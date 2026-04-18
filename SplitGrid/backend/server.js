require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const Expense = require('./models/Expense');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5001;
// Replace with the MongoDB Replica Set URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/splitgrid?replicaSet=rs0';

// Socket.io Connection
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  socket.on('join_group', (groupId) => {
    socket.join(groupId);
    console.log(`User ${socket.id} joined group: ${groupId}`);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

async function startServer() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB Replica Set');

    // Setup Change Streams
    const expenseChangeStream = Expense.watch();
    
    expenseChangeStream.on('change', (change) => {
      console.log('Change detected in Expense collection:', change.operationType);
      
      if (change.operationType === 'insert') {
        const newExpense = change.fullDocument;
        // Emit to everyone in the group
        io.to(newExpense.groupId).emit('expense_added', newExpense);
      }
    });

    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
  }
}

// Routes
app.post('/api/expenses', async (req, res) => {
  try {
    const { groupId, description, amount, paidBy, splitAmong } = req.body;
    const newExpense = new Expense({ groupId, description, amount, paidBy, splitAmong });
    await newExpense.save();
    res.status(201).json(newExpense);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add expense' });
  }
});

app.get('/api/expenses/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;
    const expenses = await Expense.find({ groupId }).sort({ createdAt: -1 });
    res.json(expenses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

startServer();
