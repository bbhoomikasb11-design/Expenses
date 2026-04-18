import React from 'react';
import { useSplitGrid } from '../context/SplitGridContext';
import { GlassCard } from './GlassCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Receipt, ArrowRight } from 'lucide-react';

export const ExpenseList = () => {
  const { expenses } = useSplitGrid();

  return (
    <GlassCard className="h-[500px] flex flex-col">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-white">
        <Receipt className="text-[--color-accent]" /> Recent Expenses
      </h2>
      
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
        {expenses.length === 0 ? (
          <div className="text-gray-500 text-center mt-10">No expenses yet. Add one!</div>
        ) : (
          <AnimatePresence>
            {expenses.map((expense) => (
              <motion.div
                key={expense._id || Math.random().toString()}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-black/20 p-4 rounded-xl border border-white/5 flex justify-between items-center"
              >
                <div>
                  <h3 className="font-bold text-lg">{expense.description}</h3>
                  <p className="text-sm text-gray-400 flex items-center gap-1">
                    {expense.paidBy} <ArrowRight size={12}/> Group
                  </p>
                </div>
                <div className="text-xl font-bold text-[--color-debt]">
                  ${expense.amount.toFixed(2)}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </GlassCard>
  );
};
