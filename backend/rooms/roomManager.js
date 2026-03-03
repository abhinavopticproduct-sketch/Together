const fs = require('fs');
const path = require('path');

class RoomManager {
    constructor() {
        this.rooms = new Map();
        const wordsPath = path.join(__dirname, '..', 'words', 'words.json');
        this.words = JSON.parse(fs.readFileSync(wordsPath, 'utf8'));
    }

    createRoom(roomId, host) {
        const room = {
            id: roomId,
            players: [{ ...host, score: 0 }],
            gameState: 'LOBBY', // LOBBY, STARTING, CHOOSING, DRAWING, ROUND_END, GAME_END
            currentWord: '',
            drawerIndex: 0,
            round: 1,
            maxRounds: 3,
            timer: 0,
            drawingData: [],
            chat: [],
            wordOptions: []
        };
        this.rooms.set(roomId, room);
        return room;
    }

    getRoom(roomId) {
        return this.rooms.get(roomId);
    }

    joinRoom(roomId, player) {
        const room = this.rooms.get(roomId);
        if (room && room.players.length < 8) {
            room.players.push({ ...player, score: 0 });
            return room;
        }
        return null;
    }

    leaveRoom(roomId, playerId) {
        const room = this.rooms.get(roomId);
        if (room) {
            room.players = room.players.filter(p => p.id !== playerId);
            if (room.players.length === 0) {
                this.rooms.delete(roomId);
            }
            return room;
        }
        return null;
    }

    getRandomWords(count = 3) {
        const shuffled = [...this.words].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    startGame(roomId) {
        const room = this.rooms.get(roomId);
        if (room) {
            room.gameState = 'CHOOSING';
            room.round = 1;
            room.drawerIndex = 0;
            room.wordOptions = this.getRandomWords();
            return room;
        }
        return null;
    }

    // Additional logic for turn management, scoring, etc. will be added to gameHandler
}

module.exports = new RoomManager();
