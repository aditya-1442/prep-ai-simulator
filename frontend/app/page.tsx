'use client'

import Navbar from '@/components/Navbar/Navbar'
import Hero from '@/components/Hero/Hero'
import Features from '@/components/Features/Features'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Zap } from 'lucide-react'
import styles from './page.module.css'

const howItWorks = [
  { step: '01', title: 'Research Your Company', desc: 'Search any company to get LeetCode patterns, interview rounds, comp benchmarks, and culture details.' },
  { step: '02', title: 'Start a Live Coding Round', desc: 'Choose your company and language. An AI interviewer throws real problems at you and challenges your thinking.' },
  { step: '03', title: 'Roast Your Resume', desc: 'Upload your CV and get a brutal Hinglish critique — match scores, missing keywords, zero sugarcoating.' },
  { step: '04', title: 'Walk In Confident', desc: 'Repeat until you crush it. Track history, sharpen your code, and walk into any interview ready to dominate.' },
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
              From Zero to
              <span className="gradient-text"> Interview-Ready</span>
            </h2>
            <p className={styles.sectionSubtitle}>Four steps. Real practice. Total confidence.</p>
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
              <h2 className={styles.ctaTitle}>Ready to ace your next interview?</h2>
              <p className={styles.ctaSubtitle}>
                Pick a company, start coding, or upload your resume. No sign-up required. Results in seconds.
              </p>
              <div className={styles.ctaChecks}>
                {['Free to use', 'No login needed', 'Gemini Powered'].map((c, i) => (
                  <span key={i} className={styles.ctaCheck}>
                    <CheckCircle2 size={16} />
                    {c}
                  </span>
                ))}
              </div>
              <Link href="/generate" className={styles.ctaButton}>
                <Zap size={18} />
                Start Mock Interview Now
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
              <p className={styles.footerTagline}>Live coding · Resume roasting · Company research.</p>
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
