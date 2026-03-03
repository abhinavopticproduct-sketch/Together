import React, { useRef, useEffect, useState } from 'react';
import { socket, socketEvents } from '../socket/socket';
import { useGameStore } from '../store/useGameStore';

export default function ChatBox() {
    const [inputValue, setInputValue] = useState('');
    const [likes, setLikes] = useState(0);
    const [dislikes, setDislikes] = useState(0);
    const [likedBy, setLikedBy] = useState([]);
    const [hasLiked, setHasLiked] = useState(false);
    const [hasDisliked, setHasDisliked] = useState(false);
    const messagesEndRef = useRef(null);

    const { roomId, playerId, playerName, messages, addMessage, gameState, currentDrawer } = useGameStore();

    const isCurrentDrawer = currentDrawer?.id === playerId;

    useEffect(() => {
        socket.on(socketEvents.CHAT_MESSAGE, (message) => {
            addMessage(message);
        });

        socket.on(socketEvents.CORRECT_GUESS, (data) => {
            addMessage({
                id: Date.now(),
                playerName: 'GAME',
                message: `✓ ${data.playerName} guessed the word!`,
                isSystemMessage: true
            });
        });

        socket.on(socketEvents.WORD_REVEALED, (data) => {
            addMessage({
                id: Date.now(),
                playerName: 'GAME',
                message: `The word was: ${data.word}`,
                isSystemMessage: true
            });
        });

        socket.on('guess_feedback', (data) => {
            if (data.feedback === 'close') {
                addMessage({
                    id: Date.now(),
                    playerName: 'HINT',
                    message: `🔥 ${data.playerName} is close!`,
                    isSystemMessage: true
                });
            }
        });

        socket.on('drawing_liked', (data) => {
            setLikes(data.totalLikes);
            setLikedBy(data.likedBy);
            addMessage({
                id: Date.now(),
                playerName: 'REACTION',
                message: `❤️ ${data.playerName} likes the drawing!`,
                isSystemMessage: true
            });
        });

        socket.on('drawing_disliked', (data) => {
            setDislikes(data.totalDislikes);
        });

        return () => {
            socket.off(socketEvents.CHAT_MESSAGE);
            socket.off(socketEvents.CORRECT_GUESS);
            socket.off(socketEvents.WORD_REVEALED);
            socket.off('guess_feedback');
            socket.off('drawing_liked');
            socket.off('drawing_disliked');
        };
    }, [addMessage]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = () => {
        if (!inputValue.trim()) return;

        const message = inputValue.trim();
        setInputValue('');

        // Check if message is a guess (only for non-drawers during drawing phase)
        if (!isCurrentDrawer && gameState === 'DRAWING') {
            socket.emit(socketEvents.GUESS_WORD, {
                roomId,
                guess: message,
                playerId,
                playerName
            });
        } else {
            socket.emit(socketEvents.CHAT_MESSAGE, {
                roomId,
                message,
                playerId,
                playerName
            });
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    const handleLike = () => {
        if (!hasLiked && gameState === 'DRAWING') {
            socket.emit('like_drawing', {
                roomId,
                playerId,
                playerName
            });
            setHasLiked(true);
        }
    };

    const handleDislike = () => {
        if (!hasDisliked && gameState === 'DRAWING') {
            socket.emit('dislike_drawing', {
                roomId,
                playerId
            });
            setHasDisliked(true);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200 shadow overscroll-contain">
            <div className="px-4 py-3 border-b border-gray-200">
                <h3 className="font-bold text-gray-800">Chat & Messages</h3>
                {gameState === 'DRAWING' && !isCurrentDrawer && (
                    <p className="text-sm text-gray-500 mt-1">Type your guess...</p>
                )}
            </div>

            {/* Like/Dislike Buttons - Show during drawing phase */}
            {gameState === 'DRAWING' && !isCurrentDrawer && (
                <div className="px-4 py-2 border-b border-gray-200 flex gap-2">
                    <button
                        onClick={handleLike}
                        disabled={hasLiked}
                        className={`flex-1 px-3 py-2 rounded font-semibold transition ${
                            hasLiked
                                ? 'bg-red-100 text-red-600 cursor-not-allowed'
                                : 'bg-red-50 text-red-600 hover:bg-red-100'
                        }`}
                    >
                        ❤️ Like ({likes})
                    </button>
                    <button
                        onClick={handleDislike}
                        disabled={hasDisliked}
                        className={`flex-1 px-3 py-2 rounded font-semibold transition ${
                            hasDisliked
                                ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        👎 Dislike ({dislikes})
                    </button>
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">No messages yet...</div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`p-2 rounded ${msg.isSystemMessage
                                ? 'bg-yellow-100 text-yellow-800 text-sm font-semibold'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                        >
                            {msg.isSystemMessage ? (
                                <p>{msg.message}</p>
                            ) : (
                                <>
                                    <p className="font-semibold text-sm">{msg.playerName}</p>
                                    <p className="text-sm">{msg.message}</p>
                                </>
                            )}
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {gameState === 'DRAWING' && (
                <div className="px-4 py-3 border-t border-gray-200 flex gap-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={isCurrentDrawer ? "Watch others guess..." : "Type your guess..."}
                        disabled={isCurrentDrawer}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={isCurrentDrawer || !inputValue.trim()}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        Send
                    </button>
                </div>
            )}

            {gameState !== 'DRAWING' && (
                <div className="px-4 py-3 border-t border-gray-200 flex gap-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Chat with other players..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim()}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        Send
                    </button>
                </div>
            )}
        </div>
    );
}
