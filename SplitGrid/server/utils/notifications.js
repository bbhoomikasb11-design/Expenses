exports.notifyGroupOfExpense = (group, expense) => {
  console.log(`\n======================================`);
  console.log(`🔔 SMS NOTIFICATION DISPATCHER ACTIVE`);
  console.log(`======================================`);
  
  let sentCount = 0;
  
  group.members.forEach(member => {
    if (member.mobileNumber && member.name !== expense.paidBy) {
      console.log(`\n➡️ Sending SMS to ${member.name} (${member.mobileNumber}):`);
      console.log(`"Hey ${member.name}, ${expense.paidBy} just added a ₹${expense.amount} expense for ${expense.item} in ${group.groupName}!"`);
      sentCount++;
    }
  });
  
  if (sentCount === 0) {
     console.log(`\nℹ️ No SMS sent. No other members had mobile numbers configured.`);
  }
  
  console.log(`\n======================================\n`);
};
