const mongoose = require('mongoose');
const Group = require('../models/Group');
const { recalculateBalances } = require('../utils/balanceEngine');
const { notifyGroupOfExpense } = require('../utils/notifications');
const crypto = require('crypto');

exports.createGroup = async (req, res) => {
  try {
    const { groupName, emoji, groupType, members } = req.body;
    const group = new Group({ groupName, emoji, groupType, members });
    // referralCode = first 6 chars of groupId (uppercase). We set it after _id exists.
    group.referralCode = String(group._id).slice(0, 6).toUpperCase();
    group.balances = recalculateBalances(group);
    await group.save();
    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.lookupGroupByReferral = async (req, res) => {
  try {
    const code = String(req.params.code || '').toUpperCase();
    if (!code || code.length < 4) return res.status(400).json({ error: 'Invalid referral code' });
    const group = await Group.findOne({ referralCode: code }).select('_id referralCode groupName');
    if (!group) return res.status(404).json({ error: 'Group not found' });
    res.json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addMember = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ error: 'Group not found' });

    const name = String(req.body?.name || '').trim();
    if (!name) return res.status(400).json({ error: 'Member name required' });
    if (group.members.some((m) => m.name.toLowerCase() === name.toLowerCase())) {
      return res.status(409).json({ error: 'Member already exists' });
    }

    const newMember = {
      name,
      avatar: req.body?.avatar,
      mobileNumber: req.body?.mobileNumber
    };
    group.members.push(newMember);
    group.balances = recalculateBalances(group);
    await group.save();
    res.status(200).json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ error: 'Group not found' });
    res.json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addExpense = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ error: 'Group not found' });

    const newExpense = {
      id: req.body.id || crypto.randomUUID(),
      item: req.body.item,
      amount: req.body.amount,
      paidBy: req.body.paidBy,
      splitAmong: req.body.splitAmong,
      category: req.body.category || 'other',
      timestamp: req.body.timestamp || new Date()
    };

    group.expenses.push(newExpense);
    group.balances = recalculateBalances(group);
    await group.save();

    // Trigger asynchronous mock SMS notification mapping
    notifyGroupOfExpense(group, newExpense);

    res.status(200).json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addSettlement = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ error: 'Group not found' });

    const newSettlement = {
      from: req.body.from,
      to: req.body.to,
      amount: req.body.amount,
      timestamp: req.body.timestamp || new Date()
    };

    group.settlements.push(newSettlement);
    group.balances = recalculateBalances(group);
    await group.save();

    res.status(200).json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.removeExpense = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ error: 'Group not found' });

    const expenseIndex = group.expenses.findIndex(e => e.id === req.params.expenseId);
    if (expenseIndex !== -1) {
      group.expenses.splice(expenseIndex, 1);
      group.balances = recalculateBalances(group);
      await group.save();
    }
    
    res.status(200).json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createDemo = async (req, res) => {
  try {
    const members = [
      { name: "Riya", avatar: "#00F5A0" },
      { name: "Arjun", avatar: "#FF3CAC" },
      { name: "Priya", avatar: "#3B82F6" },
      { name: "Dev", avatar: "#F59E0B" }
    ];
    
    const now = new Date();
    const group = new Group({
      groupName: "Goa Trip 🏝️",
      emoji: "🏝️",
      groupType: "Trip",
      members: members,
    });

    const expenses = [
      { id: crypto.randomUUID(), item: "Flight Tickets", amount: 8000, paidBy: "Riya", splitAmong: ["Riya", "Arjun", "Priya", "Dev"], category: "✈️", timestamp: new Date(now.getTime() - 86400000) },
      { id: crypto.randomUUID(), item: "Hotel Night 1", amount: 3600, paidBy: "Arjun", splitAmong: ["Riya", "Arjun", "Priya", "Dev"], category: "🏨", timestamp: new Date(now.getTime() - 43200000) },
      { id: crypto.randomUUID(), item: "Beach Shack Dinner", amount: 1400, paidBy: "Priya", splitAmong: ["Riya", "Arjun", "Priya", "Dev"], category: "🍕", timestamp: new Date(now.getTime() - 20000000) },
      { id: crypto.randomUUID(), item: "Scooter Rental", amount: 800, paidBy: "Dev", splitAmong: ["Riya", "Arjun", "Priya", "Dev"], category: "🚕", timestamp: new Date(now.getTime() - 10000000) },
      { id: crypto.randomUUID(), item: "Drinks at Tito's", amount: 1200, paidBy: "Riya", splitAmong: ["Riya", "Arjun", "Priya", "Dev"], category: "🍹", timestamp: new Date(now.getTime() - 5000000) }
    ];
    
    group.expenses = expenses;
    group.balances = recalculateBalances(group);
    
    await group.save();
    res.status(201).json({ id: group._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
