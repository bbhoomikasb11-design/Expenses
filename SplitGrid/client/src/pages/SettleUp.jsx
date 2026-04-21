import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, MoreVertical, CheckCircle2 } from 'lucide-react';
import { useGroup } from '../context/GroupContext';
import toast from 'react-hot-toast';

const simplifyDebts = (balancesMap) => {
  if (!balancesMap) return [];
  const debtors = [], creditors = [];
  for (const [name, balance] of Object.entries(balancesMap)) {
    if (balance < -0.01) debtors.push({ name, amount: -balance });
    else if (balance > 0.01) creditors.push({ name, amount: balance });
  }
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);
  let i = 0, j = 0;
  const transactions = [];
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i], creditor = creditors[j];
    const amount = Math.min(debtor.amount, creditor.amount);
    transactions.push({ from: debtor.name, to: creditor.name, amount });
    debtor.amount -= amount;
    creditor.amount -= amount;
    if (debtor.amount < 0.01) i++;
    if (creditor.amount < 0.01) j++;
  }
  return transactions;
};

const SwipeSettle = ({ tx, settled, onSettle }) => {
  const [value, setValue] = useState(0);

  const handleChange = (e) => {
    if (settled) return;
    const v = parseInt(e.target.value);
    setValue(v);
    if (v >= 95) {
      setValue(100);
      onSettle(`${tx.from}-${tx.to}`);
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full bg-[var(--deep-card-violet)] p-4 rounded-3xl shadow-sm border border-white/5 relative overflow-hidden group">
      
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full border-2 border-white/10 flex justify-center items-center font-bold text-lg bg-[#3b82f6] text-white">
             {tx.from.charAt(0).toUpperCase()}
          </div>
          <span className="font-semibold text-lg text-white tracking-wide truncate max-w-[90px]">{tx.from}</span>
          <span className="text-[var(--text-sub)] font-medium text-sm">owes {tx.to}</span>
          {settled && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-green-400">
              <CheckCircle2 size={20} strokeWidth={2.5} />
            </motion.div>
          )}
        </div>
        <div className="text-[var(--highlight-gold)] font-bold text-lg whitespace-nowrap">
          ₹ {Math.ceil(tx.amount)}
        </div>
      </div>

      <div className="relative w-full h-14 bg-[#1e1b4b] rounded-full overflow-hidden flex items-center border border-white/5 shadow-inner mt-2">
        {/* Progress Fill */}
        <div 
          className={`absolute top-0 left-0 h-full transition-colors duration-300 ${settled ? 'bg-green-500' : 'bg-gradient-to-r from-[#3b82f6] to-[var(--container-violet)]'}`} 
          style={{ width: `${value}%` }} 
        />
        
        {/* The Text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 mix-blend-difference">
           <span className="font-bold text-white/90 tracking-[0.2em] text-xs shadow-sm uppercase">
             {settled ? 'Settled' : 'Slide to Settle'}
           </span>
        </div>

        {/* Input Overlay */}
        <input 
          type="range" min="0" max="100" value={value} onChange={handleChange} 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30" 
          disabled={settled}
        />
        
        {/* Thumb Visualizer */}
        <div 
           className={`absolute w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg pointer-events-none z-20 top-1 transition-transform duration-75`}
           style={{ left: `calc(${Math.max(2, Math.min(value, 98))}% - ${value > 50 ? 44 : 4}px)` }}
        >
          <span className="text-[var(--deep-card-violet)] font-black text-xl">›</span>
        </div>
      </div>
    </div>
  )
};

const SettleUp = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { group, loading, addSettlement } = useGroup();
  const [settledUsers, setSettledUsers] = useState({});
  const [isSettling, setIsSettling] = useState(false);

  useEffect(() => {
    // Clear local slider states when balances change (socket update / refresh)
    setSettledUsers({});
  }, [group?.balances]);

  if (loading || !group) {
    return <div className="min-h-screen app-container flex items-center justify-center text-[var(--highlight-gold)] tracking-widest font-bold">Fetching Ledgers...</div>;
  }

  const transactions = simplifyDebts(group.balances);
  const totalBill = group.expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const handleSettle = (txId) => {
    setSettledUsers(prev => ({ ...prev, [txId]: true }));
  };

  const submitSettlement = async () => {
    if (Object.keys(settledUsers).length === 0) return toast('Slide a bar to settle first!', { icon: '🤔' });
    setIsSettling(true);
    
    try {
      const txsToSettle = transactions.filter((tx) => settledUsers[`${tx.from}-${tx.to}`]);
      for (const tx of txsToSettle) {
        await addSettlement({ from: tx.from, to: tx.to, amount: Math.ceil(tx.amount) });
      }
      toast.success('Settlements saved. Balances updated.', {
        style: { background: '#13131A', color: '#00F5A0', border: '1px solid #00F5A0' }
      });
      navigate(`/group/${id}`);
    } catch (e) {
      toast.error('Failed to settle. Please try again.');
    } finally {
      setIsSettling(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-12 bg-[var(--bg-cream)]">
      <main className="app-container w-full max-w-md mx-auto min-h-[85vh] flex flex-col relative pb-8 shadow-2xl">
        
        {/* Top Nav */}
        <nav className="flex justify-between items-center p-6 w-full text-white">
          <button onClick={() => navigate(-1)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
             <ChevronLeft size={24} className="text-[var(--highlight-gold)]" />
          </button>
          <h2 className="font-bold text-xl tracking-wide">Split Now</h2>
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <MoreVertical size={24} className="text-[var(--highlight-gold)]" />
          </button>
        </nav>

        {/* Padding Wrapper for Content */}
        <div className="px-6 flex flex-col gap-8 flex-1">
          
          {/* Perforated Receipt Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
            className="w-full relative rounded-3xl bg-[var(--card-peach)] shadow-2xl py-8 px-6 text-center mt-2 z-10"
          >
            {/* Top Cutouts */}
            <div className="absolute top-0 left-0 w-full flex justify-between px-2 -translate-y-1/2">
               {Array.from({length: 12}).map((_, i) => (
                 <div key={`t-${i}`} className="w-3 h-3 rounded-full bg-[var(--container-violet)]"></div>
               ))}
            </div>
            
            <p className="text-amber-900/50 font-bold uppercase tracking-[0.3em] text-xs mb-3">Receipt</p>
            <h1 className="text-3xl font-extrabold text-[#78350f] mb-1">{group.groupName}</h1>
            <p className="font-semibold text-amber-900/80 mb-6">Total Bill Generated</p>
            
            <div className="text-5xl font-extrabold text-[#1e1b4b] tracking-tighter mb-8">
              ₹ {totalBill.toFixed(2)}
            </div>

            <div className="flex flex-col items-center">
               <p className="text-amber-900/60 font-semibold text-xs uppercase tracking-widest mb-3">Active Members</p>
               <div className="flex -space-x-3 justify-center mb-2">
                 {group.members.slice(0, 5).map(u => (
                   <div key={u.name} className="w-12 h-12 rounded-full border-2 border-[var(--card-peach)] shadow-md bg-white flex justify-center items-center text-sm font-bold text-[#1e1b4b]" title={u.name}>
                     {u.name.charAt(0)}
                   </div>
                 ))}
                 {group.members.length > 5 && <div className="w-12 h-12 rounded-full border-2 border-[var(--card-peach)] shadow-md bg-white flex justify-center items-center text-xs font-bold text-[#1e1b4b]">+{group.members.length - 5}</div>}
               </div>
            </div>

            {/* Bottom Cutouts */}
            <div className="absolute bottom-0 left-0 w-full flex justify-between px-2 translate-y-1/2">
               {Array.from({length: 12}).map((_, i) => (
                 <div key={`b-${i}`} className="w-3 h-3 rounded-full bg-[var(--container-violet)]"></div>
               ))}
            </div>
          </motion.div>

          {/* Sliders Container */}
          <div className="flex flex-col gap-4 mt-2">
            {transactions.length === 0 ? (
               <div className="text-center p-8 border border-white/10 rounded-2xl bg-white/5">
                  <h3 className="text-[var(--text-sub)] font-medium">All debts are perfectly settled! 🎉</h3>
               </div>
            ) : (
               transactions.map((tx, i) => {
                 const txId = `${tx.from}-${tx.to}`;
                 return (
                   <motion.div key={txId} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                     <SwipeSettle 
                       tx={tx} 
                       settled={settledUsers[txId]} 
                       onSettle={handleSettle} 
                     />
                   </motion.div>
                 )
               })
            )}
          </div>

          {/* History (settlements only) */}
          <div className="mt-6">
            <h3 className="text-white font-semibold mb-3">History</h3>
            {(group.settlements?.length || 0) === 0 ? (
              <div className="text-center p-6 border border-white/10 rounded-2xl bg-white/5 text-[var(--text-sub)] font-medium">
                No settlements yet
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {[...group.settlements]
                  .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                  .map((s, idx) => (
                    <div key={`${s.from}-${s.to}-${idx}`} className="p-4 rounded-2xl bg-[var(--deep-card-violet)] border border-white/10 flex justify-between items-center">
                      <div className="text-white font-semibold">
                        <span className="text-[var(--text-sub)]">{s.from}</span> paid <span className="text-[var(--highlight-gold)]">{s.to}</span>
                        <div className="text-xs text-[var(--text-sub)] mt-1">
                          {new Date(s.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-[var(--highlight-gold)] font-extrabold">₹ {Math.ceil(s.amount)}</div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Confirm Button */}
          {transactions.length > 0 && (
            <motion.div className="mt-auto pt-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <button disabled={isSettling} onClick={submitSettlement} className="w-full py-5 rounded-full bg-[#1e1b4b] text-[var(--highlight-gold)] font-bold text-lg flex justify-center items-center gap-3 hover:bg-[#151336] transition-colors shadow-2xl relative overflow-hidden group">
                <span className="relative z-10 tracking-wider uppercase text-sm">{isSettling ? 'Processing...' : 'Confirm Split'}</span>
                {!isSettling && (
                  <motion.span 
                    animate={{ x: [0, 8, 0] }} 
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    className="relative z-10 font-bold tracking-tighter"
                  >
                    &gt;&gt;&gt;
                  </motion.span>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
              </button>
            </motion.div>
          )}

        </div>
      </main>
    </div>
  );
};

export default SettleUp;
