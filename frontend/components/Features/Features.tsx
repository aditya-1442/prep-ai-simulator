'use client'

import { motion } from 'framer-motion'
import { Terminal, AlertTriangle, Building2, Code2, BarChart2, Cpu } from 'lucide-react'
import styles from './Features.module.css'

const features = [
  {
    icon: <Terminal size={26} />,
    title: 'Live Code Sandbox',
    description: 'Pick any top company and dive into a real-time coding round. An AI interviewer asks questions, reviews your code, and fires follow-ups — just like the actual interview.',
    color: '#6B0E22',
  },
  {
    icon: <AlertTriangle size={26} />,
    title: 'Savage Resume Roaster',
    description: 'Upload your resume (PDF/DOCX) and get a no-holds-barred Hinglish roast. Match scores, missing keywords, and brutal honest feedback to make it interview-ready.',
    color: '#A8253E',
  },
  {
    icon: <Building2 size={26} />,
    title: 'Company Deep-Dives',
    description: 'Research any company — from Google to startups. Get real LeetCode patterns, interview process breakdowns, compensation benchmarks, and previous interview questions.',
    color: '#C4384F',
  },
  {
    icon: <Code2 size={26} />,
    title: 'Multi-Language Support',
    description: 'Code in Python, JavaScript, Java, C++, or any language you prefer. The AI adapts its feedback and hints to your chosen language and stack.',
    color: '#8B1A2F',
  },
  {
    icon: <BarChart2 size={26} />,
    title: 'Company Benchmarking',
    description: 'Compare two companies side-by-side — interview difficulty, comp packages, culture, and engineering bar — so you can make the smartest career decision.',
    color: '#6B0E22',
  },
  {
    icon: <Cpu size={26} />,
    title: 'Gemini AI Powered',
    description: "Google's Gemini model is the brain behind every interview, roast, and research session — providing deep, contextual, and up-to-date responses every time.",
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
            Live coding practice, resume roasting, and deep-dive company research — built for serious candidates.
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
