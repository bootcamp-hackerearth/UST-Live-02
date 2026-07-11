# Hospital Management System

# Production Deployment Guide

---

# Overview

This guide explains the complete production deployment process of the Hospital Management System.

The project consists of

- Angular Admin Portal
- Node.js Backend
- React Native Mobile App

All deployments are automated using GitHub Actions.

---

# Production Infrastructure

Cloud Provider

AWS EC2 Ubuntu 26.04 LTS

Database

MongoDB Atlas

Reverse Proxy

NGINX

Process Manager

PM2

SSL

Let's Encrypt

Domain

DuckDNS

Mobile Build

Expo EAS Build

CI/CD

GitHub Actions

---

# Architecture

Developer

↓

GitHub Repository

↓

GitHub Actions

↓

SSH

↓

AWS EC2

↓

PM2

↓

NGINX

↓

MongoDB Atlas

---

# Server Specifications

Operating System

Ubuntu 26.04 LTS

Node.js

v20

NPM

v10

PM2

v7

NGINX

Latest Stable

---

# Backend Deployment

Repository

HMS_Backend

Deployment Trigger

Push to

feature/visagan_sprint_5

Deployment Steps

1.

SSH into EC2

↓

2.

Navigate to project

```bash
cd ~/hms_project/HMS_backend
```

↓

3.

Fetch latest code

```bash
git fetch origin
git reset --hard origin/feature/visagan_sprint_5
```

↓

4.

Install dependencies

```bash
npm install
```

↓

5.

Restart application

```bash
pm2 restart hms-backend --update-env
```

↓

6.

Save PM2 state

```bash
pm2 save
```

↓

7.

Verify health

```bash
curl http://localhost:5000/health
```

---

# Backend GitHub Action

```yaml
Push

↓

SSH

↓

Git Fetch

↓

Git Reset

↓

npm install

↓

PM2 Restart

↓

Health Check
```

---

# Angular Deployment

Repository

HMS_Frontend

Deployment Trigger

Push

↓

feature/visagan_sprint_5

Deployment Steps

1.

SSH to EC2

↓

2.

Pull latest code

↓

3.

Install dependencies

```bash
npm ci
```

↓

4.

Build Angular

```bash
npm run build
```

↓

5.

Delete old files

```bash
sudo rm -rf /var/www/hms-admin/*
```

↓

6.

Copy build

```bash
sudo cp -r dist/HMS-Frontend/browser/* /var/www/hms-admin/
```

↓

7.

Reload NGINX

```bash
sudo systemctl reload nginx
```

↓

8.

Verify

```bash
curl http://localhost
```

---

# React Native Deployment

Repository

HMSMobile

Deployment

Expo EAS Cloud Build

Deployment Steps

```bash
eas build --platform android --profile preview
```

↓

Cloud Build

↓

APK Generated

↓

APK Download

---

# PM2 Configuration

Start

```bash
pm2 start src/server.js --name hms-backend
```

Startup

```bash
pm2 startup
```

Save

```bash
pm2 save
```

Status

```bash
pm2 status
```

Logs

```bash
pm2 logs
```

Monitor

```bash
pm2 monit
```

---

# NGINX Configuration

Reverse Proxy

```
443

↓

NGINX

↓

Angular

/api

↓

Node.js

↓

MongoDB
```

---

# SSL Configuration

Provider

Let's Encrypt

Verification

```bash
sudo certbot certificates
```

Renew

```bash
sudo certbot renew
```

---

# Firewall

UFW

Allowed Ports

22

80

443

Verification

```bash
sudo ufw status
```

---

# Fail2Ban

Installation

```bash
sudo apt install fail2ban
```

Status

```bash
sudo fail2ban-client status
```

Jail

sshd

---

# Automatic Updates

Package

Unattended Upgrades

Verification

```bash
systemctl status unattended-upgrades
```

---

# Monitoring

PM2

```bash
pm2 monit
```

Logs

```bash
pm2 logs
```

Backend Logs

Morgan

Winston

NGINX Logs

```bash
sudo tail -f /var/log/nginx/access.log
```

```bash
sudo tail -f /var/log/nginx/error.log
```

---

# Health Check Endpoints

Backend

```
GET /health
```

Response

```json
{
  "success": true,
  "message": "Server is running"
}
```

---

# Deployment Verification Checklist

## Backend

✅ PM2 Online

✅ MongoDB Connected

✅ Health Endpoint

✅ GitHub Action Passed

---

## Frontend

✅ Angular Build

✅ Files Copied

✅ NGINX Reloaded

✅ Site Accessible

---

## Mobile

✅ EAS Build Passed

✅ APK Generated

---

## Infrastructure

✅ HTTPS

✅ SSL

✅ DuckDNS

✅ Elastic IP

✅ PM2 Startup

✅ PM2 Save

✅ UFW

✅ Fail2Ban

✅ Auto Updates

---

# Rollback Strategy

Backend

```bash
git log --oneline

git reset --hard <commit>

pm2 restart HMS_backend
```

Frontend

```bash
git reset --hard <commit>

npm run build

sudo cp -r dist/... /var/www/hms-admin/
```

---

# Troubleshooting

PM2

```bash
pm2 logs
```

NGINX

```bash
sudo nginx -t
```

Restart NGINX

```bash
sudo systemctl restart nginx
```

Restart PM2

```bash
pm2 restart HMS_backend
```

Restart Server

```bash
sudo reboot
```

---

# Technologies Used

Backend

- Node.js
- Express
- MongoDB
- JWT
- Helmet
- Winston
- Morgan

Frontend

- Angular
- TypeScript
- RxJS

Mobile

- React Native
- Expo
- React Query

Infrastructure

- AWS EC2
- Ubuntu
- NGINX
- PM2
- GitHub Actions
- DuckDNS
- Let's Encrypt
- UFW
- Fail2Ban
- EAS Build

---

# Author

Bootstrap Sprint 5 Project

Hospital Management System
