# Troubleshooting - Xử lý lỗi

## Lỗi: "NET::ERR_CERT_COMMON_NAME_INVALID"

### Nguyên nhân
- Certificate chưa được cấu hình đúng trong Nginx
- Certificate không khớp với domain
- Nginx chưa có cấu hình HTTPS

### Giải pháp

#### Bước 1: Kiểm tra certificate
```bash
chmod +x check_ssl.sh
sudo bash check_ssl.sh
```

#### Bước 2: Cấu hình Nginx với SSL
```bash
# Chỉnh sửa đường dẫn root trong script trước
nano configure_nginx_ssl.sh  # Sửa ROOT_PATH

# Chạy script
chmod +x configure_nginx_ssl.sh
sudo bash configure_nginx_ssl.sh
```

#### Bước 3: Xóa HSTS cache trong browser
1. Mở Chrome: `chrome://net-internals/#hsts`
2. Tìm domain `serievo-taxcheck.nhtan.app`
3. Click "Delete domain security policies"
4. Clear browser cache và thử lại

#### Nếu vẫn lỗi, tạo lại certificate:
```bash
# Xóa certificate cũ
sudo certbot delete --cert-name serievo-taxcheck.nhtan.app

# Tạo lại
sudo systemctl stop nginx
sudo certbot certonly --standalone -d serievo-taxcheck.nhtan.app --non-interactive --agree-tos --register-unsafely-without-email
sudo systemctl start nginx

# Cấu hình lại Nginx
sudo bash configure_nginx_ssl.sh
```

## Lỗi: "Server is speaking HTTP/2 over HTTP"

### Nguyên nhân
Nginx đang sử dụng HTTP/2 trên port 80, nhưng Let's Encrypt cần HTTP/1.1 để verify domain.

### Giải pháp

#### Cách 1: Dùng standalone mode (Khuyến nghị)

```bash
# Chạy script tự động
chmod +x certbot_standalone.sh
sudo bash certbot_standalone.sh

# Hoặc chạy thủ công
sudo systemctl stop nginx
sudo certbot certonly --standalone -d serievo-taxcheck.nhtan.app --non-interactive --agree-tos --register-unsafely-without-email
sudo systemctl start nginx
```

Sau đó cấu hình Nginx thủ công để sử dụng certificate.

#### Cách 2: Sửa Nginx config

```bash
# Chạy script tự động
chmod +x fix_certbot_http2.sh
sudo bash fix_certbot_http2.sh

# Sau đó chạy lại certbot
sudo certbot --nginx -d serievo-taxcheck.nhtan.app --non-interactive --agree-tos --register-unsafely-without-email --redirect
```

#### Cách 3: Sửa thủ công trong Nginx config

Tìm và xóa `http2` khỏi dòng `listen 80`:

```nginx
# Trước (sai)
listen 80 http2;

# Sau (đúng)
listen 80;
```

Sau đó:
```bash
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d serievo-taxcheck.nhtan.app --non-interactive --agree-tos --register-unsafely-without-email --redirect
```

## Lỗi: "Connection refused" hoặc "Timeout"

### Nguyên nhân
- Firewall chặn port 80/443
- Domain chưa trỏ về IP server
- Nginx chưa được cấu hình đúng

### Giải pháp

```bash
# Kiểm tra firewall
sudo ufw status
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Kiểm tra domain trỏ đúng chưa
dig serievo-taxcheck.nhtan.app
nslookup serievo-taxcheck.nhtan.app

# Kiểm tra Nginx
sudo nginx -t
sudo systemctl status nginx
```

## Lỗi: "Certificate already exists"

### Giải pháp

```bash
# Xem danh sách certificate
sudo certbot certificates

# Xóa certificate cũ nếu cần
sudo certbot delete --cert-name serievo-taxcheck.nhtan.app

# Sau đó chạy lại
sudo certbot --nginx -d serievo-taxcheck.nhtan.app --non-interactive --agree-tos --register-unsafely-without-email --redirect
```

## Lỗi: "Too many requests"

### Nguyên nhân
Let's Encrypt giới hạn 5 certificate mỗi domain mỗi tuần.

### Giải pháp
- Đợi 1 tuần
- Hoặc dùng staging environment để test:
```bash
sudo certbot --nginx -d serievo-taxcheck.nhtan.app --staging --non-interactive --agree-tos --register-unsafely-without-email
```

## Kiểm tra certificate sau khi cấu hình

```bash
# Xem certificate
sudo certbot certificates

# Test SSL
openssl s_client -connect serievo-taxcheck.nhtan.app:443 -servername serievo-taxcheck.nhtan.app

# Test online
# https://www.ssllabs.com/ssltest/analyze.html?d=serievo-taxcheck.nhtan.app
```

## Logs để debug

```bash
# Certbot logs
sudo tail -f /var/log/letsencrypt/letsencrypt.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Nginx access logs
sudo tail -f /var/log/nginx/access.log
```

