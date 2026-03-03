const roomManager = require('../rooms/roomManager');

const ROUND_DURATION = 90; // 90 seconds per round
const WORD_CHOOSE_DURATION = 15; // 15 seconds to choose word

class GameHandler {
    constructor() {
        this.timers = new Map(); // roomId -> timer object
        this.playerSockets = new Map(); // playerId -> socketId
    }

    handleCreateRoom(socket, data, io) {
        try {
            const { playerName, playerId } = data;
            const roomId = Math.random().toString(36).substring(2, 10).toUpperCase();

            const room = roomManager.createRoom(roomId, {
                id: playerId,
                name: playerName,
                socketId: socket.id,
                isHost: true
            });

            socket.join(roomId);
            this.playerSockets.set(playerId, socket.id);

            socket.emit('room_joined', {
                roomId,
                room,
                playerId
            });

            io.to(roomId).emit('player_joined', {
                player: room.players[0],
                players: room.players
            });

            console.log(`Room created: ${roomId} by ${playerName}`);
        } catch (error) {
            console.error('Error creating room:', error);
            socket.emit('error', { message: 'Failed to create room' });
        }
    }

    handleJoinRoom(socket, data, io) {
        try {
            const { roomId, playerName, playerId } = data;
            const room = roomManager.getRoom(roomId);

            if (!room) {
                socket.emit('error', { message: 'Room not found' });
                return;
            }

            if (room.players.length >= 8) {
                socket.emit('error', { message: 'Room is full' });
                return;
            }

            const updatedRoom = roomManager.joinRoom(roomId, {
                id: playerId,
                name: playerName,
                socketId: socket.id,
                isHost: false
            });

            socket.join(roomId);
            this.playerSockets.set(playerId, socket.id);

            const newPlayer = updatedRoom.players[updatedRoom.players.length - 1];

            socket.emit('room_joined', {
                roomId,
                room: updatedRoom,
                playerId
            });

            io.to(roomId).emit('player_joined', {
                player: newPlayer,
                players: updatedRoom.players
            });

            console.log(`${playerName} joined room: ${roomId}`);
        } catch (error) {
            console.error('Error joining room:', error);
            socket.emit('error', { message: 'Failed to join room' });
        }
    }

    handleStartGame(socket, data, io) {
        try {
            const { roomId } = data;
            const room = roomManager.getRoom(roomId);

            if (!room || room.players.length < 2) {
                socket.emit('error', { message: 'Need at least 2 players to start' });
                return;
            }

            const updatedRoom = roomManager.startGame(roomId);
            const currentDrawer = updatedRoom.players[updatedRoom.drawerIndex];

            io.to(roomId).emit('game_started', {
                gameState: updatedRoom.gameState,
                players: updatedRoom.players,
                currentDrawer
            });

            // Emit word options only to the drawer
            const drawerSocket = this.playerSockets.get(currentDrawer.id);
            if (drawerSocket) {
                io.to(drawerSocket).emit('word_options', {
                    options: updatedRoom.wordOptions
                });
            }

            // Start word selection timer
            this.startWordSelectionTimer(roomId, io);

            console.log(`Game started in room: ${roomId}`);
        } catch (error) {
            console.error('Error starting game:', error);
            socket.emit('error', { message: 'Failed to start game' });
        }
    }

    handleChooseWord(socket, data, io) {
        try {
            const { roomId, word } = data;
            const room = roomManager.getRoom(roomId);

            if (!room) return;

            room.currentWord = word.toLowerCase();
            room.gameState = 'DRAWING';
            room.drawingData = [];

            // Clear any existing word selection timer
            if (this.timers.has(`word-${roomId}`)) {
                clearInterval(this.timers.get(`word-${roomId}`));
                this.timers.delete(`word-${roomId}`);
            }

            const maskedWord = word.split('').map(() => '_').join(' ');

            io.to(roomId).emit('new_round', {
                gameState: 'DRAWING',
                maskedWord,
                drawer: room.players[room.drawerIndex],
                round: room.round,
                maxRounds: room.maxRounds
            });

            // Start game timer
            this.startGameTimer(roomId, ROUND_DURATION, io);

            console.log(`Word chosen in room ${roomId}: ${word}`);
        } catch (error) {
            console.error('Error choosing word:', error);
        }
    }

    handleDraw(socket, data, io) {
        try {
            const { roomId, drawData } = data;
            const room = roomManager.getRoom(roomId);

            if (!room) return;

            room.drawingData.push(drawData);

            // Broadcast drawing to all players in the room except sender
            socket.to(roomId).emit('draw', drawData);
        } catch (error) {
            console.error('Error handling draw:', error);
        }
    }

    handleClearCanvas(socket, data, io) {
        try {
            const { roomId } = data;
            socket.to(roomId).emit('clear_canvas', {});
        } catch (error) {
            console.error('Error clearing canvas:', error);
        }
    }

    handleChatMessage(socket, data, io) {
        try {
            const { roomId, message, playerId, playerName } = data;
            const room = roomManager.getRoom(roomId);

            if (!room) return;

            const chatEntry = {
                id: Date.now(),
                playerId,
                playerName,
                message,
                timestamp: new Date()
            };

            room.chat.push(chatEntry);

            io.to(roomId).emit('chat_message', chatEntry);
        } catch (error) {
            console.error('Error handling chat:', error);
        }
    }

    handleGuessWord(socket, data, io) {
        try {
            const { roomId, guess, playerId, playerName } = data;
            const room = roomManager.getRoom(roomId);

            if (!room) return;

            const cleanGuess = guess.toLowerCase().trim();
            const isCorrect = cleanGuess === room.currentWord;

            if (isCorrect) {
                // Find guesser and drawer
                const guesser = room.players.find(p => p.id === playerId);
                const drawer = room.players[room.drawerIndex];

                if (guesser && drawer) {
                    guesser.score += 10;
                    drawer.score += 5;
                }

                io.to(roomId).emit('correct_guess', {
                    playerId,
                    playerName,
                    word: room.currentWord,
                    players: room.players
                });

                // Reveal word to all players
                io.to(roomId).emit('word_revealed', {
                    word: room.currentWord
                });

                // End round early if guessed
                this.endRound(roomId, io);
            } else {
                // Check if guess is similar to actual word
                const similarity = this.calculateSimilarity(cleanGuess, room.currentWord);
                
                if (similarity > 0.6 && similarity < 1.0) {
                    // Player is close!
                    io.to(roomId).emit('guess_feedback', {
                        playerId,
                        playerName,
                        feedback: 'close',
                        message: `${playerName} is close!`
                    });
                }
            }
        } catch (error) {
            console.error('Error handling guess:', error);
        }
    }

    calculateSimilarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        
        if (longer.length === 0) return 1.0;
        
        const editDistance = this.getEditDistance(longer, shorter);
        return (longer.length - editDistance) / longer.length;
    }

    getEditDistance(s1, s2) {
        const costs = [];
        for (let i = 0; i <= s1.length; i++) {
            let lastValue = i;
            for (let j = 0; j <= s2.length; j++) {
                if (i === 0) {
                    costs[j] = j;
                } else if (j > 0) {
                    let newValue = costs[j - 1];
                    if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
                        newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                    }
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
            if (i > 0) costs[s2.length] = lastValue;
        }
        return costs[s2.length];
    }

    handleDisconnect(socket, io) {
        try {
            // Find and remove the player from all rooms
            for (const [roomId, room] of roomManager.rooms.entries()) {
                const player = room.players.find(p => p.socketId === socket.id);
                if (player) {
                    roomManager.leaveRoom(roomId, player.id);
                    this.playerSockets.delete(player.id);

                    if (room.players.length === 0) {
                        // Clear timers if room is empty
                        if (this.timers.has(roomId)) {
                            clearInterval(this.timers.get(roomId));
                            this.timers.delete(roomId);
                        }
                        if (this.timers.has(`word-${roomId}`)) {
                            clearInterval(this.timers.get(`word-${roomId}`));
                            this.timers.delete(`word-${roomId}`);
                        }
                    } else {
                        // Check if drawer disconnected
                        if (room.drawerIndex >= room.players.length) {
                            room.drawerIndex = 0;
                        }

                        io.to(roomId).emit('player_left', {
                            player,
                            players: room.players
                        });
                    }

                    console.log(`${player.name} disconnected from room ${roomId}`);
                }
            }
        } catch (error) {
            console.error('Error handling disconnect:', error);
        }
    }

    handleLikeDrawing(socket, data, io) {
        try {
            const { roomId, playerId, playerName } = data;
            const room = roomManager.getRoom(roomId);
            
            if (!room) return;
            
            if (!room.drawingLikes) {
                room.drawingLikes = [];
            }
            
            // Check if already liked
            const alreadyLiked = room.drawingLikes.some(like => like.playerId === playerId);
            
            if (!alreadyLiked) {
                room.drawingLikes.push({ playerId, playerName });
                
                io.to(roomId).emit('drawing_liked', {
                    playerName,
                    totalLikes: room.drawingLikes.length,
                    likedBy: room.drawingLikes.map(l => l.playerName)
                });
            }
        } catch (error) {
            console.error('Error liking drawing:', error);
        }
    }

    handleDislikeDrawing(socket, data, io) {
        try {
            const { roomId, playerId } = data;
            const room = roomManager.getRoom(roomId);
            
            if (!room) return;
            
            if (!room.drawingDislikes) {
                room.drawingDislikes = [];
            }
            
            // Check if already disliked
            const alreadyDisliked = room.drawingDislikes.some(dislike => dislike.playerId === playerId);
            
            if (!alreadyDisliked) {
                room.drawingDislikes.push({ playerId });
                
                io.to(roomId).emit('drawing_disliked', {
                    totalDislikes: room.drawingDislikes.length
                });
            }
        } catch (error) {
            console.error('Error disliking drawing:', error);
        }
    }

    startWordSelectionTimer(roomId, io) {
        let time = WORD_CHOOSE_DURATION;

        const timer = setInterval(() => {
            time--;

            io.to(roomId).emit('word_selection_timer', { time });

            if (time <= 0) {
                clearInterval(timer);
                this.timers.delete(`word-${roomId}`);

                // Auto-select first word if not selected
                const room = roomManager.getRoom(roomId);
                if (room && room.gameState === 'CHOOSING' && room.currentWord === '') {
                    this.handleChooseWord({ to: () => ({}) }, { roomId, word: room.wordOptions[0] }, io);
                }
            }
        }, 1000);

        this.timers.set(`word-${roomId}`, timer);
    }

    startGameTimer(roomId, duration, io) {
        let time = duration;

        const timer = setInterval(() => {
            time--;

            io.to(roomId).emit('timer_update', { time });

            if (time <= 0) {
                clearInterval(timer);
                this.timers.delete(roomId);
                this.endRound(roomId, io);
            }
        }, 1000);

        this.timers.set(roomId, timer);
    }

    endRound(roomId, io) {
        const room = roomManager.getRoom(roomId);

        if (!room) return;

        // Clear timer
        if (this.timers.has(roomId)) {
            clearInterval(this.timers.get(roomId));
            this.timers.delete(roomId);
        }

        // Move to next drawer
        room.drawerIndex = (room.drawerIndex + 1) % room.players.length;
        room.round++;

        if (room.round > room.maxRounds) {
            // Game over
            room.gameState = 'GAME_END';
            const winner = room.players.reduce((prev, current) =>
                prev.score > current.score ? prev : current
            );

            io.to(roomId).emit('game_end', {
                players: room.players,
                winner
            });

            console.log(`Game ended in room ${roomId}`);
        } else {
            // Start new round
            room.gameState = 'CHOOSING';
            room.currentWord = '';
            room.wordOptions = roomManager.getRandomWords();

            const currentDrawer = room.players[room.drawerIndex];
            const drawerSocket = this.playerSockets.get(currentDrawer.id);

            io.to(roomId).emit('round_end', {
                players: room.players,
                nextRound: room.round,
                maxRounds: room.maxRounds
            });

            // Give drawer word options after a delay
            setTimeout(() => {
                if (drawerSocket) {
                    io.to(drawerSocket).emit('word_options', {
                        options: room.wordOptions
                    });
                }

                // Start word selection timer
                this.startWordSelectionTimer(roomId, io);
            }, 2000);

            console.log(`Round ${room.round - 1} ended in room ${roomId}`);
        }
    }
}

module.exports = new GameHandler();
