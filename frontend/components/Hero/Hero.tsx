'use client'

import { useState, useEffect } from 'react'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Sparkles, Brain, Zap, Star } from 'lucide-react'
import styles from './Hero.module.css'

const floatingCards = [
  { icon: '🎯', label: 'Smart Questions', delay: 0 },
  { icon: '📋', label: 'One-Page Briefs', delay: 0.4 },
  { icon: '⚡', label: 'Instant Results', delay: 0.8 },
]

const stats = [
  { value: '50K+', label: 'Questions Generated' },
  { value: '98%', label: 'User Satisfaction' },
  { value: '<10s', label: 'Average Time' },
  { value: '15+', label: 'Sources Supported' },
]

export default function Hero() {
  const [particleStyles, setParticleStyles] = useState<any[]>([])

  useEffect(() => {
    // Generate random styles only on the client side to prevent hydration mismatches
    const generatedStyles = [...Array(12)].map(() => ({
      left: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 8}s`,
      animationDuration: `${6 + Math.random() * 6}s`,
      width: `${4 + Math.random() * 8}px`,
      height: `${4 + Math.random() * 8}px`,
    }))
    setParticleStyles(generatedStyles)
  }, [])

  return (
    <section className={styles.hero}>
      {/* Background decorative blobs */}
      <div className={styles.blobPrimary} />
      <div className={styles.blobSecondary} />
      <div className={styles.blobTertiary} />

      {/* Floating particles */}
      {particleStyles.map((style, i) => (
        <div
          key={i}
          className={styles.particle}
          style={style}
        />
      ))}

      {/* Decorative grid */}
      <div className={styles.grid} />

      <div className={`container ${styles.content}`}>
        {/* Badge */}
        <motion.div
          className={styles.badge}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Sparkles size={13} />
          Advanced Interview Intelligence
          <span className={styles.badgeDot} />
          <Star size={11} fill="currentColor" />
          4.9/5
        </motion.div>

        {/* Headline */}
        <motion.h1
          className={styles.headline}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          Ace Every Interview
          <br />
          <span className={styles.headlineAccent}>With AI Precision</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          className={styles.subheadline}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
        >
          Paste any URL — company page, job description, research paper, or YouTube video.
          PrepAI distills it into targeted interview questions or a crisp one-page summary in seconds.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className={styles.ctaGroup}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Link href="/generate" className="btn-primary">
            <Zap size={17} />
            Generate Now — It&apos;s Free
            <ArrowRight size={16} />
          </Link>
          <Link href="/history" className="btn-secondary">
            View History
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          className={styles.stats}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
        >
          {stats.map((s, i) => (
            <div key={i} className={styles.stat}>
              <span className={styles.statValue}>{s.value}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Floating feature cards */}
      <div className={styles.floatingCards}>
        {floatingCards.map((card, i) => (
          <motion.div
            key={i}
            className={styles.floatingCard}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.7 + card.delay }}
            style={{ animationDelay: `${i * 1.5}s` }}
          >
            <span className={styles.floatingIcon}>{card.icon}</span>
            <span className={styles.floatingLabel}>{card.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Central visual */}
      <motion.div
        className={styles.visualWrapper}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <div className={styles.visualOrb}>
          <div className={styles.orbInner}>
            <Brain size={56} color="white" />
          </div>
          <div className={styles.orbRing1} />
          <div className={styles.orbRing2} />
          <div className={styles.orbRing3} />

          {/* Orbiting dots */}
          {[0, 72, 144, 216, 288].map((deg, i) => (
            <div
              key={i}
              className={styles.orbitDot}
              style={{ '--deg': `${deg}deg` } as React.CSSProperties}
            />
          ))}
        </div>

        {/* Mini cards around the orb */}
        <motion.div
          className={`${styles.miniCard} ${styles.miniCard1}`}
          animate={{ y: [-6, 6, -6] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className={styles.miniCardDot} style={{ background: '#22c55e' }} />
          <span>Company Research</span>
        </motion.div>
        <motion.div
          className={`${styles.miniCard} ${styles.miniCard2}`}
          animate={{ y: [6, -6, 6] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className={styles.miniCardDot} style={{ background: '#f59e0b' }} />
          <span>YouTube Videos</span>
        </motion.div>
        <motion.div
          className={`${styles.miniCard} ${styles.miniCard3}`}
          animate={{ y: [-4, 8, -4] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className={styles.miniCardDot} style={{ background: '#6B0E22' }} />
          <span>Job Descriptions</span>
        </motion.div>
      </motion.div>

      {/* Wave divider */}
      <div className={styles.waveDivider}>
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="#FAF8F8" />
        </svg>
      </div>
    </section>
  )
}
