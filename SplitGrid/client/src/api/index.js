import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000"
});

export const createGroup = (data) => API.post('/api/groups', data);
export const createDemoGroup = () => API.post('/api/groups/demo');
export const getGroup = (id) => API.get(`/api/groups/${id}`);
export const addExpense = (id, data) => API.post(`/api/groups/${id}/expense`, data);
export const addSettlement = (id, data) => API.post(`/api/groups/${id}/settle`, data);
export const deleteExpense = (id, expenseId) => API.delete(`/api/groups/${id}/expense/${expenseId}`);
