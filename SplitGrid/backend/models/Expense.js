const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  groupId: {
    type: String, // String for simplicity, or ObjectId
    required: true,
    index: true
  },
  description: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  paidBy: {
    type: String,
    required: true
  },
  splitAmong: [{
    user: String,
    amount: Number
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Expense', expenseSchema);
