import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BackButton from '../components/BackButton';
import Avatar from '../components/Avatar';
import BottomNav from '../components/BottomNav';
import { useApp } from '../context/AppContext';

/* ─────────────────────────────────────────────
   Add Expense Modal
───────────────────────────────────────────── */
function AddExpenseModal({ onClose, onAdd, members }) {
  const [desc, setDesc]   = useState('');
  const [amount, setAmount] = useState('');
  const [payer, setPayer]   = useState(members[0]?.id ?? '');
  const [split, setSplit]   = useState(members.map((m) => m.id)); // all selected by default

  const toggleSplit = (id) =>
    setSplit((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const handleSubmit = () => {
    if (!desc.trim() || !amount || isNaN(Number(amount)) || split.length === 0) return;
    onAdd({
      description: desc.trim(),
      amount: Number(amount),
      paidBy: payer,
      splitBetween: split,
    });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(10,20,60,0.75)',
        backdropFilter: 'blur(6px)', zIndex: 200,
        display: 'flex', alignItems: 'flex-end',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        className="glass"
        style={{
          width: '100%', maxWidth: '430px', margin: '0 auto',
          padding: '28px 24px 40px', borderRadius: '24px 24px 0 0', borderBottom: 'none',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700' }}>Add Expense</h2>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%',
              width: '32px', height: '32px', color: '#fff', cursor: 'pointer', fontSize: '16px',
            }}
          >×</button>
        </div>

        {/* Description */}
        <input
          className="input-glass"
          placeholder="Description (e.g. Dinner)"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          style={{ marginBottom: '12px' }}
        />

        {/* Amount */}
        <input
          className="input-glass"
          placeholder="Amount (₹)"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ marginBottom: '12px' }}
        />

        {/* Paid by */}
        <select
          className="input-glass"
          value={payer}
          onChange={(e) => setPayer(e.target.value)}
          style={{ marginBottom: '16px', appearance: 'none' }}
        >
          {members.map((m) => (
            <option key={m.id} value={m.id} style={{ background: '#0f2060' }}>
              {m.name} paid
            </option>
          ))}
        </select>

        {/* Split between */}
        <p style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: '10px' }}>
          Split between
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
          {members.map((m) => {
            const selected = split.includes(m.id);
            return (
              <button
                key={m.id}
                onClick={() => toggleSplit(m.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '40px',
                  border: `1px solid ${selected ? 'rgba(99,179,237,0.6)' : 'rgba(255,255,255,0.12)'}`,
                  background: selected ? 'rgba(99,179,237,0.2)' : 'rgba(255,255,255,0.04)',
                  color: selected ? '#63b3ed' : 'rgba(255,255,255,0.5)',
                  fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {m.name}
              </button>
            );
          })}
        </div>

        <button
          className="btn-primary"
          onClick={handleSubmit}
          disabled={!desc.trim() || !amount || split.length === 0}
        >
          Add Expense
        </button>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   Expenses Tab
───────────────────────────────────────────── */
function ExpensesTab({ expenses, members, onRemove }) {
  const memberName = (id) => members.find((m) => m.id === id)?.name ?? id;

  return (
    <div>
      {expenses.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <p style={{ fontSize: '32px', marginBottom: '8px' }}>🧾</p>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>No expenses yet</p>
        </div>
      )}
      {expenses.map((exp, i) => (
        <motion.div
          key={exp.id}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          style={{
            display: 'flex', alignItems: 'center', gap: '14px',
            padding: '14px 20px',
            background: 'rgba(255,255,255,0.04)', borderRadius: '14px', marginBottom: '8px',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <Avatar name={memberName(exp.paidBy)} size="sm" />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '14px', fontWeight: '600' }}>{exp.description}</p>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginTop: '2px' }}>
              Paid by {memberName(exp.paidBy)} · split {exp.splitBetween.length} way{exp.splitBetween.length !== 1 ? 's' : ''}
            </p>
          </div>
          <span style={{ fontWeight: '700', fontSize: '15px', marginRight: '8px' }}>₹{exp.amount}</span>
          <button
            onClick={() => onRemove(exp.id)}
            style={{
              background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)',
              fontSize: '18px', cursor: 'pointer', padding: '4px'
            }}
          >
            ×
          </button>
        </motion.div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Debt Summary Tab  (members tab)
───────────────────────────────────────────── */
function DebtSummaryTab({ debts, onSettle }) {
  if (debts.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0' }}>
        <p style={{ fontSize: '32px', marginBottom: '8px' }}>🎉</p>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>All settled up!</p>
      </div>
    );
  }

  return (
    <div>
      {debts.map((d, i) => (
        <motion.div
          key={`${d.fromId}-${d.toId}`}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.06 }}
          style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '14px 20px',
            background: 'rgba(255,255,255,0.04)', borderRadius: '14px', marginBottom: '8px',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <Avatar name={d.from} size="sm" />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '14px', fontWeight: '500' }}>
              <span style={{ fontWeight: '700' }}>{d.from}</span>
              <span style={{ color: 'rgba(255,255,255,0.4)', margin: '0 6px' }}>→</span>
              <span style={{ fontWeight: '700' }}>{d.to}</span>
            </p>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
              owes ₹{d.amount}
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
            <span style={{ fontWeight: '700', fontSize: '15px', color: '#ff6b6b' }}>₹{d.amount}</span>
            <button
              onClick={() => onSettle(d)}
              style={{
                fontSize: '11px', fontWeight: '700', padding: '4px 10px',
                borderRadius: '20px', border: '1px solid rgba(81,240,163,0.4)',
                background: 'rgba(81,240,163,0.12)', color: '#51f0a3',
                cursor: 'pointer', letterSpacing: '0.05em',
              }}
            >
              Settle
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   History Tab  (settlements only)
───────────────────────────────────────────── */
function HistoryTab({ settlements }) {
  if (settlements.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0' }}>
        <p style={{ fontSize: '32px', marginBottom: '8px' }}>📜</p>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>No settlements yet</p>
      </div>
    );
  }

  return (
    <div>
      {settlements.map((s, i) => {
        const d = new Date(s.settledAt);
        const dateStr = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' });
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '14px 20px',
              background: 'rgba(81,240,163,0.05)', borderRadius: '14px', marginBottom: '8px',
              border: '1px solid rgba(81,240,163,0.15)',
            }}
          >
            <Avatar name={s.from} size="sm" />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '14px', fontWeight: '500' }}>
                <span style={{ fontWeight: '700' }}>{s.from}</span>
                <span style={{ color: 'rgba(255,255,255,0.4)', margin: '0 6px' }}>→</span>
                <span style={{ fontWeight: '700' }}>{s.to}</span>
              </p>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>
                Settled on {dateStr}
              </p>
            </div>
            <span style={{ fontWeight: '700', fontSize: '15px', color: '#51f0a3' }}>₹{s.amount}</span>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Dashboard Screen
───────────────────────────────────────────── */
export default function DashboardScreen({ onBack }) {
  const {
    groupName, members, activeTab, expenses, addExpense, removeExpense,
    debts, settlements, settle, myBalance,
  } = useApp();
  const [showModal, setShowModal] = useState(false);

  const isOwing   = myBalance < -0.005;
  const isGetting = myBalance > 0.005;

  const balanceLabel = isOwing
    ? `You owe ₹${Math.abs(Math.round(myBalance))}`
    : isGetting
    ? `You get ₹${Math.round(myBalance)}`
    : 'All settled up 🎉';

  const balanceColor = isOwing ? '#ff6b6b' : '#51f0a3';
  const balanceBg    = isOwing
    ? 'linear-gradient(135deg, rgba(255,107,107,0.15) 0%, rgba(255,107,107,0.05) 100%)'
    : 'linear-gradient(135deg, rgba(81,240,163,0.15) 0%, rgba(81,240,163,0.05) 100%)';
  const balanceBorder = isOwing ? 'rgba(255,107,107,0.25)' : 'rgba(81,240,163,0.25)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', padding: '24px 24px 0' }}>
      {/* Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        <BackButton onClick={onBack} />
        <h1 style={{ flex: 1, textAlign: 'center', fontSize: '18px', fontWeight: '700', letterSpacing: '-0.01em' }}>
          {groupName || 'Group'}
        </h1>
        <div style={{ width: '40px' }} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '90px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass"
          style={{ padding: '28px 24px', position: 'relative', overflow: 'hidden', background: balanceBg, borderColor: balanceBorder }}
        >
          <div style={{
            position: 'absolute', top: '-40px', right: '-40px',
            width: '160px', height: '160px', borderRadius: '50%',
            background: `radial-gradient(circle, ${isOwing ? 'rgba(255,107,107,0.2)' : 'rgba(81,240,163,0.2)'} 0%, transparent 70%)`,
          }} />
          <p className="section-label" style={{ marginBottom: '10px' }}>Your Balance</p>
          <p style={{
            fontSize: '34px', fontWeight: '800', letterSpacing: '-0.03em',
            color: balanceColor, textShadow: `0 0 24px ${balanceColor}66`,
          }}>
            {balanceLabel}
          </p>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginTop: '6px' }}>
            {isOwing ? 'Settle up to clear your balance' : isGetting ? 'Others owe you money 💰' : 'You\'re in the clear 🎉'}
          </p>
          {members.length > 0 && (
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>
              Showing balance for {members[0].name}
            </p>
          )}
        </motion.div>

        {/* Members Row */}
        {members.length > 0 && (
          <div>
            <p className="section-label">Members</p>
            <div className="scroll-x" style={{ padding: '4px 0 8px' }}>
              {members.map((m, i) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.06 }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', minWidth: '56px' }}
                >
                  <Avatar name={m.name} size="lg" />
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', fontWeight: '500', whiteSpace: 'nowrap' }}>
                    {m.name.split(' ')[0]}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content */}
        <div>
          {activeTab === 'members' && (
            <div>
              <p className="section-label">Debt Summary</p>
              <DebtSummaryTab debts={debts} onSettle={settle} />
            </div>
          )}
          {activeTab === 'expenses' && (
            <div>
              <p className="section-label">All Expenses</p>
              <ExpensesTab expenses={expenses} members={members} onRemove={removeExpense} />
            </div>
          )}
          {activeTab === 'history' && (
            <div>
              <p className="section-label">Settlement History</p>
              <HistoryTab settlements={settlements} />
            </div>
          )}
        </div>
      </div>

      {/* FAB */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        className="fab"
        onClick={() => setShowModal(true)}
        title="Add Expense"
        disabled={members.length === 0}
        style={{ opacity: members.length === 0 ? 0.4 : 1 }}
      >
        +
      </motion.button>

      <BottomNav />

      {/* Add Expense Modal */}
      <AnimatePresence>
        {showModal && (
          <AddExpenseModal
            onClose={() => setShowModal(false)}
            onAdd={addExpense}
            members={members}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
