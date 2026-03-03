# Together - Real-Time Multiplayer Drawing Game

A Skribbl.io-style real-time multiplayer drawing and guessing game built with React, Node.js, Express, and Socket.io.

## 🎮 Features

- **Real-time Drawing**: Draw on canvas while others watch in real-time
- **Multiplayer Support**: 2-8 players per room
- **Turn-based Gameplay**: Players take turns drawing while others guess
- **Score System**: Points awarded for correct guesses and drawer bonuses
- **Live Chat**: Real-time messaging and guessing system
- **Room System**: Create or join rooms with unique room codes
- **Timer Control**: Automatic round management with timers
- **Responsive UI**: Beautiful UI built with React and TailwindCSS

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **State Management**: Zustand
- **Real-time Communication**: Socket.io Client
- **Styling**: TailwindCSS + PostCSS
- **Canvas Rendering**: HTML5 Canvas API

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Real-time Socket**: Socket.io
- **Server**: HTTP Server
- **CORS**: Cross-Origin Resource Sharing enabled

## 📁 Project Structure

```
together-game/
├── backend/
│   ├── server.js                 # Express server & Socket.io setup
│   ├── rooms/
│   │   └── roomManager.js        # Room management logic
│   ├── socket/
│   │   └── gameHandler.js        # Socket event handlers
│   ├── words/
│   │   └── words.json            # Word list for drawing
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── index.html            # HTML entry point
│   ├── src/
│   │   ├── components/
│   │   │   ├── CanvasBoard.jsx   # Drawing canvas
│   │   │   ├── ChatBox.jsx       # Chat & guessing
│   │   │   ├── Timer.jsx         # Round timer
│   │   │   ├── ColorPicker.jsx   # Drawing tools
│   │   │   ├── PlayerList.jsx    # Players display
│   │   │   └── ScoreBoard.jsx    # Score leaderboard
│   │   ├── pages/
│   │   │   ├── Home.jsx          # Home/login screen
│   │   │   ├── Lobby.jsx         # Game lobby
│   │   │   └── Game.jsx          # Main game screen
│   │   ├── store/
│   │   │   └── useGameStore.js   # Zustand store
│   │   ├── socket/
│   │   │   └── socket.js         # Socket.io client
│   │   ├── App.jsx               # Main app component
│   │   ├── App.css               # Global styles
│   │   ├── index.css             # Tailwind imports
│   │   └── main.jsx              # React entry point
│   ├── vite.config.js            # Vite configuration
│   ├── tailwind.config.js        # TailwindCSS configuration
│   ├── postcss.config.js         # PostCSS configuration
│   ├── package.json
│   └── .env.example              # Environment variables template
│
└── README.md                      # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Installation

1. **Clone and Navigate**
```bash
cd d:\Together
```

2. **Install Backend Dependencies**
```bash
cd backend
npm install
```

3. **Install Frontend Dependencies**
```bash
cd ../frontend
npm install
```

4. **Setup Environment Variables**
```bash
# In frontend folder
cp .env.example .env.local
```

## 🎯 Running the Application

### Development Mode

**Terminal 1 - Start Backend Server:**
```bash
cd backend
npm run dev
```
The backend will start on `http://localhost:5000`

**Terminal 2 - Start Frontend Development Server:**
```bash
cd frontend
npm run dev
```
The frontend will start on `http://localhost:5173`

Then open `http://localhost:5173` in your browser.

### Production Build

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## 🎮 How to Play

1. **Enter Your Name**: On the home page, enter your player name
2. **Create or Join a Room**:
   - Click "Create Room" to host a new game
   - Click "Join Room" and enter a room code to join
3. **Wait for Players**: Room host must wait for at least 2 players
4. **Start Game**: Host clicks "Start Game" button
5. **Game Flow**:
   - One player becomes the "Drawer"
   - Drawer chooses one of 3 word options
   - Drawer has 90 seconds to draw the word
   - Other players guess in the chat
   - First correct guess gets 10 points
   - Drawer gets 5 bonus points
6. **Scoreboard**: Track scores across all 3 rounds
7. **Game End**: Winner displayed on final screen

## 🎨 Canvas Features

- **Drawing Tools**:
  - 10 color options
  - Adjustable brush size (1-20px)
  - Clear canvas button
  - Eraser (use white color)

- **Synchronization**:
  - Real-time drawing sync
  - Smooth line rendering
  - HD canvas (800x600)

## 🔧 Game Configuration

Default settings (can be modified in `gameHandler.js`):
- **Round Duration**: 90 seconds
- **Word Selection Time**: 15 seconds
- **Rounds per Game**: 3
- **Players per Room**: 2-8
- **Points for Correct Guess**: 10
- **Points for Drawer**: 5

## 📊 Game Events (Socket.io)

### Client → Server
- `create_room` - Create new game room
- `join_room` - Join existing room
- `start_game` - Start the game
- `choose_word` - Drawer selects word
- `draw` - Drawing data
- `clear_canvas` - Clear drawing board
- `chat_message` - Send chat message
- `guess_word` - Submit word guess

### Server → Client
- `room_joined` - Room successfully joined
- `player_joined` - New player joined room
- `player_left` - Player left room
- `game_started` - Game has started
- `word_options` - Word options for drawer
- `word_selection_timer` - Word selection countdown
- `new_round` - New round starting
- `draw` - Incoming drawing data
- `correct_guess` - Someone guessed correctly
- `word_revealed` - Actual word shown
- `timer_update` - Round timer countdown
- `round_end` - Round has ended
- `game_end` - Game has ended
- `clear_canvas` - Clear other players' canvas

## 🌐 Deployment

### Frontend Deployment (Vercel)

1. Push project to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Set root directory to `frontend`
5. Add environment variable:
   - `VITE_SOCKET_URL` = Your backend URL
6. Deploy

### Backend Deployment (Railway/Render)

**Option 1: Railway**
1. Push to GitHub
2. Connect at [railway.app](https://railway.app)
3. Select backend folder
4. Set `PORT` environment variable
5. Deploy

**Option 2: Render**
1. Push to GitHub
2. Create Web Service on [render.com](https://render.com)
3. Build command: `cd backend && npm install`
4. Start command: `npm start`
5. Deploy

**Enable WebSocket Support:**
- Both Railway and Render support WebSocket automatically
- Socket.io connections will work seamlessly

## 🔐 Security Notes

- Room IDs are random and publicly shareable
- No permanent user accounts required
- All game state is ephemeral
- Consider adding:
  - Rate limiting for API endpoints
  - Input validation sanitization
  - Profanity filter for chat
  - Player kick functionality (optional)

## 📱 Performance Optimization

- Canvas drawing uses requestAnimationFrame internally via events
- Socket.io with transports: WebSocket (primary)
- Zustand for efficient state management
- TailwindCSS with PurgeCSS (production)

## 🐛 Troubleshooting

**Socket.io Connection Issues:**
```javascript
// If frontend can't connect, check VITE_SOCKET_URL in .env.local
// Ensure backend is running on port 5000
// Check browser console for errors
```

**Canvas Not Drawing:**
- Ensure you're the current drawer
- Check gameState is 'DRAWING'
- Verify websocket connection is active

**Players Not Synchronized:**
- Check socket.io connection in both frontend and backend
- Verify correct room ID is being used
- Check backend console for errors

## 📚 Additional Features (To Implement)

- [ ] Player avatars
- [ ] Drawing replay system
- [ ] Private rooms with passwords
- [ ] Player kick functionality
- [ ] Mobile responsive improvements
- [ ] Emoji reactions
- [ ] AI word suggestions

### Mobile improvements
- Prevent page scrolling while drawing on touch devices (added `touch-action: none` on canvas)
- Display transient hint banner when someone is close to guessing the word
- [ ] User statistics/history
- [ ] Lobby chat before game starts
- [ ] Custom word sets

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📧 Support

For issues or questions, please open an issue on the GitHub repository.

---

**Made with 🎨 and ❤️**

Enjoy playing Together!
