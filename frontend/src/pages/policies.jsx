/** Policy pages (extracted / slimmed for issue #14 code-split). Canonical email: support@softogram.in */
import { useEffect } from "react";
import { motion } from "framer-motion";
import SeoHead from "@/components/redesign/SeoHead";
import { metaFor } from "@/lib/routeMeta";

const SUPPORT = "support@softogram.in";

function PolicyLayout({ title, route, lastUpdated, children }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "#0d1117" }} data-testid="policy-page">
      {/* Metadata comes from routeMeta.json so the prerendered HTML matches
          exactly (issue #80). These pages previously set no canonical at all
          and inherited the homepage's. */}
      <SeoHead {...metaFor(route)} />
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
    <PolicyLayout title="Privacy Policy" route="/privacy-policy" lastUpdated="March 2026">
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
    <PolicyLayout title="Terms & Conditions" route="/terms-and-conditions" lastUpdated="March 2026">
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
    <PolicyLayout title="Refund & Cancellation Policy" route="/refund-policy" lastUpdated="March 2026">
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
    <PolicyLayout title="Cookie Policy" route="/cookie-policy" lastUpdated="August 2026">
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

/**
 * SpiceCraft is a separate product (a mobile puzzle game), not a Softogram
 * client engagement, so its policy describes a different thing entirely: no
 * accounts, no purchases yet, the one real data flow being Google AdMob's ads.
 * Source text lives in the SpiceCraft repo at docs/store/privacy-policy.md,
 * founder-confirmed 2026-09-30; kept in sync by hand since the two repos
 * don't share a build.
 */
export function SpiceCraftPrivacyPolicy() {
  return (
    <PolicyLayout title="SpiceCraft Privacy Policy" route="/spicecraft/privacy" lastUpdated="September 2026">
      <PolicySection title="The short version">
        <p>
          The game itself does not collect anything about you. It does not ask for your name, your
          email address or your location, and it has no accounts to sign in to. Everything the game
          remembers is stored on your own phone. The one exception is advertising: the game shows ads
          from Google AdMob, and AdMob collects some information about your device in order to show
          them. That is described below.
        </p>
      </PolicySection>
      <PolicySection title="What the game stores on your phone">
        <p>
          The game saves one small file on your device. It stays on your device, and we never receive
          a copy of it.
        </p>
        <p className="mt-4">It holds:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>which levels you have unlocked, and how many stars you earned on each</li>
          <li>the puzzle you are part way through, so you can close the app and come back to it</li>
          <li>your two settings: sound on or off, and reduced motion on or off</li>
          <li>
            a note of whether you used a hint or a peek on the level you are playing, so the game can
            say something fitting when you win
          </li>
          <li>how many levels you have won in a row, for the same reason</li>
          <li>whether you have bought the remove-ads option, for when that exists</li>
        </ul>
        <p className="mt-4">
          There is nothing in that file that identifies you. There is no name, no email address, no
          phone number, no account and no device identifier of any kind.
        </p>
        <p className="mt-4">
          <strong className="text-white">Deleting it is simple: uninstall the game.</strong> Removing
          the app removes the file and everything in it, including your progress. We cannot restore it
          afterwards, because we never had a copy.
        </p>
      </PolicySection>
      <PolicySection title="Advertising">
        <p>The game is free, and it pays for itself by showing ads supplied by Google AdMob.</p>
        <p className="mt-4">You will see two kinds:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong className="text-white">Ads you choose to watch.</strong> When you run out of
            moves, or want a hint, a peek at a hidden spice or a spare jar, the game offers you a short
            video in exchange. You never have to watch one. Declining only means you do not get that
            extra.
          </li>
          <li>
            <strong className="text-white">Ads between levels.</strong> A full-screen ad appears after
            some finished levels, without being asked for.
          </li>
        </ul>
        <p className="mt-4">
          To show these ads, Google collects information from your device. Google, not us, does this
          collection, and Google is the one that holds the data. According to Google&apos;s own
          description of what its ads library collects, this is:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            your IP address (roughly, where on the internet your phone is, which tells an advertiser
            what country you are in)
          </li>
          <li>
            your advertising ID, a resettable number Android and iOS give to apps so that ads can be
            measured without knowing who you are
          </li>
          <li>what you did with the ad, such as whether you watched it or closed it</li>
          <li>diagnostic information about your device and the app, used to find faults</li>
        </ul>
        <p className="mt-4">
          Google uses this to choose which ads to show, to measure whether they worked, and to detect
          fraud.
        </p>
        <p className="mt-4">
          Source:{" "}
          <a
            href="https://developers.google.com/admob/android/privacy/play-data-disclosure"
            className="text-cyan-400 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            Google Play Data safety guidance for AdMob
          </a>
          .
        </p>
        <p className="mt-4">
          Google&apos;s own privacy policy explains what it does with the data it collects:{" "}
          <a
            href="https://policies.google.com/privacy"
            className="text-cyan-400 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            policies.google.com/privacy
          </a>
          . Google also publishes how it uses data from apps that use its services:{" "}
          <a
            href="https://policies.google.com/technologies/partner-sites"
            className="text-cyan-400 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            policies.google.com/technologies/partner-sites
          </a>
          .
        </p>
        <p className="mt-4">
          <strong className="text-white">You can reset or delete your advertising ID at any time</strong>,
          from your phone&apos;s own settings. On Android it is under Settings, Google, Ads. On iPhone it
          is under Settings, Privacy &amp; Security, Tracking. Doing so does not stop the ads; it stops
          them being connected to what you did before.
        </p>
      </PolicySection>
      <PolicySection title="Your choices about ads in Europe, the UK and Switzerland">
        <p>
          If you are in the European Economic Area, the United Kingdom or Switzerland, the first time
          you open the game you are asked whether you agree to personalised ads. That screen is
          Google&apos;s consent form, shown through Google&apos;s User Messaging Platform.
        </p>
        <ul className="list-disc pl-6 space-y-2 mt-4">
          <li>If you agree, ads may be chosen based on information about your device.</li>
          <li>If you do not agree, you still see ads, but they are not personalised.</li>
        </ul>
        <p className="mt-4">
          <strong className="text-white">The game plays exactly the same either way.</strong> Nothing
          in the puzzle is locked behind that choice.
        </p>
        <p className="mt-4">You can change your answer later from the Settings screen inside the game.</p>
      </PolicySection>
      <PolicySection title="What we do not collect">
        <p>To be unambiguous, the game does not:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>ask for or store your name, email address, phone number or postal address</li>
          <li>have accounts, logins or profiles</li>
          <li>collect or use your location</li>
          <li>read your contacts, photos, microphone, camera or files</li>
          <li>
            use an analytics service. Unity&apos;s analytics and crash reporting are switched off in
            this app
          </li>
          <li>show ads from any company other than Google AdMob</li>
          <li>sell anything, and it contains no purchases</li>
        </ul>
        <p className="mt-4">
          We receive no information from the game at all. The only company that receives anything is
          Google, as described above.
        </p>
      </PolicySection>
      <PolicySection title="Children">
        <p>
          <strong className="text-white">
            SpiceCraft is not directed at children under 13, and we ask that children under 13 do not
            play it.
          </strong>
        </p>
        <p className="mt-4">
          We do not knowingly collect any information from children. If you believe a child has
          provided information through this game, please write to{" "}
          <a href={`mailto:${SUPPORT}`} className="text-cyan-400 hover:underline">
            {SUPPORT}
          </a>{" "}
          and we will look into it.
        </p>
      </PolicySection>
      <PolicySection title="How long anything is kept">
        <p>
          We keep nothing, so there is nothing for us to delete. The data Google collects for
          advertising is kept according to Google&apos;s own retention rules, which are described in
          Google&apos;s privacy policy linked above.
        </p>
      </PolicySection>
      <PolicySection title="Your rights">
        <p>
          Depending on where you live, you may have the right to ask what information is held about
          you, to have it corrected, or to have it deleted. Because we hold nothing about you, any such
          request about advertising data has to go to Google, whose privacy policy explains how.
        </p>
        <p className="mt-4">
          If you want to make a request of us, or you simply want to ask a question, write to{" "}
          <a href={`mailto:${SUPPORT}`} className="text-cyan-400 hover:underline">
            {SUPPORT}
          </a>{" "}
          and we will answer.
        </p>
      </PolicySection>
      <PolicySection title="Changes to this policy">
        <p>
          If the game changes in a way that affects this policy, for example if a purchase is added,
          this page is updated before that version of the game is released. The date at the top is the
          date of the last change.
        </p>
      </PolicySection>
      <PolicySection title="Contact">
        <p>
          <strong className="text-white">Softogram</strong>
          <br />
          <a href={`mailto:${SUPPORT}`} className="text-cyan-400 hover:underline">
            {SUPPORT}
          </a>
        </p>
        <p className="mt-4">This policy is governed by the law of India.</p>
      </PolicySection>
    </PolicyLayout>
  );
}
