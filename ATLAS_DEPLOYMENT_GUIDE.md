# ATLAS DEPLOYMENT GUIDE
## Production Server Setup, Nginx SSE Configuration, Process Management & WAL Backups

**System:** ATLAS Campus Multi-Agent AI  
**Deployment Target:** Linux (Ubuntu 24.04 LTS / Debian 12 / RHEL 9)  
**Architecture:** Node.js Backend + Nginx Reverse Proxy + Systemd + Local Ollama

---

### 1. Production Architecture Overview

In a pilot or production deployment, ATLAS sits behind an Nginx reverse proxy terminating TLS and proxying requests to the Node.js service on port 8080:

```
[ Internet / Campus WAN ]
           │
           ▼
[ Nginx (Port 443 HTTPS) ]
   ├── Static Asset Cache (/dist/)
   ├── Unbuffered SSE Reverse Proxy (/api/atlas/chat/stream)
   └── TLS 1.3 Termination (Let's Encrypt / Institutional CA)
           │
           ▼
[ ATLAS Backend (:8080) ] <--- Managed by Systemd / PM2
           ├── SQLite WAL Database (/backend/data/campus.db)
           └── Ollama Service (:11434 with gemma4:e2b)
```

---

### 2. Nginx Reverse Proxy Configuration (Crucial for SSE)

Server-Sent Events (SSE) require **unbuffered streaming**. If Nginx buffers SSE responses, tokens and step updates will not stream to the client until the request completes.

Create `/etc/nginx/sites-available/atlas.campus.edu`:

```nginx
server {
    listen 80;
    server_name atlas.campus.edu;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name atlas.campus.edu;

    ssl_certificate /etc/letsencrypt/live/atlas.campus.edu/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/atlas.campus.edu/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security Headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Frontend Static Distribution
    location / {
        root /var/www/atlas/frontend/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
        expires 1h;
        add_header Cache-Control "public, no-transform";
    }

    # API Proxy
    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # SSE Streaming Endpoint (STRICT UNBUFFERED CONFIGURATION)
    location /api/atlas/chat/stream {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Connection '';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Disable all buffering for SSE real-time token delivery
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
        chunked_transfer_encoding on;
    }
}
```

---

### 3. Systemd Service Management

#### 3.1 Backend Service (`/etc/systemd/system/atlas-backend.service`)
```ini
[Unit]
Description=ATLAS Campus Multi-Agent AI Backend Service
After=network.target ollama.service

[Service]
Type=simple
User=atlas
WorkingDirectory=/var/www/atlas/backend
Environment=NODE_ENV=production
Environment=PORT=8080
Environment=APP_BASE=https://atlas.campus.edu
Environment=FRONTEND_URL=https://atlas.campus.edu
Environment=ATLAS_AUTH_MODE=production
Environment=ATLAS_JWT_SECRET=super_secret_institutional_key_min_32_characters_long_atlas_2026
ExecStart=/usr/bin/node --no-warnings server.js
Restart=always
RestartSec=5
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable atlas-backend
sudo systemctl start atlas-backend
```

---

### 4. SQLite WAL Mode Maintenance & Backup Procedures

ATLAS uses SQLite with Write-Ahead Logging (`WAL`). This allows simultaneous readers without blocking writers.

#### 4.1 Online Zero-Downtime Backup Script
SQLite provides the `VACUUM INTO` command, which generates a point-in-time consistent snapshot without locking the database:

Create `/usr/local/bin/atlas-backup.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/atlas"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_FILE="/var/www/atlas/backend/data/campus.db"
BACKUP_FILE="${BACKUP_DIR}/campus_${TIMESTAMP}.db"

mkdir -p "$BACKUP_DIR"

# Perform atomic, online zero-downtime backup
sqlite3 "$DB_FILE" "VACUUM INTO '${BACKUP_FILE}';"

# Compress backup
gzip -9 "$BACKUP_FILE"

# Retention: Delete backups older than 14 days
find "$BACKUP_DIR" -type f -name "*.db.gz" -mtime +14 -delete

echo "Atlas backup successfully generated: ${BACKUP_FILE}.gz"
```

Add to cron (`crontab -e`):
```cron
# Run daily backup at 2:00 AM
0 2 * * * /usr/local/bin/atlas-backup.sh >> /var/log/atlas-backup.log 2>&1
```

---

### 5. Disaster Recovery Procedure

To restore from a backup:
1. Stop the backend service:
   ```bash
   sudo systemctl stop atlas-backend
   ```
2. Uncompress and restore database file:
   ```bash
   gunzip -c /var/backups/atlas/campus_20261103_020000.db.gz > /var/www/atlas/backend/data/campus.db
   rm -f /var/www/atlas/backend/data/campus.db-wal
   rm -f /var/www/atlas/backend/data/campus.db-shm
   ```
3. Restart backend service:
   ```bash
   sudo systemctl start atlas-backend
   ```
4. Verify database health:
   ```bash
   curl https://atlas.campus.edu/api/atlas/health
   ```
