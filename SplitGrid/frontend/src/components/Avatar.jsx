import React from 'react';

const COLORS = [
  'linear-gradient(135deg, #667eea, #764ba2)',
  'linear-gradient(135deg, #f093fb, #f5576c)',
  'linear-gradient(135deg, #4facfe, #00f2fe)',
  'linear-gradient(135deg, #43e97b, #38f9d7)',
  'linear-gradient(135deg, #fa709a, #fee140)',
  'linear-gradient(135deg, #a18cd1, #fbc2eb)',
];

function getColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

export default function Avatar({ name, size = 'md', className = '' }) {
  const sizeClass = size === 'sm' ? 'avatar avatar-sm' : size === 'lg' ? 'avatar avatar-lg' : 'avatar';
  const initial = name ? name.charAt(0).toUpperCase() : '?';
  return (
    <div
      className={`${sizeClass} ${className}`}
      style={{ background: getColor(name || '?') }}
      title={name}
    >
      {initial}
    </div>
  );
}
