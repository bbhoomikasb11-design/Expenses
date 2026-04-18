import React, { useState } from 'react';
import { useSplitGrid } from '../context/SplitGridContext';
import { GlassCard } from './GlassCard';

export const ExpenseForm = () => {
  const { addExpense, users } = useSplitGrid();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState(users[0]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description || !amount) return;

    setLoading(true);
    // Evenly divide the amount
    const splitAmount = parseFloat(amount) / users.length;
    const splitAmong = users.map(user => ({
      user,
      amount: splitAmount
    }));

    await addExpense({
      description,
      amount: parseFloat(amount),
      paidBy,
      splitAmong
    });

    setDescription('');
    setAmount('');
    setLoading(false);
  };

  return (
    <GlassCard>
      <h2 className="text-2xl font-bold mb-4 text-[--color-accent]">Add Expense</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-sm text-gray-400 block mb-1">Description</label>
          <input 
            type="text" 
            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 outline-none focus:border-[--color-accent] transition-colors"
            placeholder="Dinner, Taxi, etc."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-400 block mb-1">Amount</label>
            <input 
              type="number" 
              className="w-full bg-black/40 border border-white/10 rounded-lg p-3 outline-none focus:border-[--color-accent] transition-colors"
              placeholder="$0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1">Paid By</label>
            <select 
              className="w-full bg-black/40 border border-white/10 rounded-lg p-3 outline-none focus:border-[--color-accent] transition-colors"
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
            >
              {users.map(user => (
                <option key={user} value={user}>{user}</option>
              ))}
            </select>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="mt-2 text-black font-bold bg-[--color-accent] hover:bg-white transition-colors duration-300 rounded-lg p-3 shadow-[0_0_15px_rgba(0,245,160,0.4)] hover:shadow-[0_0_25px_rgba(255,255,255,0.6)]"
        >
          {loading ? 'Adding...' : 'Split Expense'}
        </button>
      </form>
    </GlassCard>
  );
};
