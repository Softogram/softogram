// Upsolve backend: demo bookings, seat arithmetic and the money paths.
// Real backend and real Postgres; Razorpay is fixtures/razorpay-mock.js, which
// holds the same test secrets, so signatures here are computed the real way.
const { test, expect } = require("@playwright/test");
const {
  BACKEND_URL,
  RAZORPAY_MOCK_URL,
  adminToken,
  resetEmails,
  resetUpsolve,
  sendRazorpayWebhook,
  waitForEmails,
} = require("../fixtures/helpers");

const API = `${BACKEND_URL}/api/upsolve`;
const ADMIN = `${BACKEND_URL}/api/admin/upsolve`;
const DEMO = "2099-03-01";
const phoneFor = (n) => `9${String(n).padStart(9, "0")}`;

const client = (id) => ({ "X-E2E-Client-Id": `upsolve-${id}` });
const stats = async (request) => (await request.get(`${API}/stats`)).json();

function student(n, extra = {}) {
  return { name: `Student ${n}`, phone: phoneFor(n), email: `s${n}@example.com`, college: "UIT", language: "C++", plan: "full", ...extra };
}

async function startEnrolment(request, n, extra) {
  const res = await request.post(`${API}/enrolments`, { headers: client("enrol"), data: student(n, extra) });
  expect(res.status()).toBe(200);
  return res.json();
}

async function sign(request, orderId) {
  return (await request.get(`${RAZORPAY_MOCK_URL}/sign?order_id=${orderId}`)).json();
}

async function verify(request, order, signed) {
  return request.post(`${API}/enrolments/${order.enrolmentId}/verify`, {
    data: {
      razorpay_order_id: order.orderId,
      razorpay_payment_id: signed.payment_id,
      razorpay_signature: signed.signature,
    },
  });
}

async function paySeat(request, n, extra) {
  const order = await startEnrolment(request, n, extra);
  const res = await verify(request, order, await sign(request, order.orderId));
  expect(res.status()).toBe(200);
  return { order, body: await res.json() };
}

function capturedEvent(orderId, paymentId = `pay_wh${Date.now()}`) {
  return { event: "payment.captured", payload: { payment: { entity: { id: paymentId, order_id: orderId } } } };
}

test.describe("Upsolve API", () => {
  test.beforeEach(async ({ request }) => {
    await resetUpsolve(request);
    await resetEmails(request);
  });

  test.describe("demo bookings", () => {
    const booking = (extra = {}) => ({ name: "Asha Rao", phone: "+91 98765 43210", college: "UIT", year: "3rd year", demo_date: DEMO, ...extra });

    test("a booking counts, reaches admin with a normalised number, and emails Saurabh", async ({ request }) => {
      const res = await request.post(`${API}/demo-bookings`, { headers: client("book"), data: booking() });
      expect(res.status()).toBe(200);
      expect((await res.json()).alreadyBooked).toBe(false);
      expect((await stats(request)).demoBookings).toBe(1);

      const token = await adminToken(request);
      const rows = await (await request.get(`${ADMIN}/bookings`, { headers: { Authorization: `Bearer ${token}` } })).json();
      expect(rows[0]).toMatchObject({ name: "Asha Rao", phone: "9876543210", demoDate: DEMO, status: "new" });

      const emails = await waitForEmails(request, 1);
      expect(emails[0].payload.Content.Simple.Subject.Data).toContain("demo booking: Asha Rao");
    });

    test("the same number books once per demo", async ({ request }) => {
      await request.post(`${API}/demo-bookings`, { headers: client("dup"), data: booking() });
      const again = await request.post(`${API}/demo-bookings`, { headers: client("dup"), data: booking({ phone: "9876543210" }) });
      expect((await again.json()).alreadyBooked).toBe(true);
      expect((await stats(request)).demoBookings).toBe(1);
    });

    test("rejects a bad number and a date that is not an upcoming demo", async ({ request }) => {
      const badPhone = await request.post(`${API}/demo-bookings`, { headers: client("bad"), data: booking({ phone: "12345" }) });
      expect(badPhone.status()).toBe(422);
      const badDate = await request.post(`${API}/demo-bookings`, { headers: client("bad"), data: booking({ demo_date: "2020-01-01" }) });
      expect(badDate.status()).toBe(422);
    });

    test("a filled honeypot looks successful but stores nothing", async ({ request }) => {
      const res = await request.post(`${API}/demo-bookings`, { headers: client("hp"), data: booking({ company_website: "spam.example" }) });
      expect((await res.json()).status).toBe("success");
      expect((await stats(request)).demoBookings).toBe(0);
    });

    test("admin endpoints refuse a request with no token", async ({ request }) => {
      expect((await request.get(`${ADMIN}/bookings`)).status()).toBe(401);
      expect((await request.get(`${ADMIN}/enrolments`)).status()).toBe(401);
      expect((await request.patch(`${ADMIN}/enrolments/1`, { data: { status: "paid" } })).status()).toBe(401);
      const validBody = { method: "manual", name: "No Token", phone: "9123456789", plan: "full" };
      expect((await request.post(`${ADMIN}/enrolments`, { data: validBody })).status()).toBe(401);
      expect((await stats(request)).seatsTaken).toBe(0);
    });
  });

  test.describe("prices are set by the server", () => {
    test("first students get the early-bird price and instalments are half", async ({ request }) => {
      const full = await startEnrolment(request, 1);
      expect(full).toMatchObject({ amountPaise: 1200000, earlyBird: true, keyId: "rzp_test_e2e" });
      const half = await startEnrolment(request, 2, { plan: "instalment" });
      expect(half.amountPaise).toBe(600000);

      const orders = await (await request.get(`${RAZORPAY_MOCK_URL}/orders`)).json();
      expect(orders.map((o) => o.amount)).toEqual([1200000, 600000]);
    });

    test("a price sent by the browser is ignored", async ({ request }) => {
      const order = await startEnrolment(request, 1, { amount: 100, amountPaise: 100, early_bird: true });
      expect(order.amountPaise).toBe(1200000);
    });

    test("the sixth student pays the full fee", async ({ request }) => {
      for (let n = 1; n <= 5; n += 1) await paySeat(request, n);
      expect((await stats(request)).earlyBirdActive).toBe(false);
      const sixth = await startEnrolment(request, 6);
      expect(sixth).toMatchObject({ amountPaise: 1500000, earlyBird: false });
    });

    test("an unpaid checkout holds an early-bird seat, so the price cannot be oversold", async ({ request }) => {
      for (let n = 1; n <= 4; n += 1) await paySeat(request, n);
      const holding = await startEnrolment(request, 5);
      expect(holding.earlyBird).toBe(true);
      const next = await startEnrolment(request, 6);
      expect(next.earlyBird).toBe(false);
      // The public counter still shows the seat until someone has actually paid for it.
      expect((await stats(request)).earlyBirdLeft).toBe(1);
    });

    test("a retry replaces the student's own attempt instead of holding two seats", async ({ request }) => {
      for (let n = 1; n <= 4; n += 1) await paySeat(request, n);
      const first = await startEnrolment(request, 5);
      const retry = await startEnrolment(request, 5);
      expect(retry.earlyBird).toBe(true);
      expect(retry.orderId).not.toBe(first.orderId);
    });

    test("parallel requests cannot share the last early-bird seat", async ({ request }) => {
      for (let n = 1; n <= 4; n += 1) await paySeat(request, n);
      const orders = await Promise.all([5, 6, 7, 8].map((n) => startEnrolment(request, n)));
      expect(orders.filter((o) => o.earlyBird)).toHaveLength(1);
    });

    test("the batch stops at ten and a paid number cannot enrol twice", async ({ request }) => {
      for (let n = 1; n <= 10; n += 1) await paySeat(request, n);
      const s = await stats(request);
      expect(s).toMatchObject({ seatsTaken: 10, seatsLeft: 0 });
      const full = await request.post(`${API}/enrolments`, { headers: client("full"), data: student(11) });
      expect(full.status()).toBe(409);
      const twice = await request.post(`${API}/enrolments`, { headers: client("full"), data: student(1) });
      expect(twice.status()).toBe(409);
      expect((await twice.json()).detail).toContain("already has a seat");
    });
  });

  test.describe("verifying a payment", () => {
    test("a correct signature takes a seat and sends one receipt", async ({ request }) => {
      const { body } = await paySeat(request, 1);
      expect(body).toMatchObject({ status: "paid", seatNumber: 1, seatsTotal: 10, receipt: "UPS-0001" });
      expect(await stats(request)).toMatchObject({ seatsTaken: 1, earlyBirdLeft: 4 });
      const emails = await waitForEmails(request, 2);
      const receipt = emails.find((e) => e.payload.Destination.ToAddresses[0] === "s1@example.com");
      expect(receipt.payload.Content.Simple.Subject.Data).toContain("Rs 12,000 received");
      expect(receipt.payload.Content.Simple.Body.Html.Data).toContain("individual tutor");
    });

    test("a forged signature changes nothing", async ({ request }) => {
      const order = await startEnrolment(request, 1);
      const res = await verify(request, order, { payment_id: "pay_fake", signature: "deadbeef" });
      expect(res.status()).toBe(400);
      expect((await stats(request)).seatsTaken).toBe(0);
    });

    test("a real signature for a different order is refused", async ({ request }) => {
      const a = await startEnrolment(request, 1);
      const b = await startEnrolment(request, 2);
      const res = await verify(request, a, await sign(request, b.orderId));
      expect(res.status()).toBe(400);
      expect((await stats(request)).seatsTaken).toBe(0);
    });
  });

  test.describe("webhook", () => {
    test("records a payment when the student closed the tab before confirmation", async ({ request }) => {
      const order = await startEnrolment(request, 1);
      const res = await sendRazorpayWebhook(request, capturedEvent(order.orderId));
      expect(res.status()).toBe(200);
      expect(await res.json()).toMatchObject({ matched: true });
      expect((await stats(request)).seatsTaken).toBe(1);
    });

    test("refuses a bad signature", async ({ request }) => {
      const order = await startEnrolment(request, 1);
      const res = await sendRazorpayWebhook(request, capturedEvent(order.orderId), { signature: "nope" });
      expect(res.status()).toBe(400);
      expect((await stats(request)).seatsTaken).toBe(0);
    });

    test("a redelivered event is applied once, with one receipt", async ({ request }) => {
      const order = await startEnrolment(request, 1);
      const event = capturedEvent(order.orderId, "pay_once");
      await sendRazorpayWebhook(request, event, { eventId: "evt_same" });
      const again = await sendRazorpayWebhook(request, event, { eventId: "evt_same" });
      expect(await again.json()).toMatchObject({ duplicate: true });
      await new Promise((r) => setTimeout(r, 500));
      const emails = await waitForEmails(request, 2);
      expect(emails.filter((e) => e.payload.Destination.ToAddresses[0] === "s1@example.com")).toHaveLength(1);
    });

    test("verify and webhook together still send one receipt", async ({ request }) => {
      const order = await startEnrolment(request, 1);
      const signed = await sign(request, order.orderId);
      await verify(request, order, signed);
      await sendRazorpayWebhook(request, capturedEvent(order.orderId, signed.payment_id));
      await new Promise((r) => setTimeout(r, 500));
      const emails = await waitForEmails(request, 2);
      expect(emails.filter((e) => e.payload.Destination.ToAddresses[0] === "s1@example.com")).toHaveLength(1);
    });

    test("a refund reopens the seat", async ({ request }) => {
      const { order } = await paySeat(request, 1);
      const token = await adminToken(request);
      const list = await (await request.get(`${ADMIN}/enrolments`, { headers: { Authorization: `Bearer ${token}` } })).json();
      const paymentId = list.items.find((i) => i.razorpayOrderId === order.orderId).razorpayPaymentId;
      await sendRazorpayWebhook(request, { event: "refund.processed", payload: { refund: { entity: { id: "rfnd_1", payment_id: paymentId } } } });
      expect(await stats(request)).toMatchObject({ seatsTaken: 0, earlyBirdLeft: 5 });
    });

    test("a failed attempt releases the hold, and a later capture still counts", async ({ request }) => {
      const order = await startEnrolment(request, 1);
      await sendRazorpayWebhook(request, { event: "payment.failed", payload: { payment: { entity: { id: "pay_f", order_id: order.orderId } } } });
      await sendRazorpayWebhook(request, capturedEvent(order.orderId, "pay_ok"));
      expect((await stats(request)).seatsTaken).toBe(1);
    });

    test("an unknown order is stored and acknowledged, not an error", async ({ request }) => {
      const res = await sendRazorpayWebhook(request, capturedEvent("order_unknown"));
      expect(res.status()).toBe(200);
      expect(await res.json()).toMatchObject({ matched: false });
    });
  });

  test.describe("admin payments", () => {
    let auth;
    test.beforeEach(async ({ request }) => {
      auth = { Authorization: `Bearer ${await adminToken(request)}` };
    });

    const newStudent = (method, extra = {}) => ({ method, name: "WhatsApp Student", phone: "9123456789", email: "wa@example.com", plan: "full", ...extra });

    test("a payment link is created at the server's price and paid through the webhook", async ({ request }) => {
      const created = await (await request.post(`${ADMIN}/enrolments`, { headers: auth, data: newStudent("link") })).json();
      expect(created).toMatchObject({ status: "pending", source: "link", amountRupees: 12000 });
      expect(created.paymentLinkUrl).toContain("rzp.io");

      const orders = await (await request.get(`${RAZORPAY_MOCK_URL}/orders`)).json();
      const link = orders.find((o) => o.kind === "payment_link");
      expect(link.amount).toBe(1200000);

      await sendRazorpayWebhook(request, {
        event: "payment_link.paid",
        payload: { payment_link: { entity: { id: link.id } }, payment: { entity: { id: "pay_link1" } } },
      });
      expect((await stats(request)).seatsTaken).toBe(1);
    });

    test("a UPI transfer recorded by hand takes a seat and sends a receipt", async ({ request }) => {
      const created = await (await request.post(`${ADMIN}/enrolments`, { headers: auth, data: newStudent("manual") })).json();
      expect(created).toMatchObject({ status: "paid", source: "manual" });
      expect((await stats(request)).seatsTaken).toBe(1);
      const emails = await waitForEmails(request, 1);
      expect(emails.some((e) => e.payload.Destination.ToAddresses[0] === "wa@example.com")).toBe(true);
    });

    test("two hand-recorded payments do not collide on the empty payment id", async ({ request }) => {
      await request.post(`${ADMIN}/enrolments`, { headers: auth, data: newStudent("manual") });
      const second = await request.post(`${ADMIN}/enrolments`, { headers: auth, data: newStudent("manual", { phone: "9123456780", email: "wb@example.com" }) });
      expect(second.status()).toBe(200);
      expect((await stats(request)).seatsTaken).toBe(2);
    });

    test("a second instalment adds money but not a second seat, and asking twice returns the same link", async ({ request }) => {
      const { body } = await paySeat(request, 1, { plan: "instalment" });
      const url = `${ADMIN}/enrolments/${body.id}/second-instalment`;
      const first = await (await request.post(url, { headers: auth, data: { method: "link" } })).json();
      expect(first).toMatchObject({ instalmentNo: 2, amountRupees: 6000 });
      const again = await (await request.post(url, { headers: auth, data: { method: "link" } })).json();
      expect(again.id).toBe(first.id);

      const orders = await (await request.get(`${RAZORPAY_MOCK_URL}/orders`)).json();
      const link = orders.find((o) => o.kind === "payment_link");
      await sendRazorpayWebhook(request, {
        event: "payment_link.paid",
        payload: { payment_link: { entity: { id: link.id } }, payment: { entity: { id: "pay_second" } } },
      });
      expect((await stats(request)).seatsTaken).toBe(1);
      const list = await (await request.get(`${ADMIN}/enrolments`, { headers: auth })).json();
      expect(list.collectedRupees).toBe(12000);
    });

    test("a full-fee student has no second instalment", async ({ request }) => {
      const { body } = await paySeat(request, 1);
      const res = await request.post(`${ADMIN}/enrolments/${body.id}/second-instalment`, { headers: auth, data: { method: "link" } });
      expect(res.status()).toBe(409);
    });
  });
});
