#!/usr/bin/env python3
"""
NeyPotAmablex Log Collector v2.0.0
================================
Script untuk mengumpulkan log dari berbagai honeypot services
dan mengirimkannya ke NeyPotAmablex dashboard.

Supported Services:
- HTTP (nginx/apache access logs)
- SSH (auth logs, cowrie)
- FTP (vsftpd, proftpd)
- MySQL (mysql audit logs)
- Custom (file/stdin)

Usage:
    python3 honeypot-collector.py --config config.yaml
    python3 honeypot-collector.py --token YOUR_TOKEN --service http --log /var/log/nginx/access.log
    
Author: NeyPotAmablex Team
License: MIT
"""

import argparse
import json
import os
import re
import sys
import time
import hashlib
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, Any, Generator
import urllib.request
import urllib.error

# Configuration
VERSION = "2.0.0"
DEFAULT_ENDPOINT = "https://qjyrlrkxhmhvrcgrymaj.supabase.co/functions/v1/ingest"
BATCH_SIZE = 50
RETRY_ATTEMPTS = 3
RETRY_DELAY = 5

# Service type patterns
SERVICE_PATTERNS = {
    "http": {
        "nginx_combined": r'(?P<ip>[\d.]+) - - \[(?P<time>[^\]]+)\] "(?P<method>\w+) (?P<path>[^ ]+) [^"]*" (?P<status>\d+) (?P<size>\d+) "(?P<referer>[^"]*)" "(?P<ua>[^"]*)"',
        "apache_combined": r'(?P<ip>[\d.]+) - - \[(?P<time>[^\]]+)\] "(?P<method>\w+) (?P<path>[^ ]+) [^"]*" (?P<status>\d+) (?P<size>\d+)',
    },
    "ssh": {
        "auth_failed": r'(?P<time>\w+ +\d+ [\d:]+) .* sshd\[\d+\]: Failed password for (?:invalid user )?(?P<user>\w+) from (?P<ip>[\d.]+)',
        "auth_success": r'(?P<time>\w+ +\d+ [\d:]+) .* sshd\[\d+\]: Accepted password for (?P<user>\w+) from (?P<ip>[\d.]+)',
        "cowrie": r'(?P<time>[\d-]+ [\d:]+).*?\[SSHChannel.*?\] (?P<ip>[\d.]+).*?(?P<action>login attempt|command)',
    },
    "ftp": {
        "vsftpd": r'(?P<time>\w+ +\d+ [\d:]+) .* vsftpd\[\d+\]: .* Client "(?P<ip>[\d.]+)"',
        "proftpd": r'(?P<time>[\d-]+ [\d:]+) .* proftpd\[\d+\]: (?P<ip>[\d.]+) .* USER (?P<user>\w+)',
    },
    "mysql": {
        "audit": r'(?P<time>[\d-]+T[\d:]+).*?(?P<ip>[\d.]+).*?Query.*?(?P<query>SELECT|INSERT|UPDATE|DELETE|DROP)',
        "general": r'(?P<time>[\d-]+ [\d:]+).*?Connect.*?(?P<user>\w+)@(?P<ip>[\d.]+)',
    },
}

# Risk scoring rules per service
RISK_RULES = {
    "http": {
        "paths": {
            "/admin": 30, "/wp-admin": 25, "/phpmyadmin": 25,
            "/.env": 35, "/.git": 30, "/config": 25,
            "/backup": 20, "/shell": 40, "/cmd": 40,
        },
        "methods": {"POST": 10, "PUT": 10, "DELETE": 15},
        "payloads": {
            "SELECT": 25, "UNION": 30, "<script>": 35,
            "<?php": 35, "wget": 30, "curl": 20,
            "passwd": 25, "../": 20, "eval(": 40,
        },
    },
    "ssh": {
        "users": {"root": 30, "admin": 25, "test": 15, "oracle": 20, "postgres": 20},
        "patterns": {"brute_force": 40, "failed_login": 20},
    },
    "ftp": {
        "users": {"anonymous": 15, "root": 30, "admin": 25},
        "patterns": {"brute_force": 35},
    },
    "mysql": {
        "queries": {"DROP": 50, "DELETE": 30, "UPDATE": 20, "INSERT": 15},
        "users": {"root": 30, "admin": 25},
    },
}


class Colors:
    """ANSI color codes for terminal output"""
    RED = '\033[91m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    PURPLE = '\033[95m'
    CYAN = '\033[96m'
    RESET = '\033[0m'
    BOLD = '\033[1m'


def log(level: str, message: str):
    """Pretty print log messages"""
    colors = {
        "INFO": Colors.BLUE,
        "SUCCESS": Colors.GREEN,
        "WARNING": Colors.YELLOW,
        "ERROR": Colors.RED,
        "DEBUG": Colors.PURPLE,
    }
    color = colors.get(level, Colors.RESET)
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"{Colors.CYAN}[{timestamp}]{Colors.RESET} {color}[{level}]{Colors.RESET} {message}")


def calculate_risk_score(service: str, data: Dict[str, Any]) -> int:
    """Calculate risk score based on service type and data"""
    score = 0
    rules = RISK_RULES.get(service, {})
    
    if service == "http":
        path = data.get("path", "").lower()
        method = data.get("method", "GET")
        body = data.get("body", "").lower()
        
        for pattern, points in rules.get("paths", {}).items():
            if pattern in path:
                score += points
        
        score += rules.get("methods", {}).get(method, 0)
        
        for pattern, points in rules.get("payloads", {}).items():
            if pattern.lower() in body:
                score += points
    
    elif service == "ssh":
        user = data.get("user", "").lower()
        score += rules.get("users", {}).get(user, 10)
        if data.get("action") == "failed_login":
            score += rules.get("patterns", {}).get("failed_login", 20)
    
    elif service == "ftp":
        user = data.get("user", "").lower()
        score += rules.get("users", {}).get(user, 10)
    
    elif service == "mysql":
        query = data.get("query", "").upper()
        for pattern, points in rules.get("queries", {}).items():
            if pattern in query:
                score += points
                break
    
    return min(100, score)


def parse_log_line(line: str, service: str) -> Optional[Dict[str, Any]]:
    """Parse a log line based on service type"""
    patterns = SERVICE_PATTERNS.get(service, {})
    
    for pattern_name, pattern in patterns.items():
        match = re.search(pattern, line)
        if match:
            data = match.groupdict()
            return {
                "source_ip": data.get("ip", "unknown"),
                "path": data.get("path", f"/{service}"),
                "method": data.get("method", service.upper()),
                "user_agent": data.get("ua", f"{service}-honeypot"),
                "service": f"{service}-honeypot",
                "body": line,
                "user": data.get("user"),
                "query": data.get("query"),
                "pattern_matched": pattern_name,
            }
    
    return None


def tail_file(filepath: str, follow: bool = True) -> Generator[str, None, None]:
    """Tail a file, optionally following new lines"""
    try:
        with open(filepath, 'r') as f:
            # Go to end of file
            f.seek(0, 2)
            
            while True:
                line = f.readline()
                if line:
                    yield line.strip()
                elif follow:
                    time.sleep(0.1)
                else:
                    break
    except FileNotFoundError:
        log("ERROR", f"File tidak ditemukan: {filepath}")
        sys.exit(1)
    except PermissionError:
        log("ERROR", f"Tidak ada izin membaca: {filepath}")
        sys.exit(1)


def send_event(endpoint: str, token: str, event: Dict[str, Any]) -> bool:
    """Send single event to ingest endpoint"""
    headers = {
        "Content-Type": "application/json",
        "X-API-TOKEN": token,
    }
    
    data = json.dumps(event).encode('utf-8')
    req = urllib.request.Request(endpoint, data=data, headers=headers, method='POST')
    
    for attempt in range(RETRY_ATTEMPTS):
        try:
            with urllib.request.urlopen(req, timeout=10) as response:
                result = json.loads(response.read().decode('utf-8'))
                if result.get("success"):
                    return True
                else:
                    log("WARNING", f"Server response: {result.get('error', 'Unknown error')}")
        except urllib.error.HTTPError as e:
            log("ERROR", f"HTTP Error {e.code}: {e.reason}")
            if e.code == 401:
                log("ERROR", "Token tidak valid. Periksa kembali API token Anda.")
                return False
        except urllib.error.URLError as e:
            log("WARNING", f"Koneksi gagal (attempt {attempt + 1}/{RETRY_ATTEMPTS}): {e.reason}")
        except Exception as e:
            log("ERROR", f"Error: {str(e)}")
        
        if attempt < RETRY_ATTEMPTS - 1:
            time.sleep(RETRY_DELAY)
    
    return False


def send_batch(endpoint: str, token: str, events: list) -> tuple[int, int]:
    """Send batch of events, return (success_count, fail_count)"""
    success = 0
    failed = 0
    
    for event in events:
        if send_event(endpoint, token, event):
            success += 1
        else:
            failed += 1
    
    return success, failed


def collect_and_forward(
    token: str,
    service: str,
    log_path: str,
    endpoint: str = DEFAULT_ENDPOINT,
    follow: bool = True,
    dry_run: bool = False,
):
    """Main collection loop"""
    log("INFO", f"NeyPotAmablex Collector v{VERSION}")
    log("INFO", f"Service: {Colors.BOLD}{service}{Colors.RESET}")
    log("INFO", f"Log file: {Colors.BOLD}{log_path}{Colors.RESET}")
    log("INFO", f"Endpoint: {endpoint}")
    log("INFO", f"Follow mode: {'Ya' if follow else 'Tidak'}")
    
    if dry_run:
        log("WARNING", "DRY RUN MODE - tidak akan mengirim data")
    
    print(f"\n{Colors.GREEN}{'='*50}{Colors.RESET}")
    log("SUCCESS", "Memulai pengumpulan log...")
    print(f"{Colors.GREEN}{'='*50}{Colors.RESET}\n")
    
    event_count = 0
    batch = []
    
    try:
        for line in tail_file(log_path, follow):
            parsed = parse_log_line(line, service)
            
            if parsed:
                risk_score = calculate_risk_score(service, parsed)
                
                event = {
                    "source_ip": parsed["source_ip"],
                    "path": parsed["path"],
                    "method": parsed["method"],
                    "user_agent": parsed["user_agent"],
                    "service": parsed["service"],
                    "body": parsed["body"][:5000],  # Limit body size
                }
                
                event_count += 1
                
                # Color based on risk
                if risk_score >= 60:
                    color = Colors.RED
                elif risk_score >= 30:
                    color = Colors.YELLOW
                else:
                    color = Colors.GREEN
                
                log("INFO", f"Event #{event_count}: {color}[Risk: {risk_score}]{Colors.RESET} {parsed['source_ip']} → {parsed['path']}")
                
                if not dry_run:
                    batch.append(event)
                    
                    if len(batch) >= BATCH_SIZE:
                        success, failed = send_batch(endpoint, token, batch)
                        log("SUCCESS", f"Batch terkirim: {success} berhasil, {failed} gagal")
                        batch = []
    
    except KeyboardInterrupt:
        log("INFO", "\nMenghentikan collector...")
        
        if batch and not dry_run:
            log("INFO", f"Mengirim {len(batch)} event tersisa...")
            send_batch(endpoint, token, batch)
        
        log("SUCCESS", f"Total event diproses: {event_count}")


def test_connection(token: str, endpoint: str = DEFAULT_ENDPOINT) -> bool:
    """Test connection to ingest endpoint"""
    log("INFO", "Testing koneksi ke endpoint...")
    
    test_event = {
        "source_ip": "127.0.0.1",
        "path": "/test/connection",
        "method": "GET",
        "user_agent": f"NeyPotAmablex-Collector/{VERSION}",
        "service": "test-honeypot",
        "body": "Connection test from collector script",
    }
    
    if send_event(endpoint, token, test_event):
        log("SUCCESS", "Koneksi berhasil! Token valid.")
        return True
    else:
        log("ERROR", "Koneksi gagal. Periksa token dan endpoint.")
        return False


def main():
    parser = argparse.ArgumentParser(
        description=f"NeyPotAmablex Log Collector v{VERSION}",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Contoh penggunaan:

  # Monitor HTTP access log
  python3 honeypot-collector.py --token YOUR_TOKEN --service http --log /var/log/nginx/access.log

  # Monitor SSH auth log  
  python3 honeypot-collector.py --token YOUR_TOKEN --service ssh --log /var/log/auth.log

  # Monitor FTP log
  python3 honeypot-collector.py --token YOUR_TOKEN --service ftp --log /var/log/vsftpd.log

  # Monitor MySQL audit log
  python3 honeypot-collector.py --token YOUR_TOKEN --service mysql --log /var/log/mysql/audit.log

  # Test koneksi
  python3 honeypot-collector.py --token YOUR_TOKEN --test

  # Dry run (tidak mengirim data)
  python3 honeypot-collector.py --token YOUR_TOKEN --service http --log /var/log/access.log --dry-run

Services yang didukung: http, ssh, ftp, mysql
        """
    )
    
    parser.add_argument("--token", "-t", required=True, help="API token dari NeyPotAmablex")
    parser.add_argument("--service", "-s", choices=["http", "ssh", "ftp", "mysql"], help="Tipe service honeypot")
    parser.add_argument("--log", "-l", help="Path ke file log")
    parser.add_argument("--endpoint", "-e", default=DEFAULT_ENDPOINT, help="Custom ingest endpoint")
    parser.add_argument("--no-follow", action="store_true", help="Baca file sekali tanpa follow")
    parser.add_argument("--dry-run", action="store_true", help="Parse tanpa mengirim data")
    parser.add_argument("--test", action="store_true", help="Test koneksi ke endpoint")
    parser.add_argument("--version", "-v", action="version", version=f"%(prog)s {VERSION}")
    
    args = parser.parse_args()
    
    print(f"""
{Colors.CYAN}╔═══════════════════════════════════════════════════════╗
║     {Colors.BOLD}NeyPotAmablex Log Collector v{VERSION}{Colors.RESET}{Colors.CYAN}            ║
║     Honeypot Monitoring & Security Analytics          ║
╚═══════════════════════════════════════════════════════╝{Colors.RESET}
    """)
    
    if args.test:
        success = test_connection(args.token, args.endpoint)
        sys.exit(0 if success else 1)
    
    if not args.service or not args.log:
        parser.error("--service dan --log diperlukan (kecuali mode --test)")
    
    collect_and_forward(
        token=args.token,
        service=args.service,
        log_path=args.log,
        endpoint=args.endpoint,
        follow=not args.no_follow,
        dry_run=args.dry_run,
    )


if __name__ == "__main__":
    main()
