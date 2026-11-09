#!/usr/bin/env node
/**
 * Minimal Razorpay mock for e2e tests (Upsolve enrolments, issues #152/#154).
 *
 * The backend is pointed here via RAZORPAY_API_BASE, the same way the SES mock
 * is reached through AWS_SES_ENDPOINT_URL. It knows the same test secrets as
 * the backend (see playwright.config.js), so it can also mint the signatures a
 * real Razorpay would: for the browser checkout stub and for webhook tests.
 *
 * Endpoints:
 *   GET    /health                 -> 200 ok (Playwright readiness probe)
 *   POST   /v1/orders              -> creates an order {id: "order_e2e…"}; records it
 *   POST   /v1/payment_links       -> creates a link {id: "plink_e2e…", short_url}
 *   GET    /orders                 -> JSON array of created orders
 *   DELETE /orders                 -> clears recorded orders
 *   GET    /sign?order_id=X        -> {payment_id, signature} for a successful payment
 *   POST   /webhook-signature      -> raw body in, {signature} out (webhook secret)
 *   GET    /checkout-stub.js       -> a window.Razorpay stand-in the frontend loads
 *                                     instead of checkout.razorpay.com in e2e
 */
const http = require("http");
const crypto = require("crypto");

const PORT = process.env.RAZORPAY_MOCK_PORT || 8026;
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "e2e-razorpay-secret";
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || "e2e-webhook-secret";

let orders = [];
let seq = 0;

function readBody(req) {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => resolve(data));
  });
}

function hmac(secret, message) {
  return crypto.createHmac("sha256", secret).update(message).digest("hex");
}

// Mimics the two calls the page makes on Razorpay's checkout object: `open()`
// and `on("payment.failed", …)`. Mode comes from localStorage so a test can
// pick the path: "success" (default) pays at once; "dismiss" closes the sheet
// like a student backing out.
const CHECKOUT_STUB = `
(function () {
  var MOCK = "http://localhost:${PORT}";
  function Razorpay(options) {
    this.options = options || {};
    this.handlers = {};
  }
  Razorpay.prototype.on = function (event, fn) { this.handlers[event] = fn; };
  Razorpay.prototype.open = function () {
    var opts = this.options;
    var mode = "success";
    try { mode = window.localStorage.getItem("rzp-e2e-mode") || "success"; } catch (e) {}
    if (mode === "dismiss") {
      if (opts.modal && typeof opts.modal.ondismiss === "function") opts.modal.ondismiss();
      return;
    }
    fetch(MOCK + "/sign?order_id=" + encodeURIComponent(opts.order_id))
      .then(function (r) { return r.json(); })
      .then(function (d) {
        opts.handler({
          razorpay_order_id: opts.order_id,
          razorpay_payment_id: d.payment_id,
          razorpay_signature: mode === "tampered" ? "deadbeef" : d.signature,
        });
      });
  };
  window.Razorpay = Razorpay;
})();
`;

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const { method } = req;
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (method === "OPTIONS") {
    res.writeHead(204, cors);
    return res.end();
  }

  if (method === "GET" && url.pathname === "/health") {
    res.writeHead(200, { "Content-Type": "application/json", ...cors });
    return res.end(JSON.stringify({ ok: true, orders: orders.length }));
  }

  if (method === "POST" && url.pathname === "/v1/orders") {
    const raw = await readBody(req);
    let body;
    try {
      body = JSON.parse(raw);
    } catch {
      res.writeHead(400, { "Content-Type": "application/json", ...cors });
      return res.end(JSON.stringify({ error: { description: "bad json" } }));
    }
    if (!req.headers.authorization || !req.headers.authorization.startsWith("Basic ")) {
      res.writeHead(401, { "Content-Type": "application/json", ...cors });
      return res.end(JSON.stringify({ error: { description: "missing auth" } }));
    }
    seq += 1;
    const order = {
      id: `order_e2e${String(seq).padStart(4, "0")}`,
      entity: "order",
      amount: body.amount,
      amount_paid: 0,
      currency: body.currency || "INR",
      receipt: body.receipt || null,
      notes: body.notes || {},
      status: "created",
      created_at: Math.floor(Date.now() / 1000),
    };
    orders.push(order);
    res.writeHead(200, { "Content-Type": "application/json", ...cors });
    return res.end(JSON.stringify(order));
  }

  if (method === "POST" && url.pathname === "/v1/payment_links") {
    const raw = await readBody(req);
    const body = JSON.parse(raw);
    seq += 1;
    const link = {
      id: `plink_e2e${String(seq).padStart(4, "0")}`,
      short_url: `https://rzp.io/e2e${seq}`,
      amount: body.amount,
      reference_id: body.reference_id,
      status: "created",
    };
    orders.push({ ...link, kind: "payment_link", customer: body.customer });
    res.writeHead(200, { "Content-Type": "application/json", ...cors });
    return res.end(JSON.stringify(link));
  }

  if (method === "GET" && url.pathname === "/orders") {
    res.writeHead(200, { "Content-Type": "application/json", ...cors });
    return res.end(JSON.stringify(orders));
  }

  if (method === "DELETE" && url.pathname === "/orders") {
    orders = [];
    res.writeHead(204, cors);
    return res.end();
  }

  if (method === "GET" && url.pathname === "/sign") {
    const orderId = url.searchParams.get("order_id") || "";
    const paymentId = `pay_e2e${crypto.randomBytes(5).toString("hex")}`;
    res.writeHead(200, { "Content-Type": "application/json", ...cors });
    return res.end(
      JSON.stringify({ payment_id: paymentId, signature: hmac(KEY_SECRET, `${orderId}|${paymentId}`) }),
    );
  }

  if (method === "POST" && url.pathname === "/webhook-signature") {
    const raw = await readBody(req);
    res.writeHead(200, { "Content-Type": "application/json", ...cors });
    return res.end(JSON.stringify({ signature: hmac(WEBHOOK_SECRET, raw) }));
  }

  if (method === "GET" && url.pathname === "/checkout-stub.js") {
    res.writeHead(200, { "Content-Type": "application/javascript", ...cors });
    return res.end(CHECKOUT_STUB);
  }

  res.writeHead(404, { "Content-Type": "application/json", ...cors });
  res.end(JSON.stringify({ error: `no route for ${method} ${url.pathname}` }));
});

server.listen(PORT, () => {
  console.log(`[razorpay-mock] listening on http://localhost:${PORT}`);
});
