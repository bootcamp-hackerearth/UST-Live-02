# Troubleshooting Guide

## Backend not running

Check

pm2 status

Restart

pm2 restart hms-backend

Logs

pm2 logs

---

NGINX

Configuration

sudo nginx -t

Restart

sudo systemctl restart nginx

Status

systemctl status nginx

---

SSL

Certificates

sudo certbot certificates

Renew

sudo certbot renew

---

Firewall

Status

sudo ufw status

---

Fail2Ban

Status

sudo fail2ban-client status

---

Backend Health

curl http://localhost:5000/health

---

Frontend

curl http://localhost

---

Server Logs

NGINX

sudo tail -f /var/log/nginx/error.log

PM2

pm2 logs

Morgan

logs/access.log

Winston

logs/error.log

---

Server Restart

sudo reboot