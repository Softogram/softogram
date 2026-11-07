/**
 * /classes - landing page for Softogram Classes, the live online DSA batch.
 *
 * This is the page the printed flyers' QR code opens, so it has one job: turn
 * a student holding a flyer into a WhatsApp message. Every section ends in the
 * same two actions (WhatsApp, call). Content comes from data/classes.js.
 */
import React, { useEffect } from "react";
import { MessageCircle, Phone, Github, Linkedin } from "lucide-react";
import { G, A, DIM, BORDER, CARD, Section, Reveal } from "@/components/redesign/homePrimitives";
import SeoHead from "@/components/redesign/SeoHead";
import { metaFor } from "@/lib/routeMeta";
import { capture } from "@/lib/analytics";
import {
  BATCH,
  WHAT_YOU_GET,
  SYLLABUS,
  PLACEMENT_SUPPORT,
  TEACHER,
  SCHOOL,
  FAQ,
  CLASSES_PHONE_DISPLAY,
  CLASSES_PHONE_TEL,
  CLASSES_WHATSAPP_HREF,
  CLASSES_WHATSAPP_SCHOOL_HREF,
} from "@/data/classes";

const TEXT = "#e2e8f0";
const MONO = "var(--font-mono)";
const DISPLAY = "var(--font-display)";

const COURSE_LD = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "Softogram Classes: 12-week live DSA batch",
  description:
    "Live online data structures and algorithms batch for B.Tech students, 10 students per batch, with off-campus placement support.",
  provider: { "@type": "Organization", name: "Softogram", url: "https://softogram.in" },
  url: "https://softogram.in/classes",
};

function Eyebrow({ children }) {
  return (
    <p className="text-xs uppercase tracking-[0.18em] mb-3" style={{ color: G, fontFamily: MONO }}>
      {children}
    </p>
  );
}

function H2({ children }) {
  return (
    <h2 className="text-2xl md:text-3xl font-bold mb-6" style={{ color: TEXT, fontFamily: DISPLAY }}>
      {children}
    </h2>
  );
}

function PlusList({ items, testId }) {
  return (
    <ul className="space-y-3" data-testid={testId}>
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-sm md:text-base leading-relaxed" style={{ color: "#c9d1d9" }}>
          <span style={{ color: G, fontFamily: MONO }} aria-hidden="true">
            +
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Card({ children, accent, className = "", testId }) {
  return (
    <div
      className={`rounded-sm p-6 ${className}`}
      style={{ background: CARD, border: `1px solid ${accent ? `${accent}66` : BORDER}` }}
      data-testid={testId}
    >
      {children}
    </div>
  );
}

/** The two actions every section funnels into. `where` tags the analytics event. */
function Actions({ where, whatsappHref = CLASSES_WHATSAPP_HREF, whatsappLabel = "WhatsApp for the demo link" }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-sm text-sm font-semibold transition-colors duration-200 hover:brightness-110"
        style={{ background: G, color: "#09090e", fontFamily: MONO }}
        data-testid={`classes-whatsapp-${where}`}
        onClick={() => capture("classes_whatsapp_clicked", { where })}
      >
        <MessageCircle size={16} aria-hidden="true" />
        {whatsappLabel}
      </a>
      <a
        href={CLASSES_PHONE_TEL}
        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-sm text-sm font-semibold transition-colors duration-200"
        style={{ border: `1px solid ${G}66`, color: TEXT, fontFamily: MONO }}
        data-testid={`classes-call-${where}`}
        onClick={() => capture("classes_call_clicked", { where })}
      >
        <Phone size={16} aria-hidden="true" />
        Call {CLASSES_PHONE_DISPLAY}
      </a>
    </div>
  );
}

export default function Classes() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "#0d1117" }} data-testid="classes-page">
      <SeoHead {...metaFor("/classes")} jsonLd={COURSE_LD} />

      {/* Hero */}
      <Section id="classes-hero" className="pt-32 pb-16 md:pb-20">
        <div className="max-w-5xl mx-auto px-4">
          <Eyebrow>softogram classes . live . online . {BATCH.seats} per batch</Eyebrow>
          <h1
            className="text-4xl md:text-6xl font-bold leading-[1.05] mb-6"
            style={{ color: G, fontFamily: DISPLAY, letterSpacing: "-0.01em" }}
            data-testid="classes-hero-title"
          >
            Crack coding interviews.
            <br />
            Live, online, {BATCH.seats} students per batch.
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-3xl" style={{ color: TEXT }}>
            A 3-month DSA batch for B.Tech students, taught live by an engineer who has done it. DSA means data
            structures and algorithms, the problem-solving topics every coding interview tests.
          </p>
          <Actions where="hero" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-10" data-testid="classes-facts">
            {[
              ["Starts", BATCH.startDate],
              ["Schedule", BATCH.schedule],
              ["Length", `${BATCH.weeks} weeks, ends ${BATCH.endDate}`],
              ["Batch size", `${BATCH.seats} students`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-sm p-4" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
                <p className="text-xs mb-1" style={{ color: DIM, fontFamily: MONO }}>
                  {label}
                </p>
                <p className="text-sm font-semibold" style={{ color: TEXT }}>
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Demo + fee */}
      <Section id="classes-demo" className="py-16" topRule>
        <div className="max-w-5xl mx-auto px-4 grid md:grid-cols-2 gap-6">
          <Reveal>
            <Card accent={A} testId="classes-demo-card" className="h-full">
              <Eyebrow>Free demo class</Eyebrow>
              <ul className="space-y-2 mb-4">
                {BATCH.demos.map((d) => (
                  <li key={d.label} className="text-lg font-semibold" style={{ color: TEXT }}>
                    {d.when}
                  </li>
                ))}
              </ul>
              <p className="text-sm leading-relaxed mb-6" style={{ color: DIM }}>
                Online, one hour. One real interview problem solved live, thinking aloud. Then ask anything about
                the batch, placements or preparation. Message on WhatsApp and you get the link.
              </p>
              <Actions where="demo" />
            </Card>
          </Reveal>
          <Reveal delay={60}>
            <Card accent={G} testId="classes-fee-card" className="h-full">
              <Eyebrow>Fee</Eyebrow>
              <p className="text-4xl font-bold mb-1" style={{ color: G, fontFamily: DISPLAY }}>
                {BATCH.fee}{" "}
                <span className="text-base font-medium" style={{ color: TEXT, fontFamily: "var(--font-rd-sans)" }}>
                  {BATCH.feeNote}
                </span>
              </p>
              <p className="text-sm mb-4" style={{ color: TEXT }}>
                <span
                  className="text-xs px-2 py-0.5 rounded-sm mr-2"
                  style={{ background: G, color: "#09090e", fontFamily: MONO }}
                >
                  EARLY BIRD
                </span>
                <strong>{BATCH.earlyBird}</strong> {BATCH.earlyBirdNote}
              </p>
              <p className="text-sm leading-relaxed" style={{ color: DIM }} data-testid="classes-refund">
                {BATCH.refund} Payment by UPI after the demo, with a receipt on WhatsApp.
              </p>
            </Card>
          </Reveal>
        </div>
      </Section>

      {/* What you get */}
      <Section id="classes-what" className="py-16" topRule>
        <div className="max-w-5xl mx-auto px-4 grid md:grid-cols-5 gap-10">
          <div className="md:col-span-2">
            <Eyebrow>Who it is for</Eyebrow>
            <H2>2nd, 3rd and 4th year B.Tech, any branch.</H2>
            <p className="text-sm md:text-base leading-relaxed" style={{ color: DIM }}>
              You should already be able to write loops and functions in C++, Java or Python. Nothing beyond arrays
              is assumed. If you are below that level, the school batch below is the right start.
            </p>
          </div>
          <div className="md:col-span-3">
            <Eyebrow>What you get</Eyebrow>
            <PlusList items={WHAT_YOU_GET} testId="classes-what-list" />
          </div>
        </div>
      </Section>

      {/* Teacher */}
      <Section id="classes-teacher" className="py-16" topRule>
        <div className="max-w-5xl mx-auto px-4">
          <Reveal>
            <Card testId="classes-teacher-card">
              <Eyebrow>About the teacher</Eyebrow>
              <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: TEXT, fontFamily: DISPLAY }}>
                {TEACHER.name}
              </h2>
              <div className="space-y-3 mb-5 max-w-3xl">
                {TEACHER.lines.map((line) => (
                  <p key={line} className="text-sm md:text-base leading-relaxed" style={{ color: "#c9d1d9" }}>
                    {line}
                  </p>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 mb-6">
                {TEACHER.badges.map((b) => (
                  <span
                    key={b}
                    className="text-xs px-2 py-1 rounded-sm"
                    style={{ background: `${G}22`, color: G, border: `1px solid ${G}44`, fontFamily: MONO }}
                  >
                    {b}
                  </span>
                ))}
              </div>
              <div className="flex gap-4">
                <a
                  href={TEACHER.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm hover:underline"
                  style={{ color: G, fontFamily: MONO }}
                  data-testid="classes-teacher-github"
                >
                  <Github size={16} aria-hidden="true" /> GitHub
                </a>
                <a
                  href={TEACHER.links.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm hover:underline"
                  style={{ color: G, fontFamily: MONO }}
                  data-testid="classes-teacher-linkedin"
                >
                  <Linkedin size={16} aria-hidden="true" /> LinkedIn
                </a>
              </div>
            </Card>
          </Reveal>
        </div>
      </Section>

      {/* Syllabus + placement */}
      <Section id="classes-syllabus" className="py-16" topRule>
        <div className="max-w-5xl mx-auto px-4 grid md:grid-cols-2 gap-10">
          <div>
            <Eyebrow>12 weeks, in order</Eyebrow>
            <H2>The syllabus</H2>
            <ol className="space-y-2" data-testid="classes-syllabus-list">
              {SYLLABUS.map(({ week, topic }) => (
                <li key={week} className="flex gap-4 text-sm md:text-base" style={{ color: "#c9d1d9" }}>
                  <span className="w-8 shrink-0" style={{ color: G, fontFamily: MONO }}>
                    {String(week).padStart(2, "0")}
                  </span>
                  <span>{topic}</span>
                </li>
              ))}
            </ol>
            <p className="text-sm mt-6 leading-relaxed" style={{ color: DIM }}>
              Monday and Tuesday: the idea, taught by solving problems live. Wednesday and Thursday: you solve, I
              check your code on screen. Friday: harder mixed problems. Saturday: contest. Sunday: upsolve.
            </p>
          </div>
          <div>
            <Eyebrow>Off-campus placement support</Eyebrow>
            <H2>What we actually do</H2>
            <PlusList items={PLACEMENT_SUPPORT} testId="classes-placement-list" />
            <div className="mt-6 pl-4" style={{ borderLeft: `2px solid ${A}` }} data-testid="classes-no-guarantee">
              <p className="text-sm leading-relaxed" style={{ color: "#c9d1d9" }}>
                <strong style={{ color: A }}>No placement guarantee.</strong> This batch has not run before, so
                there are no past results to show you yet. What is guaranteed is that you will have solved more
                interview problems under time pressure than most people you compete with.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* School batch */}
      <Section id="classes-school" className="py-16" topRule>
        <div className="max-w-5xl mx-auto px-4">
          <Reveal>
            <Card testId="classes-school-card">
              <div className="grid md:grid-cols-5 gap-8">
                <div className="md:col-span-3">
                  <Eyebrow>For school students</Eyebrow>
                  <H2>Coding and problem solving, {SCHOOL.classes.toLowerCase()}.</H2>
                  <PlusList items={SCHOOL.points} testId="classes-school-list" />
                </div>
                <div className="md:col-span-2 flex flex-col">
                  <p className="text-3xl font-bold mb-1" style={{ color: G, fontFamily: DISPLAY }}>
                    {SCHOOL.fee}{" "}
                    <span className="text-sm font-medium" style={{ color: TEXT, fontFamily: "var(--font-rd-sans)" }}>
                      {SCHOOL.feeNote}
                    </span>
                  </p>
                  <p className="text-sm leading-relaxed mb-6" style={{ color: DIM }}>
                    {SCHOOL.schedule}
                  </p>
                  <div className="mt-auto">
                    <Actions
                      where="school"
                      whatsappHref={CLASSES_WHATSAPP_SCHOOL_HREF}
                      whatsappLabel="WhatsApp about school classes"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </Reveal>
        </div>
      </Section>

      {/* FAQ */}
      <Section id="classes-faq" className="py-16" topRule>
        <div className="max-w-5xl mx-auto px-4">
          <Eyebrow>Questions</Eyebrow>
          <H2>Plain answers</H2>
          <dl className="grid md:grid-cols-2 gap-6" data-testid="classes-faq-list">
            {FAQ.map(({ q, a }) => (
              <div key={q} className="rounded-sm p-5" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
                <dt className="font-semibold mb-2" style={{ color: TEXT }}>
                  {q}
                </dt>
                <dd className="text-sm leading-relaxed" style={{ color: DIM }}>
                  {a}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      {/* Final CTA */}
      <Section id="classes-cta" className="py-20" topRule>
        <div className="max-w-5xl mx-auto px-4">
          <Eyebrow>Next step</Eyebrow>
          <H2>Come to the free demo. Decide after.</H2>
          <p className="text-sm md:text-base leading-relaxed mb-8 max-w-2xl" style={{ color: DIM }}>
            Message on WhatsApp with your name, college and year. You get the demo link the same day. The batch is
            confirmed when 5 students have paid, and seats stop at {BATCH.seats}.
          </p>
          <Actions where="footer" />
          <p className="text-xs mt-8" style={{ color: DIM, fontFamily: MONO }}>
            Softogram Classes is run by Softogram, a brand of Opengram Labs Private Limited.
          </p>
        </div>
      </Section>
    </div>
  );
}
