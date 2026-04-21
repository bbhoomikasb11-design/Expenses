import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { io } from 'socket.io-client';
import { api } from '../api';

const AppContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Greedy debt-simplification:
// Returns array of { from, fromId, to, toId, amount }
function simplifyDebts(balancesMap, members) {
  const entries = members.map((m) => ({
    id: m.id,
    name: m.name,
    amount: balancesMap[m.id] ?? 0,
  }));

  const creditors = entries.filter((e) => e.amount > 0.005).sort((a, b) => b.amount - a.amount);
  const debtors   = entries.filter((e) => e.amount < -0.005).sort((a, b) => a.amount - b.amount);

  const debts = [];
  let ci = 0;
  let di = 0;

  // Work on copies to avoid mutation
  const cList = creditors.map(c => ({ ...c }));
  const dList = debtors.map(d => ({ ...d }));

  while (ci < cList.length && di < dList.length) {
    const credit = cList[ci];
    const debtor = dList[di];
    const settleAmount = Math.min(credit.amount, -debtor.amount);

    if (settleAmount > 0.005) {
      debts.push({
        from: debtor.name,
        fromId: debtor.id,
        to: credit.name,
        toId: credit.id,
        amount: Math.round(settleAmount * 100) / 100,
      });
    }

    credit.amount  -= settleAmount;
    debtor.amount  += settleAmount;

    if (credit.amount < 0.005) ci++;
    if (debtor.amount > -0.005) di++;
  }

  return debts;
}

export function AppProvider({ children }) {
  const [activeGroupId, setActiveGroupId] = useState(() => localStorage.getItem('splitgrid_active_group_id') || null);
  const [group, setGroup] = useState(null);

  const [activeTab, setActiveTab] = useState('members');

  useEffect(() => {
    if (activeGroupId) {
      localStorage.setItem('splitgrid_active_group_id', activeGroupId);
    } else {
      localStorage.removeItem('splitgrid_active_group_id');
    }
  }, [activeGroupId]);

  // Real-time group sync (MongoDB Change Streams -> socket.io -> UI)
  useEffect(() => {
    if (!activeGroupId) return;
    const socket = io(API_BASE, { autoConnect: true });
    socket.emit('join-group', activeGroupId);
    socket.on('group-updated', (updated) => {
      if (updated && String(updated._id) === String(activeGroupId)) setGroup(updated);
    });
    return () => socket.close();
  }, [activeGroupId]);

  // Load active group on refresh
  useEffect(() => {
    if (!activeGroupId) return;
    api
      .getGroup(activeGroupId)
      .then((g) => setGroup(g))
      .catch(() => {
        setActiveGroupId(null);
        setGroup(null);
      });
  }, [activeGroupId]);

  const members = useMemo(() => {
    const list = group?.members || [];
    return list.map((m) => ({ id: m.name, name: m.name }));
  }, [group?.members]);

  const expenses = useMemo(() => {
    const list = group?.expenses || [];
    return list.map((e) => ({
      id: e.id,
      description: e.item,
      amount: e.amount,
      paidBy: e.paidBy,
      splitBetween: e.splitAmong || [],
      timestamp: e.timestamp
    }));
  }, [group?.expenses]);

  const settlements = useMemo(() => {
    const list = group?.settlements || [];
    return list.map((s) => ({
      id: `${s.from}-${s.to}-${s.timestamp}`,
      from: s.from,
      fromId: s.from,
      to: s.to,
      toId: s.to,
      amount: s.amount,
      settledAt: s.timestamp
    }));
  }, [group?.settlements]);

  const groupName = group?.groupName || '';
  const referralCode = group?.referralCode || (activeGroupId ? String(activeGroupId).slice(0, 6).toUpperCase() : '');

  // ---------- Group Management ----------
  const createGroup = async (name) => {
    const g = await api.createGroup({ groupName: name });
    setActiveGroupId(g._id);
    setGroup(g);
    return g._id;
  };

  const joinGroup = async (input) => {
    const raw = String(input || '').trim();
    if (!raw) return false;

    const match = raw.match(/\/join\/([a-f0-9]{24})/i);
    const idFromLink = match?.[1];
    const idFromPaste = /^[a-f0-9]{24}$/i.test(raw) ? raw : null;

    let groupId = idFromLink || idFromPaste;
    if (!groupId) {
      const code = raw.toUpperCase();
      const lookedUp = await api.lookupByCode(code);
      groupId = lookedUp?._id;
    }

    if (!groupId) return false;
    const g = await api.getGroup(groupId);
    setActiveGroupId(groupId);
    setGroup(g);
    return true;
  };

  // ---------- Members ----------
  const addMember = async (memberName) => {
    if (!activeGroupId) return;
    const name = String(memberName || '').trim();
    if (!name) return;
    const g = await api.addMember(activeGroupId, { name });
    setGroup(g);
  };

  // Note: backend doesn't support member removal yet. Keep UI simple.
  const removeMember = () => {};

  // ---------- Expenses ----------
  const addExpense = async (expense) => {
    if (!activeGroupId) return;
    const g = await api.addExpense(activeGroupId, expense);
    setGroup(g);
  };

  const removeExpense = async (id) => {
    if (!activeGroupId) return;
    const g = await api.removeExpense(activeGroupId, id);
    setGroup(g);
  };

  // ---------- Settle ----------
  const settle = async (debt) => {
    if (!activeGroupId) return;
    const g = await api.settle(activeGroupId, { from: debt.from, to: debt.to, amount: debt.amount });
    setGroup(g);
  };

  // ---------- Derived: balances ----------
  const balances = useMemo(() => {
    // Use backend-calculated balances (Mongo persisted)
    const raw = group?.balances || {};
    const map = {};
    members.forEach((m) => {
      map[m.id] = Number(raw[m.name] ?? 0);
    });
    return map;
  }, [group?.balances, members]);

  // ---------- Derived: active debts (suggested by engine) ----------
  const debts = useMemo(() => simplifyDebts(balances, members), [balances, members]);

  // ---------- myBalance (net balance of first member as "You") ----------
  const myBalance = members.length > 0 ? (balances[members[0].id] ?? 0) : 0;

  return (
    <AppContext.Provider
      value={{
        groupId: activeGroupId,
        groupName,
        referralCode,
        members,
        expenses,
        settlements,
        activeTab,
        setActiveTab,
        balances,
        debts,
        myBalance,
        createGroup,
        joinGroup,
        addMember,
        removeMember,
        addExpense,
        removeExpense,
        settle,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);

