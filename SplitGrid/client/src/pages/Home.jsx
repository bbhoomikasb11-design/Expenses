import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Users, ReceiptText, Zap, Activity, Calculator, MousePointerClick, BarChart3 } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  return (
    <div className="relative min-h-screen text-white overflow-hidden bg-[#020617]">
      {/* Large soft radial gradient behind content */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[1200px] aspect-square bg-radial-indigo rounded-full pointer-events-none z-0"></div>

      <main className="relative z-10 flex flex-col items-center max-w-6xl mx-auto px-6 pt-32 pb-16">

        <section className="w-full flex-col md:flex-row flex items-center justify-between mb-40">
          <motion.div
            className="md:w-1/2 flex flex-col items-start text-left"
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
          >
            <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] mb-6 tracking-tight text-white">
              <span className="bg-gradient-to-b from-white to-[#94a3b8] bg-clip-text text-transparent">Split smart.</span><br />
              <span className="bg-gradient-to-b from-white to-[#94a3b8] bg-clip-text text-transparent">Not later — </span>
              <span className="text-[#a78bfa] glow-text">now.</span>
            </h1>
            <p className="text-xl text-[#94a3b8] mb-10 max-w-md font-medium">
              Real-time expense sharing for groups that move fast.
            </p>
            <div className="flex justify-start w-full sm:w-auto mt-4">
              <button onClick={() => navigate('/create')} className="cta-glow-indigo w-full sm:w-auto px-10 py-5 rounded-full font-bold bg-white text-[#020617] hover:scale-[1.02] active:scale-95 transition-all duration-300 text-lg flex items-center justify-center gap-3">
                Create Your Group →
              </button>
            </div>
          </motion.div>

          <motion.div
            className="hidden md:flex md:w-1/2 justify-end"
            initial={{ opacity: 0, scale: 0.8, rotate: -2 }} animate={{ opacity: 1, scale: 1, rotate: 2 }} transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          >
            <div className="floating-glass-card p-6 w-[350px] relative shadow-2xl">
              <div className="flex items-center justify-between mb-5 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-[#a78bfa]/10 rounded-2xl border border-[#a78bfa]/20 text-2xl">
                    🍕
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-white">Pizza</h3>
                    <p className="text-sm text-[#94a3b8]">paid by Riya</p>
                  </div>
                </div>
                <div className="font-bold text-xl text-white">₹500</div>
              </div>
              <div className="border-t border-white/5 pt-4 flex justify-between items-center text-xs relative z-10">
                <span className="flex items-center gap-2 group">
                  <div className="w-2 h-2 rounded-full bg-[#a78bfa] animate-pulse shadow-[0_0_8px_rgba(167,139,250,0.8)]" />
                  <span className="text-[#a78bfa] font-medium">just now</span>
                </span>
                <span className="text-[#94a3b8] font-medium">+ 3 splitting</span>
              </div>
            </div>
          </motion.div>
        </section>

        <motion.section
          className="w-full mb-32"
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
        >
          <div className="flex flex-col md:flex-row gap-8 justify-center w-full">
            {[
              { icon: <Users size={40} className="text-[#a78bfa] icon-glow-violet" />, title: "Create your group", desc: "No sign ups needed." },
              { icon: <ReceiptText size={40} className="text-[#a78bfa] icon-glow-violet" />, title: "Add expenses", desc: "Keep track on the go." },
              { icon: <Zap size={40} className="text-[#a78bfa] icon-glow-violet" />, title: "See it instantly", desc: "Real-time synchronization." }
            ].map((step, idx) => (
              <motion.div key={idx} variants={fadeUp} className="floating-glass-card p-10 flex-1 flex flex-col items-start hover:-translate-y-2 transition-transform duration-300">
                <div className="mb-8">{step.icon}</div>
                <h3 className="font-semibold text-xl mb-2 text-white">{step.title}</h3>
                <p className="text-[#94a3b8] text-sm font-medium">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          className="w-full max-w-5xl mx-auto mb-16 mt-20"
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
        >
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 text-[#94a3b8]">
            {[
              { text: "Real-time sync", icon: <Activity size={20} /> },
              { text: "Auto-calculates", icon: <Calculator size={20} /> },
              { text: "One-tap settles", icon: <MousePointerClick size={20} /> },
              { text: "Visual breakdowns", icon: <BarChart3 size={20} /> }
            ].map((feature, idx) => (
              <motion.div key={idx} variants={fadeUp} className="flex items-center gap-3 font-medium text-base hover:text-white transition-colors cursor-default">
                <span className="text-[#a78bfa] icon-glow-violet">{feature.icon}</span>
                <span>{feature.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </main>

      <footer className="w-full py-10 text-center relative z-20">
        <p className="text-[#94a3b8] font-medium tracking-wide">
          SplitGrid
        </p>
      </footer>
    </div>
  );
};

export default Home;
