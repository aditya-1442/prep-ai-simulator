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
  { step: '03', title: 'AI Does the Work', desc: 'Gemini 1.5 scrapes, analyzes, and synthesizes the best prep material for you.' },
  { step: '04', title: 'Walk In Prepared', desc: 'Review your questions and summaries, then walk into the interview with total confidence.' },
]

const testimonials = [
  { name: 'Priya M.', role: 'Software Engineer @ Google', text: 'PrepAI turned a 40-page company report into 20 razor-sharp questions in under 10 seconds. Absolutely wild.' },
  { name: 'Rahul K.', role: 'Product Manager @ Stripe', text: 'I used PrepAI the night before my final round. The questions it generated were almost exactly what I was asked.' },
  { name: 'Sara L.', role: 'Data Scientist @ Meta', text: 'The one-page summary feature is a game changer. I can brief myself on any company in 5 minutes.' },
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

      {/* ===== TESTIMONIALS ===== */}
      <section className={styles.testimonialsSection}>
        <div className={styles.testimonialsBg} />
        <div className="container">
          <motion.div
            className={styles.sectionHeader}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className={styles.badgeLight}>✦ Reviews</span>
            <h2 className={styles.sectionTitleLight}>
              Trusted by Top Candidates
            </h2>
          </motion.div>

          <div className={styles.testimonialsGrid}>
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                className={styles.testimonialCard}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                whileHover={{ y: -6 }}
              >
                <div className={styles.stars}>{'★'.repeat(5)}</div>
                <p className={styles.testimonialText}>&ldquo;{t.text}&rdquo;</p>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.authorAvatar}>
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <span className={styles.authorName}>{t.name}</span>
                    <span className={styles.authorRole}>{t.role}</span>
                  </div>
                </div>
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
                Start with any URL. No sign-up required. Results in seconds.
              </p>
              <div className={styles.ctaChecks}>
                {['Free to use', 'No login needed', 'Powered by Gemini 1.5'].map((c, i) => (
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
          <p className={styles.footerCopy}>© 2026 PrepAI. Built with Gemini 1.5 & FastAPI.</p>
        </div>
      </footer>
    </main>
  )
}
