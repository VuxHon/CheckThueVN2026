# Certbot Commands - Hướng dẫn nhanh

## Lệnh cơ bản

### 1. Lấy SSL certificate (tự động cấu hình Nginx)
```bash
# Với email
sudo certbot --nginx -d serievo-taxcheck.nhtan.app --non-interactive --agree-tos --email your-email@example.com --redirect

# Không cần email
sudo certbot --nginx -d serievo-taxcheck.nhtan.app --non-interactive --agree-tos --register-unsafely-without-email --redirect
```

### 2. Lấy SSL certificate (chỉ lấy, không cấu hình)
```bash
# Với email
sudo certbot certonly --nginx -d serievo-taxcheck.nhtan.app --non-interactive --agree-tos --email your-email@example.com

# Không cần email
sudo certbot certonly --nginx -d serievo-taxcheck.nhtan.app --non-interactive --agree-tos --register-unsafely-without-email
```

### 3. Lấy certificate cho nhiều domain
```bash
sudo certbot --nginx -d domain1.com -d domain2.com --non-interactive --agree-tos --email your-email@example.com
```

## Quản lý Certificate

### Xem danh sách certificate
```bash
sudo certbot certificates
```

### Renew certificate
```bash
# Renew tất cả certificate sắp hết hạn
sudo certbot renew

# Renew một certificate cụ thể
sudo certbot renew --cert-name serievo-taxcheck.nhtan.app
```

### Test auto-renewal
```bash
sudo certbot renew --dry-run
```

### Xóa certificate
```bash
sudo certbot delete --cert-name serievo-taxcheck.nhtan.app
```

## Cấu hình Nginx thủ công

Sau khi có certificate, thêm vào nginx.conf:

```nginx
server {
    listen 443 ssl http2;
    server_name serievo-taxcheck.nhtan.app;

    ssl_certificate /etc/letsencrypt/live/serievo-taxcheck.nhtan.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/serievo-taxcheck.nhtan.app/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Rest of your configuration...
    root /var/www/checkthuevn;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name serievo-taxcheck.nhtan.app;
    return 301 https://$server_name$request_uri;
}
```

## Troubleshooting

### Kiểm tra certificate
```bash
# Xem thông tin certificate
sudo openssl x509 -in /etc/letsencrypt/live/serievo-taxcheck.nhtan.app/cert.pem -text -noout

# Kiểm tra ngày hết hạn
sudo certbot certificates
```

### Kiểm tra Nginx config
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Kiểm tra firewall
```bash
# Ubuntu/Debian
sudo ufw status
sudo ufw allow 443/tcp

# CentOS/RHEL
sudo firewall-cmd --list-all
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### Logs
```bash
# Certbot logs
sudo tail -f /var/log/letsencrypt/letsencrypt.log

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

## Auto-renewal

Certbot tự động tạo systemd timer để renew certificate. Kiểm tra:

```bash
# Xem timer status
sudo systemctl status certbot.timer

# Xem timer details
sudo systemctl list-timers | grep certbot

# Enable timer (nếu chưa enable)
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

## Lệnh nhanh cho domain của bạn

```bash
# Setup SSL tự động (không cần email)
sudo certbot --nginx -d serievo-taxcheck.nhtan.app --non-interactive --agree-tos --register-unsafely-without-email --redirect

# Setup SSL tự động (có email)
sudo certbot --nginx -d serievo-taxcheck.nhtan.app --non-interactive --agree-tos --email your-email@example.com --redirect

# Renew
sudo certbot renew

# Test renewal
sudo certbot renew --dry-run
```

**Lưu ý:** Không dùng email sẽ không nhận được thông báo khi certificate sắp hết hạn, nhưng auto-renewal vẫn hoạt động bình thường.

