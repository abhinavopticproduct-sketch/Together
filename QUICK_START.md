# Quick Start Guide - Together Game

Get the Together game running locally in 5 minutes!

## Prerequisites

- **Node.js**: v14 or higher
- **npm**: comes with Node.js
- **Git**: for version control (optional)

## Installation & Running

### Option 1: Automatic Setup (Windows)

```bash
cd D:\Together
setup.bat
```

This script will automatically install all dependencies for both frontend and backend.

### Option 2: Automatic Setup (macOS/Linux)

```bash
cd Together
chmod +x setup.sh
./setup.sh
```

### Option 3: Manual Setup

**Terminal 1 - Backend:**
```bash
cd D:\Together\backend
npm install
npm run dev
```

You should see:
```
Server running on port 5000
```

**Terminal 2 - Frontend:**
```bash
cd D:\Together\frontend
npm install
npm run dev
```

You should see:
```
VITE v4.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

## Access the Game

Open your browser and go to: **http://localhost:5173**

## Play a Game

### Single Player Testing

1. **First Tab**: Open http://localhost:5173
   - Enter name: "Player 1"
   - Click "Create Room"
   - Note the room ID (e.g., "ABC12345")

2. **Second Tab**: Open http://localhost:5173
   - Enter name: "Player 2"
   - Click "Join Room"
   - Paste the room ID from step 1
   - Click "Join Room"

3. **Back to First Tab**:
   - Click "Start Game"
   - Wait for game to load

4. **Play**:
   - Player 1 (drawer) receives 3 word options
   - Click any word to start drawing
   - Player 2 guesses in the chat
   - Repeat for all rounds

### Multi-Computer Testing

Use your computer's IP address instead of localhost:

1. Get your IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Share `http://YOUR_IP:5173` with friends
3. Everyone joins the same network

## Project Structure

```
D:\Together
├── backend/
│   ├── server.js          → Express + Socket.io server
│   ├── socket/
│   │   └── gameHandler.js → Game logic
│   ├── rooms/
│   │   └── roomManager.js → Room management
│   ├── words/
│   │   └── words.json     → Word list
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/     → Reusable React components
    │   ├── pages/          → Page components
    │   ├── store/          → Zustand state
    │   ├── socket/         → Socket.io client
    │   └── App.jsx         → Main app
    ├── public/
    │   └── index.html      → HTML template
    └── package.json
```

## Key Commands

### Backend
```bash
cd backend

# Development (auto-reload)
npm run dev

# Production
npm start
```

### Frontend
```bash
cd frontend

# Development (hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Game Config

Edit these files to customize gameplay:

**Game Balance** (`backend/socket/gameHandler.js`):
```javascript
const ROUND_DURATION = 90;      // seconds per round
const WORD_CHOOSE_DURATION = 15; // seconds to choose word
```

**Game Rules** (`backend/rooms/roomManager.js`):
- Change `maxRounds` for different round counts
- Change max/min players per room

**Word List** (`backend/words/words.json`):
- Add or remove words from the list
- Modify categories (optional)

**Scoring** (`backend/socket/gameHandler.js`):
```javascript
guesser.score += 10;  // correct guess reward
drawer.score += 5;    // drawer bonus
```

## Troubleshooting

### Port 5000 Already in Use
```bash
# Windows: Find and kill process
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

### Port 5173 Already in Use
```bash
# Try different port
npm run dev -- --port 3000
```

### Cannot Connect Socket.io
1. Check backend is running on port 5000
2. Check frontend `.env.local`:
   ```
   VITE_SOCKET_URL=http://localhost:5000
   ```
3. Restart both servers

### Drawing Not Syncing
1. Refresh the page (F5)
2. Make sure you're the current drawer
3. Check browser console for errors (F12)

## Best Practices

### Development Tips
- Use two browser windows for testing
- Keep console open (F12) to watch for errors
- Use Firefox/Chrome developer tools
- Test with actual friends for real feedback

### Performance
- Canvas is optimized for smooth drawing
- Socket.io uses WebSocket for real-time sync
- Zustand ensures efficient state updates

### Code Style
- React components in `src/components/`
- Page logic in `src/pages/`
- Socket listeners in component `useEffect`
- State management with Zustand hooks

## Next Steps

1. ✅ Run the game locally
2. 📖 Read [README.md](./README.md) for full docs
3. 🚀 Check [DEPLOYMENT.md](./DEPLOYMENT.md) to deploy online
4. 💡 Modify game mechanics and features
5. 🎉 Share with friends!

## Useful Resources

- **React Docs**: https://react.dev
- **Zustand Docs**: https://zustand.js.org
- **Socket.io Docs**: https://socket.io/docs/
- **TailwindCSS**: https://tailwindcss.com
- **Canvas API**: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API

## Getting Help

1. Check browser console for errors (F12)
2. Check terminal for backend errors
3. Try restarting both servers
4. Clear browser cache and refresh
5. Check GitHub issues or open a new one

---

**Happy Drawing!** 🎨

Questions? Check the README.md or DEPLOYMENT.md for more info.
