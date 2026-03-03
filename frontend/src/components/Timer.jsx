import React, { useEffect } from 'react';
import { socket, socketEvents } from '../socket/socket';
import { useGameStore } from '../store/useGameStore';

export default function Timer() {
    const { timer, wordSelectionTimer, gameState, setTimer, setWordSelectionTimer } = useGameStore();

    useEffect(() => {
        socket.on(socketEvents.TIMER_UPDATE, (data) => {
            setTimer(data.time);
        });

        socket.on(socketEvents.WORD_SELECTION_TIMER, (data) => {
            setWordSelectionTimer(data.time);
        });

        return () => {
            socket.off(socketEvents.TIMER_UPDATE);
            socket.off(socketEvents.WORD_SELECTION_TIMER);
        };
    }, [setTimer, setWordSelectionTimer]);

    const displayTime = wordSelectionTimer > 0 ? wordSelectionTimer : timer;
    const isWarning = displayTime < 10 && displayTime > 0;

    return (
        <div className={`text-center p-4 rounded-lg font-bold text-4xl ${
            isWarning ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
        }`}>
            ⏱ {displayTime}s
        </div>
    );
}
