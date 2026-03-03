const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const path = require('path');
const gameHandler = require('./socket/gameHandler');
const roomManager = require('./rooms/roomManager');

const app = express();
const server = http.createServer(app);

// Configure Socket.io with CORS
const io = new socketIO.Server(server, {
    cors: {
        origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:4173'],
        methods: ['GET', 'POST']
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'Server running' });
});

app.get('/api/rooms', (req, res) => {
    const rooms = Array.from(roomManager.rooms.values()).map(room => ({
        id: room.id,
        playerCount: room.players.length,
        gameState: room.gameState
    }));
    res.json(rooms);
});

// Socket.io connection
io.on('connection', (socket) => {
    console.log(`New connection: ${socket.id}`);

    // Game event handlers
    socket.on('create_room', (data) => gameHandler.handleCreateRoom(socket, data, io));
    socket.on('join_room', (data) => gameHandler.handleJoinRoom(socket, data, io));
    socket.on('start_game', (data) => gameHandler.handleStartGame(socket, data, io));
    socket.on('choose_word', (data) => gameHandler.handleChooseWord(socket, data, io));
    socket.on('draw', (data) => gameHandler.handleDraw(socket, data, io));
    socket.on('clear_canvas', (data) => gameHandler.handleClearCanvas(socket, data, io));
    socket.on('chat_message', (data) => gameHandler.handleChatMessage(socket, data, io));
    socket.on('guess_word', (data) => gameHandler.handleGuessWord(socket, data, io));
    socket.on('like_drawing', (data) => gameHandler.handleLikeDrawing(socket, data, io));
    socket.on('dislike_drawing', (data) => gameHandler.handleDislikeDrawing(socket, data, io));
    socket.on('disconnect', () => gameHandler.handleDisconnect(socket, io));

    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server, io };
