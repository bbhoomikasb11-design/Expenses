import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BackButton from '../components/BackButton';
import Avatar from '../components/Avatar';
import BottomNav from '../components/BottomNav';
import { useApp } from '../context/AppContext';

export default function GroupMembersScreen({ onBack }) {
  const { groupName, members, addMember, removeMember } = useApp();
  const [input, setInput] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const handleAdd = () => {
    if (input.trim()) { addMember(input.trim()); setInput(''); setShowAdd(false); }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100dvh',
      padding: '24px 24px 0',
    }}>
      {/* Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
        <BackButton onClick={onBack} />
        <h1 style={{
          flex: 1,
          textAlign: 'center',
          fontSize: '18px',
          fontWeight: '700',
          letterSpacing: '-0.01em',
        }}>
          {groupName || 'Group'}
        </h1>
        <div style={{ width: '40px' }} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '100px' }}>
        {/* Section header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <p className="section-label">Members ({members.length})</p>
        </div>

        {/* Member List */}
        <motion.div className="glass" style={{ padding: '8px 0', marginBottom: '16px' }}>
          <AnimatePresence>
            {members.map((member, i) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16, height: 0 }}
                transition={{ delay: i * 0.05, duration: 0.25 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px 20px',
                  borderBottom: i < members.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                }}
              >
                <Avatar name={member.name} />
                <span style={{ flex: 1, fontSize: '15px', fontWeight: '500' }}>{member.name}</span>
                <button
                  onClick={() => removeMember(member.id)}
                  style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: 'rgba(255,255,255,0.5)', fontSize: '16px',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.15s',
                  }}
                >
                  ×
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {members.length === 0 && (
            <p style={{ padding: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>
              No members yet
            </p>
          )}
        </motion.div>

        {/* Add Members Toggle */}
        <AnimatePresence>
          {showAdd && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-sm"
              style={{ padding: '16px', marginBottom: '16px', overflow: 'hidden' }}
            >
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  className="input-glass"
                  placeholder="Member name…"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAdd()}
                  autoFocus
                  style={{ flex: 1 }}
                />
                <button className="btn-primary" onClick={handleAdd}
                  style={{ width: 'auto', padding: '0 20px', fontSize: '14px' }}
                  disabled={!input.trim()}
                >
                  Add
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          className="btn-glass"
          onClick={() => setShowAdd(p => !p)}
          style={{ fontSize: '14px', padding: '13px 20px' }}
        >
          {showAdd ? '✕ Cancel' : '+ Add Members'}
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
