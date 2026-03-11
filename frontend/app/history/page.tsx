'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, HelpCircle, FileText, Search, Brain, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import Navbar from '@/components/Navbar/Navbar'
import styles from './page.module.css'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface Generation {
  id: number
  target_name: string
  generation_type: string
  generated_content: string
  created_at: string
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function HistoryPage() {
  const [generations, setGenerations] = useState<Generation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<number | null>(null)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/generations`)
        if (!res.ok) throw new Error('Failed to load history')
        const data: Generation[] = await res.json()
        setGenerations(data)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Unexpected error')
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [])

  const filtered = generations.filter(g =>
    g.target_name.toLowerCase().includes(search.toLowerCase())
  )

  const toggle = (id: number) => setExpanded(prev => prev === id ? null : id)

  return (
    <div className={styles.page}>
      <Navbar />

      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerBg} />
        <div className="container">
          <motion.div
            className={styles.headerContent}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className={styles.headerIcon}>
              <Clock size={28} color="white" />
            </div>
            <h1 className={styles.headerTitle}>Generation History</h1>
            <p className={styles.headerSub}>All your past interview prep sessions, available anytime.</p>
          </motion.div>
        </div>
      </div>

      <div className={`container ${styles.content}`}>
        {/* Search bar */}
        <motion.div
          className={styles.searchWrap}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Search size={18} className={styles.searchIcon} />
          <input
            id="historySearch"
            type="text"
            className={styles.searchInput}
            placeholder="Search by company or target name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </motion.div>

        {/* States */}
        {loading && (
          <div className={styles.centerState}>
            {[...Array(3)].map((_, i) => (
              <div key={i} className={`${styles.skeletonCard} shimmer`} />
            ))}
          </div>
        )}

        {error && (
          <motion.div className={styles.errorState} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p>
              ⚠️{' '}
              {error.includes('429') || error.includes('Quota') || error.includes('RESOURCE_EXHAUSTED')
                ? "Our Gemini AI API limits are temporarily exhausted due to high traffic! Please try again in about 1 minute."
                : error}
            </p>
            <p className={styles.errorHint}>
              {error.includes('429') || error.includes('Quota') || error.includes('RESOURCE_EXHAUSTED')
                ? 'Free tier APIs can sometimes hit sudden rate limits. Wait a moment and then refresh.'
                : 'Is the backend server running on port 8000?'}
            </p>
          </motion.div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <motion.div
            className={styles.emptyState}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className={styles.emptyOrb}>
              <Brain size={40} color="#C4384F" />
            </div>
            <h3>{search ? 'No results found' : 'No generations yet'}</h3>
            <p>{search ? 'Try a different search term.' : 'Head to the Generate page to create your first prep session!'}</p>
          </motion.div>
        )}

        {/* History List */}
        {!loading && !error && (
          <motion.div
            className={styles.list}
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          >
            <AnimatePresence>
              {filtered.map((g) => (
                <motion.div
                  key={g.id}
                  className={styles.card}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
                  }}
                  exit={{ opacity: 0, height: 0 }}
                  layout
                >
                  {/* Card Header */}
                  <button
                    id={`history-item-${g.id}`}
                    className={styles.cardHeader}
                    onClick={() => toggle(g.id)}
                    aria-expanded={expanded === g.id}
                  >
                    <div className={styles.cardMeta}>
                      <div className={styles.cardTypeIcon}>
                        {g.generation_type === 'questions'
                          ? <HelpCircle size={16} color="#6B0E22" />
                          : <FileText size={16} color="#6B0E22" />
                        }
                      </div>
                      <div>
                        <span className={styles.cardName}>{g.target_name}</span>
                        <span className={styles.cardType}>
                          {g.generation_type === 'questions' ? 'Interview Questions' : 'One-Page Summary'}
                        </span>
                      </div>
                    </div>
                    <div className={styles.cardRight}>
                      <span className={styles.cardDate}>
                        <Clock size={13} />
                        {formatDate(g.created_at)}
                      </span>
                      <span className={styles.chevron}>
                        {expanded === g.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </span>
                    </div>
                  </button>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {expanded === g.id && (
                      <motion.div
                        className={styles.cardBody}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <div className={styles.markdownBody}>
                          <ReactMarkdown>{g.generated_content}</ReactMarkdown>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  )
}
