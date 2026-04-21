const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const msg = data?.error || data?.message || `Request failed (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  createGroup: ({ groupName }) =>
    request('/api/groups', {
      method: 'POST',
      body: JSON.stringify({ groupName, emoji: '🏠', groupType: 'other', members: [] })
    }),

  getGroup: (id) => request(`/api/groups/${id}`),

  lookupByCode: (code) => request(`/api/groups/lookup/${encodeURIComponent(code)}`),

  addMember: (groupId, { name }) =>
    request(`/api/groups/${groupId}/members`, {
      method: 'POST',
      body: JSON.stringify({ name })
    }),

  addExpense: (groupId, { description, amount, paidBy, splitBetween }) =>
    request(`/api/groups/${groupId}/expense`, {
      method: 'POST',
      body: JSON.stringify({
        item: description,
        amount,
        paidBy,
        splitAmong: splitBetween,
        category: '💸'
      })
    }),

  removeExpense: (groupId, expenseId) =>
    request(`/api/groups/${groupId}/expense/${expenseId}`, { method: 'DELETE' }),

  settle: (groupId, { from, to, amount }) =>
    request(`/api/groups/${groupId}/settle`, {
      method: 'POST',
      body: JSON.stringify({ from, to, amount })
    })
};

