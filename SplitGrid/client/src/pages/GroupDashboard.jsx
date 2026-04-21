import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, AlertTriangle, Navigation, Search, Clock, Plus, X, Receipt } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGroup } from '../context/GroupContext';

const simplifyDebts = (balancesMap) => {
  if (!balancesMap) return [];
  const debtors = [];
  const creditors = [];
  for (const [name, balance] of Object.entries(balancesMap)) {
    if (balance < -0.01) debtors.push({ name, amount: -balance });
    else if (balance > 0.01) creditors.push({ name, amount: balance });
  }
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  let i = 0;
  let j = 0;
  const transactions = [];
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = Math.min(debtor.amount, creditor.amount);
    transactions.push({ from: debtor.name, to: creditor.name, amount });
    debtor.amount -= amount;
    creditor.amount -= amount;
    if (debtor.amount < 0.01) i++;
    if (creditor.amount < 0.01) j++;
  }
  return transactions;
};

const GroupDashboard = () => {
  const { id } = useParams();
  const { group, loading, addExpense, deleteExpense, socket } = useGroup();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [socketStatus, setSocketStatus] = useState(socket?.connected ? 'connected' : 'connecting');
  const [me, setMe] = useState('');

  // Add Expense form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenseItem, setExpenseItem] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expensePayer, setExpensePayer] = useState('');
  const [expenseSpliters, setExpenseSpliters] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!socket) return;
    const onConnect = () => setSocketStatus('connected');
    const onDisconnect = () => setSocketStatus('disconnected');
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    setSocketStatus(socket.connected ? 'connected' : 'connecting');
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, [socket]);

  useEffect(() => {
    if (group && group.members?.length > 0 && !expensePayer) {
      setExpensePayer(group.members[0].name);
      setExpenseSpliters(group.members.map(m => m.name));
      if(selectedFriends.length === 0) setSelectedFriends([group.members[0].name]);
    }
  }, [group, expensePayer]);

  useEffect(() => {
    if (!group?.members?.length) return;
    const key = `splitgrid.me.${id}`;
    const stored = localStorage.getItem(key);
    const initial = stored && group.members.some((m) => m.name === stored) ? stored : group.members[0].name;
    setMe(initial);
    localStorage.setItem(key, initial);
  }, [group?.members, id]);

  if (loading || !group) {
    return (
       <div className="min-h-screen app-container flex items-center justify-center">
         <div className="text-[var(--highlight-gold)] font-bold text-2xl animate-pulse tracking-widest uppercase">Fetching Group Data...</div>
       </div>
    );
  }

  const handleAddExpense = async (e) => {
    if (e) e.preventDefault();
    if (!expenseItem || !expenseAmount || !expensePayer || expenseSpliters.length === 0) return toast.error('Fill out all core fields!');
    setIsSubmitting(true);
    try {
      await addExpense({
        item: expenseItem, amount: parseFloat(expenseAmount), paidBy: expensePayer, splitAmong: expenseSpliters, category: '💸'
      });
      setIsModalOpen(false);
      setExpenseItem('');
      setExpenseAmount('');
    } catch (err) {
      toast.error('Failed to add expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFriend = (name) => {
    setSelectedFriends(prev => 
      prev.includes(name) ? prev.filter(f => f !== name) : [...prev, name]
    );
  };

  const totalSpent = group.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const sortedExpenses = [...group.expenses].sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
  const lastExpense = sortedExpenses.length > 0 ? sortedExpenses[0] : null;
  const myBalance = me && group.balances ? Number(group.balances[me] ?? 0) : 0;
  const debtSummary = simplifyDebts(group.balances || {});

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-12 relative overflow-hidden bg-[var(--bg-cream)]">
      <main className="app-container w-full max-w-xl mx-auto min-h-[85vh] p-6 md:p-10 flex flex-col relative z-10 shadow-2xl">
        
        {/* Header */}
        <header className="flex justify-between items-center w-full mb-8">
          <div className="flex flex-col">
            <span className="text-[var(--text-sub)] text-sm md:text-base tracking-wider uppercase font-semibold flex items-center gap-2">
               Live Sync
               <div className={`w-2 h-2 rounded-full ${socketStatus === 'connected' ? 'bg-green-400 shadow-[0_0_8px_#4ade80]' : 'bg-red-400'}`} title="Live Sync Status" />
            </span>
            <h1 className="text-3xl md:text-4xl text-[var(--highlight-gold)] font-bold mt-1 max-w-[200px] md:max-w-md truncate">{group.groupName}</h1>
            <div className="mt-3 flex items-center gap-3">
              <span className="text-xs text-[var(--text-sub)] font-bold uppercase tracking-widest">You are</span>
              <select
                value={me}
                onChange={(e) => {
                  const next = e.target.value;
                  setMe(next);
                  localStorage.setItem(`splitgrid.me.${id}`, next);
                }}
                className="bg-[var(--deep-card-violet)] border border-white/10 rounded-xl px-3 py-2 text-white text-sm font-semibold outline-none focus:border-[var(--highlight-gold)]"
              >
                {group.members.map((m) => (
                  <option key={m.name} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-gray-200 rounded-full flex justify-center items-center overflow-hidden shadow-lg border-2 border-transparent hover:border-[var(--highlight-gold)] transition-colors">
               <img src={`https://ui-avatars.com/api/?name=${group.members[0].name}&background=random`} alt="Profile" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        {/* Dynamic Balance Card */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card-peach w-full p-6 md:p-8 flex items-stretch justify-between mb-6 relative z-20 shadow-2xl">
          <div className="flex flex-col justify-center">
            <p className="text-amber-900/60 font-semibold text-sm md:text-base uppercase tracking-wider mb-2">Your Balance</p>
            {myBalance < -0.01 ? (
              <div className="text-4xl md:text-5xl font-extrabold text-red-700">You owe ₹ {Math.ceil(Math.abs(myBalance))}</div>
            ) : myBalance > 0.01 ? (
              <div className="text-4xl md:text-5xl font-extrabold text-green-700">You get ₹ {Math.ceil(myBalance)}</div>
            ) : (
              <div className="text-4xl md:text-5xl font-extrabold text-[#78350f]">All settled up 🎉</div>
            )}
            <p className="text-amber-900/60 font-semibold text-sm mt-3">Group total: ₹ {totalSpent.toFixed(2)}</p>
          </div>
          
          <div className="flex flex-col items-end relative">
            <p className="text-amber-900/60 font-semibold text-sm md:text-base uppercase tracking-wider mb-2">Split With</p>
            <div className="bg-white/40 p-2 md:p-3 rounded-2xl cursor-pointer hover:bg-white/60 transition-colors flex flex-col gap-2 items-center min-w-[50px] shadow-sm relative z-30" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-white shadow-sm flex items-center justify-center font-bold text-xl overflow-hidden bg-white/50 text-[#1e1b4b]">
                {selectedFriends.length > 0 ? selectedFriends[0].charAt(0).toUpperCase() : '?'}
              </div>
              <ChevronDown size={18} className={`text-amber-900 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </div>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div initial={{ opacity: 0, y: -20, height: 0 }} animate={{ opacity: 1, y: 10, height: 'auto' }} exit={{ opacity: 0, y: -20, height: 0 }} className="absolute top-full right-0 mt-3 bg-white/70 backdrop-blur-xl p-3 md:p-4 rounded-3xl flex flex-col gap-3 shadow-2xl border border-white/50 z-40 max-h-60 overflow-y-auto w-max">
                  {group.members.map((m) => {
                    const isSelected = selectedFriends.includes(m.name);
                    return (
                      <div key={m.name} className="relative group p-1 flex items-center gap-3 cursor-pointer" onClick={() => toggleFriend(m.name)}>
                         <div className={`w-10 h-10 rounded-full transition-all duration-300 flex items-center justify-center font-bold text-[#1e1b4b] overflow-hidden ${isSelected ? 'shadow-[0_0_15px_var(--highlight-gold)] border-2 border-[var(--highlight-gold)] scale-110 bg-white' : 'border-2 border-transparent hover:scale-105 opacity-80 hover:opacity-100 bg-white/50'} `}>
                           {m.name.charAt(0).toUpperCase()}
                         </div>
                         <span className="font-semibold text-amber-950 pr-2">{m.name}</span>
                         {isSelected && <div className="absolute left-7 bottom-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>}
                      </div>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Deep Cards Stack */}
        <div className="flex flex-col gap-4 mb-10 w-full md:flex-row">
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-deep flex-1 p-5 md:p-6 flex items-center justify-between shadow-xl">
             <div className="flex items-center gap-4">
               <div className="text-amber-400 bg-amber-400/10 p-3 rounded-full">
                 <AlertTriangle size={24} />
               </div>
               <div>
                  <h3 className="text-white font-medium text-lg md:text-xl">Previous Split</h3>
                  <p className="text-[var(--text-sub)] text-sm md:text-base line-clamp-1">{lastExpense ? lastExpense.item : 'No expenses yet'}</p>
               </div>
             </div>
             <div className="text-[var(--highlight-gold)] font-bold text-xl md:text-2xl tracking-wide text-right w-[100px] truncate">
               {lastExpense ? `₹${lastExpense.amount.toFixed(0)}` : '₹0'}
             </div>
           </motion.div>

           <motion.div onClick={() => setIsModalOpen(true)} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-deep flex-1 p-5 md:p-6 flex items-center justify-center text-center gap-4 cursor-pointer hover:bg-[#343063] transition-colors shadow-xl group hover:border-[var(--highlight-gold)] border border-transparent">
             <div className="text-[var(--highlight-gold)] group-hover:scale-110 transition-transform bg-white/5 p-3 rounded-full">
                <Receipt size={28} strokeWidth={1.5} />
             </div>
             <h3 className="text-white font-medium text-lg tracking-wide group-hover:text-[var(--highlight-gold)] transition-colors">Add Manual Expense</h3>
           </motion.div>
        </div>

        {/* Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 w-full mt-auto">
          
          <div className="flex flex-col">
             <div className="flex justify-between items-center mb-5">
               <h3 className="text-white font-semibold flex items-center gap-2 text-lg"><Navigation size={18} className="text-[var(--text-sub)]"/> Group Members</h3>
               <Link to={`/settle/${id}`} className="text-[var(--highlight-gold)] text-sm cursor-pointer hover:text-white transition font-bold uppercase tracking-wider bg-white/5 px-3 py-1 rounded-full">Debts & History →</Link>
             </div>
             <div className="flex justify-between md:justify-start gap-4 md:gap-6 overflow-x-auto pb-4 scrollbar-hide shrink-0">
                <div className="flex flex-col items-center gap-3">
                   <div className="w-14 h-14 md:w-16 md:h-16 rounded-[1.25rem] bg-[var(--card-peach)] flex justify-center items-center cursor-pointer shadow-lg hover:-translate-y-1 transition-transform text-amber-900 border border-white/40">
                     <Search size={24} strokeWidth={2.5} />
                   </div>
                   <span className="text-[var(--text-sub)] text-xs md:text-sm font-medium">Search</span>
                </div>
                {group.members.map((m) => (
                   <div key={m.name} className="flex flex-col items-center gap-3 min-w-[56px] cursor-pointer group-hover:-translate-y-1 transition-all">
                     <div className="w-14 h-14 md:w-16 md:h-16 rounded-[1.25rem] overflow-hidden border-2 border-[var(--text-sub)] flex items-center justify-center font-bold text-xl shadow-md bg-white/80 text-[#1e1b4b]">
                        {m.name.charAt(0).toUpperCase()}
                     </div>
                     <span className="text-[var(--text-sub)] text-xs md:text-sm font-medium">{m.name.substring(0, 6)}</span>
                   </div>
                ))}
             </div>
          </div>

          <div className="flex flex-col">
             <div className="flex justify-between items-center mb-5">
               <h3 className="text-white font-semibold flex items-center gap-2 text-lg"><Clock size={18} className="text-[var(--text-sub)]"/> Recently Split</h3>
             </div>
             <div className="flex justify-between md:justify-start gap-4 md:gap-6 overflow-x-auto pb-4 scrollbar-hide shrink-0">
                {sortedExpenses.slice(0,4).map((exp, idx) => (
                   <div key={idx} className="flex flex-col items-center gap-3 min-w-[56px] cursor-pointer group">
                     <div className="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-transparent group-hover:border-[var(--highlight-gold)] transition-all flex items-center justify-center font-bold shadow-md bg-[#2e2a56] text-[var(--highlight-gold)]">
                        {exp.paidBy.charAt(0).toUpperCase()}
                     </div>
                     <span className="text-[var(--text-sub)] text-xs font-medium uppercase truncate max-w-[60px] text-center" title={exp.item}>{exp.item}</span>
                   </div>
                ))}
             </div>
          </div>

        </div>

        {/* Debt Summary (computed, no mock data) */}
        <div className="mt-10 w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-semibold text-lg">Debt Summary</h3>
            <Link to={`/settle/${id}`} className="text-[var(--highlight-gold)] text-sm font-bold uppercase tracking-wider hover:text-white transition">
              Settle →
            </Link>
          </div>
          {debtSummary.length === 0 ? (
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-[var(--text-sub)] font-medium text-center">
              No active debts. Add an expense to see the split.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {debtSummary.slice(0, 6).map((tx) => (
                <div key={`${tx.from}-${tx.to}`} className="p-4 rounded-2xl bg-[var(--deep-card-violet)] border border-white/10 flex justify-between items-center">
                  <div className="text-white font-semibold">
                    <span className="text-[var(--text-sub)]">{tx.from}</span> pays <span className="text-[var(--highlight-gold)]">{tx.to}</span>
                  </div>
                  <div className="text-[var(--highlight-gold)] font-extrabold">₹ {Math.ceil(tx.amount)}</div>
                </div>
              ))}
              {debtSummary.length > 6 && (
                <div className="text-center text-[var(--text-sub)] text-sm">+ {debtSummary.length - 6} more…</div>
              )}
            </div>
          )}
        </div>

      </main>

      {/* Add Expense Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="fixed inset-0 bg-[#020617]/80 backdrop-blur-md z-40" />
            <motion.div 
              initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 lg:bottom-auto lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 w-full lg:w-[500px] bg-[var(--container-violet)] rounded-t-3xl lg:rounded-[2rem] border-t lg:border border-white/10 p-6 md:p-8 z-50 shadow-[0_0_50px_rgba(0,0,0,0.5)] max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[var(--highlight-gold)] tracking-wide">Add Expense</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-[var(--text-sub)] hover:text-white p-2 bg-white/5 rounded-full transition-colors"><X size={20}/></button>
              </div>

              <form onSubmit={handleAddExpense} className="space-y-5">
                <div>
                  <label className="text-xs text-[var(--text-sub)] block mb-1 uppercase tracking-widest font-bold">Description</label>
                  <input type="text" value={expenseItem} onChange={e => setExpenseItem(e.target.value)} placeholder="e.g. Dinner" className="w-full bg-[var(--deep-card-violet)] border border-white/10 rounded-xl p-4 outline-none focus:border-[var(--highlight-gold)] transition-colors text-white placeholder-white/30" />
                </div>
                <div>
                   <label className="text-xs text-[var(--text-sub)] block mb-1 uppercase tracking-widest font-bold">Amount</label>
                   <div className="relative">
                     <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-sub)] font-bold text-lg">₹</span>
                     <input type="number" value={expenseAmount} onChange={e=>setExpenseAmount(e.target.value)} placeholder="0.00" className="w-full bg-[var(--deep-card-violet)] border border-white/10 rounded-xl py-4 pl-10 pr-4 outline-none focus:border-[var(--highlight-gold)] transition-colors text-white font-bold text-xl" />
                   </div>
                </div>
                <div>
                   <label className="text-xs text-[var(--text-sub)] block mb-1 uppercase tracking-widest font-bold">Paid By</label>
                   <select value={expensePayer} onChange={e=>setExpensePayer(e.target.value)} className="w-full bg-[var(--deep-card-violet)] border border-white/10 rounded-xl p-4 outline-none focus:border-[var(--highlight-gold)] transition-colors text-white appearance-none">
                     {group.members.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
                   </select>
                </div>
                <div>
                   <label className="text-xs text-[var(--text-sub)] block mb-2 uppercase tracking-widest font-bold">Split Among</label>
                   <div className="flex flex-wrap gap-2">
                     {group.members.map(m => (
                       <button 
                         type="button" key={m.name} onClick={() => {
                           if (expenseSpliters.includes(m.name)) setExpenseSpliters(s => s.filter(n => n !== m.name));
                           else setExpenseSpliters(s => [...s, m.name]);
                         }}
                         className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${expenseSpliters.includes(m.name) ? 'bg-[var(--highlight-gold)] border-[var(--highlight-gold)] text-amber-950 shadow-md transform scale-105' : 'bg-[var(--deep-card-violet)] border-white/10 text-[var(--text-sub)] hover:text-white'}`}
                       >
                         {m.name}
                       </button>
                     ))}
                   </div>
                </div>
                <div className="pt-4">
                  <button type="submit" disabled={isSubmitting} className="w-full py-5 rounded-xl bg-[var(--card-peach)] text-[#1e1b4b] font-bold text-lg tracking-wide hover:opacity-90 hover:-translate-y-1 transition-all shadow-[0_10px_20px_rgba(0,0,0,0.2)] flex justify-center items-center">
                    {isSubmitting ? 'Sumitting...' : 'Add Expense 🚀'}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};

export default GroupDashboard;
