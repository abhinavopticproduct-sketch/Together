# API Documentation - Together Game

Complete reference for all Socket.io events and HTTP endpoints.

## Table of Contents
1. [HTTP API](#http-api)
2. [Socket.io Events](#socketio-events)
3. [Event Payloads](#event-payloads)
4. [Error Handling](#error-handling)

---

## HTTP API

### Base URL
```
http://localhost:5000
```

### Health Check

**GET** `/api/health`

Check if server is running.

**Response:**
```json
{
  "status": "Server running"
}
```

**Example:**
```bash
curl http://localhost:5000/api/health
```

---

### Get All Rooms

**GET** `/api/rooms`

Get list of all active game rooms.

**Response:**
```json
[
  {
    "id": "ABC1234",
    "playerCount": 3,
    "gameState": "DRAWING"
  },
  {
    "id": "XYZ9876",
    "playerCount": 2,
    "gameState": "LOBBY"
  }
]
```

**Example:**
```bash
curl http://localhost:5000/api/rooms
```

---

## Socket.io Events

### Connection Events

#### Connect
Automatic when client connects to socket server.

```javascript
socket.on('connect', () => {
  console.log('Connected to server');
});
```

#### Disconnect
Automatic when client or server disconnects.

```javascript
socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
});
```

#### Error
Sent when a socket error occurs.

```javascript
socket.on('error', (data) => {
  console.error(data.message);
});
```

---

### Room Events

#### CREATE_ROOM

**Client → Server**

Create a new game room.

```javascript
socket.emit('create_room', {
  playerName: string,
  playerId: string
});
```

**Response (Server → Client):**
```javascript
socket.on('room_joined', {
  roomId: string,
  room: {
    id: string,
    players: Player[],
    gameState: string,
    wordOptions: string[],
    draw: string,
    // ... other room data
  },
  playerId: string
});
```

**Example:**
```javascript
socket.emit('create_room', {
  playerName: 'Alice',
  playerId: 'player_123456789'
});
```

---

#### JOIN_ROOM

**Client → Server**

Join an existing game room.

```javascript
socket.emit('join_room', {
  roomId: string,
  playerName: string,
  playerId: string
});
```

**Response (Server → Client):**
```javascript
socket.on('room_joined', {
  roomId: string,
  room: Room,
  playerId: string
});
```

**Error Response:**
```javascript
socket.on('error', {
  message: 'Room not found' | 'Room is full'
});
```

**Example:**
```javascript
socket.emit('join_room', {
  roomId: 'ABC1234',
  playerName: 'Bob',
  playerId: 'player_987654321'
});
```

---

### Game Events

#### START_GAME

**Client → Server**

Start the game (only host can do this).

```javascript
socket.emit('start_game', {
  roomId: string
});
```

**Broadcast Response (Server → All in Room):**
```javascript
socket.on('game_started', {
  gameState: 'CHOOSING',
  players: Player[],
  currentDrawer: Player
});
```

---

#### WORD_OPTIONS

**Server → Client (to drawer only)**

Drawer receives 3 word options to choose from.

```javascript
socket.on('word_options', {
  options: string[] // ['word1', 'word2', 'word3']
});
```

---

#### WORD_SELECTION_TIMER

**Server → Client**

Countdown timer for word selection (15 seconds).

```javascript
socket.on('word_selection_timer', {
  time: number // 15, 14, 13, ... 1, 0
});
```

---

#### CHOOSE_WORD

**Client → Server**

Drawer selects which word to draw.

```javascript
socket.emit('choose_word', {
  roomId: string,
  word: string
});
```

**Broadcast Response (Server → All in Room):**
```javascript
socket.on('new_round', {
  gameState: 'DRAWING',
  maskedWord: string, // '_ _ _ _ _ _'
  drawer: Player,
  round: number,
  maxRounds: number
});
```

---

### Drawing Events

#### DRAW

**Client → Server**

Send drawing data when player draws on canvas.

```javascript
socket.emit('draw', {
  roomId: string,
  drawData: {
    x: number,
    y: number,
    prevX: number,
    prevY: number,
    color: string, // hex color '#FF0000'
    thickness: number,
    type: 'draw' | 'erase',
    isEraser: boolean
  }
});
```

**Broadcast Response (Server → Other Players):**
```javascript
socket.on('draw', drawData);
```

---

#### CLEAR_CANVAS

**Client → Server**

Clear the drawing canvas.

```javascript
socket.emit('clear_canvas', {
  roomId: string
});
```

**Broadcast Response (Server → All in Room):**
```javascript
socket.on('clear_canvas', {});
```

---

### Chat & Guess Events

#### CHAT_MESSAGE

**Client → Server**

Send a chat message.

```javascript
socket.emit('chat_message', {
  roomId: string,
  message: string,
  playerId: string,
  playerName: string
});
```

**Broadcast Response (Server → All in Room):**
```javascript
socket.on('chat_message', {
  id: number,
  playerId: string,
  playerName: string,
  message: string,
  timestamp: Date
});
```

---

#### GUESS_WORD

**Client → Server**

Submit a word guess (only non-drawers during DRAWING phase).

```javascript
socket.emit('guess_word', {
  roomId: string,
  guess: string,
  playerId: string,
  playerName: string
});
```

**Correct Guess Response (Server → All in Room):**
```javascript
socket.on('correct_guess', {
  playerId: string,
  playerName: string,
  word: string,
  players: Player[] // updated with new scores
});
```

**Word Revealed:**
```javascript
socket.on('word_revealed', {
  word: string
});
```

---

### Timer Events

#### TIMER_UPDATE

**Server → Client**

Countdown timer for the round (90 seconds).

```javascript
socket.on('timer_update', {
  time: number // 90, 89, 88, ... 1, 0
});
```

---

### Round & Game Events

#### ROUND_END

**Server → Client**

End of current round, prepare for next.

```javascript
socket.on('round_end', {
  players: Player[],
  nextRound: number,
  maxRounds: number
});
```

---

#### GAME_END

**Server → Client**

End of entire game session.

```javascript
socket.on('game_end', {
  players: Player[],
  winner: Player
});
```

---

### Player Events

#### PLAYER_JOINED

**Server → Client (to all in room)**

New player joined the room.

```javascript
socket.on('player_joined', {
  player: Player,
  players: Player[] // all players in room
});
```

---

#### PLAYER_LEFT

**Server → Client (to all in room)**

A player left the room.

```javascript
socket.on('player_left', {
  player: Player,
  players: Player[] // remaining players
});
```

---

## Event Payloads

### Player Object

```typescript
interface Player {
  id: string;
  name: string;
  socketId: string;
  isHost: boolean;
  score: number;
}
```

**Example:**
```json
{
  "id": "player_123456789",
  "name": "Alice",
  "socketId": "socket_abc123",
  "isHost": true,
  "score": 25
}
```

---

### Room Object

```typescript
interface Room {
  id: string;
  players: Player[];
  gameState: "LOBBY" | "CHOOSING" | "DRAWING" | "ROUND_END" | "GAME_END";
  currentWord: string;
  maskedWord: string;
  drawerIndex: number;
  round: number;
  maxRounds: number;
  timer: number;
  drawingData: DrawData[];
  chat: ChatMessage[];
  wordOptions: string[];
}
```

---

### DrawData Object

```typescript
interface DrawData {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  color: string;
  thickness: number;
  type: "draw" | "erase";
  isEraser: boolean;
}
```

---

### ChatMessage Object

```typescript
interface ChatMessage {
  id: number;
  playerId: string;
  playerName: string;
  message: string;
  timestamp: Date;
  isSystemMessage?: boolean;
}
```

---

## Error Handling

### Common Error Responses

#### Room Not Found
```json
{
  "message": "Room not found"
}
```

#### Room is Full
```json
{
  "message": "Room is full"
}
```

#### Need More Players
```json
{
  "message": "Need at least 2 players to start"
}
```

#### Socket Connection Error
```javascript
socket.on('error', (error) => {
  console.error('Socket error:', error);
});
```

---

### Error Handling Best Practices

**Frontend:**
```javascript
// Listen for errors
socket.on('error', (data) => {
  alert(data.message);
});

// Handle connection failures
socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});

socket.on('disconnect', (reason) => {
  if (reason === 'io server disconnect') {
    // server disconnected, reconnect manually
    socket.connect();
  }
});
```

**Backend:**
```javascript
socket.on('error', (error) => {
  console.error('Socket error:', error);
  socket.emit('error', {
    message: 'An error occurred. Please try again.'
  });
});
```

---

## Game State Flow

```
┌─────────────────────────────────┐
│         LOBBY                   │
│  - Players joining              │
│  - Host waiting for 2+ players  │
└────────────┬────────────────────┘
             │ startGame()
┌─────────────▼────────────────────┐
│       CHOOSING                   │
│  - Drawer chooses a word        │
│  - 15 second timer              │
└────────────┬────────────────────┘
             │ chooseWord()
┌─────────────▼────────────────────┐
│       DRAWING                    │
│  - Drawer draws on canvas       │
│  - Others guess in chat         │
│  - 90 second timer              │
└────────────┬────────────────────┘
             │ timeout or correct guess
┌─────────────▼────────────────────┐
│      ROUND_END                   │
│  - Show scores                  │
│  - Prepare next round           │
└────────────┬────────────────────┘
             │ startNextRound()
      ┌──────┴──────┐
      │             │
   [More rounds?]   No → GAME_END
      │
      Yes
      │
      └─────────────────────────────┐
              (go back to CHOOSING) │
                                    │
                                    │
```

---

## Testing Socket.io Events

### Using Socket.io Testing Tool

```bash
npm install -g socket.io-client-cli
```

### Example Test

```bash
socket.io-client http://localhost:5000

# List available events
> /emit create_room

# Subscribe to event
> /subscribe game_started

# Emit event with data
> /emit create_room '{"playerName":"TestUser","playerId":"test123"}'
```

---

## Performance Metrics

### Latency Expectations

| Event | Latency | Notes |
|-------|---------|-------|
| Chat | <50ms | Real-time |
| Drawing | <16ms | 60fps drawing |
| Guess Check | <100ms | Server processing |
| Score Update | <100ms | Server broadcast |

### Bandwidth Usage

- **Drawing**: ~5-10KB per second (compressed)
- **Chat**: ~1KB per message
- **Game State**: ~100 bytes per update
- **Total**: ~50KB per 5-minute game

---

## Rate Limiting

Current implementation has no rate limiting. For production, add:

```javascript
const rateLimit = require('express-rate-limit');

const socketIoRateLimit = (socket, next) => {
  const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100 // limit each IP to 100 requests per windowMs
  });
  next();
};

io.use(socketIoRateLimit);
```

---

## Troubleshooting

### Socket Connection Fails

1. Check backend is running
2. Verify CORS settings
3. Check firewall/network
4. Look for console errors

### Events Not Received

1. Verify event name matches exactly
2. Check room ID is correct
3. Verify payload format
4. Check console for errors

### Latency Issues

1. Check network connection
2. Monitor server CPU/memory
3. Check for errors in logs
4. Consider Redis for scaling

---

**For more info, see [README.md](./README.md) and [QUICK_START.md](./QUICK_START.md)**
