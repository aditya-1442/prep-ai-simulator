'use client'

import Navbar from '@/components/Navbar/Navbar'
import Hero from '@/components/Hero/Hero'
import Features from '@/components/Features/Features'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Zap } from 'lucide-react'
import styles from './page.module.css'

const howItWorks = [
  { step: '01', title: 'Paste Your URLs', desc: 'Add any combination of URLs — job postings, company pages, YouTube videos, articles.' },
  { step: '02', title: 'Choose Output Type', desc: 'Want targeted interview questions? Or a crisp one-page summary? Pick your mode.' },
  { step: '03', title: 'AI Does the Work', desc: 'Advanced AI models scrape, analyze, and synthesize the best prep material for you.' },
  { step: '04', title: 'Walk In Prepared', desc: 'Review your questions and summaries, then walk into the interview with total confidence.' },
]

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Features />

      {/* ===== HOW IT WORKS ===== */}
      <section className={styles.howSection}>
        <div className="container">
          <motion.div
            className={styles.sectionHeader}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
          >
            <span className="badge">✦ Process</span>
            <h2 className={styles.sectionTitle}>
              From URL to
              <span className="gradient-text"> Interview-Ready</span>
            </h2>
            <p className={styles.sectionSubtitle}>Four simple steps. Zero fluff.</p>
          </motion.div>

          <div className={styles.stepsGrid}>
            {howItWorks.map((item, i) => (
              <motion.div
                key={i}
                className={styles.stepCard}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
              >
                <div className={styles.stepNumber}>{item.step}</div>
                <div className={styles.stepConnector} />
                <h3 className={styles.stepTitle}>{item.title}</h3>
                <p className={styles.stepDesc}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA STRIP ===== */}
      <section className={styles.ctaSection}>
        <div className="container">
          <motion.div
            className={styles.ctaCard}
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Decorative elements */}
            <div className={styles.ctaBlob1} />
            <div className={styles.ctaBlob2} />
            <div className={styles.ctaGrid} />

            <div className={styles.ctaInner}>
              <div className={styles.ctaIcon}>
                <Zap size={32} color="white" />
              </div>
              <h2 className={styles.ctaTitle}>Ready to prepare smarter?</h2>
              <p className={styles.ctaSubtitle}>
                Start with any URL or Upload your Resume. No sign-up required. Results in seconds.
              </p>
              <div className={styles.ctaChecks}>
                {['Free to use', 'No login needed', 'Powered by AI'].map((c, i) => (
                  <span key={i} className={styles.ctaCheck}>
                    <CheckCircle2 size={16} />
                    {c}
                  </span>
                ))}
              </div>
              <Link href="/generate" className={styles.ctaButton}>
                <Zap size={18} />
                Start Generating Now
                <ArrowRight size={18} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerInner}>
            <div className={styles.footerBrand}>
              <span className={styles.footerLogo}>PrepAI</span>
              <p className={styles.footerTagline}>Ace every interview with AI precision.</p>
            </div>
            <div className={styles.footerLinks}>
              <Link href="/" className={styles.footerLink}>Home</Link>
              <Link href="/generate" className={styles.footerLink}>Generate</Link>
              <Link href="/history" className={styles.footerLink}>History</Link>
            </div>
          </div>
          <div className={styles.footerDivider} />
          <p className={styles.footerCopy}>© 2026 PrepAI. Built for Excellence.</p>
        </div>
      </footer>
    </main>
  )
}
