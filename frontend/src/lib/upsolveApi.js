/** Client for the Upsolve endpoints (demo bookings, seat counters, Razorpay enrolment). */
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { adminHeaders } from "@/lib/cmsApi";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export async function fetchUpsolveStats() {
  const { data } = await axios.get(`${API}/upsolve/stats`, { timeout: 8000 });
  return data;
}

/** Live counters for the page. `stats` stays null until the backend answers; nothing is guessed. */
export function useUpsolveStats() {
  const [stats, setStats] = useState(null);
  const refresh = useCallback(() => {
    return fetchUpsolveStats()
      .then((data) => {
        setStats(data);
        return data;
      })
      .catch(() => null);
  }, []);
  useEffect(() => {
    refresh();
  }, [refresh]);
  return { stats, refresh };
}

export async function bookDemoSeat(payload) {
  const { data } = await axios.post(`${API}/upsolve/demo-bookings`, payload, { timeout: 10000 });
  return data;
}

export async function createEnrolment(payload) {
  const { data } = await axios.post(`${API}/upsolve/enrolments`, payload, { timeout: 20000 });
  return data;
}

export async function verifyEnrolment(enrolmentId, payload) {
  const { data } = await axios.post(`${API}/upsolve/enrolments/${enrolmentId}/verify`, payload, { timeout: 15000 });
  return data;
}

const CHECKOUT_URL = process.env.REACT_APP_RAZORPAY_CHECKOUT_URL || "https://checkout.razorpay.com/v1/checkout.js";
let checkoutScript = null;

/** Load Razorpay's checkout script once, only when a student actually goes to pay. */
export function loadRazorpayCheckout() {
  if (window.Razorpay) return Promise.resolve(window.Razorpay);
  if (!checkoutScript) {
    checkoutScript = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = CHECKOUT_URL;
      script.async = true;
      script.onload = () => resolve(window.Razorpay);
      script.onerror = () => {
        checkoutScript = null;
        reject(new Error("Could not load the payment window"));
      };
      document.body.appendChild(script);
    });
  }
  return checkoutScript;
}

export function apiErrorMessage(err, fallback) {
  const detail = err?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg.replace(/^Value error, /, "");
  return fallback;
}

// ----- admin -----

export async function adminFetchUpsolveBookings() {
  const { data } = await axios.get(`${API}/admin/upsolve/bookings`, { headers: adminHeaders() });
  return data;
}

export async function adminUpdateUpsolveBooking(id, patch) {
  const { data } = await axios.patch(`${API}/admin/upsolve/bookings/${id}`, patch, { headers: adminHeaders() });
  return data;
}

export async function adminFetchUpsolveEnrolments() {
  const { data } = await axios.get(`${API}/admin/upsolve/enrolments`, { headers: adminHeaders() });
  return data;
}

export async function adminCreateUpsolveEnrolment(payload) {
  const { data } = await axios.post(`${API}/admin/upsolve/enrolments`, payload, { headers: adminHeaders() });
  return data;
}

export async function adminSecondInstalment(id, method) {
  const { data } = await axios.post(
    `${API}/admin/upsolve/enrolments/${id}/second-instalment`,
    { method },
    { headers: adminHeaders() },
  );
  return data;
}

export async function adminUpdateUpsolveEnrolment(id, patch) {
  const { data } = await axios.patch(`${API}/admin/upsolve/enrolments/${id}`, patch, { headers: adminHeaders() });
  return data;
}
