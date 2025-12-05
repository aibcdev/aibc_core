# Deploy Backend to VPS (DigitalOcean/Linode)

## Prerequisites

- VPS instance (DigitalOcean, Linode, AWS EC2, etc.)
- Domain DNS access (to point `api.aibcmedia.com` to your VPS)
- SSH access to your VPS

---

## Step 1: Set Up VPS

### Create Droplet/Instance

**DigitalOcean:**
1. Create new Droplet
2. Choose: Ubuntu 22.04 LTS
3. Plan: Basic ($12/month - 2GB RAM, 1 vCPU)
4. Add SSH key
5. Create droplet

**Linode:**
1. Create Linode
2. Distribution: Ubuntu 22.04 LTS
3. Plan: Shared CPU - Nanode ($12/month)
4. Add SSH key
5. Create Linode

---

## Step 2: Initial Server Setup

### Connect via SSH
```bash
ssh root@YOUR_SERVER_IP
```

### Update system
```bash
apt update && apt upgrade -y
```

### Install Node.js 18
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
node --version  # Should show v18.x.x
```

### Install PM2 (Process Manager)
```bash
npm install -g pm2
```

### Install Nginx
```bash
apt install -y nginx
systemctl start nginx
systemctl enable nginx
```

### Install Certbot (for SSL)
```bash
apt install -y certbot python3-certbot-nginx
```

---

## Step 3: Deploy Backend Code

### Option A: Clone from GitHub (Recommended)

```bash
# Install git
apt install -y git

# Clone repository
cd /var/www
git clone YOUR_GITHUB_REPO_URL aibc-backend
cd aibc-backend/backend

# Install dependencies
npm install

# Install Playwright browsers
npm run install-playwright
```

### Option B: Upload via SCP

```bash
# On your local machine
cd /path/to/aibc_core-1
scp -r backend root@YOUR_SERVER_IP:/var/www/aibc-backend
```

Then on server:
```bash
cd /var/www/aibc-backend/backend
npm install
npm run install-playwright
```

---

## Step 4: Configure Environment

```bash
cd /var/www/aibc-backend/backend
nano .env
```

Add:
```env
PORT=3001
FRONTEND_URL=https://aibcmedia.com
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=production
```

Save and exit (Ctrl+X, Y, Enter)

---

## Step 5: Build and Start with PM2

```bash
# Build TypeScript
npm run build

# Start with PM2
pm2 start dist/server.js --name aibc-backend

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup
# Follow the instructions it prints
```

---

## Step 6: Configure Nginx Reverse Proxy

```bash
nano /etc/nginx/sites-available/aibc-backend
```

Add:
```nginx
server {
    listen 80;
    server_name api.aibcmedia.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
ln -s /etc/nginx/sites-available/aibc-backend /etc/nginx/sites-enabled/
nginx -t  # Test configuration
systemctl reload nginx
```

---

## Step 7: Set Up SSL with Let's Encrypt

```bash
certbot --nginx -d api.aibcmedia.com
```

Follow prompts:
- Enter email
- Agree to terms
- Choose whether to redirect HTTP to HTTPS (recommended: Yes)

---

## Step 8: Configure DNS

1. Go to your domain registrar (where you bought aibcmedia.com)
2. Add DNS record:
   - **Type:** A
   - **Name:** api
   - **Value:** YOUR_SERVER_IP
   - **TTL:** 3600

Wait 5-60 minutes for DNS propagation.

---

## Step 9: Verify Deployment

```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs aibc-backend

# Test API
curl https://api.aibcmedia.com/health
```

Should return: `{"status":"ok"}`

---

## Step 10: Update Frontend

In Netlify dashboard:
1. Go to Site settings → Environment variables
2. Update `VITE_API_URL` to: `https://api.aibcmedia.com`
3. Trigger new deployment

---

## Monitoring & Maintenance

### View logs
```bash
pm2 logs aibc-backend
```

### Restart backend
```bash
pm2 restart aibc-backend
```

### Update code
```bash
cd /var/www/aibc-backend/backend
git pull
npm install
npm run build
pm2 restart aibc-backend
```

### Check server resources
```bash
htop  # or: top
```

---

## Security Checklist

- [ ] Firewall configured (UFW)
- [ ] SSH key authentication only
- [ ] SSL certificate active
- [ ] PM2 running as non-root user (optional but recommended)
- [ ] Regular system updates

### Set up firewall
```bash
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp # HTTPS
ufw enable
```

---

## Cost Breakdown

- **VPS:** $12-24/month (DigitalOcean/Linode)
- **Domain:** $12/year (~$1/month)
- **SSL:** Free (Let's Encrypt)
- **Total:** ~$13-25/month

---

## Troubleshooting

### Backend not starting
- Check logs: `pm2 logs aibc-backend`
- Check environment variables: `cat .env`
- Check port: `netstat -tulpn | grep 3001`

### Nginx errors
- Test config: `nginx -t`
- Check logs: `tail -f /var/log/nginx/error.log`

### SSL issues
- Renew certificate: `certbot renew --dry-run`
- Check certificate: `certbot certificates`

### DNS not working
- Check DNS: `dig api.aibcmedia.com`
- Wait longer (up to 48 hours)
- Verify DNS record is correct

---

## Next Steps

1. Set up automated backups
2. Configure monitoring (UptimeRobot, Pingdom)
3. Set up log rotation
4. Configure auto-scaling (if needed)

