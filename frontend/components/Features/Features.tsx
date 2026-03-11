'use client'

import { motion } from 'framer-motion'
import { Globe, Youtube, FileText, Building2, Cpu, BookOpen } from 'lucide-react'
import styles from './Features.module.css'

const features = [
  {
    icon: <Building2 size={26} />,
    title: 'Company Deep-Dives',
    description: 'Scrape any company website. Get interview questions tailored to their products, culture, and tech stack.',
    color: '#6B0E22',
  },
  {
    icon: <Youtube size={26} />,
    title: 'YouTube Transcripts',
    description: 'Paste a YouTube URL and PrepAI extracts the full transcript, turning talks into focused study material.',
    color: '#A8253E',
  },
  {
    icon: <FileText size={26} />,
    title: 'Job Description Parser',
    description: 'Upload or link a JD. Our AI identifies key competencies and generates relevant behavioral and technical questions.',
    color: '#C4384F',
  },
  {
    icon: <Globe size={26} />,
    title: 'Any Web Article',
    description: 'Research papers, blog posts, news articles — if it has a URL, PrepAI can study it for you.',
    color: '#8B1A2F',
  },
  {
    icon: <Cpu size={26} />,
    title: 'Gemini 1.5 Powered',
    description: "Google's latest large context model ensures deep comprehension across long documents without missing key details.",
    color: '#6B0E22',
  },
  {
    icon: <BookOpen size={26} />,
    title: 'One-Page Summaries',
    description: 'Too busy to read everything? Get crisp, actionable one-pagers that capture everything that matters.',
    color: '#A8253E',
  },
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

export default function Features() {
  return (
    <section className={styles.section}>
      <div className="container">
        {/* Header */}
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <span className="badge">✦ Features</span>
          <h2 className={styles.title}>
            Everything You Need to
            <br />
            <span className="gradient-text">Prepare Like a Pro</span>
          </h2>
          <p className={styles.subtitle}>
            PrepAI handles any source content so you can focus entirely on learning.
          </p>
        </motion.div>

        {/* Feature Grid */}
        <motion.div
          className={styles.grid}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {features.map((f, i) => (
            <motion.div
              key={i}
              className={styles.card}
              variants={cardVariants}
              whileHover={{ y: -8, transition: { duration: 0.25 } }}
            >
              <div className={styles.iconWrapper} style={{ background: `${f.color}18`, border: `1.5px solid ${f.color}30` }}>
                <span style={{ color: f.color }}>{f.icon}</span>
              </div>
              <h3 className={styles.cardTitle}>{f.title}</h3>
              <p className={styles.cardDesc}>{f.description}</p>
              <div className={styles.cardLine} style={{ background: `linear-gradient(90deg, ${f.color}, transparent)` }} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
