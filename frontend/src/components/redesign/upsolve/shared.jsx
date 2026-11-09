/** Small building blocks shared by the Upsolve sections. */
import React from "react";
import { MessageCircle } from "lucide-react";
import { G, A, DIM, BORDER, CARD } from "@/components/redesign/homePrimitives";

export { G, A, DIM, BORDER, CARD };
export const TEXT = "#e2e8f0";
export const BODY = "#c9d1d9";
export const INK = "#09090e";
export const FIELD_BORDER = "#30363d";
export const ERROR = "#f85149";
export const MONO = "var(--font-mono)";
export const DISPLAY = "var(--font-display)";
export const SANS = "var(--font-rd-sans)";

export function Eyebrow({ children, color = G, className = "mb-3" }) {
  return (
    <p className={`text-xs uppercase tracking-[0.18em] ${className}`} style={{ color, fontFamily: MONO }}>
      {children}
    </p>
  );
}

export function Heading({ children, className = "text-3xl md:text-4xl mb-4" }) {
  return (
    <h2 className={`font-bold leading-tight ${className}`} style={{ color: TEXT, fontFamily: DISPLAY }}>
      {children}
    </h2>
  );
}

export function Tick({ size = 18, color = G }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0 mt-0.5">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function WhatsAppLink({ href, children, testId, where, onClick, solid = false }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-testid={testId}
      data-where={where}
      onClick={onClick}
      className="inline-flex items-center justify-center text-center px-5 py-3 rounded-sm text-sm font-medium min-h-[46px] transition-colors duration-200"
      style={solid ? { background: G, color: INK, fontFamily: MONO } : { border: `1px solid ${G}66`, color: TEXT, fontFamily: MONO }}
    >
      <span>
        <MessageCircle size={16} aria-hidden="true" className="inline-block align-[-3px] mr-2" />
        {children}
      </span>
    </a>
  );
}

export const fieldStyle = {
  background: "#0d1117",
  border: `1px solid ${FIELD_BORDER}`,
  color: TEXT,
  fontFamily: SANS,
};

export function Field({ id, label, required, error, help, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-semibold" style={{ color: TEXT }}>
        {label}
        {required && (
          <span style={{ color: A }} aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </label>
      {children}
      {help && !error && (
        <span className="text-xs" style={{ color: DIM }}>
          {help}
        </span>
      )}
      {error && (
        <span className="text-xs" style={{ color: ERROR }} role="alert" data-testid={`${id}-error`}>
          {error}
        </span>
      )}
    </div>
  );
}

/** Hidden field that only bots fill in, same pattern as the blog comment form. */
export function Honeypot({ value, onChange, testId }) {
  return (
    <input
      type="text"
      tabIndex={-1}
      autoComplete="off"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      data-testid={testId}
      aria-hidden="true"
      style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0, width: 0 }}
    />
  );
}

export function isValidIndianPhone(raw) {
  let digits = (raw || "").replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return digits.length === 10 && "6789".includes(digits[0]);
}

export function rupees(n) {
  return `Rs ${Number(n).toLocaleString("en-IN")}`;
}

/** "14 days to go", "tomorrow", "today" for a demo. */
export function daysPhrase(daysLeft) {
  if (daysLeft === 0) return "today";
  if (daysLeft === 1) return "tomorrow";
  return `${daysLeft} days to go`;
}

/** Upcoming demos from the backend, or the static list until it answers. */
export function demosFrom(stats, fallback) {
  if (stats) return stats.demos;
  const today = new Date().toISOString().slice(0, 10);
  return fallback.filter((d) => d.date >= today);
}
