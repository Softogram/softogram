#!/usr/bin/env node
/**
 * Minimal AWS SES v2 (sesv2) mock for e2e tests.
 *
 * Captures POST /v2/email/outbound-emails payloads in memory and exposes
 * them for assertions. The backend is pointed here via AWS_SES_ENDPOINT_URL.
 * Wire shape verified empirically against boto3 (see git history for the
 * probe script): plain JSON body, no SigV4 validation needed since this
 * mock never checks the Authorization header.
 *
 * Endpoints:
 *   GET    /health                    -> 200 ok (Playwright readiness probe)
 *   POST   /v2/email/outbound-emails  -> 200 (or a forced status, see below),
 *                                         captures body, returns {"MessageId": ...}
 *   GET    /emails                    -> JSON array of captured send payloads
 *   DELETE /emails                    -> clears captured payloads
 *   POST   /behavior                  -> {"status": 500, "times": 2} forces the
 *                                         next N sends to return that status
 */
const http = require("http");

const PORT = process.env.SES_MOCK_PORT || 8025;

let emails = [];
let forced = { status: null, times: 0 };

function readBody(req) {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => resolve(data));
  });
}

const server = http.createServer(async (req, res) => {
  const { method, url } = req;

  if (method === "GET" && url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ ok: true, captured: emails.length }));
  }

  if (method === "POST" && url === "/v2/email/outbound-emails") {
    const raw = await readBody(req);
    let payload;
    try {
      payload = JSON.parse(raw);
    } catch {
      payload = { unparsed: raw };
    }
    if (forced.times > 0 && forced.status) {
      forced.times -= 1;
      res.writeHead(forced.status, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ message: "forced by e2e mock" }));
    }
    emails.push({ receivedAt: new Date().toISOString(), payload });
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ MessageId: `mock-${emails.length}` }));
  }

  if (method === "GET" && url === "/emails") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(emails));
  }

  if (method === "DELETE" && url === "/emails") {
    emails = [];
    forced = { status: null, times: 0 };
    res.writeHead(204);
    return res.end();
  }

  if (method === "POST" && url === "/behavior") {
    const raw = await readBody(req);
    try {
      const body = JSON.parse(raw);
      forced = { status: body.status || null, times: body.times || 0 };
    } catch {
      forced = { status: null, times: 0 };
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(forced));
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: `no route for ${method} ${url}` }));
});

server.listen(PORT, () => {
  console.log(`[ses-mock] listening on http://localhost:${PORT}`);
});
