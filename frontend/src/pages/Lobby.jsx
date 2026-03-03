import React, { useState, useEffect } from 'react';
import { socket, socketEvents } from '../socket/socket';
import { useGameStore } from '../store/useGameStore';
import PlayerList from '../components/PlayerList';

export default function Lobby({ onNavigate, roomData }) {
    const [copied, setCopied] = useState(false);

    const {
        roomId: storedRoomId,
        playerId,
        isHost,
        setRoomId,
        setIsHost,
        setPlayers
    } = useGameStore();

    const roomId = storedRoomId || roomData?.roomId;

    useEffect(() => {
        if (roomData) {
            setRoomId(roomData.roomId);
            setIsHost(roomData.room.players[0].id === playerId);
            setPlayers(roomData.room.players);
        }
    }, [roomData, setRoomId, setIsHost, setPlayers, playerId]);

    useEffect(() => {
        socket.on(socketEvents.PLAYER_JOINED, (data) => {
            setPlayers(data.players);
        });

        socket.on(socketEvents.GAME_STARTED, (data) => {
            setPlayers(data.players);
            onNavigate('game', data);
        });

        socket.on(socketEvents.ERROR, (data) => {
            console.error('Error:', data.message);
        });

        return () => {
            socket.off(socketEvents.PLAYER_JOINED);
            socket.off(socketEvents.GAME_STARTED);
            socket.off(socketEvents.ERROR);
        };
    }, [onNavigate, setPlayers]);

    const handleStartGame = () => {
        socket.emit(socketEvents.START_GAME, { roomId });
    };

    const handleCopyRoomId = () => {
        navigator.clipboard.writeText(roomId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const players = useGameStore((state) => state.players);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center text-white mb-8">
                    <h1 className="text-5xl font-bold mb-2">🎨 Together</h1>
                    <p className="text-xl opacity-90">Room Ready!</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Room Info */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Room Code</h2>
                            <div className="flex items-center gap-4">
                                <div className="text-5xl font-bold text-blue-600 font-mono tracking-widest">
                                    {roomId}
                                </div>
                                <button
                                    onClick={handleCopyRoomId}
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                                >
                                    {copied ? '✓ Copied!' : 'Copy'}
                                </button>
                            </div>
                            <p className="text-gray-600 text-sm mt-4">
                                Share this code with friends to join your room
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Game Settings</h2>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                    <span className="font-semibold text-gray-700">Rounds per Game</span>
                                    <span className="text-xl font-bold text-blue-600">3</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                    <span className="font-semibold text-gray-700">Time per Round</span>
                                    <span className="text-xl font-bold text-blue-600">90 seconds</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                    <span className="font-semibold text-gray-700">Players Required</span>
                                    <span className="text-xl font-bold text-blue-600">2-8</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Players and Start Button */}
                    <div className="lg:col-span-1">
                        <PlayerList />

                        {isHost && players.length >= 2 && (
                            <button
                                onClick={handleStartGame}
                                className="w-full mt-4 px-6 py-4 bg-green-500 text-white font-bold text-lg rounded-lg hover:bg-green-600 transition"
                            >
                                🎮 Start Game
                            </button>
                        )}

                        {!isHost && (
                            <div className="mt-4 p-4 bg-blue-100 border border-blue-400 text-blue-800 rounded">
                                <p className="text-sm">Waiting for host to start the game...</p>
                            </div>
                        )}

                        {isHost && players.length < 2 && (
                            <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded">
                                <p className="text-sm">Need at least 2 players to start</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
