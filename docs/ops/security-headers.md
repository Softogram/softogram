# Security headers (issue #10)

## Done in code
- FastAPI middleware sets `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`,
  `Strict-Transport-Security`, and `Permissions-Policy` on API responses.
- `frontend/public/_headers` documents the CSP/header set for hosts that honor Netlify-style `_headers`.

## Production (softogram.in is on S3 / CloudFront)
`_headers` is **not** applied by bare S3. Configure a **CloudFront Response Headers Policy**:

| Header | Value |
|--------|--------|
| Strict-Transport-Security | `max-age=31536000; includeSubDomains` |
| X-Content-Type-Options | `nosniff` |
| X-Frame-Options | `DENY` |
| Referrer-Policy | `strict-origin-when-cross-origin` |
| Content-Security-Policy | Copy from `frontend/public/_headers` (adjust if you add analytics hosts) |

Optional API nginx extras (defense in depth) in the `api.softogram.in` server block:

```nginx
add_header X-Content-Type-Options nosniff always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header X-Frame-Options DENY always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

## Verify
1. https://securityheaders.com/?q=https://softogram.in
2. Confirm fonts + PostHog + contact form still work after CSP enforce.
