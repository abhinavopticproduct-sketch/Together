import React, { useState } from 'react';
import { socket, socketEvents } from '../socket/socket';
import { useGameStore } from '../store/useGameStore';

export default function Home({ onNavigate }) {
    const [playerName, setPlayerName] = useState('');
    const [roomId, setRoomId] = useState('');
    const [isJoining, setIsJoining] = useState(false);
    const [error, setError] = useState('');

    const { setPlayerId, setPlayerName: setStoredPlayerName } = useGameStore();

    const generatePlayerId = () => `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const handleCreateRoom = () => {
        if (!playerName.trim()) {
            setError('Please enter your name');
            return;
        }

        const playerId = generatePlayerId();
        setPlayerId(playerId);
        setStoredPlayerName(playerName);

        socket.emit(socketEvents.CREATE_ROOM, {
            playerName: playerName.trim(),
            playerId
        });

        socket.once(socketEvents.ROOM_JOINED, (data) => {
            onNavigate('lobby', data);
        });

        socket.once(socketEvents.ERROR, (data) => {
            setError(data.message);
        });
    };

    const handleJoinRoom = () => {
        if (!playerName.trim()) {
            setError('Please enter your name');
            return;
        }

        if (!roomId.trim()) {
            setError('Please enter a room ID');
            return;
        }

        const playerId = generatePlayerId();
        setPlayerId(playerId);
        setStoredPlayerName(playerName);

        socket.emit(socketEvents.JOIN_ROOM, {
            roomId: roomId.trim().toUpperCase(),
            playerName: playerName.trim(),
            playerId
        });

        socket.once(socketEvents.ROOM_JOINED, (data) => {
            onNavigate('lobby', data);
        });

        socket.once(socketEvents.ERROR, (data) => {
            setError(data.message);
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
                <h1 className="text-4xl font-bold text-center text-gray-800 mb-2">
                    🎨 Together
                </h1>
                <p className="text-center text-gray-600 mb-8">
                    Real-time Multiplayer Drawing Game
                </p>

                {error && (
                    <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}

                <div className="space-y-6">
                    <input
                        type="text"
                        placeholder="Enter your name"
                        value={playerName}
                        onChange={(e) => {
                            setPlayerName(e.target.value);
                            setError('');
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && !isJoining) {
                                handleCreateRoom();
                            }
                        }}
                    />

                    <button
                        onClick={handleCreateRoom}
                        className="w-full px-4 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition"
                    >
                        ➕ Create Room
                    </button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">OR</span>
                        </div>
                    </div>

                    <input
                        type="text"
                        placeholder="Enter room ID"
                        value={roomId}
                        onChange={(e) => {
                            setRoomId(e.target.value);
                            setError('');
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && !isJoining) {
                                handleJoinRoom();
                            }
                        }}
                    />

                    <button
                        onClick={handleJoinRoom}
                        className="w-full px-4 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition"
                    >
                        🔗 Join Room
                    </button>
                </div>

                <div className="mt-8 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
                    <p className="font-semibold mb-2">How to Play:</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Create or join a room</li>
                        <li>Wait for players to join</li>
                        <li>Take turns drawing words</li>
                        <li>Others guess your drawing</li>
                        <li>Earn points for correct guesses!</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
