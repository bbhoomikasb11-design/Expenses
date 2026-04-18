const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  avatar: { type: String }, // e.g. initials-based color hex
  mobileNumber: { type: String }
}, { _id: false });

const expenseSchema = new mongoose.Schema({
  id: { type: String, required: true },
  item: { type: String, required: true },
  amount: { type: Number, required: true },
  paidBy: { type: String, required: true },
  splitAmong: [{ type: String }],
  category: { 
    type: String, 
    default: 'other' 
  },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const settlementSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  amount: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const groupSchema = new mongoose.Schema({
  groupName: { type: String, required: true },
  emoji: { type: String, default: '🏠' },
  groupType: { 
    type: String, 
    default: 'other'
  },
  members: [memberSchema],
  expenses: [expenseSchema],
  balances: { 
    type: Map, 
    of: Number,
    default: {} 
  },
  settlements: [settlementSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Group', groupSchema);
