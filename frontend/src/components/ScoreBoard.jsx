import React from 'react';
import { useGameStore } from '../store/useGameStore';

export default function ScoreBoard() {
    const { players } = useGameStore();

    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow">
            <h3 className="font-bold text-gray-800 mb-4">Scores 🏆</h3>
            
            <div className="space-y-2">
                {sortedPlayers.length === 0 ? (
                    <div className="text-gray-500 text-sm py-4">No scores yet...</div>
                ) : (
                    sortedPlayers.map((player, index) => (
                        <div
                            key={player.id}
                            className={`p-3 rounded-lg flex items-center justify-between ${
                                index === 0
                                    ? 'bg-yellow-100 border-2 border-yellow-400'
                                    : index === 1
                                    ? 'bg-gray-100 border-2 border-gray-300'
                                    : index === 2
                                    ? 'bg-orange-50 border-2 border-orange-300'
                                    : 'bg-gray-50 border border-gray-200'
                            }`}
                        >
                            <div className="flex items-center gap-2 flex-1">
                                <span className="text-lg font-bold">#{index + 1}</span>
                                <span className="font-semibold text-gray-800">{player.name}</span>
                            </div>
                            <span className="font-bold text-lg bg-white px-3 py-1 rounded">
                                {player.score}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
