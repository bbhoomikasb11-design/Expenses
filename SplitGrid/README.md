# SplitGrid

**SplitGrid** is a premium, real-time expense-sharing and debt-settlement platform built for groups that move fast. It goes beyond standard expense trackers by utilizing **MongoDB Change Streams** and **Socket.io** to synchronize debts across users instantly—without any browser refreshes.

Designed with an ultra-modern `"Floating Glass"` aesthetic inspired by Apple and Linear.app, SplitGrid strips away rigid boxes and cluttered lists in favor of an immersive, spacial UI loaded with backdrop blurs, soft lighting, and sharp typography.

---

## 🎯 The Concept

Managing group expenses (like trips, dinners, or roommates) often devolves into chaotic spreadsheets and constant "who owes who" confusion. SplitGrid solves this by:
1. **Frictionless Onboarding**: No sign-ups required. Instantly create a group space and share the URL.
2. **Intelligent Debt Parsing**: When an expense is dumped into the system, SplitGrid's internal graph algorithm minimizes group debts. It simplifies a complex web of "A owes B, B owes C" into the fewest direct transactions possible (e.g., A owes C).
3. **True Real-time**: When your friend adds an expense from their phone, it instantly materializes on your screen, complete with updated debt charts and settlement graphs.

---

## 🛠 Tech Stack

### Frontend Architecture (Client)
- **Framework**: React 19 + Vite for rapid HMR and lightweight bundling.
- **Styling**: Tailwind CSS v4, utilizing deep obsidian blues, soft radial gradients, and heavy glassmorphic blurs (`backdrop-blur`).
- **Icons & Typography**: `lucide-react` for minimalist vectors and `Inter` for highly legible, premium typography.
- **Animations**: `framer-motion` for buttery smooth ingress animations and micro-interactions.
- **State & Routing**: React Router DOM (v7) and React Context API for localized group caching.
- **Visuals**: `canvas-confetti` (for celebrations on settlement) and `recharts` for 60-FPS financial breakdown graphs.

### Backend Architecture (Server)
- **Runtime**: Node.js & Express.js.
- **Database**: MongoDB & Mongoose.
- **Real-Time Engine**: `Socket.io` working in tandem with **MongoDB Change Streams**. (Whenever a database document is updated, the change stream triggers an immediate push event over web sockets to broadcast the payload to all connected clients natively).

---

## 🚀 Quick Setup & Installation

> **CRITICAL DATABASE REQUIREMENT**
> You **must** be connected to a MongoDB instance configured as a **Replica Set**. SplitGrid's real-time features rely on MongoDB Change Streams, which do not function on standard standalone local installations out of the box. 
> 
> **Solution**: The easiest and most reliable method is to grab a free tier cluster string from **MongoDB Atlas** (which provisions replica sets by default).

### 1. Database Configuration
1. Obtain your MongoDB Atlas connection string: `mongodb+srv://<username>:<password>@cluster...`
2. Create or edit the environment file at `/server/.env`:
```bash
MONGO_URI=your_atlas_replica_set_connection_string
PORT=5000
```

### 2. Install Dependencies
Run the installation commands for both the client and the server:
```bash
# Backend Server
cd server
npm install

# Frontend Client
cd ../client
npm install
```

### 3. Boot Application Environment
SplitGrid requires both the client and server to be running simultaneously to stream sockets properly.

**Terminal 1 (Backend Server)**
```bash
cd server
node server.js
# Runs the API & Socket gateway on port 5000
```

**Terminal 2 (Frontend Client)**
```bash
cd client
npm run dev
# Vite serves the React SPA locally at port 5173
```

---

## 💫 Core Features At a Glance

* **Floating Glass UI**: Visually stunning dashboard avoiding harsh grid lines; designed purely with light rims and deep depth-of-field blurs.
* **Instant Propagation**: Built strictly for speed. Zero manual syncing or refetching operations.
* **Greedy Graph Minimization**: Internal algorithms automatically reduce complex group debts to streamline settlements into single-tap workflows.
* **Demo Environment**: Exposes an automatic `/api/groups/demo` endpoint to instantly spin up a populated mock presentation room.
