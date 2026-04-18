/**
 * Recalculates the group's balances map based on members, expenses, and settlements.
 * 
 * @param {Object} group - The group document or object
 * @returns {Map<String, Number>} - A Map of { "MemberName": BalanceAmount }
 */
const recalculateBalances = (group) => {
  const balances = new Map();

  // 1. Reset all balances to 0 for all members
  if (Array.isArray(group.members)) {
    group.members.forEach(member => {
      balances.set(member.name, 0);
    });
  }

  // 2. Process all expenses
  if (Array.isArray(group.expenses)) {
    group.expenses.forEach(expense => {
      // Handle the person who paid (they get the full amount added to their balance, representing what they are owed)
      const currentPayerBalance = balances.get(expense.paidBy) || 0;
      balances.set(expense.paidBy, currentPayerBalance + expense.amount);

      // Handle the people splitting the cost (they each subtract an equal split from their balance)
      if (Array.isArray(expense.splitAmong) && expense.splitAmong.length > 0) {
        const splitAmount = expense.amount / expense.splitAmong.length;
        expense.splitAmong.forEach(member => {
          const currentBal = balances.get(member) || 0;
          balances.set(member, currentBal - splitAmount);
        });
      }
    });
  }

  // 3. Process all settlements
  if (Array.isArray(group.settlements)) {
    group.settlements.forEach(settlement => {
      // The person who sent the money ("from") has paid down their debt -> reduce their debt (meaning add to their balance, wait let's follow the prompt exactly)
      // User Prompt: "For each settlement: deducts from "from", adds to "to""
      const fromBal = balances.get(settlement.from) || 0;
      balances.set(settlement.from, fromBal - settlement.amount);

      const toBal = balances.get(settlement.to) || 0;
      balances.set(settlement.to, toBal + settlement.amount);
    });
  }

  return balances;
};

module.exports = { recalculateBalances };
