# Ops: renew TLS for `api.softogram.in` (issue #1)

**Status (verified 2026-08-06):** certificate **expired**.

| Host | IP | TLS | App |
|------|-----|-----|-----|
| `api.softogram.in` | `18.61.153.149` | Let's Encrypt **expired 2026-06-09** (nginx/1.28.2) | FastAPI live (`curl -k` → `{"message":"Softogram API is Live"}`) |
| `softogram.in` / `www` | Amazon S3 | Amazon cert OK until **2026-09-23** | Static frontend |

Browsers block `POST https://api.softogram.in/api/contact` until the API cert is renewed. Local / E2E contact path is fine; production leads are not.

## Prerequisites

SSH access to the API host as a user that can run `sudo` (typical: `ubuntu@18.61.153.149` or the key/user you use for Softogram API deploys).

```bash
ssh -i ~/.ssh/<your-key> ubuntu@18.61.153.149
# confirm nginx + certbot
sudo nginx -t
sudo certbot certificates
```

## 1. Renew now

Preferred (if certbot + nginx plugin already used for this host):

```bash
sudo certbot renew --cert-name api.softogram.in --force-renewal
# or interactive:
sudo certbot --nginx -d api.softogram.in
sudo systemctl reload nginx
```

If HTTP-01 fails (firewall / only 443 open), use DNS-01 with your DNS provider, or temporarily allow port 80 from the internet for the challenge.

Verify from your laptop (no `-k`):

```bash
curl -sS https://api.softogram.in/api/
# expect: {"message":"Softogram API is Live"}

echo | openssl s_client -connect api.softogram.in:443 -servername api.softogram.in 2>/dev/null \
  | openssl x509 -noout -dates -subject
# notAfter should be ~90 days out
```

## 2. Automate renewal

```bash
# systemd timer (certbot package usually installs this)
systemctl list-timers | grep -i certbot
sudo systemctl enable --now certbot.timer

# dry-run
sudo certbot renew --dry-run
```

Optional deploy hook so nginx always reloads after a successful renew — e.g. `/etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh`:

```bash
#!/bin/bash
systemctl reload nginx
```

```bash
sudo chmod +x /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh
```

Document the actual path to the nginx site config on the server once known (`sites-enabled` vs `/etc/nginx/conf.d/`).

## 3. Monitoring (cert expiry + HTTPS)

Pick one and alert to email/WhatsApp:

- [UptimeRobot](https://uptimerobot.com/) — HTTPS monitor on `https://api.softogram.in/api/` **and** `https://softogram.in/`
- Or Better Stack / Checkly / AWS Route53 health checks

Also add a **certificate expiry** check (UptimeRobot “SSL certificate” keyword / Better Stack TLS check) so a failed auto-renew is caught before browsers fail.

## 4. Smoke after renew

1. `curl -sS https://api.softogram.in/api/` OK without `-k`
2. Open `https://softogram.in/`, submit Contact with a real email
3. Confirm notification lands in `support@softogram.in` (or current `RECIPIENT_EMAIL`)

Note: production contact may still fail after TLS if **#2 CORS** is misconfigured for the live origin. Fix TLS first, then verify CORS.

## Ops note: production `CORS_ORIGINS`

After deploy, set on the API host (never `*`):

```bash
CORS_ORIGINS=https://softogram.in,https://www.softogram.in
```

Code defaults to these origins if the env var is missing or set to `*`.
Credentials are off; methods `GET,POST`; header `Content-Type` only.
See issue #2.

## Acceptance (issue #1)

- [ ] `curl https://api.softogram.in/api/` succeeds without `-k`
- [ ] Certbot timer (or equivalent) enabled; dry-run succeeds
- [ ] External HTTPS + cert-expiry monitors active
- [ ] Live contact form produces an inbox email
