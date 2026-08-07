/** Redesign site chrome — nav + footer. Ported Phase 1 from Redesign-Softogram-Website. */
import { useState, useEffect, useRef } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import LogoMono from './LogoMono'
import Logo from './Logo'
import WhatsAppButton from './WhatsAppButton'
import { BOOKING_URL, TRUST_BADGES, SUPPORT_EMAIL, PHONE_TEL, PHONE_DISPLAY } from '@/data/site'
import { capture } from '@/lib/analytics'

const G      = '#4ade80'
const DIM    = '#8b949e'
const BORDER = 'rgba(255,255,255,0.06)'

// Week branches — extend this list as sprints accumulate.
const WEEK_BRANCHES = [
  { label: 'week-1', href: '/#week-1' },
  { label: 'week-2', href: '/#week-2' },
  { label: 'week-3', href: '/#week-3' },
  { label: 'week-4', href: '/#week-4' },
]

// Flat nav links (not branch tabs)
const NAV_LINKS = [
  { label: 'log',      href: '/#build-log' },
  { label: 'shipped',  href: '/products' },
  { label: 'clients',  href: '/client-work' },
  { label: 'blog',     href: '/blog' },
  { label: 'contact',  href: '/#contact' },
]

// ── Branch dropdown ───────────────────────────────────────────────────────────
function BranchDropdown({ activeWeek }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Close when clicking outside
  useEffect(() => {
    if (!open) return
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target )) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    function handle(e) { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [open])

  const displayLabel = activeWeek || 'main'

  return (
    <div ref={ref} className="relative shrink-0">
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm transition-all duration-150 select-none"
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.72rem',
          color: G,
          background: open ? `${G}14` : `${G}0d`,
          border: `1px solid ${open ? `${G}44` : `${G}28`}`,
          outline: 'none',
          cursor: 'pointer',
        }}
      >
        {/* Branch glyph */}
        <svg width="11" height="11" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
          <circle cx="4" cy="4" r="2.5" stroke={G} strokeWidth="1.5" />
          <circle cx="12" cy="12" r="2.5" stroke={G} strokeWidth="1.5" />
          <circle cx="12" cy="4" r="2.5" stroke={G} strokeWidth="1.5" />
          <line x1="4" y1="6.5" x2="4" y2="9" stroke={G} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M4 9 Q4 12 12 12" stroke={G} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <line x1="12" y1="6.5" x2="12" y2="9.5" stroke={G} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span>{displayLabel}</span>
        {/* Chevron */}
        <svg
          width="8" height="8" viewBox="0 0 8 8" fill="none"
          style={{ transition: 'transform 0.15s', transform: open ? 'rotate(180deg)' : 'none', flexShrink: 0 }}
        >
          <path d="M1.5 2.5L4 5L6.5 2.5" stroke={G} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute top-full left-0 mt-1 rounded-sm overflow-hidden z-50"
          style={{
            minWidth: 160,
            background: '#161b22',
            border: `1px solid ${BORDER}`,
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          }}
        >
          {/* main */}
          <a
            href="/"
            className="flex items-center gap-2.5 px-3 py-2 transition-colors duration-100"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.72rem',
              color: displayLabel === 'main' ? G : '#e2e8f0',
              background: displayLabel === 'main' ? `${G}0d` : 'transparent',
              textDecoration: 'none',
              borderBottom: `1px solid ${BORDER}`,
            }}
            onMouseEnter={e => { if (displayLabel !== 'main') (e.currentTarget ).style.background = 'rgba(255,255,255,0.04)' }}
            onMouseLeave={e => { if (displayLabel !== 'main') (e.currentTarget ).style.background = 'transparent' }}
            onClick={() => setOpen(false)}
          >
            <span className="w-1.5 h-1.5 rounded-full inline-block shrink-0" style={{ background: displayLabel === 'main' ? G : 'rgba(255,255,255,0.2)', boxShadow: displayLabel === 'main' ? `0 0 4px ${G}` : 'none' }} />
            main
          </a>

          {/* Week branches — scrollable if list grows */}
          <div style={{ maxHeight: 240, overflowY: 'auto' }}>
            {WEEK_BRANCHES.map(b => {
              const isActive = displayLabel === b.label
              return (
                <a
                  key={b.label}
                  href={b.href}
                  className="flex items-center gap-2.5 px-3 py-2 transition-colors duration-100"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.72rem',
                    color: isActive ? G : DIM,
                    background: isActive ? `${G}0d` : 'transparent',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={e => { if (!isActive) (e.currentTarget ).style.background = 'rgba(255,255,255,0.04)' }}
                  onMouseLeave={e => { if (!isActive) (e.currentTarget ).style.background = 'transparent' }}
                  onClick={() => setOpen(false)}
                >
                  <span className="w-1.5 h-1.5 rounded-full inline-block shrink-0" style={{ background: isActive ? G : 'rgba(255,255,255,0.12)' }} />
                  {b.label}
                </a>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Flat nav link ─────────────────────────────────────────────────────────────
function NavLink({ href, label, active }) {
  return (
    <a
      href={href}
      data-testid={`nav-link-${label}`}
      className="relative text-xs transition-colors duration-150 py-1"
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        color: active ? '#e2e8f0' : DIM,
        textDecoration: 'none',
      }}
      onMouseEnter={e => (e.currentTarget.style.color = '#e2e8f0')}
      onMouseLeave={e => (e.currentTarget.style.color = active ? '#e2e8f0' : DIM)}
    >
      {label}
      {active && (
        <span className="absolute bottom-0 left-0 right-0 h-px" style={{ background: G, opacity: 0.5 }} />
      )}
    </a>
  )
}

// ── Layout ────────────────────────────────────────────────────────────────────
export default function Layout() {
  const [scrolled, setScrolled]   = useState(false)
  const [menuOpen, setMenuOpen]   = useState(false)
  const [activeHash, setActiveHash] = useState('')
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    if (location.pathname === '/') window.scrollTo(0, 0)
  }, [location.pathname])

  useEffect(() => {
    setActiveHash(location.hash)
  }, [location.hash])

  // Determine which week branch is active (if any)
  const activeWeek = (() => {
    const found = WEEK_BRANCHES.find(b => activeHash === `#${b.label.replace('week-', 'week-')}` || activeHash === `#${b.label}`)
    return found ? found.label : ''
  })()

  // Determine active flat nav link
  const getActiveLink = () => {
    const p = location.pathname
    if (p === '/products')    return 'shipped'
    if (p === '/client-work') return 'clients'
    if (p.startsWith('/blog')) return 'blog'
    return ''
  }
  const activeLink = getActiveLink()

  // Mobile: all destinations
  const allMobileLinks = [
    { label: 'main',     href: '/' },
    ...WEEK_BRANCHES,
    { label: '──',       href: '' },
    ...NAV_LINKS,
  ]

  return (
    <div style={{ background: '#0d1117', minHeight: '100vh', color: '#e2e8f0' }}>
      {/* ── Nav ── */}
      <nav
        data-testid="navbar"
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(13,17,23,0.94)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px) saturate(140%)' : 'none',
          borderBottom: scrolled ? `1px solid ${BORDER}` : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-4">
          {/* Logo mark */}
          <Link to="/" className="shrink-0 flex items-center" style={{ lineHeight: 0 }} data-testid="logo-link">
            <LogoMono size={26} color={G} />
          </Link>

          {/* Branch dropdown */}
          <BranchDropdown activeWeek={activeWeek} />

          {/* Divider */}
          <div className="hidden md:block w-px h-4 shrink-0" style={{ background: BORDER }} />

          {/* Flat nav links */}
          <div className="hidden md:flex items-center gap-5 flex-1">
            {NAV_LINKS.map(l => (
              <NavLink key={l.label} href={l.href} label={l.label} active={activeLink === l.label} />
            ))}
          </div>

          {/* Right CTAs */}
          <div className="hidden md:flex items-center gap-4 ml-auto">
            <a
              href="https://github.com/Softogram"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs transition-colors duration-150"
              style={{ color: DIM, fontFamily: "'JetBrains Mono', monospace" }}
              onMouseEnter={e => (e.currentTarget.style.color = '#e2e8f0')}
              onMouseLeave={e => (e.currentTarget.style.color = DIM)}
            >
              github ↗
            </a>
            <div className="w-px h-3" style={{ background: BORDER }} />
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="nav-booking-cta"
              className="text-xs transition-colors duration-150"
              style={{ color: DIM, fontFamily: "'JetBrains Mono', monospace" }}
              onClick={() => capture('booking_clicked', { placement: 'nav' })}
              onMouseEnter={e => (e.currentTarget.style.color = '#e2e8f0')}
              onMouseLeave={e => (e.currentTarget.style.color = DIM)}
            >
              book a call
            </a>
            <a
              href="/#contact"
              className="px-4 py-1.5 rounded-sm text-xs font-semibold transition-all duration-150 hover:opacity-90"
              style={{ background: G, color: '#0d1117', fontFamily: "'JetBrains Mono', monospace" }}
            >
              get in touch
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden ml-auto p-1.5"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu" data-testid="nav-mobile-toggle"
          >
            <div className="flex flex-col gap-1.5 w-5">
              {[0, 1, 2].map(i => (
                <span
                  key={i}
                  className="block h-px transition-all duration-200"
                  style={{
                    background: DIM,
                    transform: menuOpen && i === 0 ? 'rotate(45deg) translateY(8px)' : menuOpen && i === 2 ? 'rotate(-45deg) translateY(-8px)' : 'none',
                    opacity: menuOpen && i === 1 ? 0 : 1,
                  }}
                />
              ))}
            </div>
          </button>
        </div>

        {/* Mobile drawer */}
        <div
          className="md:hidden overflow-hidden transition-all duration-300"
          style={{
            maxHeight: menuOpen ? '600px' : '0',
            background: 'rgba(13,17,23,0.98)',
            borderBottom: menuOpen ? `1px solid ${BORDER}` : 'none',
          }}
        >
          <div className="px-6 py-5 flex flex-col gap-1">
            {allMobileLinks.map((l, i) => {
              if (l.label === '──') {
                return <div key={i} className="my-2 h-px" style={{ background: BORDER }} />
              }
              return (
                <a
                  key={l.label}
                  href={l.href}
                  className="flex items-center gap-2 py-2 text-sm transition-colors duration-150"
                  style={{
                    color: DIM,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.82rem',
                    textDecoration: 'none',
                  }}
                  onClick={() => setMenuOpen(false)}
                  onMouseEnter={e => (e.currentTarget.style.color = '#e2e8f0')}
                  onMouseLeave={e => (e.currentTarget.style.color = DIM)}
                >
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'rgba(255,255,255,0.15)' }} />
                  {l.label}
                </a>
              )
            })}
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="nav-booking-cta-mobile"
              className="mt-3 px-4 py-2.5 text-xs font-semibold rounded-sm text-center"
              style={{
                background: 'transparent',
                color: G,
                border: `1px solid ${BORDER}`,
                fontFamily: "'JetBrains Mono', monospace",
              }}
              onClick={() => {
                capture('booking_clicked', { placement: 'nav_mobile' })
                setMenuOpen(false)
              }}
            >
              book a free 30-min call
            </a>
            <a
              href="/#contact"
              className="mt-2 px-4 py-2.5 text-xs font-semibold rounded-sm text-center"
              style={{ background: G, color: '#0d1117', fontFamily: "'JetBrains Mono', monospace" }}
              onClick={() => setMenuOpen(false)}
            >
              get in touch
            </a>
          </div>
        </div>
      </nav>

      {/* ── Page ── */}
      <Outlet />

      <WhatsAppButton />

      {/* ── Footer ── */}
      <footer data-testid="footer" className="py-12" style={{ borderTop: `1px solid ${BORDER}`, background: '#0d1117' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-0 mb-8">
            <div
              className="shrink-0 text-right pr-3"
              style={{ width: 48, borderRight: `1px solid ${BORDER}`, fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', color: 'rgba(255,255,255,0.12)', paddingTop: 2 }}
            >
              —
            </div>
            <div className="flex-1 pl-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                {/* Footer keeps the full-color logo — social/print context */}
                <Logo size={32} />
                <p className="mt-3 text-xs max-w-xs" style={{ color: DIM, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.7 }}>
                  Custom software, AI agent tooling, SaaS platforms.
                  <br />
                  Proof is in the repo, not the deck.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                {NAV_LINKS.map(l => (
                  <a
                    key={l.label}
                    href={l.href}
                    className="text-xs transition-colors duration-150"
                    style={{ color: DIM, fontFamily: "'JetBrains Mono', monospace", textDecoration: 'none' }}
                    onMouseEnter={e => (e.currentTarget.style.color = G)}
                    onMouseLeave={e => (e.currentTarget.style.color = DIM)}
                  >
                    {l.label}
                  </a>
                ))}
              </div>
              <div className="text-xs" style={{ color: DIM, fontFamily: "'JetBrains Mono', monospace" }}>
                © 2026 Softogram
                <br />
                <a href={`mailto:${SUPPORT_EMAIL}`} style={{ color: DIM }} data-testid="footer-email">
                  {SUPPORT_EMAIL}
                </a>
                <br />
                <a href={PHONE_TEL} style={{ color: DIM }} data-testid="footer-phone">
                  {PHONE_DISPLAY}
                </a>
                <br />
                <span style={{ color: 'rgba(255,255,255,0.15)' }}>dark theme · softogram.in</span>
                <div className="flex flex-wrap gap-3 mt-3" data-testid="trust-badges">
                  {TRUST_BADGES.map((b) => (
                    <a
                      key={b.id}
                      href={b.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                      style={{ color: 'rgba(255,255,255,0.35)' }}
                      data-testid={`trust-badge-${b.id}`}
                    >
                      {b.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
