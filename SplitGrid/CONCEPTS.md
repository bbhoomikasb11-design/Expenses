# Technical Concepts in SplitGrid 🧠

SplitGrid isn't just another CRUD app; it's an event-driven system designed for high performance and premium user experience.

## 1. Real-Time Synchronization Architecture

SplitGrid uses a multi-layered approach to ensure that data is always fresh across all clients.

### MongoDB Change Streams
Instead of relying solely on API call responses, the backend "listens" to the database itself.
- **The Engine**: `Group.watch()` in `server/socket/index.js`.
- **How it works**: Whenever a document in the `groups` collection is inserted or updated (via API, manual DB edit, or other processes), MongoDB emits a change event.
- **Socket.io Integration**: The server catches these events and immediately broadcasts the updated group data to a specific Socket.io "room" identified by the `groupId`.

### Why this matters?
This design decouples the database update from the client notification. If a background job or another service updates the balance, the UI will reflect it instantly without any extra logic in the API controllers.

---

## 2. The Balance Calculation Engine

Located in `server/utils/balanceEngine.js`, the `recalculateBalances` function is the brain of the financial logic.

### Calculating Net Worth
The engine computes a single `balances` Map for the entire group:
1. **Initial State**: All members start at `0`.
2. **Expenses**: 
    - The **Payer** gets the full amount added (they are "owed").
    - The **Splitters** get an equal share subtracted (they "owe").
3. **Settlements**:
    - The person paying (`from`) gets the amount added back (debt reduced).
    - The person receiving (`to`) gets the amount subtracted (amount received).

This results in a clean map where positive numbers mean the person is owed, and negative numbers mean they owe the group.

---

## 3. Glassmorphism & Modern UI (Tailwind CSS v4)

SplitGrid pushes the boundaries of web UI by moving away from standard borders and boxes.

### Key Principles:
- **Translucency**: High `backdrop-blur` values create a sense of depth.
- **Layering**: Subtle `z-index` management and soft shadows make elements appear to float.
- **Dynamic Gradients**: Instead of solid colors, we use radial and linear gradients that react to the dark theme.
- **Tailwind 4 Utilities**: Leveraging new JIT features for complex animations and custom property injections.

---

## 4. State Management & Hooks

In React 19, SplitGrid manages state through a combination of:
- **Context API**: Providing group data to all nested screens (Dashboard, Members, Expenses).
- **Socket Hooks**: Custom listeners that hook into the `group-updated` event to refresh local state.
- **Optimistic UI**: (Future improvement) The system is designed to allow local state updates while waiting for the socket confirmation.

---

## 5. Security & Privacy

- **Unique Room IDs**: Groups are identified by cryptographically random IDs, making it nearly impossible for unauthorized users to "guess" a room URL.
- **Minimal Data Footprint**: SplitGrid focuses on utility, storing only what's necessary for expense sharing.
