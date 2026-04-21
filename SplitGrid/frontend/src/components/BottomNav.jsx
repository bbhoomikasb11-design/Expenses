import React from 'react';
import { useApp } from '../context/AppContext';

const ICONS = {
  members: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="7" r="3"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75" opacity="0.6"/><path d="M21 21v-2a4 4 0 0 0-3-3.87" opacity="0.6"/>
    </svg>
  ),
  expenses: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
      <line x1="7" y1="15" x2="7.01" y2="15"/><line x1="11" y1="15" x2="13" y2="15"/>
    </svg>
  ),
  history: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="12 8 12 12 14 14"/><circle cx="12" cy="12" r="9"/>
    </svg>
  ),
};

export default function BottomNav() {
  const { activeTab, setActiveTab } = useApp();
  const tabs = ['members', 'expenses', 'history'];

  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => (
        <button
          key={tab}
          className={`nav-tab${activeTab === tab ? ' active' : ''}`}
          onClick={() => setActiveTab(tab)}
        >
          {ICONS[tab]}
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </button>
      ))}
    </nav>
  );
}
