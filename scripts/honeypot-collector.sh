#!/bin/bash
#
# NeyPotAmablex Log Collector v2.0.0 (Bash Version)
# =================================================
# Lightweight bash script untuk forward logs ke NeyPotAmablex
#
# Usage:
#   ./honeypot-collector.sh -t YOUR_TOKEN -s http -l /var/log/nginx/access.log
#   ./honeypot-collector.sh --test -t YOUR_TOKEN
#
# Requirements: curl, jq (optional for pretty output)
#

VERSION="2.0.0"
ENDPOINT="https://qjyrlrkxhmhvrcgrymaj.supabase.co/functions/v1/ingest"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Logging functions
log_info() { echo -e "${CYAN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} ${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${CYAN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} ${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${CYAN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} ${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${CYAN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} ${RED}[ERROR]${NC} $1"; }

# Print banner
print_banner() {
    echo -e "${CYAN}"
    echo "╔═══════════════════════════════════════════════════════╗"
    echo "║     ${BOLD}NeyPotAmablex Log Collector v${VERSION}${NC}${CYAN}            ║"
    echo "║     Honeypot Monitoring & Security Analytics          ║"
    echo "╚═══════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Show usage
usage() {
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  -t, --token TOKEN      API token dari NeyPotAmablex (required)"
    echo "  -s, --service SERVICE  Tipe service: http|ssh|ftp|mysql"
    echo "  -l, --log PATH         Path ke file log"
    echo "  -e, --endpoint URL     Custom ingest endpoint"
    echo "  --test                 Test koneksi"
    echo "  --dry-run              Parse tanpa mengirim"
    echo "  -h, --help             Show this help"
    echo ""
    echo "Examples:"
    echo "  $0 -t YOUR_TOKEN -s http -l /var/log/nginx/access.log"
    echo "  $0 -t YOUR_TOKEN -s ssh -l /var/log/auth.log"
    echo "  $0 -t YOUR_TOKEN --test"
}

# Send event to ingest endpoint
send_event() {
    local ip="$1"
    local path="$2"
    local method="$3"
    local user_agent="$4"
    local service="$5"
    local body="$6"
    
    local json_payload=$(cat <<EOF
{
    "source_ip": "$ip",
    "path": "$path",
    "method": "$method",
    "user_agent": "$user_agent",
    "service": "$service",
    "body": "$body"
}
EOF
)
    
    local response=$(curl -s -w "\n%{http_code}" -X POST "$ENDPOINT" \
        -H "Content-Type: application/json" \
        -H "X-API-TOKEN: $TOKEN" \
        -d "$json_payload" \
        --connect-timeout 10 \
        --max-time 30)
    
    local http_code=$(echo "$response" | tail -n1)
    local body_response=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "200" ]; then
        return 0
    else
        log_warning "HTTP $http_code: $body_response"
        return 1
    fi
}

# Test connection
test_connection() {
    log_info "Testing koneksi ke endpoint..."
    
    if send_event "127.0.0.1" "/test/connection" "GET" "NeyPotAmablex-Collector/$VERSION" "test-honeypot" "Connection test"; then
        log_success "Koneksi berhasil! Token valid."
        return 0
    else
        log_error "Koneksi gagal. Periksa token dan endpoint."
        return 1
    fi
}

# Parse nginx/apache log line
parse_http_log() {
    local line="$1"
    
    # Nginx combined format
    if [[ $line =~ ^([0-9.]+)\ -\ -\ \[([^\]]+)\]\ \"([A-Z]+)\ ([^ ]+) ]]; then
        local ip="${BASH_REMATCH[1]}"
        local method="${BASH_REMATCH[3]}"
        local path="${BASH_REMATCH[4]}"
        local ua=""
        
        # Extract user agent
        if [[ $line =~ \"([^\"]+)\"$ ]]; then
            ua="${BASH_REMATCH[1]}"
        fi
        
        echo "$ip|$path|$method|$ua"
        return 0
    fi
    
    return 1
}

# Parse SSH auth log
parse_ssh_log() {
    local line="$1"
    
    # Failed password
    if [[ $line =~ Failed\ password\ for\ (invalid\ user\ )?([^ ]+)\ from\ ([0-9.]+) ]]; then
        local user="${BASH_REMATCH[2]}"
        local ip="${BASH_REMATCH[3]}"
        echo "$ip|/ssh/login|FAILED|ssh-client|$user"
        return 0
    fi
    
    # Accepted password
    if [[ $line =~ Accepted\ password\ for\ ([^ ]+)\ from\ ([0-9.]+) ]]; then
        local user="${BASH_REMATCH[1]}"
        local ip="${BASH_REMATCH[2]}"
        echo "$ip|/ssh/login|SUCCESS|ssh-client|$user"
        return 0
    fi
    
    return 1
}

# Parse FTP log
parse_ftp_log() {
    local line="$1"
    
    # vsftpd/proftpd pattern
    if [[ $line =~ Client\ \"([0-9.]+)\" ]] || [[ $line =~ \[([0-9.]+)\] ]]; then
        local ip="${BASH_REMATCH[1]}"
        echo "$ip|/ftp/connect|CONNECT|ftp-client"
        return 0
    fi
    
    return 1
}

# Parse MySQL log
parse_mysql_log() {
    local line="$1"
    
    # Connect pattern
    if [[ $line =~ Connect[[:space:]]+([^@]+)@([0-9.]+) ]]; then
        local user="${BASH_REMATCH[1]}"
        local ip="${BASH_REMATCH[2]}"
        echo "$ip|/mysql/connect|CONNECT|mysql-client|$user"
        return 0
    fi
    
    return 1
}

# Main collection loop
collect_logs() {
    local service="$1"
    local logfile="$2"
    local dry_run="$3"
    
    log_info "Service: ${BOLD}$service${NC}"
    log_info "Log file: ${BOLD}$logfile${NC}"
    log_info "Endpoint: $ENDPOINT"
    
    if [ "$dry_run" = "true" ]; then
        log_warning "DRY RUN MODE - tidak akan mengirim data"
    fi
    
    echo -e "\n${GREEN}==================================================${NC}"
    log_success "Memulai pengumpulan log... (Ctrl+C untuk stop)"
    echo -e "${GREEN}==================================================${NC}\n"
    
    local count=0
    local success=0
    local failed=0
    
    # Check if file exists
    if [ ! -f "$logfile" ]; then
        log_error "File tidak ditemukan: $logfile"
        exit 1
    fi
    
    # Tail and process
    tail -n0 -F "$logfile" 2>/dev/null | while read -r line; do
        local parsed=""
        
        case "$service" in
            http)
                parsed=$(parse_http_log "$line")
                ;;
            ssh)
                parsed=$(parse_ssh_log "$line")
                ;;
            ftp)
                parsed=$(parse_ftp_log "$line")
                ;;
            mysql)
                parsed=$(parse_mysql_log "$line")
                ;;
        esac
        
        if [ -n "$parsed" ]; then
            count=$((count + 1))
            
            IFS='|' read -r ip path method ua extra <<< "$parsed"
            
            # Truncate body
            local body="${line:0:1000}"
            
            log_info "Event #$count: $ip → $path ($method)"
            
            if [ "$dry_run" != "true" ]; then
                if send_event "$ip" "$path" "$method" "$ua" "${service}-honeypot" "$body"; then
                    success=$((success + 1))
                else
                    failed=$((failed + 1))
                fi
            fi
        fi
    done
}

# Parse arguments
TOKEN=""
SERVICE=""
LOGFILE=""
TEST_MODE=false
DRY_RUN=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -t|--token)
            TOKEN="$2"
            shift 2
            ;;
        -s|--service)
            SERVICE="$2"
            shift 2
            ;;
        -l|--log)
            LOGFILE="$2"
            shift 2
            ;;
        -e|--endpoint)
            ENDPOINT="$2"
            shift 2
            ;;
        --test)
            TEST_MODE=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        -h|--help)
            print_banner
            usage
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# Main
print_banner

# Validate token
if [ -z "$TOKEN" ]; then
    log_error "Token diperlukan. Gunakan -t atau --token"
    usage
    exit 1
fi

# Check for curl
if ! command -v curl &> /dev/null; then
    log_error "curl tidak ditemukan. Install dengan: apt install curl"
    exit 1
fi

# Test mode
if [ "$TEST_MODE" = true ]; then
    test_connection
    exit $?
fi

# Validate required args
if [ -z "$SERVICE" ] || [ -z "$LOGFILE" ]; then
    log_error "--service dan --log diperlukan"
    usage
    exit 1
fi

# Validate service
case "$SERVICE" in
    http|ssh|ftp|mysql)
        ;;
    *)
        log_error "Service tidak valid: $SERVICE"
        log_error "Pilih: http, ssh, ftp, mysql"
        exit 1
        ;;
esac

# Start collection
collect_logs "$SERVICE" "$LOGFILE" "$DRY_RUN"
