import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';

const AppContext = createContext(null);

// Utility to generate IDs
const generateId = () => Math.random().toString(36).substring(2, 11);
const generateReferralCode = (id) => id.substring(0, 6).toUpperCase();

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
  // Database of all groups
  const [groups, setGroups] = useState(() => {
    const saved = localStorage.getItem('splitgrid_groups');
    return saved ? JSON.parse(saved) : {};
  });

  // Current active group ID
  const [activeGroupId, setActiveGroupId] = useState(() => {
    return localStorage.getItem('splitgrid_active_group_id') || null;
  });

  const [activeTab, setActiveTab] = useState('members');

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('splitgrid_groups', JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    if (activeGroupId) {
      localStorage.setItem('splitgrid_active_group_id', activeGroupId);
    } else {
      localStorage.removeItem('splitgrid_active_group_id');
    }
  }, [activeGroupId]);

  // Current Group Data
  const currentGroup = groups[activeGroupId] || {
    name: '',
    members: [],
    expenses: [],
    settlements: [],
    referralCode: '',
  };

  const { name, members, expenses, settlements, referralCode } = currentGroup;

  // Helpers to update current group
  const updateCurrentGroup = (updates) => {
    if (!activeGroupId) return;
    setGroups(prev => ({
      ...prev,
      [activeGroupId]: { ...prev[activeGroupId], ...updates }
    }));
  };

  // ---------- Group Management ----------
  const createGroup = (groupName) => {
    const id = generateId();
    const code = generateReferralCode(id);
    const newGroup = {
      id,
      name: groupName,
      referralCode: code,
      members: [],
      expenses: [],
      settlements: [],
    };
    setGroups(prev => ({ ...prev, [id]: newGroup }));
    setActiveGroupId(id);
    return id;
  };

  const joinGroup = (input) => {
    const idToJoin = input.includes('/join/') 
      ? input.split('/join/')[1] 
      : Object.keys(groups).find(id => groups[id].referralCode === input.toUpperCase());

    if (idToJoin && groups[idToJoin]) {
      setActiveGroupId(idToJoin);
      return true;
    }
    return false;
  };

  // ---------- Members ----------
  const addMember = (memberName) => {
    if (!memberName.trim()) return;
    const exists = members.find(m => m.name.toLowerCase() === memberName.trim().toLowerCase());
    if (exists) return;

    const newMember = { id: Date.now().toString(), name: memberName.trim() };
    updateCurrentGroup({ members: [...members, newMember] });
  };

  const removeMember = (id) => {
    updateCurrentGroup({
      members: members.filter(m => m.id !== id),
      expenses: expenses.filter(e => e.paidBy !== id && !e.splitBetween.includes(id)),
      settlements: settlements.filter(s => s.fromId !== id && s.toId !== id)
    });
  };

  // ---------- Expenses ----------
  const addExpense = (expense) => {
    const newExpense = { id: Date.now().toString(), ...expense, timestamp: Date.now() };
    updateCurrentGroup({ expenses: [newExpense, ...expenses] });
  };

  const removeExpense = (id) => {
    updateCurrentGroup({
      expenses: expenses.filter(e => e.id !== id)
    });
  };

  // ---------- Settle ----------
  const settle = (debt) => {
    const newSettlement = {
      ...debt,
      id: Date.now().toString(),
      settledAt: new Date().toISOString(),
    };
    updateCurrentGroup({ settlements: [newSettlement, ...settlements] });
  };

  // ---------- Derived: balances ----------
  const balances = useMemo(() => {
    const map = {};
    members.forEach((m) => { map[m.id] = 0; });

    // 1. Process Expenses
    expenses.forEach((exp) => {
      const splitCount = exp.splitBetween.length;
      if (splitCount === 0) return;
      const share = exp.amount / splitCount;

      // Payer gains the full amount
      map[exp.paidBy] = (map[exp.paidBy] ?? 0) + exp.amount;
      // Everyone in split owes their share
      exp.splitBetween.forEach((mid) => {
        map[mid] = (map[mid] ?? 0) - share;
      });
    });

    // 2. Process Settlements
    settlements.forEach((s) => {
      // The person who paid (fromId) "gains" balance (reduces debt)
      map[s.fromId] = (map[s.fromId] ?? 0) + s.amount;
      // The person who received (toId) "loses" balance (already got paid back)
      map[s.toId] = (map[s.toId] ?? 0) - s.amount;
    });

    return map;
  }, [expenses, members, settlements]);

  // ---------- Derived: active debts (suggested by engine) ----------
  const debts = useMemo(() => simplifyDebts(balances, members), [balances, members]);

  // ---------- myBalance (net balance of first member as "You") ----------
  const myBalance = members.length > 0 ? (balances[members[0].id] ?? 0) : 0;

  return (
    <AppContext.Provider
      value={{
        groupId: activeGroupId,
        groupName: name,
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

