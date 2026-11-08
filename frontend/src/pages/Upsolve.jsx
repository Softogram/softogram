/**
 * /upsolve - landing page for Upsolve by Softogram, the live online DSA batch.
 *
 * This is the page the printed flyers' QR code opens. Each section is its own
 * file in components/redesign/upsolve/. Copy lives in data/upsolve.js; dates,
 * seats and counters come from the backend so they can never be out of date.
 */
import React, { useEffect } from "react";
import SeoHead from "@/components/redesign/SeoHead";
import { metaFor } from "@/lib/routeMeta";
import { useUpsolveStats } from "@/lib/upsolveApi";
import Hero from "@/components/redesign/upsolve/Hero";
import Counters from "@/components/redesign/upsolve/Counters";
import DemoAnnouncement from "@/components/redesign/upsolve/DemoAnnouncement";
import WhySmallBatch from "@/components/redesign/upsolve/WhySmallBatch";
import Syllabus from "@/components/redesign/upsolve/Syllabus";
import Pricing from "@/components/redesign/upsolve/Pricing";
import Teacher from "@/components/redesign/upsolve/Teacher";
import Placement from "@/components/redesign/upsolve/Placement";
import Faq from "@/components/redesign/upsolve/Faq";
import FinalCta from "@/components/redesign/upsolve/FinalCta";

const COURSE_LD = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "Upsolve by Softogram: 12-week live DSA batch",
  description:
    "Live online data structures and algorithms batch for B.Tech students, 10 students per batch, with off-campus placement support.",
  provider: { "@type": "Organization", name: "Softogram", url: "https://softogram.in" },
  url: "https://softogram.in/upsolve",
};

export default function Upsolve() {
  const { stats, refresh } = useUpsolveStats();

  useEffect(() => {
    if (!window.location.hash) window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "#0d1117" }} data-testid="upsolve-page">
      <SeoHead {...metaFor("/upsolve")} jsonLd={COURSE_LD} />
      <Hero stats={stats} onBooked={refresh} />
      <Counters stats={stats} />
      <DemoAnnouncement stats={stats} />
      <WhySmallBatch />
      <Syllabus />
      <Pricing stats={stats} />
      <Teacher />
      <Placement />
      <Faq />
      <FinalCta stats={stats} />
    </div>
  );
}
