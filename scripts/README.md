# NeyPotAmablex Log Collector v2.0.0

Script untuk mengumpulkan log dari berbagai honeypot services dan mengirimkannya ke NeyPotAmablex dashboard.

## 🎯 Fitur

- **Multi-Service Support**: HTTP, SSH, FTP, MySQL
- **Auto Risk Scoring**: Kalkulasi skor risiko otomatis
- **Follow Mode**: Real-time monitoring file log
- **Batch Sending**: Optimasi pengiriman data
- **Retry Logic**: Auto-retry saat koneksi gagal
- **Dry Run**: Test parsing tanpa mengirim data

## 📋 Requirements

### Python Version
- Python 3.7+
- No external dependencies (uses stdlib only)

### Bash Version
- Bash 4.0+
- curl

## 🚀 Quick Start

### 1. Download Script

```bash
# Download Python version
curl -o honeypot-collector.py https://your-domain/scripts/honeypot-collector.py
chmod +x honeypot-collector.py

# Download Bash version
curl -o honeypot-collector.sh https://your-domain/scripts/honeypot-collector.sh
chmod +x honeypot-collector.sh
```

### 2. Dapatkan API Token

1. Login ke NeyPotAmablex dashboard
2. Buat Tenant baru (jika belum ada)
3. Generate API Token di halaman Tokens
4. Copy token yang ditampilkan (hanya muncul sekali!)

### 3. Test Koneksi

```bash
# Python
python3 honeypot-collector.py --token YOUR_TOKEN --test

# Bash
./honeypot-collector.sh -t YOUR_TOKEN --test
```

### 4. Mulai Monitoring

```bash
# Monitor HTTP (Nginx/Apache)
python3 honeypot-collector.py -t YOUR_TOKEN -s http -l /var/log/nginx/access.log

# Monitor SSH
python3 honeypot-collector.py -t YOUR_TOKEN -s ssh -l /var/log/auth.log

# Monitor FTP
python3 honeypot-collector.py -t YOUR_TOKEN -s ftp -l /var/log/vsftpd.log

# Monitor MySQL
python3 honeypot-collector.py -t YOUR_TOKEN -s mysql -l /var/log/mysql/audit.log
```

## 🔧 Opsi Command Line

| Option | Short | Description |
|--------|-------|-------------|
| `--token` | `-t` | API token (required) |
| `--service` | `-s` | Service type: http, ssh, ftp, mysql |
| `--log` | `-l` | Path ke file log |
| `--endpoint` | `-e` | Custom ingest endpoint |
| `--no-follow` | - | Baca sekali tanpa follow |
| `--dry-run` | - | Parse tanpa mengirim |
| `--test` | - | Test koneksi |
| `--version` | `-v` | Show version |

## 📊 Service Types & Log Formats

### HTTP (http)
- Nginx combined format
- Apache combined format

**Sample log:**
```
192.168.1.100 - - [01/Jan/2025:10:00:00 +0000] "POST /admin/login.php HTTP/1.1" 404 512 "-" "Mozilla/5.0"
```

### SSH (ssh)
- /var/log/auth.log
- /var/log/secure
- Cowrie honeypot logs

**Sample log:**
```
Jan  1 10:00:00 server sshd[1234]: Failed password for invalid user admin from 192.168.1.100 port 22222 ssh2
```

### FTP (ftp)
- vsftpd logs
- proftpd logs

**Sample log:**
```
Jan  1 10:00:00 server vsftpd[1234]: Client "192.168.1.100" connected
```

### MySQL (mysql)
- General query log
- Audit log

**Sample log:**
```
2025-01-01T10:00:00 Connect root@192.168.1.100 on using TCP/IP
```

## 🏃 Menjalankan sebagai Service (systemd)

### 1. Buat service file

```bash
sudo nano /etc/systemd/system/neypot-collector.service
```

```ini
[Unit]
Description=NeyPotAmablex Log Collector
After=network.target

[Service]
Type=simple
User=root
ExecStart=/usr/bin/python3 /opt/neypot/honeypot-collector.py \
    --token YOUR_TOKEN \
    --service http \
    --log /var/log/nginx/access.log
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### 2. Enable dan start

```bash
sudo systemctl daemon-reload
sudo systemctl enable neypot-collector
sudo systemctl start neypot-collector

# Check status
sudo systemctl status neypot-collector

# View logs
sudo journalctl -u neypot-collector -f
```

## 🐳 Docker Deployment

```dockerfile
FROM python:3.11-alpine

WORKDIR /app
COPY honeypot-collector.py .

ENV TOKEN=""
ENV SERVICE="http"
ENV LOGFILE="/logs/access.log"

CMD python3 honeypot-collector.py \
    --token $TOKEN \
    --service $SERVICE \
    --log $LOGFILE
```

```bash
docker build -t neypot-collector .
docker run -d \
    -e TOKEN=your_token \
    -e SERVICE=http \
    -v /var/log/nginx:/logs:ro \
    neypot-collector
```

## 🔒 Risk Scoring

Script menghitung skor risiko (0-100) berdasarkan:

### HTTP
- Path sensitif: `/admin`, `/.env`, `/.git`, `/phpmyadmin`
- Method berbahaya: POST, PUT, DELETE
- Payload mencurigakan: SQL injection, XSS, command injection

### SSH
- User target: root, admin, oracle
- Pattern: brute force, failed login

### FTP
- Anonymous login attempts
- Root/admin access attempts

### MySQL
- Query berbahaya: DROP, DELETE, UPDATE
- Root/admin connections

## 📝 Contoh Output

```
╔═══════════════════════════════════════════════════════╗
║     NeyPotAmablex Log Collector v2.0.0                ║
║     Honeypot Monitoring & Security Analytics          ║
╚═══════════════════════════════════════════════════════╝

[2025-01-01 10:00:00] [INFO] Service: http
[2025-01-01 10:00:00] [INFO] Log file: /var/log/nginx/access.log
[2025-01-01 10:00:00] [INFO] Endpoint: https://xxx.supabase.co/functions/v1/ingest

==================================================
[2025-01-01 10:00:00] [SUCCESS] Memulai pengumpulan log...
==================================================

[2025-01-01 10:00:01] [INFO] Event #1: [Risk: 25] 192.168.1.100 → /wp-admin
[2025-01-01 10:00:02] [INFO] Event #2: [Risk: 45] 10.0.0.50 → /.env
[2025-01-01 10:00:03] [INFO] Event #3: [Risk: 60] 172.16.0.10 → /admin/config.php
```

## 🔗 Integrasi dengan Honeypot

### Cowrie SSH Honeypot

```bash
# Install Cowrie
git clone https://github.com/cowrie/cowrie
cd cowrie
pip install -r requirements.txt

# Jalankan collector
python3 honeypot-collector.py -t TOKEN -s ssh -l /opt/cowrie/var/log/cowrie/cowrie.log
```

### Dionaea Honeypot

```bash
# Configure dionaea to log to file
# Edit /opt/dionaea/etc/dionaea.cfg

# Jalankan collector
python3 honeypot-collector.py -t TOKEN -s http -l /opt/dionaea/var/log/dionaea.log
```

## ❓ Troubleshooting

### Token tidak valid
- Pastikan token masih aktif di dashboard
- Check apakah token sudah expired
- Generate token baru jika perlu

### Koneksi timeout
- Check firewall/proxy settings
- Pastikan outbound HTTPS (443) terbuka
- Coba ping endpoint terlebih dahulu

### Log tidak terbaca
- Check permission file log
- Jalankan sebagai root jika diperlukan
- Pastikan format log sesuai

## 📄 License

MIT License - Free to use and modify
