import React, { useState } from 'react';
import { motion } from 'framer-motion';
import BackButton from '../components/BackButton';
import { useApp } from '../context/AppContext';

export default function JoinGroupScreen({ onBack, onJoin }) {
  const { joinGroup } = useApp();
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    setError('');
    if (!input.trim() || loading) return;

    setLoading(true);
    try {
      const success = await joinGroup(input.trim());
      if (success) {
        onJoin();
      } else {
        setError('Group not found. Check the code or link.');
      }
    } catch (e) {
      setError(e?.message || 'Join failed. Check the code or link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100dvh',
      padding: '24px 24px 40px',
    }}>
      {/* Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '48px' }}>
        <BackButton onClick={onBack} />
      </div>

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
          style={{ padding: '32px 28px', position: 'relative', zIndex: 1 }}
        >
          <p style={{
            fontSize: '11px', fontWeight: '600', letterSpacing: '0.12em',
            textTransform: 'uppercase', color: 'rgba(99,179,237,0.8)', marginBottom: '12px',
          }}>
            Welcome Back
          </p>

          <h2 style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.01em', marginBottom: '28px' }}>
            Join Group
          </h2>

          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', marginBottom: '16px' }}>
            Enter a referral code or paste the invitation link below.
          </p>

          <input
            className="input-glass"
            placeholder="Code (e.g. A8F92K) or Link"
            value={input}
            onChange={e => {
              setInput(e.target.value);
              setError('');
            }}
            onKeyDown={e => e.key === 'Enter' && handleJoin()}
            autoFocus
            style={{ marginBottom: '12px' }}
          />

          {error && (
            <p style={{ color: '#ff6b6b', fontSize: '12px', marginBottom: '16px', fontWeight: '500' }}>
              {error}
            </p>
          )}

          <button
            className="btn-primary"
            disabled={!input.trim()}
            onClick={handleJoin}
            style={{ marginTop: '12px' }}
          >
            {loading ? 'Joining...' : 'Join Group'}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
