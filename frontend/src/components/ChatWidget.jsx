import { useEffect, useRef, useState } from 'react'
import api from '../services/api'

const STARTERS = [
  'What skills should I learn next?',
  'Am I ready to freelance?',
  'Explain my match score',
]

function ChatIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

function SparkleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l2.1 6.1L20 10l-5.9 1.9L12 18l-2.1-6.1L4 10l5.9-1.9L12 2z" />
      <path d="M19 15l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" opacity="0.7" />
    </svg>
  )
}

function SendIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  )
}

function TypingIndicator() {
  return (
    <div className="mr-auto flex w-fit gap-1 rounded-2xl rounded-bl-sm bg-slate-100 px-4 py-3 dark:bg-slate-800" aria-label="Counselor is typing">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:150ms]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:300ms]" />
    </div>
  )
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const listRef = useRef(null)

  useEffect(() => {
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, loading, open])

  const send = async (text) => {
    const trimmed = (text ?? input).trim()
    if (!trimmed || loading) return
    setInput('')
    setError('')
    setMessages((m) => [...m, { role: 'user', content: trimmed }])
    setLoading(true)
    try {
      const history = messages.slice(-11).map(({ role, content }) => ({ role, content }))
      const res = await api.post('/chat/message', {
        message: trimmed,
        conversation_history: history,
      })
      setMessages((m) => [...m, { role: 'assistant', content: String(res.data.reply) }])
    } catch (err) {
      setError(
        err?.response?.status === 429
          ? 'Too many messages — give it a minute and try again.'
          : 'The counselor is unavailable right now — please try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {open && (
        <div
          role="dialog"
          aria-label="Career Counselor chat"
          className="fixed bottom-24 right-4 z-50 flex max-h-[70vh] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lift dark:border-slate-700 dark:bg-slate-900"
        >
          <div className="flex items-center gap-2 bg-brand-600 px-4 py-3 text-white">
            <SparkleIcon />
            <span className="flex-1 text-sm font-semibold">Career Counselor</span>
            <button
              onClick={() => setOpen(false)}
              aria-label="Minimize chat"
              className="rounded-lg p-1 transition-colors hover:bg-brand-700"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M5 12h14" />
              </svg>
            </button>
          </div>

          <div ref={listRef} role="log" aria-live="polite" className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 && !loading && (
              <>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Hi! I'm your AI career counselor. Ask me anything about skills, matches, or
                  freelancing.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {STARTERS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-100 dark:border-brand-800 dark:bg-brand-950/60 dark:text-brand-300 dark:hover:bg-brand-900/60"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === 'user'
                    ? 'ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-brand-600 px-3.5 py-2 text-sm text-white'
                    : 'mr-auto w-fit max-w-[85%] rounded-2xl rounded-bl-sm bg-slate-100 px-3.5 py-2 text-sm text-slate-800 dark:bg-slate-800 dark:text-slate-100'
                }
              >
                {m.content}
              </div>
            ))}
            {loading && <TypingIndicator />}
            {error && <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              send()
            }}
            className="flex items-center gap-2 border-t border-slate-200 p-3 dark:border-slate-700"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={1000}
              placeholder="Ask about skills, careers, freelancing…"
              aria-label="Message the career counselor"
              className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              aria-label="Send message"
              className="rounded-xl bg-brand-600 p-2.5 text-white transition-colors hover:bg-brand-700 disabled:pointer-events-none disabled:opacity-50"
            >
              <SendIcon />
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close career counselor chat' : 'Open career counselor chat'}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-lift transition-all hover:scale-105 hover:bg-brand-700"
      >
        {open ? <CloseIcon /> : <ChatIcon />}
      </button>
    </>
  )
}
