# Upsolve payments: setup and how it works

Upsolve by Softogram takes payment for its live DSA batch through Razorpay, an Indian payment company.
This page is what you need to turn payments on, and to understand what happens when a student pays.

## Words used here

- **Order:** a Razorpay record that says "someone intends to pay this much". Our server creates it, so the amount cannot be changed in the browser.
- **Signature:** a code Razorpay computes using a secret only Razorpay and our server know. If it matches, the payment is real.
- **Webhook:** a message Razorpay's servers send to ours when something happens, for example a payment succeeding.
- **Test mode:** Razorpay's practice environment. It takes fake cards and moves no real money.

## Turning it on

The backend reads four settings from `backend/.env` on the EC2 server.
Until the first two exist, the page offers a WhatsApp payment link instead of a pay button, so nothing breaks.

```
RAZORPAY_KEY_ID=rzp_test_xxxx
RAZORPAY_KEY_SECRET=xxxx
RAZORPAY_WEBHOOK_SECRET=xxxx
```

Never commit these values.
`RAZORPAY_API_BASE` also exists, but it is only for pointing the tests at a local mock.

In the Razorpay dashboard:

1. Settings, API Keys: generate test-mode keys first, and put them in `backend/.env`.
2. Settings, Webhooks: add `https://api.softogram.in/api/upsolve/razorpay/webhook`.
3. Tick these events: `payment.captured`, `payment.failed`, `payment_link.paid`, `refund.processed`.
4. Set a webhook secret, and put the same value in `backend/.env` as `RAZORPAY_WEBHOOK_SECRET`.
5. Settings, Payment Capture: confirm it is set to automatic, so a successful payment is captured without a manual step.

Restart the backend after changing `.env`.
Do one full payment in test mode before switching to live keys.

## What happens when a student pays

1. The enrol page posts the student's details to `POST /api/upsolve/enrolments`.
2. The server takes a lock, decides the price, holds the seat for 30 minutes, and creates a Razorpay order.
3. The browser opens Razorpay's checkout for that order.
4. On success the browser sends the result to the `verify` endpoint, which checks the signature.
5. Razorpay also sends the webhook. If the student closed the tab at step 4, this still records the payment.

Only paid first payments count as seats.
A second instalment adds money but no seat.
A refund made in the Razorpay dashboard reaches us through the webhook and reopens the seat.

## Changing dates or fees

Demo dates and fees live at the top of `backend/upsolve.py`.
Setting `UPSOLVE_DEMOS_JSON` in `backend/.env` replaces the demo dates without a code change.
The page copy lives in `frontend/src/data/upsolve.js`.
The printed flyers carry the same dates and fees, so a change there means reprinting.

## The Lambda@Edge list

`workers/blog-og/index.js` lists `/upsolve` and `/upsolve/enrol`, so link previews on WhatsApp show the right title.
That function deploys separately with `workers/blog-og/deploy.sh`.
The pages work without it; only the preview text differs.
