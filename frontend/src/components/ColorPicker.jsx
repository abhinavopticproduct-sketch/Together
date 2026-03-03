import React from 'react';
import { useGameStore } from '../store/useGameStore';

export default function ColorPicker() {
    const { selectedColor, brushSize, setSelectedColor, setBrushSize, currentDrawer, playerId, gameState } = useGameStore();

    const isCurrentDrawer = currentDrawer?.id === playerId;
    const canDraw = isCurrentDrawer && gameState === 'DRAWING';

    const colors = [
        '#000000', // Black
        '#FFFFFF', // White
        '#FF0000', // Red
        '#00FF00', // Green
        '#0000FF', // Blue
        '#FFFF00', // Yellow
        '#FF00FF', // Magenta
        '#00FFFF', // Cyan
        '#FFA500', // Orange
        '#800080'  // Purple
    ];

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow">
            <h3 className="font-bold text-gray-800 mb-4">Drawing Tools</h3>

            {canDraw ? (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Color
                        </label>
                        <div className="grid grid-cols-5 gap-2">
                            {colors.map((color) => (
                                <button
                                    key={color}
                                    onClick={() => setSelectedColor(color)}
                                    className={`w-10 h-10 rounded border-2 transition ${
                                        selectedColor === color
                                            ? 'border-black scale-110'
                                            : 'border-gray-300'
                                    }`}
                                    style={{ backgroundColor: color }}
                                    title={color}
                                />
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Brush Size: {brushSize}px
                        </label>
                        <input
                            type="range"
                            min="1"
                            max="20"
                            value={brushSize}
                            onChange={(e) => setBrushSize(parseInt(e.target.value))}
                            className="w-full cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Thin</span>
                            <span>Thick</span>
                        </div>
                    </div>

                    <div>
                        <button
                            className="w-full px-3 py-2 bg-white text-gray-800 border-2 border-gray-300 rounded hover:bg-gray-100 text-sm font-semibold"
                            disabled
                            title="Eraser tool"
                        >
                            🧹 Eraser (Use white color)
                        </button>
                    </div>
                </div>
            ) : (
                <div className="text-center text-gray-500 py-4">
                    <p>You can use drawing tools when it's your turn to draw.</p>
                </div>
            )}
        </div>
    );
}
