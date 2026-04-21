require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const groupsRouter = require('./routes/groups');
const socketSetup = require('./socket');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Setup sockets & change streams
socketSetup(io);

// Endpoints mapping
app.use('/api/groups', groupsRouter);
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.get('/', (req, res) => res.send('SplitGrid Backend is running successfully! Access the frontend at http://localhost:5175'));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('Missing MONGO_URI in server/.env');
  process.exit(1);
}

mongoose
  .connect(MONGO_URI, { dbName: 'SplitGrid' })
  .then(() => console.log('✅ Connected to MongoDB (db: SplitGrid)'))
  .catch((err) => {
    console.error('MongoDB connection error:', err?.message || err);
    if (err?.message?.toLowerCase?.().includes('bad auth')) {
      console.error('Auth failed. Verify MongoDB Atlas username/password in MONGO_URI.');
    }
    if (err?.message?.toLowerCase?.().includes('ip') || err?.message?.toLowerCase?.().includes('whitelist')) {
      console.error('Network blocked. Add your IP in MongoDB Atlas Network Access allowlist.');
    }
  });

server.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
