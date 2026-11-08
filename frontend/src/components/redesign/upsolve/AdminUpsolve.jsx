/**
 * /admin "upsolve" tab: demo bookings and paid enrolments in one place.
 *
 * Bookings are worked by hand (send the Meet link, mark attended). Enrolments
 * mostly update themselves from Razorpay; the controls here cover students who
 * enrol over WhatsApp, second instalments and UPI transfers recorded by hand.
 */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  adminCreateUpsolveEnrolment,
  adminFetchUpsolveBookings,
  adminFetchUpsolveEnrolments,
  adminSecondInstalment,
  adminUpdateUpsolveBooking,
  adminUpdateUpsolveEnrolment,
  apiErrorMessage,
} from "@/lib/upsolveApi";
import { G, A, DIM, TEXT, CARD, BORDER, ERROR, MONO, DISPLAY, rupees } from "./shared";

const BOOKING_STATUSES = ["new", "link_sent", "attended", "not_interested"];
const ENROLMENT_STATUSES = ["pending", "paid", "failed", "refunded"];
const MEET_KEY = "softogram_upsolve_meet_link";
const EMPTY_STUDENT = { name: "", phone: "", email: "", college: "", plan: "full" };

const inputStyle = { background: "#0d1117", border: `1px solid ${BORDER}`, color: TEXT };
const smallButton = { border: `1px solid ${BORDER}`, color: DIM };

function readMeetLink() {
  try {
    return localStorage.getItem(MEET_KEY) || "";
  } catch {
    return "";
  }
}

function saveMeetLink(value) {
  try {
    localStorage.setItem(MEET_KEY, value);
  } catch {
    /* only a convenience */
  }
}

function waLink(phone, text) {
  return `https://wa.me/91${phone}?text=${encodeURIComponent(text)}`;
}

function Tile({ value, label, color = TEXT, testId }) {
  return (
    <div className="rounded-sm px-4 py-3" style={{ background: CARD, border: `1px solid ${BORDER}` }} data-testid={testId}>
      <p className="text-2xl font-bold leading-none" style={{ color, fontFamily: DISPLAY, fontVariantNumeric: "tabular-nums" }}>
        {value}
      </p>
      <p className="text-xs mt-1" style={{ color: DIM }}>
        {label}
      </p>
    </div>
  );
}

function Table({ headers, children }) {
  return (
    <div className="overflow-auto rounded-sm" style={{ border: `1px solid ${BORDER}` }}>
      <table className="w-full text-xs" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: CARD, color: DIM }}>
            {headers.map((h) => (
              <th key={h} className="text-left px-3 py-2 font-medium whitespace-nowrap" style={{ borderBottom: `1px solid ${BORDER}` }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function when(iso) {
  return iso ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "";
}

export default function AdminUpsolve() {
  const [bookings, setBookings] = useState([]);
  const [enrolments, setEnrolments] = useState(null);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [demoFilter, setDemoFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [meetLink, setMeetLink] = useState(readMeetLink);
  const [student, setStudent] = useState(EMPTY_STUDENT);
  const [newLink, setNewLink] = useState(null);

  const load = useCallback(async () => {
    try {
      const [b, e] = await Promise.all([adminFetchUpsolveBookings(), adminFetchUpsolveEnrolments()]);
      setBookings(b);
      setEnrolments(e);
    } catch (err) {
      setError(apiErrorMessage(err, "Failed to load Upsolve data"));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const items = useMemo(() => enrolments?.items ?? [], [enrolments]);
  const paidPhones = useMemo(() => new Set(items.filter((i) => i.status === "paid" && i.instalmentNo === 1).map((i) => i.phone)), [items]);
  const demoDates = useMemo(() => [...new Set(bookings.map((b) => b.demoDate))].sort(), [bookings]);

  const visible = bookings.filter((b) => {
    if (demoFilter !== "all" && b.demoDate !== demoFilter) return false;
    if (statusFilter !== "all" && b.status !== statusFilter) return false;
    const q = search.trim().toLowerCase();
    return !q || `${b.name} ${b.phone} ${b.college}`.toLowerCase().includes(q);
  });

  const updateBooking = async (id, patch) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
    try {
      await adminUpdateUpsolveBooking(id, patch);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not update the booking"));
      load();
    }
  };

  const updateEnrolment = async (id, status) => {
    try {
      await adminUpdateUpsolveEnrolment(id, { status });
      await load();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not update the enrolment"));
    }
  };

  const copyNumbers = async () => {
    const numbers = visible.map((b) => `+91${b.phone}`).join("\n");
    try {
      await navigator.clipboard.writeText(numbers);
      setNote(`Copied ${visible.length} number${visible.length === 1 ? "" : "s"}`);
    } catch {
      setError("The browser blocked copying. Use export csv instead.");
    }
  };

  const exportCsv = () => {
    const headers = ["name", "phone", "college", "year", "demoDate", "status", "notes", "createdAt"];
    const cell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [headers.join(","), ...visible.map((b) => headers.map((h) => cell(b[h])).join(","))].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `upsolve-bookings-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const addStudent = async (method) => {
    setError("");
    setNewLink(null);
    try {
      const created = await adminCreateUpsolveEnrolment({
        method,
        name: student.name,
        phone: student.phone,
        email: student.email.trim() || null,
        college: student.college,
        plan: student.plan,
      });
      setStudent(EMPTY_STUDENT);
      if (created.paymentLinkUrl) setNewLink(created);
      setNote(method === "manual" ? `Recorded ${rupees(created.amountRupees)} as paid` : `Link ready for ${created.name}`);
      await load();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not create the enrolment"));
    }
  };

  const second = async (row, method) => {
    setError("");
    try {
      const created = await adminSecondInstalment(row.id, method);
      if (created.paymentLinkUrl && created.status === "pending") setNewLink(created);
      setNote(method === "manual" ? "Second instalment recorded as paid" : `Second link ready for ${row.name}`);
      await load();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not create the second instalment"));
    }
  };

  const hasSecond = (row) => items.some((x) => x.phone === row.phone && x.instalmentNo === 2 && ["pending", "paid"].includes(x.status));
  const payMessage = (row) => `Hi ${row.name}, here is your Upsolve payment link for ${rupees(row.amountRupees)}: ${row.paymentLinkUrl}`;

  return (
    <div className="p-6 flex flex-col gap-5" data-testid="admin-upsolve">
      {(error || note) && (
        <p className="text-xs" style={{ color: error ? ERROR : G }} role={error ? "alert" : "status"} data-testid="admin-upsolve-message">
          {error || note}
        </p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Tile testId="admin-upsolve-tile-bookings" value={bookings.length} label="demo bookings" color={G} />
        <Tile testId="admin-upsolve-tile-new" value={bookings.filter((b) => b.status === "new").length} label="new, not yet contacted" color={A} />
        <Tile testId="admin-upsolve-tile-seats" value={enrolments ? `${enrolments.seatsTaken} of ${enrolments.seatsTotal}` : "-"} label="paid seats (the page counts these)" color={G} />
        <Tile testId="admin-upsolve-tile-collected" value={enrolments ? rupees(enrolments.collectedRupees) : "-"} label="collected, before Razorpay fees" />
      </div>

      <section className="flex flex-col gap-3" aria-label="Demo bookings">
        <h2 className="text-sm font-semibold" style={{ color: TEXT, fontFamily: MONO }}>
          Demo bookings
        </h2>
        <div className="flex flex-wrap gap-2 items-center">
          <select value={demoFilter} onChange={(e) => setDemoFilter(e.target.value)} className="px-2 py-1 rounded-sm text-xs" style={inputStyle} aria-label="Filter by demo" data-testid="admin-upsolve-filter-demo">
            <option value="all">all demos</option>
            {demoDates.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-2 py-1 rounded-sm text-xs" style={inputStyle} aria-label="Filter by status" data-testid="admin-upsolve-filter-status">
            <option value="all">all statuses</option>
            {BOOKING_STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="name, phone, college" aria-label="Search bookings" className="px-2 py-1 rounded-sm text-xs" style={inputStyle} data-testid="admin-upsolve-search" />
          <input
            type="url"
            value={meetLink}
            onChange={(e) => {
              setMeetLink(e.target.value);
              saveMeetLink(e.target.value);
            }}
            placeholder="Google Meet link for the demo"
            aria-label="Google Meet link for the demo"
            className="px-2 py-1 rounded-sm text-xs flex-1 min-w-[220px]"
            style={inputStyle}
            data-testid="admin-upsolve-meet-link"
          />
          <button type="button" onClick={copyNumbers} className="px-3 py-1 text-xs rounded-sm" style={smallButton} data-testid="admin-upsolve-copy-numbers">
            copy whatsapp numbers
          </button>
          <button type="button" onClick={exportCsv} className="px-3 py-1 text-xs rounded-sm" style={smallButton} data-testid="admin-upsolve-export">
            export csv
          </button>
        </div>
        <Table headers={["booked", "name", "whatsapp", "college", "year", "demo", "status", "notes", "action"]}>
          {visible.map((b) => (
            <tr key={b.id} data-testid="admin-upsolve-booking-row" style={{ borderBottom: `1px solid ${BORDER}` }}>
              <td className="px-3 py-2 whitespace-nowrap" style={{ color: DIM, fontFamily: MONO }}>
                {when(b.createdAt)}
              </td>
              <td className="px-3 py-2 whitespace-nowrap" style={{ color: TEXT }}>
                {b.name}
                {paidPhones.has(b.phone) && (
                  <span className="ml-2 px-1.5 rounded-full" style={{ color: G, border: `1px solid ${G}66` }} data-testid="admin-upsolve-booking-paid">
                    paid
                  </span>
                )}
              </td>
              <td className="px-3 py-2" style={{ color: DIM, fontFamily: MONO }}>
                {b.phone}
              </td>
              <td className="px-3 py-2" style={{ color: DIM }}>
                {b.college}
              </td>
              <td className="px-3 py-2 whitespace-nowrap" style={{ color: DIM }}>
                {b.year}
              </td>
              <td className="px-3 py-2 whitespace-nowrap" style={{ color: DIM, fontFamily: MONO }}>
                {b.demoDate}
              </td>
              <td className="px-3 py-2">
                <select value={b.status} onChange={(e) => updateBooking(b.id, { status: e.target.value })} className="px-2 py-1 rounded-sm text-xs" style={{ ...inputStyle, color: G }} aria-label={`Status for ${b.name}`} data-testid="admin-upsolve-booking-status">
                  {BOOKING_STATUSES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </td>
              <td className="px-3 py-2">
                <input
                  type="text"
                  defaultValue={b.notes}
                  onBlur={(e) => e.target.value !== b.notes && updateBooking(b.id, { notes: e.target.value })}
                  className="px-2 py-1 rounded-sm text-xs w-36"
                  style={inputStyle}
                  aria-label={`Notes for ${b.name}`}
                  data-testid="admin-upsolve-booking-notes"
                />
              </td>
              <td className="px-3 py-2 whitespace-nowrap">
                <a
                  href={waLink(b.phone, `Hi ${b.name}, your seat for the free Upsolve demo on ${b.demoDate} is booked.${meetLink ? ` Join here: ${meetLink}` : ""}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => b.status === "new" && updateBooking(b.id, { status: "link_sent" })}
                  style={{ color: G, fontFamily: MONO }}
                  data-testid="admin-upsolve-send-link"
                >
                  send link
                </a>
              </td>
            </tr>
          ))}
        </Table>
        {enrolments && visible.length === 0 && (
          <p className="text-sm" style={{ color: DIM }} data-testid="admin-upsolve-bookings-empty">
            No demo bookings match.
          </p>
        )}
      </section>

      <section className="flex flex-col gap-3" aria-label="Enrolments and payments">
        <h2 className="text-sm font-semibold" style={{ color: TEXT, fontFamily: MONO }}>
          Enrolments and payments
        </h2>
        <div className="flex flex-wrap gap-2 items-center" data-testid="admin-upsolve-new-student">
          <input value={student.name} onChange={(e) => setStudent({ ...student, name: e.target.value })} placeholder="student name" aria-label="Student name" className="px-2 py-1 rounded-sm text-xs" style={inputStyle} data-testid="admin-upsolve-student-name" />
          <input value={student.phone} onChange={(e) => setStudent({ ...student, phone: e.target.value })} placeholder="whatsapp number" aria-label="Student WhatsApp number" className="px-2 py-1 rounded-sm text-xs" style={inputStyle} data-testid="admin-upsolve-student-phone" />
          <input value={student.email} onChange={(e) => setStudent({ ...student, email: e.target.value })} placeholder="email (for receipt)" aria-label="Student email" className="px-2 py-1 rounded-sm text-xs" style={inputStyle} data-testid="admin-upsolve-student-email" />
          <select value={student.plan} onChange={(e) => setStudent({ ...student, plan: e.target.value })} className="px-2 py-1 rounded-sm text-xs" style={inputStyle} aria-label="Plan" data-testid="admin-upsolve-student-plan">
            <option value="full">full fee</option>
            <option value="instalment">two instalments</option>
          </select>
          <button type="button" onClick={() => addStudent("link")} className="px-3 py-1 text-xs rounded-sm" style={{ background: `${G}22`, border: `1px solid ${G}66`, color: G }} data-testid="admin-upsolve-create-link">
            create payment link
          </button>
          <button type="button" onClick={() => addStudent("manual")} className="px-3 py-1 text-xs rounded-sm" style={smallButton} data-testid="admin-upsolve-record-upi">
            record upi as paid
          </button>
        </div>
        {newLink && (
          <p className="text-xs flex flex-wrap gap-3 items-center" style={{ color: TEXT }} data-testid="admin-upsolve-new-link">
            <span style={{ fontFamily: MONO }}>{newLink.paymentLinkUrl}</span>
            <a href={waLink(newLink.phone, payMessage(newLink))} target="_blank" rel="noopener noreferrer" style={{ color: G, fontFamily: MONO }} data-testid="admin-upsolve-new-link-send">
              send on whatsapp
            </a>
          </p>
        )}
        <Table headers={["date", "receipt", "name", "whatsapp", "plan", "amount", "status", "via", "action"]}>
          {items.map((r) => (
            <tr key={r.id} data-testid="admin-upsolve-enrolment-row" style={{ borderBottom: `1px solid ${BORDER}` }}>
              <td className="px-3 py-2 whitespace-nowrap" style={{ color: DIM, fontFamily: MONO }}>
                {when(r.paidAt || r.createdAt)}
              </td>
              <td className="px-3 py-2 whitespace-nowrap" style={{ color: DIM, fontFamily: MONO }}>
                {r.receipt}
              </td>
              <td className="px-3 py-2 whitespace-nowrap" style={{ color: TEXT }}>
                {r.name}
              </td>
              <td className="px-3 py-2" style={{ color: DIM, fontFamily: MONO }}>
                {r.phone}
              </td>
              <td className="px-3 py-2 whitespace-nowrap" style={{ color: DIM }}>
                {r.earlyBird ? "early, " : ""}
                {r.plan === "full" ? "full" : `instalment ${r.instalmentNo} of 2`}
              </td>
              <td className="px-3 py-2 whitespace-nowrap" style={{ color: TEXT, fontFamily: MONO }}>
                {rupees(r.amountRupees)}
              </td>
              <td className="px-3 py-2">
                <select value={r.status} onChange={(e) => updateEnrolment(r.id, e.target.value)} className="px-2 py-1 rounded-sm text-xs" style={{ ...inputStyle, color: r.status === "paid" ? G : r.status === "pending" ? A : DIM }} aria-label={`Payment status for ${r.name}`} data-testid="admin-upsolve-enrolment-status">
                  {ENROLMENT_STATUSES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </td>
              <td className="px-3 py-2 whitespace-nowrap" style={{ color: DIM }}>
                {r.source}
              </td>
              <td className="px-3 py-2 whitespace-nowrap">
                {r.paymentLinkUrl && r.status === "pending" && (
                  <a href={waLink(r.phone, payMessage(r))} target="_blank" rel="noopener noreferrer" style={{ color: G, fontFamily: MONO }} data-testid="admin-upsolve-enrolment-send">
                    send link
                  </a>
                )}
                {r.plan === "instalment" && r.instalmentNo === 1 && r.status === "paid" && !hasSecond(r) && (
                  <span className="flex gap-3">
                    <button type="button" onClick={() => second(r, "link")} style={{ color: G, fontFamily: MONO }} data-testid="admin-upsolve-second-link">
                      2nd link
                    </button>
                    <button type="button" onClick={() => second(r, "manual")} style={{ color: DIM, fontFamily: MONO }} data-testid="admin-upsolve-second-upi">
                      2nd upi paid
                    </button>
                  </span>
                )}
              </td>
            </tr>
          ))}
        </Table>
        {enrolments && items.length === 0 && (
          <p className="text-sm" style={{ color: DIM }} data-testid="admin-upsolve-enrolments-empty">
            No enrolments yet.
          </p>
        )}
        <p className="text-xs" style={{ color: DIM, fontFamily: MONO }}>
          Paid and refunded update themselves from Razorpay. Change a status by hand only for a UPI transfer or a correction. Do refunds in the Razorpay dashboard; the seat reopens automatically.
        </p>
      </section>
    </div>
  );
}
