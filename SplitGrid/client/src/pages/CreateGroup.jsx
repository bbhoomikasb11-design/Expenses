import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Plus, X, ArrowRight, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { createGroup } from '../api';

const EMOJIS = ['🏝️', '🏠', '🎉', '🚗', '🍻', '🎮', '✈️', '🏕️', '💼', '🥂'];
const TYPES = ['Trip', 'Flat', 'Party', 'Other'];

const CreateGroup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [groupName, setGroupName] = useState('');
  const [emoji, setEmoji] = useState('🏝️');
  const [groupType, setGroupType] = useState('Trip');
  
  const [members, setMembers] = useState([]);
  const [newMember, setNewMember] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newMember.trim() || members.some(m => m.name === newMember.trim())) {
      toast.error('Invalid or duplicate name');
      return;
    }
    const colors = ['#fbd38d', '#fbbf24', '#a5b4fc', '#e2e8f0', '#3b82f6'];
    setMembers([...members, { name: newMember.trim(), mobileNumber: mobileNumber.trim(), avatar: colors[members.length % colors.length] }]);
    setNewMember('');
    setMobileNumber('');
  };

  const nextStep = () => {
    if (step === 1 && !groupName.trim()) return toast.error('Group name required!');
    if (step === 2 && members.length < 2) return toast.error('You need at least 2 members!');
    setStep(s => s + 1);
  };

  const handleLaunch = async () => {
    setIsSubmitting(true);
    try {
      const res = await createGroup({ groupName, emoji, groupType, members });
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      setTimeout(() => navigate(`/invite/${res.data._id}`), 1000);
    } catch (error) {
      toast.error('Launch failed. Try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-12 relative overflow-hidden bg-[var(--bg-cream)]">
      <main className="app-container w-full max-w-xl min-h-[75vh] p-6 md:p-10 flex flex-col relative z-10 shadow-2xl justify-center items-center">
        
        {/* Progress Tracker */}
        <div className="flex gap-3 mb-10 w-full justify-center">
          {[1, 2, 3].map(i => (
            <div key={i} className={`w-1/3 h-2 rounded-full transition-colors duration-500 max-w-[80px] ${step >= i ? 'bg-[var(--highlight-gold)] shadow-[0_0_10px_var(--highlight-gold)]' : 'bg-white/10'}`} />
          ))}
        </div>

        <div className="w-full flex-1 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="w-full">
                <h2 className="font-bold text-3xl mb-8 text-white text-center tracking-wide">Naming your split</h2>
                <input type="text" value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="e.g. Goa Trip 🏝️" className="w-full bg-[var(--deep-card-violet)] border border-white/10 rounded-2xl p-5 text-xl outline-none focus:border-[var(--highlight-gold)] transition-colors mb-8 text-white placeholder-white/30 font-semibold shadow-inner" autoFocus />
                
                <div className="mb-8 p-6 bg-white/5 rounded-2xl border border-white/5 shadow-md">
                  <p className="text-sm text-[var(--text-sub)] mb-4 font-bold uppercase tracking-widest text-center">Select Aesthetic Icon</p>
                  <div className="flex gap-3 flex-wrap justify-center">
                    {EMOJIS.map(e => (
                      <button key={e} onClick={() => setEmoji(e)} className={`text-4xl p-3 rounded-2xl transition hover:scale-105 ${emoji === e ? 'bg-[var(--highlight-gold)] shadow-[0_0_15px_var(--highlight-gold)] border border-white/50' : 'bg-[var(--deep-card-violet)] border border-transparent shadow-sm'}`}>{e}</button>
                    ))}
                  </div>
                </div>

                <button onClick={nextStep} className="w-full bg-[var(--card-peach)] text-[#1e1b4b] font-bold px-6 py-5 rounded-full flex items-center justify-center gap-3 hover:-translate-y-1 transition-transform shadow-[0_10px_30px_rgba(251,211,141,0.3)] text-xl tracking-wide">
                  Continue Form <ArrowRight size={22}/>
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="w-full">
                <h2 className="font-bold text-3xl mb-8 text-white text-center tracking-wide">Who's involved?</h2>
                
                <form onSubmit={handleAddMember} className="flex flex-col md:flex-row gap-3 mb-8 w-full p-4 bg-white/5 rounded-2xl border border-white/5 shadow-md">
                  <input type="text" value={newMember} onChange={e => setNewMember(e.target.value)} placeholder="Friend's Name" className="flex-1 bg-[var(--deep-card-violet)] flex min-w-[30%] border border-transparent rounded-xl p-4 outline-none focus:border-[var(--highlight-gold)] transition-colors text-white font-semibold placeholder-white/30" autoFocus />
                  <input type="text" value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} placeholder="Mobile No. (Opt)" className="flex-1 bg-[var(--deep-card-violet)] flex min-w-[30%] border border-transparent rounded-xl p-4 outline-none focus:border-[var(--highlight-gold)] transition-colors text-white font-semibold placeholder-white/30" />
                  <button type="submit" className="bg-[var(--highlight-gold)] text-amber-950 font-bold p-4 rounded-xl hover:scale-105 transition-transform flex items-center justify-center shadow-lg"><Plus strokeWidth={3} /></button>
                </form>

                <div className="flex flex-wrap gap-4 min-h-[160px] content-start justify-center">
                  <AnimatePresence>
                    {members.map(m => (
                      <motion.div key={m.name} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="card-deep border border-[var(--highlight-gold)]/30 rounded-full pl-3 pr-5 py-2 flex items-center gap-3 shadow-md bg-[var(--deep-card-violet)]">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-[#1e1b4b] text-lg bg-white" style={{backgroundColor: m.avatar}}>
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-white tracking-wide">{m.name}</span>
                        <button onClick={() => setMembers(members.filter(x => x.name !== m.name))} className="text-[var(--text-sub)] hover:text-red-400 ml-2 transition-colors"><X size={18} strokeWidth={2.5} /></button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <div className="mt-8 flex justify-between gap-4">
                  <button onClick={() => setStep(1)} className="text-[var(--text-sub)] font-bold px-6 py-5 hover:text-white transition-colors">Back</button>
                  <button onClick={nextStep} className="flex-1 bg-[var(--card-peach)] text-[#1e1b4b] font-bold px-6 py-5 rounded-full flex items-center justify-center gap-3 hover:-translate-y-1 transition-transform shadow-[0_10px_30px_rgba(251,211,141,0.3)] text-xl tracking-wide">
                    Finalize <ArrowRight size={22}/>
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center w-full">
                <div className="text-7xl mb-8 animate-bounce">{emoji}</div>
                <h2 className="font-bold text-4xl mb-4 text-[var(--highlight-gold)]">{groupName}</h2>
                <div className="inline-block bg-[var(--deep-card-violet)] px-6 py-2 rounded-full border border-white/10 mb-10 shadow-inner">
                  <p className="text-[var(--text-sub)] font-bold uppercase tracking-widest text-sm">{groupType} • {members.length} Members</p>
                </div>
                
                <div className="flex justify-center -space-x-4 mb-14 drop-shadow-xl">
                  {members.map((m, i) => (
                    <div key={m.name} className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-[#1e1b4b] border-[3px] border-[var(--container-violet)] z-10 text-xl shadow-lg bg-white" style={{ backgroundColor: m.avatar, zIndex: 100 - i }}>{m.name.charAt(0).toUpperCase()}</div>
                  ))}
                </div>

                <button 
                  onClick={handleLaunch} 
                  className="w-full bg-[var(--highlight-gold)] text-amber-950 font-bold p-6 rounded-full text-xl shadow-[0_0_30px_rgba(251,191,36,0.3)] hover:shadow-[0_0_40px_rgba(251,191,36,0.6)] transition-all transform hover:-translate-y-1 relative overflow-hidden group"
                  disabled={isSubmitting}
                >
                  <span className="relative z-10">{isSubmitting ? 'Initializing...' : 'Launch App Database 🚀'}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite]"></div>
                </button>
                <button disabled={isSubmitting} onClick={() => setStep(2)} className="mt-8 text-[var(--text-sub)] font-bold hover:text-white transition-colors">Edit Members</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </main>
    </div>
  );
};

export default CreateGroup;
