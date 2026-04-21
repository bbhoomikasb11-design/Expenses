import React from 'react';
import { motion } from 'framer-motion';

const LogoIcon = () => (
  <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="6" width="18" height="18" rx="5" stroke="rgba(255,255,255,0.9)" strokeWidth="2"/>
    <rect x="32" y="6" width="18" height="18" rx="5" stroke="rgba(255,255,255,0.9)" strokeWidth="2"/>
    <rect x="6" y="32" width="18" height="18" rx="5" stroke="rgba(255,255,255,0.9)" strokeWidth="2"/>
    <rect x="32" y="32" width="18" height="18" rx="5" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeDasharray="4 3"/>
    <line x1="15" y1="28" x2="15" y2="28" stroke="rgba(255,255,255,0.6)" strokeWidth="2"/>
    <line x1="28" y1="15" x2="28" y2="15" stroke="rgba(255,255,255,0.6)" strokeWidth="2"/>
    <line x1="41" y1="28" x2="41" y2="28" stroke="rgba(255,255,255,0.6)" strokeWidth="2"/>
    <line x1="28" y1="41" x2="28" y2="41" stroke="rgba(255,255,255,0.6)" strokeWidth="2"/>
    <circle cx="28" cy="28" r="3" fill="rgba(99,179,237,0.9)"/>
  </svg>
);

export default function LandingScreen({ onCreateGroup, onJoinLink }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100dvh',
      padding: '40px 32px',
      gap: '0',
      position: 'relative',
    }}>
      {/* Radial Glow */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '340px',
        height: '340px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,179,237,0.18) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5, ease: 'backOut' }}
          style={{
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.14)',
            borderRadius: '20px',
            width: '88px',
            height: '88px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(12px)',
            marginBottom: '28px',
            boxShadow: '0 8px 32px rgba(99,179,237,0.15)',
          }}
        >
          <LogoIcon />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          style={{
            fontSize: '42px',
            fontWeight: '800',
            letterSpacing: '-0.02em',
            marginBottom: '12px',
            background: 'linear-gradient(135deg, #ffffff 40%, rgba(99,179,237,0.9) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          SplitGrid
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          style={{
            fontSize: '16px',
            color: 'rgba(255,255,255,0.5)',
            fontWeight: '400',
            textAlign: 'center',
            marginBottom: '64px',
            lineHeight: '1.5',
          }}
        >
          Track, split, and settle — instantly.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}
        >
          <button className="btn-primary" onClick={onCreateGroup}>
            Create Group
          </button>
          <button className="btn-glass" onClick={onJoinLink}>
            Join via Link
          </button>
        </motion.div>

        {/* Bottom tag */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          style={{ marginTop: '40px', fontSize: '13px', color: 'rgba(255,255,255,0.25)', fontWeight: '500' }}
        >
          No sign-up required
        </motion.p>
      </motion.div>
    </div>
  );
}
