#!/usr/bin/env bash
# One-time setup for the inspected AlmaLinux host, run interactively as root.
set -Eeuo pipefail
umask 077
backup='not-created'
trap 'printf "\nSTOP: line %s failed. Backup: %s\nDo not rerun blindly; send the error output.\n" "$LINENO" "$backup" >&2' ERR
die() { printf '%s\n' "$*" >&2; exit 1; }
[[ $EUID -eq 0 ]] || die 'Run as root.'
source /etc/os-release
[[ "$ID" == almalinux && "$VERSION_ID" == 9.* ]] || die 'This script is for AlmaLinux 9 only.'
cd /opt/yvnbet
[[ -f .env && -f compose.yaml ]] || die 'Missing existing YvnBet installation.'
for file in compose.override.yaml compose.override.yml docker-compose.override.yaml docker-compose.override.yml; do
  [[ ! -e "$file" ]] || die "Existing $file needs review first."
done
[[ ! -e /etc/nginx/conf.d/yvnbet.conf ]] || die 'yvnbet.conf already exists; review it first.'
[[ ! -e /etc/letsencrypt/renewal/yvnbet.com.conf ]] || die 'An existing yvnbet.com certificate needs review first.'
nginx -t
if nginx -T 2>&1 | grep -E '^[[:space:]]*server_name[[:space:]].*(yvnbet\.com)' >/dev/null; then
  die 'A server block already names yvnbet.com; review it first.'
fi
[[ -z "$(ss -H -ltn 'sport = :443')" ]] || die 'Port 443 is now occupied; review its owner first.'
curl -fsS --max-time 10 http://127.0.0.1:8095/api/health
docker compose ps web

# Protect existing configs, including their private include files.
backup="/root/yvnbet-before-https-$(date +%Y%m%d-%H%M%S)"
install -d -m 700 "$backup"
cp -a /etc/nginx "$backup/nginx"
cp -a .env compose.yaml "$backup/"
if [[ -d /etc/letsencrypt ]]; then cp -a /etc/letsencrypt "$backup/letsencrypt"; fi
printf '\nBackup: %s\n' "$backup"

dnf install -y epel-release
dnf install -y certbot bind-utils python3
for domain in yvnbet.com www.yvnbet.com; do
  for resolver in 1.1.1.1 8.8.8.8; do
    addresses=$(dig +short +time=3 +tries=1 A "$domain" @"$resolver" | sort -u)
    [[ "$addresses" == 62.169.27.185 ]] || die "DNS for $domain via $resolver is not exclusively 62.169.27.185. Wait for DNS."
    [[ -z "$(dig +short +time=3 +tries=1 AAAA "$domain" @"$resolver")" ]] || die "IPv6 DNS for $domain needs review before proceeding."
  done
done
if systemctl is-active --quiet firewalld; then
  firewall-cmd --zone=public --query-service=http
  firewall-cmd --zone=public --query-service=https
  firewall-cmd --permanent --zone=public --query-service=http
  firewall-cmd --permanent --zone=public --query-service=https
fi
if [[ "$(getenforce)" == Enforcing ]]; then
  getsebool httpd_can_network_connect | grep -q -- '--> on'
fi

install -d -m 755 /var/www/yvnbet-acme/.well-known/acme-challenge
restorecon -R /var/www/yvnbet-acme
cat > "$backup/http.conf" <<'NGINX'
server {
    listen 80;
    listen [::]:80;
    server_name yvnbet.com www.yvnbet.com;
    client_max_body_size 8m;
    location ^~ /.well-known/acme-challenge/ {
        root /var/www/yvnbet-acme;
        default_type text/plain;
        try_files $uri =404;
    }
    location / {
        proxy_pass http://127.0.0.1:8095;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX
install -m 644 "$backup/http.conf" /etc/nginx/conf.d/yvnbet.conf
restorecon /etc/nginx/conf.d/yvnbet.conf
nginx -t
systemctl reload nginx

# Certbot handles domain validation through the running Nginx, without stopping it.
# Answer its email and subscriber-agreement prompts yourself.
certbot certonly --webroot -w /var/www/yvnbet-acme \
  --cert-name yvnbet.com -d yvnbet.com -d www.yvnbet.com

cat > "$backup/https.conf" <<'NGINX'
server {
    listen 80;
    listen [::]:80;
    server_name yvnbet.com www.yvnbet.com;
    location ^~ /.well-known/acme-challenge/ {
        root /var/www/yvnbet-acme;
        default_type text/plain;
        try_files $uri =404;
    }
    location / { return 301 https://yvnbet.com$request_uri; }
}
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name www.yvnbet.com;
    ssl_certificate /etc/letsencrypt/live/yvnbet.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yvnbet.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    return 301 https://yvnbet.com$request_uri;
}
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name yvnbet.com;
    ssl_certificate /etc/letsencrypt/live/yvnbet.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yvnbet.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    client_max_body_size 8m;
    location / {
        proxy_pass http://127.0.0.1:8095;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 10s;
        proxy_read_timeout 60s;
    }
}
NGINX
install -m 644 "$backup/https.conf" /etc/nginx/conf.d/yvnbet.conf
if ! nginx -t; then
  install -m 644 "$backup/http.conf" /etc/nginx/conf.d/yvnbet.conf
  die 'HTTPS config failed validation; restored the HTTP config. Nginx was not reloaded.'
fi
systemctl reload nginx

# Keep the same application port and volume; bind it only to localhost.
python3 - <<'PY'
from pathlib import Path
p = Path('.env')
lines = p.read_text().splitlines()
values = {'YVNBET_PORT': '127.0.0.1:8095', 'YVNBET_ORIGIN': 'https://yvnbet.com'}
lines = [line for line in lines if line.split('=', 1)[0].strip() not in values]
lines += [f'{key}={value}' for key, value in values.items()]
p.write_text('\n'.join(lines) + '\n')
p.chmod(0o600)
PY
cat > compose.override.yaml <<'YAML'
services:
  web:
    environment:
      TRUST_PROXY_HOPS: "1"
YAML
docker compose config --quiet
docker compose up -d --no-build --wait --wait-timeout 120 web
curl -fsS --max-time 15 http://127.0.0.1:8095/api/health

install -d -m 755 /etc/letsencrypt/renewal-hooks/deploy
[[ ! -e /etc/letsencrypt/renewal-hooks/deploy/yvnbet-nginx.sh ]] || die 'Existing renewal hook needs review.'
cat > /etc/letsencrypt/renewal-hooks/deploy/yvnbet-nginx.sh <<'HOOK'
#!/bin/sh
set -e
case " ${RENEWED_DOMAINS:-} " in
  *" yvnbet.com "*) /usr/sbin/nginx -t && /usr/bin/systemctl reload nginx ;;
esac
HOOK
chmod 755 /etc/letsencrypt/renewal-hooks/deploy/yvnbet-nginx.sh
restorecon -R /etc/letsencrypt/renewal-hooks
systemctl enable --now certbot-renew.timer
certbot renew --cert-name yvnbet.com --dry-run --run-deploy-hooks

nginx -t
docker compose ps web
systemctl list-timers --all certbot-renew.timer
certbot certificates --cert-name yvnbet.com
for domain in yvnbet.com www.yvnbet.com; do
  curl -fsS --max-time 20 -o /dev/null -w "$domain HTTP: %{http_code} redirect=%{redirect_url}\n" "http://$domain/"
  curl -fsSL --max-time 20 -o /dev/null -w "$domain HTTPS: %{http_code} final=%{url_effective}\n" "https://$domain/"
done
curl -fsS --max-time 20 https://yvnbet.com/api/health
printf '\nFinal Nginx config:\n'
cat /etc/nginx/conf.d/yvnbet.conf
printf '\nDONE. Site: https://yvnbet.com  Admin: https://yvnbet.com/admin\nBackup: %s\n' "$backup"
