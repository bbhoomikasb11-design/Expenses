# SplitGrid 💸

**SplitGrid** is a premium, real-time expense-sharing and debt-settlement platform designed for groups that move fast. It leverages **MongoDB Change Streams** and **Socket.io** to synchronize debts across users instantly—without any browser refreshes.

Designed with an ultra-modern `"Floating Glass"` aesthetic, SplitGrid features an immersive UI loaded with backdrop blurs, soft lighting, and sharp typography, inspired by top-tier fintech applications.

---

## 🎯 The Concept

Managing group expenses often leads to confusion and tedious manual math. SplitGrid solves this by:
1. **Instant Group Creation**: No registration required. Create a group, invite friends via a unique ID, and start tracking immediately.
2. **Real-Time Debt Tracking**: See balances update live as expenses are added or settled.
3. **Smart Settlements**: Record payments between members to clear debts instantly.
4. **Data Persistence**: Powered by MongoDB for reliable storage and real-time event streaming.

---

## 🛠 Tech Stack

### Frontend Architecture
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/) for ultra-fast development.
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) featuring deep obsidian themes and glassmorphic effects.
- **Interactions**: [Framer Motion](https://www.framer.com/motion/) for smooth layout transitions and micro-animations.
- **Real-time**: `socket.io-client` for persistent bidirectional communication.

### Backend Architecture
- **Runtime**: Node.js & Express.js.
- **Database**: MongoDB & Mongoose.
- **Live Sync**: `Socket.io` paired with **MongoDB Change Streams**. This ensures that any data modification in the database is automatically broadcasted to all active participants in a group room.

---

## 🚀 Quick Setup & Installation

### Prerequisites
- **MongoDB Replica Set**: Required for Change Streams. Use **MongoDB Atlas** (free tier) for the easiest setup.
- **Node.js**: Version 18 or higher.

### 1. Environment Configuration
Create a `.env` file in the `/server` directory:
```bash
MONGO_URI=your_mongodb_connection_string
PORT=5000
```

### 2. Install Dependencies
```bash
# Install server dependencies
cd server
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Run the Application
Open two terminal windows:

**Terminal 1 (Backend Server)**
```bash
cd server
npm start # or node server.js
```

**Terminal 2 (Frontend Client)**
```bash
cd frontend
npm run dev
```
Access the application at `http://localhost:5173`.

---

## 💫 Core Features

* **Floating Glass UI**: A premium, borderless design system with high-end visual polish.
* **Instant Propagation**: Built on events, not polling. Updates arrive in milliseconds.
* **Member Invites**: Join groups via unique IDs and shareable invite screens.
* **Dynamic Balances**: Rolling balance calculation engine that accounts for all group transactions and settlements.
* **Detailed Activity**: Track who paid for what and when with a clear historical log.

---

For a deeper dive into the technical implementation, see [CONCEPTS.md](CONCEPTS.md).
