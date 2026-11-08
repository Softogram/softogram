/** Piece 7: who teaches, and why being from Prayagraj matters. */
import React from "react";
import { Github, Linkedin, Trophy } from "lucide-react";
import { TEACHER } from "@/data/upsolve";
import { G, A, DIM, TEXT, CARD, BORDER, MONO, DISPLAY, Eyebrow, Heading } from "./shared";

function ProfileLink({ href, icon: Icon, children, testId }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 no-underline text-[13px] min-h-[32px]" style={{ color: G, fontFamily: MONO }} data-testid={testId}>
      <Icon size={14} aria-hidden="true" />
      {children}
    </a>
  );
}

export default function Teacher() {
  return (
    <section id="teacher" className="py-16 px-4 md:px-6 scroll-mt-20" style={{ background: "#0d1117", borderTop: `1px solid ${BORDER}` }} aria-label="About the teacher" data-testid="upsolve-teacher">
      <div className="max-w-[1120px] mx-auto flex gap-10 flex-wrap items-start">
        <div className="shrink-0 w-[240px] max-w-full">
          <div className="w-[240px] h-[240px] rounded-xl flex items-center justify-center overflow-hidden" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
            <img src={TEACHER.avatar} alt={`Cartoon portrait of ${TEACHER.name}`} width={240} height={240} loading="lazy" className="w-full h-full object-cover" data-testid="upsolve-teacher-avatar" />
          </div>
          <div className="mt-3.5 flex flex-col gap-1">
            {TEACHER.codingProfiles.map((p) => (
              <ProfileLink key={p.id} href={p.url} icon={Trophy} testId={`upsolve-teacher-${p.id}`}>
                {p.site}, {p.handle}
              </ProfileLink>
            ))}
            <ProfileLink href={TEACHER.github} icon={Github} testId="upsolve-teacher-github">
              GitHub, CosmicSaaurabh
            </ProfileLink>
            <ProfileLink href={TEACHER.linkedin} icon={Linkedin} testId="upsolve-teacher-linkedin">
              LinkedIn, 2bsaurabh
            </ProfileLink>
          </div>
        </div>
        <div className="flex-1 basis-[560px] min-w-0">
          <Eyebrow>Your coach</Eyebrow>
          <Heading className="text-3xl md:text-[40px] mb-1.5">{TEACHER.name}</Heading>
          <p className="text-[13px] mb-5" style={{ color: DIM, fontFamily: MONO }}>
            {TEACHER.tagline}
          </p>
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3.5 mb-5">
            {TEACHER.career.map((c) => {
              const color = c.accent ? A : G;
              return (
                <div key={c.label} className="pl-3.5" style={{ borderLeft: `2px solid ${color}` }}>
                  <p className="text-xs mb-0.5" style={{ color, fontFamily: MONO }}>
                    {c.label}
                  </p>
                  <p className="text-[15px] leading-normal" style={{ color: "#d1d5db" }}>
                    {c.text}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="grid md:grid-cols-3 gap-3 mb-4" data-testid="upsolve-teacher-local">
            {TEACHER.local.map((l) => (
              <div key={l.label} className="rounded-md px-4 py-3.5" style={{ background: `${A}1a`, border: `1px solid ${A}8c` }}>
                <p className="text-[11px] tracking-[0.14em] uppercase mb-1.5" style={{ color: A, fontFamily: MONO }}>
                  {l.label}
                </p>
                <p className="text-sm leading-normal" style={{ color: TEXT }}>
                  {l.text}
                </p>
              </div>
            ))}
          </div>
          <blockquote className="m-0 px-5 py-4 rounded-md text-base leading-normal" style={{ background: CARD, border: `1px solid ${BORDER}`, color: TEXT, fontFamily: DISPLAY }}>
            "{TEACHER.quote}"
          </blockquote>
        </div>
      </div>
    </section>
  );
}
