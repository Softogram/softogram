/** Interactive Terminal demo. Ported Phase 3 from Redesign-Softogram-Website. */
// Terminal widget — three explicit states.
// NOTE: This is the static design spec.
// The real component executes live CLI output via shell subprocess.
// State machine: idle → typing → output → idle (reset)

import { useState, useEffect, useRef } from 'react'

const PROMPT = 'softogram@cli:~$ '
const PLACEHOLDER = 'try: mcp-migration-check examples/before'
const DEMO_CMD = 'mcp-migration-check examples/before'

const DEMO_OUTPUT = [
  { text: `${PROMPT}${DEMO_CMD}`, color: '#e2e8f0' },
  { text: '', color: '' },
  { text: 'scanning 4 files in examples/before …', color: '#94a3b8' },
  { text: '', color: '' },
  { text: '[CONFIRMED] tools/list handler renamed → tools/list_changed', color: '#4ade80', file: 'server.go:42' },
  { text: '[CONFIRMED] resources/read missing content-type field', color: '#4ade80', file: 'resources.go:17' },
  { text: '[REPORTED]  stdio transport version field deprecated', color: '#fb923c', file: 'transport.go:8' },
  { text: '[CONFIRMED] prompts/get argument schema changed → prompts/get_v2', color: '#4ade80', file: 'prompts.go:31' },
  { text: '', color: '' },
  { text: '4 findings: 3 confirmed  1 reported', color: '#e2e8f0' },
  { text: 'exit 0', color: '#94a3b8' },
]


export default function Terminal() {
  const [state, setState] = useState('idle')
  const [typedCmd, setTypedCmd] = useState('')
  const [visibleLines, setVisibleLines] = useState(0)
  const [blinkOn, setBlinkOn] = useState(true)
  const outputRef = useRef(null)

  // Cursor blink
  useEffect(() => {
    if (state !== 'output') {
      const id = setInterval(() => setBlinkOn(b => !b), 530)
      return () => clearInterval(id)
    }
  }, [state])

  // Typing animation
  useEffect(() => {
    if (state !== 'typing') return
    setTypedCmd('')
    let i = 0
    const id = setInterval(() => {
      i++
      setTypedCmd(DEMO_CMD.slice(0, i))
      if (i === DEMO_CMD.length) {
        clearInterval(id)
        setTimeout(() => setState('output'), 500)
      }
    }, 55)
    return () => clearInterval(id)
  }, [state])

  // Output line reveal
  useEffect(() => {
    if (state !== 'output') return
    setVisibleLines(0)
    let i = 0
    const id = setInterval(() => {
      i++
      setVisibleLines(i)
      if (i >= DEMO_OUTPUT.length) clearInterval(id)
    }, 90)
    return () => clearInterval(id)
  }, [state])

  // Auto-scroll output
  useEffect(() => {
    outputRef.current?.scrollTo({ top: 9999, behavior: 'smooth' })
  }, [visibleLines])

  const reset = () => {
    setState('idle')
    setTypedCmd('')
    setVisibleLines(0)
  }

  return (
    <div data-testid="terminal-widget" className="relative">
      {/* ── Terminal window ── */}
      <div
        className="rounded-sm overflow-hidden"
        style={{
          background: '#010409',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
          fontFamily: "var(--font-mono)",
          fontSize: '0.72rem',
          lineHeight: 1.7,
        }}
      >
        {/* Title bar — CSS grid keeps lights / label / reset in separate columns */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '64px 1fr 64px',
            alignItems: 'center',
            background: '#161b22',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            height: 36,
            padding: '0 12px',
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ background: '#ff5f57' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: '#febc2e' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: '#28c840' }} />
          </div>
          <div
            style={{
              color: '#8b949e',
              fontSize: 12,
              textAlign: 'center',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            mcp-migration-checker — bash
          </div>
          <div style={{ textAlign: 'right' }}>
            {state !== 'idle' && (
              <button
                onClick={reset}
                className="text-xs transition-colors duration-150"
                style={{ color: '#8b949e' }}
                data-testid="terminal-reset"
                onMouseEnter={e => (e.currentTarget.style.color = '#e2e8f0')}
                onMouseLeave={e => (e.currentTarget.style.color = '#8b949e')}
              >
                reset
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div
          ref={outputRef}
          className="p-4 overflow-auto"
          style={{ minHeight: 220, maxHeight: 280, overflowX: 'auto', overflowY: 'auto' }}
        >
          {/* ── Idle ── */}
          {state === 'idle' && (
            <div className="flex items-center gap-0">
              <span style={{ color: '#4ade80' }}>{PROMPT}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}>{PLACEHOLDER}</span>
              <span
                className="inline-block w-1.5 h-3.5 ml-0.5"
                style={{
                  background: '#e2e8f0',
                  opacity: blinkOn ? 0.8 : 0,
                  transition: 'opacity 0.08s',
                  verticalAlign: 'text-bottom',
                }}
              />
            </div>
          )}

          {/* ── Typing ── */}
          {state === 'typing' && (
            <div className="flex items-center gap-0">
              <span style={{ color: '#4ade80' }}>{PROMPT}</span>
              <span style={{ color: '#e2e8f0' }}>{typedCmd}</span>
              <span
                className="inline-block w-1.5 h-3.5 ml-0.5"
                style={{
                  background: '#e2e8f0',
                  opacity: blinkOn ? 0.8 : 0,
                  transition: 'opacity 0.08s',
                  verticalAlign: 'text-bottom',
                }}
              />
            </div>
          )}

          {/* ── Output ── */}
          {state === 'output' && (
            <div>
              {DEMO_OUTPUT.slice(0, visibleLines).map((line, i) => (
                <div key={i} className="flex justify-between gap-4 min-w-0">
                  <span className="min-w-0 break-words" style={{ color: line.color || 'transparent' }}>
                    {line.text || ' '}
                  </span>
                  {line.file && (
                    <span className="shrink-0" style={{ color: '#8b949e' }}>{line.file}</span>
                  )}
                </div>
              ))}
              {visibleLines >= DEMO_OUTPUT.length && (
                <div className="flex items-center gap-0 mt-1">
                  <span style={{ color: '#4ade80' }}>{PROMPT}</span>
                  <span
                    className="inline-block w-1.5 h-3.5 ml-0.5"
                    style={{
                      background: '#e2e8f0',
                      opacity: blinkOn ? 0.8 : 0,
                      verticalAlign: 'text-bottom',
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Run button — idle only */}
        {state === 'idle' && (
          <div
            className="flex items-center justify-between px-4 py-2.5"
            style={{ background: '#161b22', borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <span className="text-xs" style={{ color: '#8b949e' }}>
              click run to execute the demo scan
            </span>
            <button
              onClick={() => setState('typing')} data-testid="terminal-run"
              className="flex items-center gap-2 px-4 py-1.5 rounded-sm text-xs font-semibold transition-all duration-150 hover:opacity-90"
              style={{ background: '#4ade80', color: '#010409' }}
            >
              ▶ run
            </button>
          </div>
        )}
      </div>

      {/* ── Spec annotation ── */}
      <div
        className="mt-3 flex items-start gap-2 px-3 py-2 rounded-sm text-xs"
        style={{
          background: 'rgba(251,146,60,0.06)',
          border: '1px solid rgba(251,146,60,0.2)',
          fontFamily: "var(--font-mono)",
          color: '#94a3b8',
        }}
      >
        <span style={{ color: '#fb923c', flexShrink: 0 }}>⚠</span>
        <span>
          Animated demo of the CLI — click run to replay sample output.
          Live binary:{' '}
          <a
            href="https://github.com/Softogram/softogram-mcp-spec-migration-checker"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#4ade80', textDecoration: 'underline' }}
          >
            mcp-migration-checker
          </a>
          .
        </span>
      </div>
    </div>
  )
}
