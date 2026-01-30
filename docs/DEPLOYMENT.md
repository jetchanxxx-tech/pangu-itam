# ITAM System Deployment Guide

## 1. Prerequisites

Before deploying the ITAM (IT Asset Management) system, ensure the following requirements are met:

### Hardware Requirements
- **CPU**: 2 cores minimum, 4 cores recommended
- **RAM**: 4GB minimum, 8GB recommended
- **Disk**: 50GB SSD for application and database
- **OS**: Linux (Ubuntu 20.04+, CentOS 7+), Windows Server 2019+, or macOS

### Software Dependencies
- **Go**: Version 1.20+ (for backend compilation)
- **Node.js**: Version 16+ (for frontend build)
- **Database**: 
  - SQLite (Default, embedded)
  - MySQL 5.7+ / 8.0+ (Optional, for production)
  - PostgreSQL 12+ (Optional, for production)
- **Redis**: 6.0+ (Optional, for caching and session management)

## 2. Backend Deployment

### 2.1 Build from Source

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-org/itam.git
   cd itam/backend
   ```

2. **Configuration**
   Copy the example config and edit it:
   ```bash
   cp config.yaml.example config.yaml
   # Edit config.yaml to set database, server port, etc.
   ```

3. **Build the Binary**
   ```bash
   # Linux/macOS
   go build -o itam-server cmd/server/main.go
   
   # Windows
   go build -o itam-server.exe cmd/server/main.go
   ```

### 2.2 Run the Server

1. **Direct Execution**
   ```bash
   ./itam-server
   ```
   The server will start on port `8080` (default).

2. **Systemd Service (Linux)**
   Create `/etc/systemd/system/itam.service`:
   ```ini
   [Unit]
   Description=ITAM Backend Service
   After=network.target

   [Service]
   Type=simple
   User=itam
   WorkingDirectory=/opt/itam/backend
   ExecStart=/opt/itam/backend/itam-server
   Restart=on-failure

   [Install]
   WantedBy=multi-user.target
   ```
   Enable and start:
   ```bash
   systemctl enable itam
   systemctl start itam
   ```

## 3. Frontend Deployment

### 3.1 Build Static Files

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Build for Production**
   ```bash
   npm run build
   ```
   This will generate a `dist` directory containing static files.

### 3.2 Serve with Nginx

Install Nginx and configure a virtual host:

```nginx
server {
    listen 80;
    server_name itam.example.com;

    root /opt/itam/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 4. Docker Deployment (Recommended)

### 4.1 Docker Compose

Create a `docker-compose.yml`:

```yaml
version: '3'
services:
  backend:
    build: ./backend
    ports:
      - "8080:8080"
    volumes:
      - ./backend/config.yaml:/app/config.yaml
      - ./backend/data:/app/data
    restart: always

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
```

### 4.2 Start Services

```bash
docker-compose up -d
```

## 5. Verification

1. Access the web interface: `http://localhost` (or your domain).
2. Check backend health: `http://localhost:8080/health`.
3. Verify database connection in logs.

## 6. Troubleshooting

- **Database Connection Failed**: Check `config.yaml` and ensure database service is running.
- **Frontend 404 Errors**: Ensure Nginx `try_files` is configured for SPA (Single Page Application).
- **Permission Denied**: Check file permissions for the application user.
