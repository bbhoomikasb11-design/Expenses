import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';

export default function InviteScreen({ onNext }) {
  const { referralCode, groupId } = useApp();
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/join/${groupId}`;

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100dvh',
      padding: '24px 24px 40px',
    }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,179,237,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="glass"
          style={{ padding: '32px 28px', position: 'relative', zIndex: 1, textAlign: 'center' }}
        >
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>🎉</div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.01em', marginBottom: '8px' }}>
            Invite friends
          </h2>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', marginBottom: '32px' }}>
            Share this code or link with your friends to start splitting expenses.
          </p>

          <div style={{ marginBottom: '24px' }}>
            <p className="section-label" style={{ marginBottom: '8px' }}>Referral Code</p>
            <div 
              onClick={() => copyToClipboard(referralCode)}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '16px',
                padding: '16px',
                fontSize: '24px',
                fontWeight: '800',
                letterSpacing: '0.2em',
                color: '#63b3ed',
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              {referralCode}
            </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <p className="section-label" style={{ marginBottom: '8px' }}>Share Link</p>
            <button 
              onClick={() => copyToClipboard(shareUrl)}
              className="btn-glass"
              style={{ width: '100%', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {shareUrl}
            </button>
          </div>

          <AnimatePresence>
            {copied && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  position: 'absolute',
                  top: '20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#51f0a3',
                  color: '#0a143c',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '700',
                  zIndex: 10
                }}
              >
                Copied!
              </motion.div>
            )}
          </AnimatePresence>

          <button className="btn-primary" onClick={onNext}>
            Proceed to Dashboard
          </button>
        </motion.div>
      </div>
    </div>
  );
}
