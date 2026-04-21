import React from 'react';

export default function BackButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '12px',
        color: '#fff',
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        fontSize: '18px',
        transition: 'background 0.15s',
        flexShrink: 0,
      }}
      aria-label="Go back"
    >
      ←
    </button>
  );
}
