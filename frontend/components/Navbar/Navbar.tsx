'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Brain, Sparkles } from 'lucide-react'
import styles from './Navbar.module.css'

export default function Navbar() {
  return (
    <motion.nav
      className={styles.nav}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className={`container ${styles.inner}`}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <div className={styles.logoIcon}>
            <Brain size={20} color="white" />
          </div>
          <span className={styles.logoText}>
            Prep<span className={styles.logoAccent}>AI</span>
          </span>
        </Link>

        {/* Nav Links */}
        <div className={styles.links}>
          <Link href="/" className={styles.link}>Home</Link>
          <Link href="/generate" className={styles.link}>Generate</Link>
          <Link href="/history" className={styles.link}>History</Link>
        </div>

        {/* CTA */}
        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
          <Link href="/generate" className={styles.ctaBtn}>
            <Sparkles size={15} />
            Start Prepping
          </Link>
        </motion.div>
      </div>
    </motion.nav>
  )
}
