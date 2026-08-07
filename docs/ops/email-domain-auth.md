# Softogram email identity + SendGrid domain auth (issue #11)

## Done in code
- Canonical public address: **support@softogram.in** (UI, policies, JSON-LD)
- Internal notification recipient: `RECIPIENT_EMAIL=support@softogram.in`
- Verified sender for SendGrid: `SENDER_EMAIL=admin@softogram.in` (or authenticated domain address)
- Lead **auto-reply** confirmation email after successful notification send

## Your ops checklist
1. Softogram SendGrid → Settings → Sender Authentication → Authenticate Domain `softogram.in`
2. Add the 3 CNAME records SendGrid shows (keep TTL moderate).
3. Publish DMARC (start with monitor mode if you prefer):
   ```
   _dmarc.softogram.in. TXT "v=DMARC1; p=none; rua=mailto:support@softogram.in"
   ```
   Later raise to `p=quarantine`.
4. Confirm SPF/DKIM pass: send a test and check headers / mail-tester.com (≥ 9/10).
5. Ensure production `SENDER_EMAIL` is on the authenticated domain.
