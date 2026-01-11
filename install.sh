#!/bin/bash

# ==============================================================================
# ITAM System Enterprise Installation Script
# 
# Features:
# - OS & Version Compatibility Check
# - Hardware Resource Verification (CPU/RAM/Disk)
# - Dependency Resolution & Installation
# - Security Hardening (Auto-generated passwords)
# - Infrastructure Deployment (Docker, Postgres, Redis, Etcd)
# ==============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
APP_NAME="itam-system"
INSTALL_DIR="/opt/${APP_NAME}"
DB_PASSWORD=$(openssl rand -base64 16 | tr -dc 'a-zA-Z0-9')
REDIS_PASSWORD=$(openssl rand -base64 16 | tr -dc 'a-zA-Z0-9')
MIN_RAM_MB=2048
MIN_DISK_GB=10
MIN_CPU_CORES=2
REQUIRED_PKGS=("curl" "openssl" "jq" "grep" "awk" "tar")

# Helper Functions
log_info() { echo -e "${GREEN}[INFO] $1${NC}"; }
log_warn() { echo -e "${YELLOW}[WARN] $1${NC}"; }
log_err() { echo -e "${RED}[ERROR] $1${NC}"; }
log_step() { echo -e "${BLUE}[STEP] $1${NC}"; }

# 1. System Compatibility Check
check_os_version() {
    log_step "Checking OS Compatibility..."
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$NAME
        VER=$VERSION_ID
        
        # Normalize OS names
        if [[ "$OS" == *"Ubuntu"* ]]; then
            MAJOR_VER=$(echo $VER | cut -d. -f1)
            if [ "$MAJOR_VER" -lt 20 ]; then
                log_err "Ubuntu version $VER is too old. Minimum 20.04 required."
                exit 1
            fi
        elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Red Hat"* ]] || [[ "$OS" == *"Rocky"* ]] || [[ "$OS" == *"Alma"* ]]; then
            MAJOR_VER=$(echo $VER | cut -d. -f1)
            if [ "$MAJOR_VER" -lt 7 ]; then
                log_err "RHEL/CentOS version $VER is too old. Minimum 7 required."
                exit 1
            fi
        elif [[ "$OS" == *"Debian"* ]]; then
             if [ "$VER" -lt 11 ]; then
                log_err "Debian version $VER is too old. Minimum 11 required."
                exit 1
            fi
        else
            log_warn "Untested OS: $OS $VER. Proceeding with caution..."
        fi
        log_info "OS Check Passed: $OS $VER"
    else
        log_err "Cannot detect OS version. /etc/os-release missing."
        exit 1
    fi
}

# 2. Hardware Resource Check
check_resources() {
    log_step "Checking Hardware Resources..."
    
    # Check CPU
    CPU_CORES=$(nproc)
    if [ "$CPU_CORES" -lt "$MIN_CPU_CORES" ]; then
        log_warn "CPU Cores: $CPU_CORES (Recommended: $MIN_CPU_CORES+)"
    else
        log_info "CPU Cores: $CPU_CORES [OK]"
    fi

    # Check RAM
    TOTAL_RAM=$(free -m | awk '/^Mem:/{print $2}')
    if [ "$TOTAL_RAM" -lt "$MIN_RAM_MB" ]; then
        log_err "Insufficient RAM: ${TOTAL_RAM}MB. Minimum ${MIN_RAM_MB}MB required."
        exit 1
    fi
    log_info "RAM: ${TOTAL_RAM}MB [OK]"

    # Check Disk Space
    # Ensure install dir exists or check parent
    mkdir -p "$INSTALL_DIR"
    FREE_DISK=$(df -BG "$INSTALL_DIR" | awk 'NR==2 {print $4}' | sed 's/G//')
    if [ "$FREE_DISK" -lt "$MIN_DISK_GB" ]; then
        log_err "Insufficient Disk Space in $INSTALL_DIR: ${FREE_DISK}GB. Minimum ${MIN_DISK_GB}GB required."
        exit 1
    fi
    log_info "Disk Space: ${FREE_DISK}GB [OK]"
}

# 3. Dependency Resolution
resolve_dependencies() {
    log_step "Checking & Installing Dependencies..."
    
    MISSING_PKGS=()
    for pkg in "${REQUIRED_PKGS[@]}"; do
        if ! command -v $pkg &> /dev/null; then
            MISSING_PKGS+=("$pkg")
        fi
    done

    if [ ${#MISSING_PKGS[@]} -eq 0 ]; then
        log_info "All system dependencies met."
        return
    fi

    log_warn "Missing dependencies: ${MISSING_PKGS[*]}"
    log_info "Attempting to install..."

    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        apt-get update -y
        apt-get install -y "${MISSING_PKGS[@]}"
    elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Red Hat"* ]] || [[ "$OS" == *"Rocky"* ]] || [[ "$OS" == *"Alma"* ]]; then
        yum install -y "${MISSING_PKGS[@]}"
    else
        log_err "Manual installation required for: ${MISSING_PKGS[*]}"
        exit 1
    fi
    log_info "Dependencies installed successfully."
}

# 4. Docker Environment Setup
install_docker() {
    log_step "Checking Docker Environment..."
    
    if ! command -v docker &> /dev/null; then
        log_info "Installing Docker..."
        curl -fsSL https://get.docker.com | sh
        systemctl enable --now docker
    else
        log_info "Docker is already installed."
    fi

    # Check Docker Version
    DOCKER_VER=$(docker version --format '{{.Server.Version}}')
    log_info "Docker Version: $DOCKER_VER"
}

# 5. Deploy Components
deploy_components() {
    log_step "Deploying Infrastructure Components..."
    
    mkdir -p "${INSTALL_DIR}/data/postgres"
    mkdir -p "${INSTALL_DIR}/data/redis"
    mkdir -p "${INSTALL_DIR}/data/etcd"
    mkdir -p "${INSTALL_DIR}/logs"

    # Copy init sql if exists
    if [ -f "./schema.sql" ]; then
        cp ./schema.sql "${INSTALL_DIR}/init.sql"
    else
        touch "${INSTALL_DIR}/init.sql"
        log_warn "schema.sql not found in current directory. Database will be empty."
    fi

    # Generate docker-compose.yml
    cat > "${INSTALL_DIR}/docker-compose.yml" <<EOF
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: ${APP_NAME}-db
    restart: always
    environment:
      POSTGRES_USER: itam_admin
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: itam_db
    volumes:
      - ./data/postgres:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    networks:
      - itam-net
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U itam_admin -d itam_db"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: ${APP_NAME}-redis
    restart: always
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - ./data/redis:/data
    ports:
      - "6379:6379"
    networks:
      - itam-net

  etcd:
    image: bitnami/etcd:3.5
    container_name: ${APP_NAME}-etcd
    restart: always
    environment:
      - ALLOW_NONE_AUTHENTICATION=yes
      - ETCD_ADVERTISE_CLIENT_URLS=http://etcd:2379
    volumes:
      - ./data/etcd:/bitnami/etcd-data
    ports:
      - "2379:2379"
      - "2380:2380"
    networks:
      - itam-net

networks:
  itam-net:
    driver: bridge
EOF

    log_info "Starting services..."
    cd "${INSTALL_DIR}"
    docker compose up -d

    # Save credentials
    cat > "${INSTALL_DIR}/.credentials" <<EOF
[PostgreSQL]
User: itam_admin
Pass: ${DB_PASSWORD}
DB:   itam_db

[Redis]
Pass: ${REDIS_PASSWORD}

[Etcd]
Endpoint: localhost:2379
EOF

    log_info "Credentials saved to ${INSTALL_DIR}/.credentials"
    log_warn "IMPORTANT: Please back up these credentials securely and delete the file!"
}

# Main Execution Flow
check_os_version
check_resources
resolve_dependencies
install_docker
deploy_components

log_info "Installation Complete!"
log_info "Services are running in Docker."
log_info "Check status with: cd ${INSTALL_DIR} && docker compose ps"
