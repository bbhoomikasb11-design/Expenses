import React, { useState } from 'react';
import { motion } from 'framer-motion';
import BackButton from '../components/BackButton';
import { useApp } from '../context/AppContext';

export default function CreateGroupScreen({ onBack, onNext }) {
  const { createGroup } = useApp();
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    const name = value.trim();
    if (!name || loading) return;
    setError('');
    setLoading(true);
    try {
      await createGroup(name);
      onNext();
    } catch (e) {
      setError(e?.message || 'Failed to create group');
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

      {/* Center content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {/* Glow */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,179,237,0.14) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="glass"
          style={{ padding: '32px 28px', position: 'relative', zIndex: 1 }}
        >
          {/* Card tag */}
          <p style={{
            fontSize: '11px',
            fontWeight: '600',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'rgba(99,179,237,0.8)',
            marginBottom: '12px',
          }}>
            New Group
          </p>

          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            letterSpacing: '-0.01em',
            marginBottom: '28px',
            lineHeight: '1.2',
          }}>
            Enter Group Name
          </h2>

          <input
            className="input-glass"
            placeholder="e.g. Goa Trip"
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            autoFocus
            style={{ marginBottom: '24px' }}
          />

          {error && (
            <p style={{ color: '#ff6b6b', fontSize: '12px', marginBottom: '14px', fontWeight: '600' }}>
              {error}
            </p>
          )}

          <button
            className="btn-primary"
            disabled={!value.trim()}
            onClick={handleCreate}
          >
            {loading ? 'Creating...' : 'Create Group'}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
