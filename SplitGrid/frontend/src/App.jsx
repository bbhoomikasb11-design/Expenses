import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AppProvider, useApp } from './context/AppContext';
import LandingScreen from './screens/LandingScreen';
import CreateGroupScreen from './screens/CreateGroupScreen';
import AddMembersScreen from './screens/AddMembersScreen';
import GroupMembersScreen from './screens/GroupMembersScreen';
import DashboardScreen from './screens/DashboardScreen';
import JoinGroupScreen from './screens/JoinGroupScreen';
import InviteScreen from './screens/InviteScreen';

const SCREENS = ['landing', 'create', 'addMembers', 'invite', 'dashboard', 'join'];

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
};

function AppInner() {
  const [screenIndex, setScreenIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const goTo = (index) => {
    setDirection(index > screenIndex ? 1 : -1);
    setScreenIndex(index);
  };

  const goForward = () => goTo(Math.min(screenIndex + 1, SCREENS.length - 1));
  const goBack    = () => goTo(Math.max(screenIndex - 1, 0));

  const screen = SCREENS[screenIndex];

  return (
    <div className="app-shell" style={{ overflow: 'hidden', position: 'relative' }}>
      {/* Radial glow background */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(99,179,237,0.12) 0%, transparent 70%)',
      }} />

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={screen}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
          style={{ position: 'absolute', inset: 0, overflowY: 'auto', zIndex: 1 }}
        >
          {screen === 'landing'      && <LandingScreen      onCreateGroup={() => goTo(1)} onJoinLink={() => goTo(5)} />}
          {screen === 'create'       && <CreateGroupScreen   onBack={goBack} onNext={goForward} />}
          {screen === 'addMembers'   && <AddMembersScreen    onBack={goBack} onNext={goForward} />}
          {screen === 'invite'       && <InviteScreen        onNext={() => goTo(4)} />}
          {screen === 'dashboard'    && <DashboardScreen     onBack={() => goTo(0)} />}
          {screen === 'join'         && <JoinGroupScreen     onBack={() => goTo(0)} onJoin={() => goTo(4)} />}
        </motion.div>
      </AnimatePresence>

      {/* Skip to dashboard pill (dev convenience) */}
      {screenIndex < 4 && (
        <button
          onClick={() => goTo(4)}
          style={{
            position: 'fixed', bottom: '16px', right: '16px',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.14)',
            borderRadius: '40px', padding: '6px 14px',
            color: 'rgba(255,255,255,0.4)', fontSize: '11px',
            fontWeight: '600', cursor: 'pointer', zIndex: 999,
            backdropFilter: 'blur(8px)',
            letterSpacing: '0.06em',
          }}
        >
          Skip to Dashboard
        </button>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
