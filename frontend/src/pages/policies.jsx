/** Policy pages (extracted / slimmed for issue #14 code-split). Canonical email: support@softogram.in */
import { useEffect } from "react";
import { motion } from "framer-motion";
import SeoHead from "@/components/redesign/SeoHead";

const SUPPORT = "support@softogram.in";

function PolicyLayout({ title, lastUpdated, children }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "#0d1117" }} data-testid="policy-page">
      <SeoHead
        title={`${title} | Softogram`}
        description={`${title} for Softogram — custom software and website solutions.`}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="pt-32 pb-20"
      >
        <div className="max-w-3xl mx-auto px-4">
          <h1
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ fontFamily: "var(--font-display)", color: "#e2e8f0" }}
          >
            <span style={{ color: "#4ade80" }}>{title}</span>
          </h1>
          <p className="text-sm mb-12" style={{ color: "#8b949e", fontFamily: "var(--font-mono)" }}>
            Last updated: {lastUpdated}
          </p>
          <div className="space-y-8">{children}</div>
        </div>
      </motion.div>
    </div>
  );
}

function PolicySection({ title, children }) {
  return (
    <div className="policy-section">
      <h2
        className="text-xl font-semibold mb-4 pl-4 border-l-4"
        style={{ borderColor: "#4ade80", color: "#e2e8f0", fontFamily: "var(--font-display)" }}
      >
        {title}
      </h2>
      <div className="leading-relaxed space-y-4" style={{ color: "#8b949e" }}>
        {children}
      </div>
    </div>
  );
}

export function PrivacyPolicy() {
  return (
    <PolicyLayout title="Privacy Policy" lastUpdated="March 2026">
      <PolicySection title="Information We Collect">
        <p>We collect information you provide directly to us, including:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Name, email address, and phone number</li>
          <li>Project details and requirements submitted via our contact form</li>
          <li>Communication history and correspondence</li>
          <li>Any other information you choose to provide</li>
        </ul>
      </PolicySection>
      <PolicySection title="How We Use Your Information">
        <p>We use the information we collect to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Respond to your inquiries and provide customer support</li>
          <li>Deliver project work and related services</li>
          <li>Send you updates about your project and our services</li>
          <li>Improve our website and services</li>
          <li>Comply with legal obligations</li>
        </ul>
      </PolicySection>
      <PolicySection title="Data Storage & Security">
        <p>
          Your data is stored securely using industry-standard encryption and security practices. We
          implement appropriate technical and organizational measures to protect your personal
          information against unauthorized access, alteration, disclosure, or destruction.
        </p>
        <p className="mt-4">
          We do not sell, trade, or otherwise transfer your personal information to third parties
          without your consent, except as described in this policy.
        </p>
      </PolicySection>
      <PolicySection title="Cookies">
        <p>
          We use cookies and similar tracking technologies to analyze website traffic and improve
          your experience. These include essential cookies, analytics cookies (after consent), and
          preference cookies. See our Cookie Policy for details.
        </p>
      </PolicySection>
      <PolicySection title="Your Rights">
        <p>You have the right to access, correct, or request deletion of your data, and to opt out of marketing.</p>
        <p className="mt-4">
          To exercise any of these rights, please email us at{" "}
          <a href={`mailto:${SUPPORT}`} className="text-cyan-400 hover:underline">
            {SUPPORT}
          </a>
        </p>
      </PolicySection>
      <PolicySection title="Contact Us">
        <p>
          <strong className="text-white">Email:</strong>{" "}
          <a href={`mailto:${SUPPORT}`} className="text-cyan-400 hover:underline">
            {SUPPORT}
          </a>
        </p>
      </PolicySection>
    </PolicyLayout>
  );
}

export function TermsAndConditions() {
  return (
    <PolicyLayout title="Terms & Conditions" lastUpdated="March 2026">
      <PolicySection title="Acceptance of Terms">
        <p>
          By engaging Softogram&apos;s services, accessing our website, or entering into any agreement
          with us, you acknowledge that you have read, understood, and agree to be bound by these
          Terms and Conditions.
        </p>
      </PolicySection>
      <PolicySection title="Services">
        <p>Softogram provides custom software development services, including web apps, SaaS, APIs, AI tooling, and related consulting.</p>
      </PolicySection>
      <PolicySection title="Project Engagement">
        <p>
          All projects begin with a signed proposal. An advance payment of 40–50% is typically required
          before work begins; remaining balance is due upon completion or as specified in the agreement.
        </p>
      </PolicySection>
      <PolicySection title="Intellectual Property">
        <p>
          Upon full payment, ownership of custom deliverables transfers to the client. Softogram may
          display work in our portfolio unless otherwise agreed. Third-party licenses remain as-is.
        </p>
      </PolicySection>
      <PolicySection title="Governing Law">
        <p>
          These terms are governed by the laws of India. Disputes are subject to the exclusive
          jurisdiction of the courts in Uttar Pradesh, India.
        </p>
      </PolicySection>
    </PolicyLayout>
  );
}

export function RefundPolicy() {
  return (
    <PolicyLayout title="Refund & Cancellation Policy" lastUpdated="March 2026">
      <PolicySection title="Advance Payment">
        <p>
          The initial deposit (40–50% of project cost) is non-refundable once project work has commenced.
        </p>
      </PolicySection>
      <PolicySection title="Mid-Project Cancellation">
        <p>If a project is cancelled after work has begun, completed work is billed and remaining advance is adjusted accordingly.</p>
      </PolicySection>
      <PolicySection title="Refund Process">
        <p>To request a refund:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Email{" "}
            <a href={`mailto:${SUPPORT}`} className="text-cyan-400 hover:underline">
              {SUPPORT}
            </a>{" "}
            within 7 days of payment
          </li>
          <li>Include project details and reason</li>
          <li>We review within 3–5 business days; approved refunds process in 7–10 business days</li>
        </ul>
      </PolicySection>
    </PolicyLayout>
  );
}

export function CookiePolicy() {
  return (
    <PolicyLayout title="Cookie Policy" lastUpdated="August 2026">
      <PolicySection title="What Are Cookies?">
        <p>
          Cookies are small text files stored on your device when you visit a website. They help sites
          remember preferences and understand usage.
        </p>
      </PolicySection>
      <PolicySection title="How We Use Cookies">
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong className="text-white">Essential:</strong> required for basic site functionality
          </li>
          <li>
            <strong className="text-white">Analytics:</strong> PostHog product analytics, only after you
            accept cookies in our consent banner
          </li>
          <li>
            <strong className="text-white">Preference:</strong> remember consent choice
          </li>
        </ul>
      </PolicySection>
      <PolicySection title="Managing Cookies">
        <p>
          You can control cookies in your browser settings. Declining analytics on our banner keeps
          session recording and PostHog captures off.
        </p>
      </PolicySection>
      <PolicySection title="Contact Us">
        <p>
          Questions:{" "}
          <a href={`mailto:${SUPPORT}`} className="text-cyan-400 hover:underline">
            {SUPPORT}
          </a>
        </p>
      </PolicySection>
    </PolicyLayout>
  );
}
