import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BackButton from '../components/BackButton';
import Avatar from '../components/Avatar';
import { useApp } from '../context/AppContext';

export default function AddMembersScreen({ onBack, onNext }) {
  const { members, addMember, removeMember, groupName } = useApp();
  const [input, setInput] = useState('');

  const handleAdd = () => {
    if (input.trim()) {
      addMember(input.trim());
      setInput('');
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
            textTransform: 'uppercase', color: 'rgba(99,179,237,0.8)', marginBottom: '8px',
          }}>
            {groupName || 'Your Group'}
          </p>

          <h2 style={{ fontSize: '22px', fontWeight: '700', letterSpacing: '-0.01em', marginBottom: '24px' }}>
            Add Members
          </h2>

          {/* Input Row */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            <input
              className="input-glass"
              placeholder="Add member name…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              style={{ flex: 1 }}
            />
            <button
              onClick={handleAdd}
              disabled={!input.trim()}
              style={{
                padding: '0 16px',
                background: input.trim() ? 'rgba(99,179,237,0.25)' : 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(99,179,237,0.35)',
                borderRadius: '14px',
                color: '#fff',
                fontSize: '20px',
                cursor: input.trim() ? 'pointer' : 'not-allowed',
                transition: 'background 0.15s',
                flexShrink: 0,
                opacity: input.trim() ? 1 : 0.4,
              }}
            >
              +
            </button>
          </div>

          {/* Member Chips */}
          <AnimatePresence>
            {members.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                  marginBottom: '24px',
                }}
              >
                {members.map(member => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, scale: 0.8, y: 4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="chip"
                  >
                    <Avatar name={member.name} size="sm" />
                    <span style={{ fontSize: '13px', fontWeight: '500' }}>{member.name}</span>
                    <button
                      className="chip-remove"
                      onClick={() => removeMember(member.id)}
                    >
                      ×
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {members.length === 0 && (
            <p style={{
              fontSize: '13px',
              color: 'rgba(255,255,255,0.28)',
              textAlign: 'center',
              marginBottom: '24px',
              fontStyle: 'italic',
            }}>
              No members yet — add some above
            </p>
          )}

          <button
            className="btn-primary"
            disabled={members.length === 0}
            onClick={onNext}
          >
            Create Group →
          </button>
        </motion.div>
      </div>
    </div>
  );
}
