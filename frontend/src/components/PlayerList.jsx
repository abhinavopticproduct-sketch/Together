import React, { useEffect } from 'react';
import { socket, socketEvents } from '../socket/socket';
import { useGameStore } from '../store/useGameStore';

export default function PlayerList() {
    const { players, currentDrawer, playerId } = useGameStore();

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow">
            <h3 className="font-bold text-gray-800 mb-4">Players ({players.length})</h3>
            
            <div className="space-y-2">
                {players.length === 0 ? (
                    <div className="text-gray-500 text-sm py-4">Waiting for players...</div>
                ) : (
                    players.map((player) => (
                        <div
                            key={player.id}
                            className={`p-3 rounded-lg border-2 flex items-center justify-between ${
                                currentDrawer?.id === player.id
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 bg-gray-50'
                            }`}
                        >
                            <div className="flex items-center gap-2 flex-1">
                                <span className="text-lg">
                                    {currentDrawer?.id === player.id ? '🎨' : '👤'}
                                </span>
                                <span className="font-semibold text-gray-800">
                                    {player.name}
                                    {player.id === playerId && ' (You)'}
                                </span>
                            </div>
                            {currentDrawer?.id === player.id && (
                                <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">
                                    Drawing
                                </span>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
