const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Group = require('./models/Group');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('Missing MONGO_URI in .env');
  process.exit(1);
}

mongoose.set('strictQuery', true);

mongoose
  .connect(MONGO_URI, { dbName: 'SplitGrid' })
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => {
    console.error('MongoDB Connection Error:', err?.message || err);
    if (err?.message?.toLowerCase?.().includes('bad auth')) {
      console.error(
        'Auth failed. Check MongoDB Atlas username/password in MONGO_URI and ensure the user exists.'
      );
    }
    if (err?.message?.toLowerCase?.().includes('ip') || err?.message?.toLowerCase?.().includes('whitelist')) {
      console.error('Network blocked. In MongoDB Atlas, add your IP to Network Access allowlist.');
    }
  });

// API Endpoints

// POST /create-group
app.post('/create-group', async (req, res) => {
  try {
    const { groupName, members, amount } = req.body;
    if (!groupName || !Array.isArray(members) || members.length === 0 || typeof amount !== 'number') {
      return res.status(400).json({
        message: 'Invalid payload. Expected { groupName: string, members: string[], amount: number }'
      });
    }
    const newGroup = new Group({
      groupName,
      members,
      amount
    });
    await newGroup.save();
    res.status(201).json(newGroup);
  } catch (error) {
    res.status(500).json({ message: 'Error creating group', error: error.message });
  }
});

// GET /groups
app.get('/groups', async (req, res) => {
  try {
    const groups = await Group.find().sort({ createdAt: -1 });
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching groups', error: error.message });
  }
});

function startServer(preferredPort) {
  const server = app.listen(preferredPort, () => {
    console.log(`Server running on port ${preferredPort}`);
  });

  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
      const nextPort = Number(preferredPort) + 1;
      console.warn(`Port ${preferredPort} is in use. Trying ${nextPort}...`);
      setTimeout(() => startServer(nextPort), 250);
      return;
    }
    console.error('Server error:', err);
    process.exit(1);
  });
}

const PORT = Number(process.env.PORT) || 5000;
startServer(PORT);

process.on('SIGINT', async () => {
  try {
    await mongoose.disconnect();
  } finally {
    process.exit(0);
  }
});
