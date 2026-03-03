# Developer Quick Reference - Together Game

Quick lookup guide for common tasks and configurations.

## Quick Commands

### Start Development

**Windows:**
```bash
cd D:\Together
setup.bat
```

**macOS/Linux:**
```bash
cd Together
./setup.sh
```

### Manual Start

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Runs on port 5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend  
npm run dev
# Runs on port 5173
```

### Build for Production

**Frontend:**
```bash
cd frontend
npm run build
# Outputs to frontend/dist
```

**Backend:**
```bash
cd backend
npm start
```

---

## Key Files & What They Do

### Backend Core
| File | Purpose |
|------|---------|
| `server.js` | Express server, Socket.io setup, routes |
| `socket/gameHandler.js` | Game logic, timers, socket events |
| `rooms/roomManager.js` | Room CRUD, word selection |
| `words/words.json` | 70+ words for drawing |

### Frontend Core
| File | Purpose |
|------|---------|
| `App.jsx` | Route navigation |
| `store/useGameStore.js` | Global state (Zustand) |
| `socket/socket.js` | Socket.io client config |
| `pages/Home.jsx` | Login/room join screen |
| `pages/Lobby.jsx` | Waiting room |
| `pages/Game.jsx` | Main game interface |

### Components
| Component | Lines | Purpose |
|-----------|-------|---------|
| `CanvasBoard.jsx` | ~150 | Drawing canvas (800x600) |
| `ChatBox.jsx` | ~120 | Chat & guessing |
| `Timer.jsx` | ~40 | Round timer |
| `ColorPicker.jsx` | ~90 | Brush tools |
| `PlayerList.jsx` | ~50 | Players display |
| `ScoreBoard.jsx` | ~50 | Score leaderboard |

---

## Game Configuration

### Round Duration
**File:** `backend/socket/gameHandler.js`
```javascript
// Line ~2
const ROUND_DURATION = 90;        // seconds per round
const WORD_CHOOSE_DURATION = 15;  // seconds to choose
```

### Points System
**File:** `backend/socket/gameHandler.js`
```javascript
// In handleGuessWord()
guesser.score += 10;  // Correct guess reward
drawer.score += 5;    // Drawer bonus
```

### Max Players
**File:** `backend/rooms/roomManager.js`
```javascript
// In joinRoom()
if (room.players.length < 8) {  // Max 8 players
```

### Word List
**File:** `backend/words/words.json`
```json
["apple", "banana", "car", ...]
```

---

## Environment Variables

### Frontend
**File:** `frontend/.env.local`
```
VITE_SOCKET_URL=http://localhost:5000
```

For production (Vercel):
```
VITE_SOCKET_URL=https://your-backend.com
```

### Backend
No environment file needed. Key variables:
```
PORT=5000 (default)
NODE_ENV=production (for deployment)
```

---

## Adding a New Feature

### Example: Add "Pause Game" Feature

**1. Backend - Add Socket Event**
```javascript
// In server.js, add listener:
socket.on('pause_game', (data) => gameHandler.handlePauseGame(socket, data, io));

// In gameHandler.js, add handler:
handlePauseGame(socket, data, io) {
  const room = roomManager.getRoom(data.roomId);
  room.isPaused = true;
  io.to(data.roomId).emit('game_paused', { isPaused: true });
}
```

**2. Frontend - Add State**
```javascript
// In useGameStore.js:
isPaused: false,
setIsPaused: (isPaused) => set({ isPaused }),

// In Game.jsx:
const { isPaused, setIsPaused } = useGameStore();

// Listen for event:
socket.on('game_paused', (data) => {
  setIsPaused(data.isPaused);
});

// Emit event:
socket.emit('pause_game', { roomId });
```

**3. Frontend - Add UI**
```jsx
// In Game.jsx:
{isPaused && (
  <button onClick={() => socket.emit('resume_game', {roomId})}>
    Resume Game
  </button>
)}
```

---

## Common Fixes

### Socket Connection Error
```javascript
// Check in browser console (F12)
console.log(socket.connected); // Should be true
console.log(socket.id);         // Should have value

// In frontend .env.local
VITE_SOCKET_URL=http://localhost:5000

// Verify backend is running
// Port 5000 should be accessible
```

### Port Already in Use
```bash
# Windows - Find process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

### Canvas Not Drawing
- Check `gameState === 'DRAWING'`
- Check `currentDrawer.id === playerId`
- Verify `selectedColor` is set
- Check socket is connected

### Players Not Syncing
```javascript
// Check socket room join
socket.join(roomId);

// Verify broadcast to room
io.to(roomId).emit('event', data);

// Not to specific socket
io.to(socketId).emit('event', data); // Wrong
```

---

## Testing Checklist

### Basic Gameplay
- [ ] Create room works
- [ ] Join room works  
- [ ] Start game works
- [ ] Word selection works
- [ ] Drawing syncs to other players
- [ ] Chat/guessing works
- [ ] Correct guess detected
- [ ] Scores update
- [ ] Next round starts
- [ ] Game ends after 3 rounds

### Edge Cases
- [ ] Join room that doesn't exist
- [ ] Join room that's full (8 players)
- [ ] Start game with only 1 player
- [ ] Disconnect mid-game
- [ ] Rejoin after disconnect
- [ ] Two players guess same word
- [ ] Drawer disconnects

### Performance
- [ ] Smooth drawing at 2+ players
- [ ] No lag during chat
- [ ] Timer updates smoothly
- [ ] No memory leaks after 10+ games

---

## Deployment Checklist

### Before Each Deploy

**Backend:**
- [ ] All tests pass
- [ ] No console errors
- [ ] Socket events working
- [ ] CORS configured correctly
- [ ] Health endpoint responds

**Frontend:**
- [ ] `npm run build` succeeds
- [ ] No console errors/warnings
- [ ] Socket URL configured
- [ ] Responsive on mobile
- [ ] All pages load

**Integration:**
- [ ] Frontend connects to backend
- [ ] Socket events work end-to-end
- [ ] Game completes 1 full cycle
- [ ] Scoreboard updates correctly

### To Vercel
```bash
git add .
git commit -m "Deploy message"
git push origin main
# Auto deployed!
```

### To Railway/Render
```bash
# Same as above, or:
# Configure webhook in dashboard
# Auto deploys on push!
```

---

## Code Snippets

### Emit Socket Event
```javascript
socket.emit('event_name', {
  roomId: 'ABC1234',
  data: 'value'
});
```

### Listen for Socket Event
```javascript
socket.on('event_name', (data) => {
  console.log(data);
  // Update state
  setData(data);
});
```

### Update Zustand State
```javascript
const { value, setValue } = useGameStore();

// Read
console.log(value);

// Write
setValue(newValue);
```

### Access Game State
```javascript
const store = useGameStore();
console.log(store.roomId);
console.log(store.gameState);
console.log(store.players);
```

---

## API Endpoints

### HTTP

```bash
# Health check
GET http://localhost:5000/api/health
# Response: {"status": "Server running"}

# List rooms
GET http://localhost:5000/api/rooms
# Response: [{id: "...", playerCount: 2, gameState: "DRAWING"}, ...]
```

### Socket.io (Key Events)

```javascript
// Client → Server
socket.emit('create_room', {playerName, playerId});
socket.emit('join_room', {roomId, playerName, playerId});
socket.emit('start_game', {roomId});
socket.emit('choose_word', {roomId, word});
socket.emit('draw', {roomId, drawData});
socket.emit('chat_message', {roomId, message, playerId, playerName});
socket.emit('guess_word', {roomId, guess, playerId, playerName});

// Server → Client
socket.on('room_joined', (data) => {});
socket.on('game_started', (data) => {});
socket.on('word_options', (data) => {});
socket.on('draw', (drawData) => {});
socket.on('correct_guess', (data) => {});
socket.on('timer_update', (data) => {});
socket.on('game_end', (data) => {});
```

---

## File Size Reference

| Package | Size | Notes |
|---------|------|-------|
| React | ~42KB | Minified |
| Socket.io Client | ~35KB | Minified |
| Zustand | ~2KB | Minified |
| Browser Bundle | ~150KB | Gzip ~50KB |
| Express | ~50KB | In node_modules |
| Socket.io Server | ~200KB | In node_modules |

---

## Debugging Tips

### View All Socket Events
```javascript
// Add to any component:
socket.onAny((event, ...args) => {
  console.log(`Socket event: ${event}`, args);
});
```

### Inspect Game Store
```javascript
// In browser console:
useGameStore.getState()
// Returns all state
```

### Watch Specific State Value
```javascript
useGameStore.subscribe(
  (state) => state.players,
  (players) => console.log('Players updated:', players)
);
```

### Server Debugging
```javascript
// Add to gameHandler.js:
console.log(`Handler called:`, data);
console.log(`Room state:`, roomManager.getRoom(data.roomId));
```

---

## Performance Optimization

### Canvas Drawing
```javascript
// Already optimized with:
- RequestAnimationFrame (via socket events)
- Bezier curves for smooth lines
- Efficient pixel updates
```

### Socket.io
```javascript
// Already configured with:
- WebSocket transport (fastest)
- Binary frames
- Compression enabled
```

### State Management
```javascript
// Zustand already provides:
- Minimal re-renders
- Selective subscriptions
- No provider hell
```

---

## Useful Resources

- [React Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev)
- [Socket.io Docs](https://socket.io/docs/)
- [Zustand GitHub](https://github.com/pmndrs/zustand)
- [TailwindCSS](https://tailwindcss.com)
- [Express.js](https://expressjs.com)
- [Node.js Docs](https://nodejs.org/en/docs/)

---

## Contact & Support

- **GitHub Issues**: Open for bugs
- **Discussions**: Ask questions
- **Pull Requests**: Welcome!

---

**Last Updated**: March 2026
**Version**: 1.0.0
**Status**: Production Ready ✅
