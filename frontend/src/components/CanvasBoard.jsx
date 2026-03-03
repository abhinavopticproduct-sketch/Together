import React, { useRef, useEffect, useState } from 'react';
import { socket, socketEvents } from '../socket/socket';
import { useGameStore } from '../store/useGameStore';

export default function CanvasBoard() {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [context, setContext] = useState(null);
    
    const {
        roomId,
        playerId,
        currentDrawer,
        gameState,
        selectedColor,
        brushSize,
        addDrawingData,
        clearDrawingData
    } = useGameStore();

    const isCurrentDrawer = currentDrawer?.id === playerId;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = 800;
        canvas.height = 600;

        const ctx = canvas.getContext('2d');
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        setContext(ctx);
    }, []);

    // Listen for remote drawings
    useEffect(() => {
        socket.on(socketEvents.DRAW, (drawData) => {
            if (context) {
                drawOnCanvas(drawData, false);
            }
        });

        socket.on(socketEvents.CLEAR_CANVAS, () => {
            if (context) {
                context.fillStyle = 'white';
                context.fillRect(0, 0, 800, 600);
            }
        });

        return () => {
            socket.off(socketEvents.DRAW);
            socket.off(socketEvents.CLEAR_CANVAS);
        };
    }, [context]);

    const drawOnCanvas = (drawData, isLocal = false) => {
        if (!context) return;

        const { x, y, prevX, prevY, color, thickness, type, isEraser } = drawData;

        context.strokeStyle = isEraser ? 'white' : color;
        context.lineWidth = thickness;

        if (type === 'draw' || type === 'erase') {
            context.beginPath();
            context.moveTo(prevX, prevY);
            context.lineTo(x, y);
            context.stroke();
        }

        if (type === 'clear') {
            context.fillStyle = 'white';
            context.fillRect(0, 0, 800, 600);
        }
    };

    const handleMouseDown = (e) => {
        if (!isCurrentDrawer || gameState !== 'DRAWING') return;

        setIsDrawing(true);
    };

    // touch equivalents
    const handleTouchStart = (e) => {
        if (!isCurrentDrawer || gameState !== 'DRAWING') return;
        e.preventDefault();
        setIsDrawing(true);
    };

    const handleMouseMove = (e) => {
        if (!isDrawing || !isCurrentDrawer || gameState !== 'DRAWING') return;

        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const prevX = e.nativeEvent.movementX ? x - e.nativeEvent.movementX : x;
        const prevY = e.nativeEvent.movementY ? y - e.nativeEvent.movementY : y;

        const drawData = {
            x,
            y,
            prevX,
            prevY,
            color: selectedColor,
            thickness: brushSize,
            type: 'draw',
            isEraser: false
        };

        drawOnCanvas(drawData, true);
        addDrawingData(drawData);

        socket.emit(socketEvents.DRAW, {
            roomId,
            drawData
        });
    };

    // touch move
    const handleTouchMove = (e) => {
        if (!isDrawing || !isCurrentDrawer || gameState !== 'DRAWING') return;
        e.preventDefault();
        const touch = e.touches[0];
        const rect = canvasRef.current.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;

        // approximate previous point using movement from last touch
        const prevX = x;
        const prevY = y;

        const drawData = {
            x,
            y,
            prevX,
            prevY,
            color: selectedColor,
            thickness: brushSize,
            type: 'draw',
            isEraser: false
        };

        drawOnCanvas(drawData, true);
        addDrawingData(drawData);

        socket.emit(socketEvents.DRAW, {
            roomId,
            drawData
        });
    };

    const handleMouseUp = () => {
        setIsDrawing(false);
    };

    const handleTouchEnd = (e) => {
        setIsDrawing(false);
        e.preventDefault();
    };

    const handleClearCanvas = () => {
        if (!isCurrentDrawer) return;

        if (context) {
            context.fillStyle = 'white';
            context.fillRect(0, 0, 800, 600);
        }

        clearDrawingData();
        socket.emit(socketEvents.CLEAR_CANVAS, { roomId });
    };

    const canDraw = isCurrentDrawer && gameState === 'DRAWING';

    return (
        <div className="flex flex-col items-center gap-4 bg-gray-100 p-4 rounded-lg">
            <div className={`border-4 ${canDraw ? 'border-blue-500 bg-white' : 'border-gray-300 bg-gray-50'}`}>
                <canvas
                    ref={canvasRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    className={`block ${canDraw ? 'cursor-crosshair' : 'cursor-not-allowed'}`}
                    style={{ touchAction: 'none' }}
                    width={800}
                    height={600}
                />
            </div>

            {canDraw && (
                <button
                    onClick={handleClearCanvas}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                    Clear Canvas
                </button>
            )}

            {!canDraw && currentDrawer && (
                <div className="text-center text-gray-600">
                    {currentDrawer.name} is drawing...
                </div>
            )}
        </div>
    );
}
