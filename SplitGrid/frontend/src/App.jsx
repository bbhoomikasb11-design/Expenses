import React from 'react';
import { ExpenseForm } from './components/ExpenseForm';
import { ExpenseList } from './components/ExpenseList';
import { Users, LayoutGrid } from 'lucide-react';
import { motion } from 'framer-motion';

function App() {
  return (
    <div className="min-h-screen p-4 md:p-10 flex flex-col items-center">
      
      {/* Header */}
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-5xl mb-10 flex justify-between items-center"
      >
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[--color-accent] rounded-lg shadow-[0_0_15px_rgba(0,245,160,0.5)] flex items-center justify-center">
            <LayoutGrid className="text-black" />
          </div>
          <h1 className="text-3xl font-bold tracking-wider">SplitGrid</h1>
        </div>
        <div className="flex items-center gap-2 bg-white/5 py-2 px-4 rounded-full border border-white/10">
          <Users size={18} className="text-[--color-accent]" />
          <span className="text-sm font-medium tracking-wide">Group: demo-group</span>
        </div>
      </motion.header>

      {/* Main Grid */}
      <main className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8">
        <ExpenseForm />
        <ExpenseList />
      </main>

      {/* Background Orbs */}
      <div className="fixed top-[-100px] left-[-100px] w-96 h-96 bg-[--color-accent] rounded-full blur-[150px] opacity-10 pointer-events-none -z-10"></div>
      <div className="fixed bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-[--color-debt] rounded-full blur-[150px] opacity-10 pointer-events-none -z-10"></div>
    </div>
  );
}

export default App;
