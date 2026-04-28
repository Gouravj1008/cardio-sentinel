╔════════════════════════════════════════════════════════════════════════════╗
║                PRODUCTION DEPLOYMENT GUIDE                               ║
║               Cardio-Sentinel Healthcare Platform                         ║
╚════════════════════════════════════════════════════════════════════════════╝

═══════════════════════════════════════════════════════════════════════════════
DEPLOYMENT ARCHITECTURE OVERVIEW
═══════════════════════════════════════════════════════════════════════════════

Production Stack:
  Backend:     Node.js Express API (port 5000)
  Frontend:    React Vite (port 3000 or Netlify)
  Database:    MongoDB Atlas (Cloud)
  Real-time:   Socket.IO over HTTPS/WSS
  Cache:       Redis (optional, for session management)
  Search:      Elasticsearch (optional, for audit log search)
  Auth:        JWT + HTTPS
  SSL/TLS:     Let's Encrypt (auto-renewed)


═══════════════════════════════════════════════════════════════════════════════
PHASE 1: PRE-DEPLOYMENT CHECKLIST
═══════════════════════════════════════════════════════════════════════════════

Security Audit
──────────────────────────────────────────────────────────────────────────
□ All default passwords changed
□ JWT secret randomized (32+ chars)
□ Database credentials secured in environment
□ API keys for external services secured
□ HTTPS/SSL certificates obtained
□ CORS configured for production domain
□ Rate limiting enabled on all endpoints
□ Input validation on all endpoints
□ SQL injection prevention verified
□ CSRF protection enabled
□ Security headers configured (HSTS, X-Frame-Options, etc.)
□ Dependency vulnerabilities scanned (npm audit)


HIPAA & Healthcare Compliance
──────────────────────────────────────────────────────────────────────────
□ Audit logging configured and verified
□ Encryption at rest enabled (MongoDB encryption)
□ Encryption in transit (HTTPS/TLS)
□ Data access logging implemented
□ User authentication multi-factor enabled
□ Session timeout configured (15-30 minutes)
□ HIPAA Business Associate Agreement signed
□ Data retention policies documented
□ Disaster recovery plan created
□ Backup and restore procedures tested
□ Data breach response plan documented


Infrastructure
──────────────────────────────────────────────────────────────────────────
□ Production server provisioned
□ Load balancer configured (if needed)
□ CDN configured (for static assets)
□ Database replication configured (MongoDB Atlas)
□ Backup automation enabled
□ Monitoring and alerting configured
□ Log aggregation setup (ELK stack or similar)
□ Performance monitoring setup (New Relic, DataDog, etc.)


═══════════════════════════════════════════════════════════════════════════════
PHASE 2: ENVIRONMENT CONFIGURATION
═══════════════════════════════════════════════════════════════════════════════

Backend Production Environment Variables
──────────────────────────────────────────────────────────────────────────

Create .env.production in backend/:

PORT=5000
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://produser:SECUREPASS@cluster.mongodb.net/cardio_sentinel_prod
MONGODB_REPLICA_SET=true

# Authentication
JWT_SECRET=your-random-256-bit-secret-here-at-least-32-chars
JWT_EXPIRE=30d
ADMIN_SIGNUP_SECRET=another-random-secret-for-admin-registration

# HTTPS/SSL
SSL_CERT_PATH=/etc/ssl/certs/cardio-sentinel.crt
SSL_KEY_PATH=/etc/ssl/private/cardio-sentinel.key

# CORS
CORS_ORIGIN=https://cardio-sentinel.com,https://www.cardio-sentinel.com
CORS_CREDENTIALS=true

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# HIPAA
AUDIT_LOG_RETENTION_DAYS=2555
ENCRYPTION_KEY=your-aes-256-encryption-key
ENCRYPTION_ALGORITHM=aes-256-cbc

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
SMTP_FROM=noreply@cardio-sentinel.com

# Third-party Services (if applicable)
GOOGLE_OAUTH_CLIENT_ID=your-google-oauth-id
GOOGLE_OAUTH_CLIENT_SECRET=your-google-oauth-secret

# ML Service
ML_SERVICE_URL=http://localhost:8000
ML_SERVICE_TIMEOUT=30000

# Redis (for caching/sessions)
REDIS_URL=redis://:password@redis-host:6379

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/cardio-sentinel/app.log


Frontend Production Environment Variables
──────────────────────────────────────────────────────────────────────────

Create .env.production in frontend/:

VITE_API_BASE_URL=https://api.cardio-sentinel.com
VITE_SOCKET_URL=https://api.cardio-sentinel.com
VITE_GOOGLE_CLIENT_ID=your-google-oauth-id
VITE_ANALYTICS_ID=google-analytics-4-id
VITE_SENTRY_DSN=your-sentry-error-tracking-dsn
VITE_ENVIRONMENT=production
VITE_VERSION=1.0.0


═══════════════════════════════════════════════════════════════════════════════
PHASE 3: BUILD & DEPLOYMENT
═══════════════════════════════════════════════════════════════════════════════

Backend Deployment
──────────────────────────────────────────────────────────────────────────

1. Prepare Production Server
   a. SSH into production server
   b. Install Node.js (v16+) and npm
   c. Install PM2 globally: npm install -g pm2
   d. Create application directory: /opt/cardio-sentinel

2. Clone Repository
   cd /opt/cardio-sentinel
   git clone https://github.com/your-org/cardio-sentinel.git
   cd cardio-sentinel

3. Install Dependencies
   cd backend
   npm install --production
   npm ci  # For exact dependency versions

4. Configure Environment
   cp .env.example .env.production
   # Edit .env.production with production values
   nano .env.production

5. Build Backend (if required)
   npm run build

6. Start with PM2
   pm2 start server.js --name "cardio-sentinel-api" --env production
   pm2 save
   pm2 startup

7. Configure Reverse Proxy (Nginx)
   See nginx-config.conf below

8. Test Endpoints
   curl -k https://api.cardio-sentinel.com/api/health


Frontend Deployment (Option A: Self-hosted)
──────────────────────────────────────────────────────────────────────────

1. Build React Application
   cd frontend
   npm install
   npm run build

2. This creates optimized files in frontend/dist/

3. Serve with Nginx or Apache
   # Copy dist/ to web server
   cp -r dist/* /var/www/cardio-sentinel/

4. Or use Node.js server:
   npm install -g serve
   serve -s dist -l 3000


Frontend Deployment (Option B: Netlify/Vercel)
──────────────────────────────────────────────────────────────────────────

1. Push to GitHub
   git push origin production

2. Connect repository to Netlify
   a. Go to netlify.com
   b. Select "New site from Git"
   c. Choose your repository
   d. Configure build settings:
      - Build command: npm run build
      - Publish directory: dist

3. Configure environment variables in Netlify
   a. Go to Site settings > Build & deploy > Environment
   b. Add VITE_API_BASE_URL=https://api.cardio-sentinel.com
   c. Deploy button triggers automatic deployment


═══════════════════════════════════════════════════════════════════════════════
PHASE 4: NGINX REVERSE PROXY CONFIGURATION
═══════════════════════════════════════════════════════════════════════════════

File: /etc/nginx/sites-available/cardio-sentinel

server {
    listen 443 ssl http2;
    server_name api.cardio-sentinel.com;

    # SSL Certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/api.cardio-sentinel.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.cardio-sentinel.com/privkey.pem;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'" always;

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=apirlimit:10m rate=10r/s;
    limit_req zone=apirlimit burst=20 nodelay;

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts for long-running requests
        proxy_connect_timeout 600s;
        proxy_send_timeout 600s;
        proxy_read_timeout 600s;
    }

    location /socket.io {
        proxy_pass http://localhost:5000/socket.io;
        proxy_http_version 1.1;
        proxy_buffering off;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name api.cardio-sentinel.com;
    return 301 https://$server_name$request_uri;
}

# Frontend
server {
    listen 443 ssl http2;
    server_name cardio-sentinel.com www.cardio-sentinel.com;

    ssl_certificate /etc/letsencrypt/live/cardio-sentinel.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/cardio-sentinel.com/privkey.pem;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;

    root /var/www/cardio-sentinel;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name cardio-sentinel.com www.cardio-sentinel.com;
    return 301 https://$server_name$request_uri;
}


═══════════════════════════════════════════════════════════════════════════════
PHASE 5: SSL/TLS CERTIFICATE SETUP
═══════════════════════════════════════════════════════════════════════════════

Using Let's Encrypt with Certbot
──────────────────────────────────

1. Install Certbot
   sudo apt-get install certbot python3-certbot-nginx

2. Obtain Certificates
   sudo certbot certonly --standalone -d api.cardio-sentinel.com -d cardio-sentinel.com

3. Auto-renewal Configuration
   sudo systemctl enable certbot.timer
   sudo systemctl start certbot.timer

4. Test Renewal
   sudo certbot renew --dry-run

5. Update Nginx Config
   Update /etc/nginx/sites-available/cardio-sentinel with certificate paths

6. Reload Nginx
   sudo systemctl reload nginx


═══════════════════════════════════════════════════════════════════════════════
PHASE 6: MONITORING & LOGGING
═══════════════════════════════════════════════════════════════════════════════

Application Logs
──────────────────────────────────────────────────────────────────────────

PM2 Logs:
  pm2 logs cardio-sentinel-api

File Logs:
  tail -f /var/log/cardio-sentinel/app.log

Error Tracking:
  Configure Sentry in backend:
  
  const Sentry = require("@sentry/node");
  Sentry.init({ 
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV 
  });


System Monitoring
──────────────────────────────────────────────────────────────────────────

Tools:
  - New Relic (Application Performance Monitoring)
  - DataDog (Infrastructure monitoring)
  - Prometheus + Grafana (Open source monitoring)
  - ELK Stack (ElasticSearch, Logstash, Kibana)

Configure APM:
  npm install newrelic
  node -r newrelic server.js


Health Checks
──────────────────────────────────────────────────────────────────────────

Endpoint: GET /api/health
Response: { status: "healthy", timestamp: "2024-01-01T00:00:00Z" }

Configure monitoring:
  - Check every 60 seconds
  - Alert if down for 2+ minutes
  - Automatic restart on failure (PM2)


═══════════════════════════════════════════════════════════════════════════════
PHASE 7: DATABASE BACKUP & RECOVERY
═══════════════════════════════════════════════════════════════════════════════

MongoDB Atlas Automated Backups
──────────────────────────────────────────────────────────────────────────

1. Enable in MongoDB Atlas:
   a. Go to Cluster > Backup
   b. Enable "Automatic Backups"
   c. Set retention to 30+ days

2. Manual Backup:
   mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/cardio_sentinel"

3. Export Audit Logs (HIPAA Requirement):
   mongoexport --uri="mongodb+srv://user:pass@cluster.mongodb.net/cardio_sentinel" \
     --collection=auditlogs \
     --out=audit_logs_backup.json


Disaster Recovery Plan
──────────────────────────────────────────────────────────────────────────

Recovery Time Objective (RTO): 4 hours
Recovery Point Objective (RPO): 1 hour

1. Database failure:
   - Switch to replica set member
   - Failover takes <30 seconds
   - No data loss

2. Complete data loss:
   - Restore from automated backup
   - Restore from daily exports
   - Verify data integrity

3. Application failure:
   - PM2 auto-restart
   - Nginx failover (if load balanced)
   - Manual restart from latest code


═══════════════════════════════════════════════════════════════════════════════
PHASE 8: PERFORMANCE OPTIMIZATION
═══════════════════════════════════════════════════════════════════════════════

Database Optimization
──────────────────────────────────────────────────────────────────────────

1. Create Indexes (MongoDB):
   db.users.createIndex({ email: 1 });
   db.patients.createIndex({ doctorId: 1 });
   db.auditlogs.createIndex({ userId: 1, createdAt: -1 });
   db.auditlogs.createIndex({ createdAt: -1 });

2. Analyze Slow Queries:
   Profiler enabled in MongoDB Atlas

3. Database Statistics:
   Monitor in MongoDB Atlas Dashboard


API Response Caching
──────────────────────────────────────────────────────────────────────────

Redis Configuration:
  REDIS_URL=redis://:password@redis-host:6379

Cache Popular Endpoints:
  GET /api/doctor/patients - cache 5 minutes
  GET /api/patient/health-records - cache 10 minutes
  GET /api/audit/compliance-report - cache 30 minutes


CDN for Static Assets
──────────────────────────────────────────────────────────────────────────

Configure CloudFlare or AWS CloudFront:
  - Cache all .js, .css, .jpg, .png files
  - Purge cache on new deployments
  - Enable gzip compression


Load Testing
──────────────────────────────────────────────────────────────────────────

Using Apache Bench:
  ab -n 1000 -c 100 https://api.cardio-sentinel.com/api/health

Expected Results:
  Requests per second: > 1000
  Response time: < 100ms


═══════════════════════════════════════════════════════════════════════════════
DEPLOYMENT CHECKLIST
═══════════════════════════════════════════════════════════════════════════════

Pre-Deployment
──────────────
□ All code reviewed and tested
□ Dependencies updated and certified
□ Database backups created
□ Rollback plan documented
□ Monitoring alerts configured
□ Support team trained

Deployment
──────────
□ Backend deployed and tested
□ Frontend built and deployed
□ SSL certificates verified
□ DNS updated
□ Database migrated
□ Initial admin accounts created and approved
□ Smoke tests passed

Post-Deployment
───────────────
□ Monitor error rates for 24 hours
□ Check performance metrics
□ Verify all features working
□ Monitor user feedback
□ Check audit logs for suspicious activity
□ Document any issues


═══════════════════════════════════════════════════════════════════════════════
ROLLBACK PROCEDURE
═══════════════════════════════════════════════════════════════════════════════

If critical issues occur:

1. Stop New Version
   pm2 stop cardio-sentinel-api

2. Restore From Git
   cd /opt/cardio-sentinel
   git checkout previous-stable-tag
   npm install

3. Restart Old Version
   pm2 restart cardio-sentinel-api

4. Verify Health
   curl https://api.cardio-sentinel.com/api/health

5. Investigate Issue
   Review recent changes and logs

6. Create Fix
   Fix issue in code
   Test locally
   Re-deploy


═══════════════════════════════════════════════════════════════════════════════
