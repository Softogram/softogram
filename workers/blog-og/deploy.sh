#!/usr/bin/env bash
# Publish the Lambda@Edge function and repoint CloudFront at the new version.
#
# Written because two shipped features are inert until this runs:
#
#   #78  /sitemap.xml on the apex domain still serves the old static file
#        instead of the CMS-generated one.
#   #80  /products, /client-work, /blog and the policy pages still serve the
#        generic index.html, so a crawler that does not run JavaScript sees the
#        homepage's title and canonical on every route.
#
# Both are additive. Until this is deployed every route behaves exactly as it
# does today, so there is no rush and no half-state to worry about.
#
# Needs AWS credentials with lambda:UpdateFunctionCode, lambda:PublishVersion,
# cloudfront:GetDistributionConfig and cloudfront:UpdateDistribution on the
# account that owns the distribution. Run from this directory.
set -euo pipefail

REGION="us-east-1"          # Lambda@Edge functions must live in us-east-1
FUNCTION_NAME="softogram-blog-og"
DISTRIBUTION_ID="E3GNM6E0RDAH0J"

here() { printf '\n\033[1m==> %s\033[0m\n' "$*"; }

here "Sanity-checking index.js before uploading"
node --check index.js
grep -q "PRERENDERED_ROUTES" index.js || { echo "index.js is missing the #80 route rewrite - wrong copy?"; exit 1; }
grep -q "/sitemap.xml" index.js || { echo "index.js is missing the #78 sitemap proxy - wrong copy?"; exit 1; }
echo "ok"

here "Confirming access before changing anything"
aws lambda get-function --region "$REGION" --function-name "$FUNCTION_NAME" \
  --query 'Configuration.[FunctionName,LastModified]' --output text
aws cloudfront get-distribution --id "$DISTRIBUTION_ID" \
  --query 'Distribution.[Id,Status]' --output text

here "Packaging"
rm -f function.zip
zip -q function.zip index.js
echo "function.zip $(wc -c < function.zip) bytes"

here "Uploading code"
aws lambda update-function-code \
  --region "$REGION" \
  --function-name "$FUNCTION_NAME" \
  --zip-file fileb://function.zip \
  --query '[FunctionName,LastModified]' --output text

# update-function-code returns before the new code is ready to publish.
aws lambda wait function-updated --region "$REGION" --function-name "$FUNCTION_NAME"

here "Publishing a version"
# Lambda@Edge cannot be associated with \$LATEST - it needs a numbered version.
VERSION_ARN=$(aws lambda publish-version \
  --region "$REGION" --function-name "$FUNCTION_NAME" \
  --query 'FunctionArn' --output text)
echo "published: $VERSION_ARN"

here "Repointing CloudFront"
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

aws cloudfront get-distribution-config --id "$DISTRIBUTION_ID" > "$TMP/full.json"
ETAG=$(python3 -c "import json;print(json.load(open('$TMP/full.json'))['ETag'])")

python3 - "$TMP/full.json" "$TMP/config.json" "$VERSION_ARN" <<'PY'
import json, sys
full_path, out_path, arn = sys.argv[1], sys.argv[2], sys.argv[3]
cfg = json.load(open(full_path))["DistributionConfig"]

assocs = cfg["DefaultCacheBehavior"].setdefault(
    "LambdaFunctionAssociations", {"Quantity": 0, "Items": []}
)
items = assocs.get("Items") or []

# Replace the viewer-request association only. Anything else attached to this
# behaviour is left exactly as it is.
viewer = [i for i in items if i["EventType"] == "viewer-request"]
others = [i for i in items if i["EventType"] != "viewer-request"]
if len(viewer) > 1:
    sys.exit("More than one viewer-request association found - inspect manually.")
if viewer:
    print(f"  replacing existing viewer-request: {viewer[0]['LambdaFunctionARN']}")
else:
    print("  no existing viewer-request association - adding one")

new = {"LambdaFunctionARN": arn, "EventType": "viewer-request", "IncludeBody": False}
items = others + [new]
assocs["Items"] = items
assocs["Quantity"] = len(items)

json.dump(cfg, open(out_path, "w"))
print(f"  associations now: {[i['EventType'] for i in items]}")
PY

aws cloudfront update-distribution \
  --id "$DISTRIBUTION_ID" \
  --if-match "$ETAG" \
  --distribution-config "file://$TMP/config.json" \
  --query 'Distribution.[Id,Status]' --output text

here "Invalidating cache"
aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION_ID" \
  --paths "/sitemap.xml" "/products" "/client-work" "/blog" \
          "/privacy-policy" "/terms-and-conditions" "/refund-policy" "/cookie-policy" \
  --query 'Invalidation.[Id,Status]' --output text

cat <<'DONE'

Deployed. CloudFront takes roughly 5-15 minutes to propagate to every edge.

Verify afterwards - these are the acceptance criteria for #78 and #80:

  # #78: apex sitemap should list every blog post, not the old static file
  curl -s https://softogram.in/sitemap.xml | grep -c '<url>'

  # #80: each route should return its OWN title and canonical, with no JS
  for r in / /products /client-work /blog /cookie-policy; do
    echo "-- $r"
    curl -s "https://softogram.in$r" \
      | grep -oE '<title>[^<]*</title>|rel="canonical" href="[^"]*"'
  done

If anything looks wrong, re-run this script against the previously published
version ARN to roll back - `aws lambda list-versions-by-function --region
us-east-1 --function-name softogram-blog-og` shows them.
DONE
