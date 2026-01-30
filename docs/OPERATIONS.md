# ITAM Operations Runbook

## 1. System Monitoring

### 1.1 Health Checks
- **Endpoint**: `GET /health`
- **Response**: `{"status": "ok"}`
- **Frequency**: Every 1 minute
- **Tool**: Uptime Kuma, Prometheus, or simple curl script.

### 1.2 Log Monitoring
- **Log File**: `server.log` (or stdout if containerized)
- **Critical Errors**: Search for `[error]`, `panic`, or `fatal`.
- **Log Rotation**: Ensure logs are rotated daily to prevent disk saturation.

### 1.3 Resource Usage
- **CPU**: Alert if > 80% for 5 minutes.
- **Memory**: Alert if > 85%.
- **Disk**: Alert if usage > 90%.

## 2. Routine Maintenance

### 2.1 Database Backup
**SQLite**:
```bash
sqlite3 data/itam.db ".backup 'backups/itam_$(date +%Y%m%d).db'"
```

**MySQL/PostgreSQL**:
Use standard `mysqldump` or `pg_dump` tools.

**Frequency**: Daily (Incremental), Weekly (Full).

### 2.2 Application Updates
1. **Backup** current version and database.
2. **Stop** the service.
3. **Replace** the binary or update Docker image.
4. **Run Migrations** (Automatically handled on startup).
5. **Start** the service.
6. **Verify** health endpoint.

## 3. Incident Response

### 3.1 Service Down
1. Check process status: `systemctl status itam` or `docker ps`.
2. Check logs for immediate crash reasons.
3. Restart service.
4. If failure persists, rollback to previous version.

### 3.2 High Latency
1. Check database connection pool status.
2. Check for slow queries in database logs.
3. Verify network connectivity between App and DB.

### 3.3 Security Incident
1. **Isolate**: Block suspicious IP addresses at firewall/Nginx.
2. **Analyze**: Review audit logs (`audit_logs` table) for unauthorized actions.
3. **Remediate**: Reset compromised credentials, patch vulnerabilities.

## 4. Contact Matrix

| Role | Name | Email | Phone |
|------|------|-------|-------|
| DevOps Lead | Admin | admin@example.com | +1-234-567-8900 |
| DBA | Database Team | dba@example.com | - |
| Security | SecOps | security@example.com | - |
