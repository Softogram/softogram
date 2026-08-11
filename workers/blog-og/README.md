# Blog OG crawler function (issues #41, #74)

Softogram's marketing site is a CRA SPA. Link-preview bots (WhatsApp, LinkedIn, X) do not run JavaScript, so they see the generic homepage meta tags from `index.html` instead of the post's title/image.

This started as a Cloudflare Worker, but the site's DNS and CDN are on AWS CloudFront, not Cloudflare - deploying a Cloudflare Worker would have meant moving `softogram.in`'s nameservers to Cloudflare, which touches everything under the domain (SES email records, the `api.softogram.in` subdomain, TXT verification) for no real reason. Ported to Lambda@Edge instead, which runs on the CDN the site already uses.

This Lambda function (`index.js`), triggered on CloudFront's `origin-request` event:

1. Detects known crawler user agents on `/blog/:slug`
2. Fetches pre-rendered OG HTML from `GET {API_ORIGIN}/api/content/blog/{slug}/share.html`
3. Returns that HTML directly, short-circuiting the normal origin fetch
4. Proxies `/rss.xml` to the FastAPI RSS feed (issue #45) the same way
5. Passes every other request through unmodified (returns `request` as-is, so CloudFront continues to the SPA/S3 origin normally)

`/blog/:slug` and `/rss.xml` don't exist as real S3 objects (client-side routing), so S3 always 404s them and CloudFront's custom-error-to-`index.html` substitution has `ErrorCachingMinTTL: 0` - meaning these paths are never actually cache-hit at the edge, and `origin-request` reliably fires on every request to them, crawler or not.

Lambda@Edge doesn't support environment variables, so `API_ORIGIN` is a hardcoded constant in `index.js` rather than config.

## Deploy (human, first time only)

Already deployed as of issue #74. To redeploy after editing `index.js`:

```bash
cd workers/blog-og
zip function.zip index.js
aws lambda update-function-code \
  --region us-east-1 \
  --function-name softogram-blog-og \
  --zip-file fileb://function.zip
aws lambda publish-version --region us-east-1 --function-name softogram-blog-og
```

Then update the CloudFront distribution's `DefaultCacheBehavior.LambdaFunctionAssociations` to point at the new version ARN (Lambda@Edge requires a specific published version, not `$LATEST`) - via `aws cloudfront get-distribution-config` / `update-distribution`, or the console.

Reference (as deployed):

- Function: `softogram-blog-og`, `us-east-1` (Lambda@Edge must be in `us-east-1`)
- Execution role: `softogram-blog-og-lambda-edge` (trusts both `lambda.amazonaws.com` and `edgelambda.amazonaws.com`)
- Associated with CloudFront distribution `E3GNM6E0RDAH0J`, `DefaultCacheBehavior`, event type `origin-request`

## Verify

```bash
curl -sA "WhatsApp/2.0" "https://softogram.in/blog/how-we-built-polluxkart" | grep og:title
# Expect the post title, not the homepage title.

curl -sA "Mozilla/5.0" "https://softogram.in/blog/how-we-built-polluxkart" | grep '<title>'
# Expect the normal SPA shell - regular visitors are unaffected.
```

Also re-check with Facebook Sharing Debugger / X Card Validator after deploy.
