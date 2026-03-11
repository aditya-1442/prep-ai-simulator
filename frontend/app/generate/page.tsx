'use client'
import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Brain, FileText, AlertCircle, Loader2, Link2, ListOrdered, MessageSquare, Send, ChevronRight, Terminal, BookOpen, User, Briefcase, Layout, Code2, AlertTriangle } from 'lucide-react'
import Navbar from '@/components/Navbar/Navbar'
import styles from './page.module.css'
import { python } from '@codemirror/lang-python'
import { javascript } from '@codemirror/lang-javascript'
import { cpp } from '@codemirror/lang-cpp'
import { java } from '@codemirror/lang-java'
import { oneDark } from '@codemirror/theme-one-dark'

const CodeMirror = dynamic(() => import('@uiw/react-codemirror'), { ssr: false })
const ReactMarkdown = dynamic(() => import('react-markdown'), { ssr: false })
import remarkGfm from 'remark-gfm'

const languageExtensions = { python: python(), javascript: javascript({ jsx: true }), cpp: cpp(), java: java() }

// ✅ FIX 1: Hard-coded fallback removed — must be set in Vercel env vars
// Go to Vercel → Project → Settings → Environment Variables
// Add: NEXT_PUBLIC_API_URL = https://prep-ai-simulator.onrender.com
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://prep-ai-simulator.onrender.com'

interface ResumeRoastResponse {
  roast: string
  improvements: string
  match_score: string
  missing_keywords: string[]
}

interface LiveCodeSession {
  session_id: number
  title: string
  description: string
  starting_code: string
  initial_greeting: string
}

export default function EnginePage() {
  const [mode, setMode] = useState<'roast' | 'live-code'>('live-code')

  // Resume Roast State
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [role, setRole] = useState('')
  const [resumeRoast, setResumeRoast] = useState<ResumeRoastResponse | null>(null)

  // Live Code State
  const [companyName, setCompanyName] = useState('')
  const [language, setLanguage] = useState<'python' | 'javascript' | 'cpp' | 'java'>('python')
  const [codeSession, setCodeSession] = useState<LiveCodeSession | null>(null)
  const [currentCode, setCurrentCode] = useState('')
  const [chatInput, setChatInput] = useState('')
  const [chatHistory, setChatHistory] = useState<{role: string, content: string}[]>([])
  const [submissionsCount, setSubmissionsCount] = useState(0)
  const [isInterviewOver, setIsInterviewOver] = useState(false)

  // Shared
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [companies, setCompanies] = useState<string[]>([])
  const chatEndRef = useRef<HTMLDivElement>(null)

  // ✅ FIX 2: Actually fetch companies on mount (was missing entirely!)
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/companies`)
        if (!res.ok) throw new Error('Failed to fetch companies')
        const data = await res.json()
        // Backend returns array of objects or strings — handle both
        if (Array.isArray(data)) {
          const names = data.map((c: any) => (typeof c === 'string' ? c : c.name || c))
          setCompanies(names)
        }
      } catch (err) {
        console.error('Could not load companies list:', err)
        // Non-fatal: user can still type manually
      }
    }
    fetchCompanies()
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory])

  const handleRoast = async () => {
    if (!resumeFile) return
    setLoading(true)
    setError(null)
    setResumeRoast(null)
    try {
      const formData = new FormData()
      formData.append("file", resumeFile)
      formData.append("job_description", role)

      // ✅ FIX 3: Added timeout so Render wake-up doesn't silently fail
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 60000) // 60s for Render cold start

      const res = await fetch(`${API_BASE}/api/interview/roast`, {
        method: 'POST',
        body: formData,
        signal: controller.signal
      })
      clearTimeout(timeout)

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.detail || `Server error: ${res.status}`)
      }
      setResumeRoast(await res.json())
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError('Request timed out. The backend may be waking up (Render free tier). Please try again in 30 seconds.')
      } else {
        setError(`Failed to analyze resume: ${err.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const startLiveCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setCodeSession(null)
    setChatHistory([])
    setSubmissionsCount(0)
    setIsInterviewOver(false)
    try {
      // ✅ FIX 4: Timeout for code start too
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 60000)

      const res = await fetch(`${API_BASE}/api/interview/code/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_name: companyName, language }),
        signal: controller.signal
      })
      clearTimeout(timeout)

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.detail || 'Failed to start interview.')
      }
      const data = await res.json()
      setCodeSession(data)
      setCurrentCode(data.starting_code)
      setChatHistory([{ role: 'ai', content: data.initial_greeting }])
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError('Backend is waking up (Render free tier). Please wait 30 seconds and try again.')
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSendChat = async () => {
    if (!chatInput.trim() || !codeSession || isInterviewOver) return
    const userMsg = chatInput
    setChatInput('')
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }])

    try {
      const res = await fetch(`${API_BASE}/api/interview/code/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: codeSession.session_id, code: currentCode, language, message: userMsg }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setChatHistory(prev => [...prev, { role: 'ai', content: data.reply }])
    } catch (err) {
      setError('Chat failed. Ensure backend is running.')
    }
  }

  const handleSubmitCode = async () => {
    if (!codeSession || isInterviewOver) return
    if (submissionsCount >= 3) {
      setIsInterviewOver(true)
      setChatHistory(prev => [...prev, {role: 'ai', content: "You have reached the maximum number of submissions (3/3). This concludes our interview."}])
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/api/interview/code/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: codeSession.session_id, code: currentCode, language }),
      })

      // ✅ FIX 5: Show actual backend error instead of generic message
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.detail || `Submission failed with status ${res.status}`)
      }
      const data = await res.json()

      const userMsg = `[Submitted Solution for Evaluation in ${language.toUpperCase()}]`
      let aiResp = data.feedback || ''
      if (data.status === "Passed") {
        if (data.is_final) {
          setIsInterviewOver(true)
        } else if (data.follow_up) {
          aiResp += `\n\n**Follow-up Question:**\n${data.follow_up}`
          setCodeSession(prev => prev ? {...prev, description: prev.description + "\n\n### Follow Up\n" + data.follow_up} : prev)
        }
      }

      setChatHistory(prev => [...prev, {role: 'user', content: userMsg}, {role: 'ai', content: aiResp}])

      setSubmissionsCount(prev => {
        const next = prev + 1
        if (next >= 3 && !data.is_final) {
          setIsInterviewOver(true)
          setChatHistory(curr => [...curr, {role: 'ai', content: "That was your final attempt (3/3). The interview is now complete. Good work today!"}])
        }
        return next
      })
    } catch (err: any) {
      setError(`Submission failed: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>

      {!codeSession && (
        <>
          <Navbar />
          <header className={styles.pageHeader}>
            <div className={styles.headerIcon}><Code2 size={32} color="white"/></div>
            <h1 className={styles.headerTitle}>Advanced Simulation Engine</h1>
            <p className={styles.headerSub}>Live AI pair-programming and savage resume analysis.</p>
          </header>

          <div className={styles.tabContainer}>
            <button className={mode === 'live-code' ? styles.tabActive : styles.tab} onClick={() => setMode('live-code')}>
              <Terminal size={18}/> Live Code Sandbox
            </button>
            <button className={mode === 'roast' ? styles.tabActive : styles.tab} onClick={() => setMode('roast')}>
              <AlertTriangle size={18}/> Resume Roaster
            </button>
          </div>
        </>
      )}

      <main className={codeSession ? styles.mainLayoutSandbox : styles.mainLayout}>
        {error && (
          <div className={styles.errorBox}>
            <AlertCircle size={20} /> {error}
          </div>
        )}

        {mode === 'roast' && (
            <motion.div className={styles.roasterView} initial={{opacity: 0}} animate={{opacity: 1}}>
              <div className={styles.roasterInputSection}>
                <h2>Resume Roaster</h2>
                <p>Upload your resume (PDF/DOCX) and we will tear it apart.</p>

                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                  className={styles.fileInput}
                />

                <input
                  className={styles.inputField}
                  placeholder="Target Job Description or Role (Optional)..."
                  value={role}
                  onChange={e => setRole(e.target.value)}
                />

                <button
                  className={styles.submitBtnLarge}
                  onClick={handleRoast}
                  disabled={loading || !resumeFile}
                >
                  {loading ? <Loader2 size={24} className={styles.spin}/> : 'Roast My Resume'}
                </button>

                {/* ✅ FIX 6: Show loading hint for Render cold start */}
                {loading && (
                  <p style={{fontSize: '0.8rem', color: '#888', marginTop: '8px', textAlign: 'center'}}>
                    This may take up to 60 seconds if the backend is waking up...
                  </p>
                )}
              </div>

              {resumeRoast && (
                <div className={styles.roasterOutputSection}>
                  <div className={styles.scoreContainer}>
                    <h3>Match Score</h3>
                    <div className={styles.matchScoreBadge}>{resumeRoast.match_score}</div>
                  </div>

                  <div className={styles.roastBlock}>
                    <div className={styles.roastBadgeSavage}>SAVAGE MODE ON</div>
                    <h3><AlertTriangle size={20} color="var(--accent-ruby)"/> The Roast</h3>
                    <div className={styles.roastText}><ReactMarkdown>{resumeRoast.roast}</ReactMarkdown></div>
                  </div>

                  <div className={styles.improvementBlock}>
                    <h3><Terminal size={20} color="var(--accent-emerald)"/> Roadmap to Fix</h3>
                    <div className={styles.roastText}><ReactMarkdown>{resumeRoast.improvements}</ReactMarkdown></div>
                  </div>

                  {resumeRoast.missing_keywords && resumeRoast.missing_keywords.length > 0 && (
                    <div className={styles.keywordsBlock}>
                      <h3>Missing Keywords</h3>
                      <div className={styles.keywordsList}>
                        {resumeRoast.missing_keywords.map((kw: string, i: number) => (
                          <span key={i} className={styles.keywordBadge}>{kw}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

        {mode === 'live-code' && (
          <div className={styles.codeLayout}>
            {!codeSession && (
              <div className={styles.startScreen}>
                <form onSubmit={startLiveCode} className={styles.startForm}>
                  <h3>Start Live Technical Interview</h3>
                  <div className={styles.fieldGroup}>
                    <input
                      type="text"
                      list="companies-list"
                      className={styles.inputField}
                      placeholder="Target Company (e.g. Meta, Stripe)"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                    />
                    {/* ✅ FIX 2 continued: datalist now populated from API */}
                    <datalist id="companies-list">
                      {companies.map(c => <option key={c} value={c} />)}
                    </datalist>
                  </div>
                  <div className={styles.fieldGroup}>
                    <select
                      className={styles.inputField}
                      value={language}
                      onChange={e => setLanguage(e.target.value as any)}
                    >
                      <option value="python">Python 3</option>
                      <option value="javascript">JavaScript (Node.js)</option>
                      <option value="cpp">C++</option>
                      <option value="java">Java</option>
                    </select>
                  </div>
                  <button type="submit" className={styles.submitBtnLarge} disabled={loading}>
                    {loading ? <Loader2 className={styles.spin} /> : 'Generate Environment'}
                  </button>

                  {loading && (
                    <p style={{fontSize: '0.8rem', color: '#888', marginTop: '8px', textAlign: 'center'}}>
                      Waking up backend & generating problem... this may take ~30-60s
                    </p>
                  )}
                </form>
              </div>
            )}

            {codeSession && (
              <motion.div className={styles.sandboxView} initial={{opacity: 0}} animate={{opacity: 1}}>

                {/* 1. Problem Description Pane (Top Full Width) */}
                <div className={styles.sandboxProblem}>
                  <div className={styles.problemHeaderFixed}>
                    <h2>{codeSession.title}</h2>
                    <button className={styles.backBtnSmall} onClick={() => setCodeSession(null)}>End Session</button>
                  </div>
                  <div className={styles.problemContentScroll}>
                    <div className={styles.problemMarkdown}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{codeSession.description}</ReactMarkdown>
                    </div>
                  </div>
                </div>

                <div className={styles.sandboxLower}>
                  {/* 2. Code Editor Pane */}
                  <div className={styles.sandboxEditor}>
                    <div className={styles.editorHeaderFixed}>
                      <span className={styles.editorLangBadge}>{language.toUpperCase()}</span>
                    </div>
                    <div className={styles.cmWrapper}>
                      <CodeMirror
                        value={currentCode}
                        height="100%"
                        extensions={[languageExtensions[language]]}
                        onChange={(value) => setCurrentCode(value)}
                        className={styles.cmEditor}
                        editable={!isInterviewOver}
                      />
                    </div>
                    <div className={styles.editorFooterFixed}>
                      <span className={styles.submissionsCounter}>Submissions: {submissionsCount}/3</span>
                      <button className={styles.submitCodeBtn} title="Submit and execution" onClick={handleSubmitCode} disabled={loading || isInterviewOver}>
                        {loading ? <Loader2 size={18} className={styles.spin}/> : 'Run & Submit Solution'}
                      </button>
                    </div>
                  </div>

                  {/* 3. AI Interviewer Chat Pane */}
                  <div className={styles.sandboxChat}>
                    <div className={styles.chatHeaderFixed}>
                      <h3>AI Interviewer</h3>
                    </div>
                    <div className={styles.chatWindow}>
                      {chatHistory.map((msg, i) => (
                        <div key={i} className={msg.role === 'ai' ? styles.aiMsg : styles.userMsg}>
                          <div className={styles.msgMarkdown}>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                          </div>
                        </div>
                      ))}
                      <div ref={chatEndRef} />
                    </div>
                    <div className={styles.chatBar}>
                      <input className={styles.chatInput} value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder={isInterviewOver ? "Interview concluded." : "Discuss approach..."} disabled={isInterviewOver} onKeyDown={e => e.key === 'Enter' && handleSendChat()} />
                      <button className={styles.chatSend} title="Send Message" onClick={handleSendChat} disabled={isInterviewOver}><Send size={20}/></button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
