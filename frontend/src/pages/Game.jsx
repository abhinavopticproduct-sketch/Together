import React, { useState, useEffect } from 'react';
import { socket, socketEvents } from '../socket/socket';
import { useGameStore } from '../store/useGameStore';
import CanvasBoard from '../components/CanvasBoard';
import ChatBox from '../components/ChatBox';
import Timer from '../components/Timer';
import ColorPicker from '../components/ColorPicker';
import PlayerList from '../components/PlayerList';
import ScoreBoard from '../components/ScoreBoard';

export default function Game({ onNavigate, gameData }) {
    const [showWordOptions, setShowWordOptions] = useState(false);
    const [likesThisRound, setLikesThisRound] = useState(0);
    const [dislikesThisRound, setDislikesThisRound] = useState(0);
    const [hintMessage, setHintMessage] = useState(''); // display AI hint / close feedback

    const {
        roomId: storedRoomId,
        playerId,
        gameState,
        setGameState,
        setPlayers,
        setCurrentDrawer,
        setRound,
        setCurrentWord,
        setMaskedWord,
        setWordOptions,
        currentDrawer,
        wordOptions,
        maskedWord
    } = useGameStore();

    const roomId = storedRoomId;
    const isCurrentDrawer = currentDrawer?.id === playerId;

    useEffect(() => {
        if (gameData) {
            setPlayers(gameData.players);
            setCurrentDrawer(gameData.currentDrawer || gameData.drawer);
            setGameState('DRAWING');
        }
    }, [gameData, setPlayers, setCurrentDrawer, setGameState]);

    useEffect(() => {
        socket.on(socketEvents.NEW_ROUND, (data) => {
            setMaskedWord(data.maskedWord);
            setCurrentDrawer(data.drawer);
            setRound(data.round);
            setGameState('DRAWING');
            setShowWordOptions(false);
            // Reset likes/dislikes for new round
            setLikesThisRound(0);
            setDislikesThisRound(0);
        });

        socket.on(socketEvents.WORD_OPTIONS, (data) => {
            setWordOptions(data.options);
            setShowWordOptions(true);
        });

        socket.on(socketEvents.CORRECT_GUESS, (data) => {
            setPlayers(data.players);
        });

        socket.on(socketEvents.ROUND_END, (data) => {
            setGameState('ROUND_END');
            setPlayers(data.players);
            setShowWordOptions(false);
            // Reset likes/dislikes for next round
            setLikesThisRound(0);
            setDislikesThisRound(0);
        });

        socket.on(socketEvents.GAME_END, (data) => {
            setGameState('GAME_END');
            setPlayers(data.players);
            setShowWordOptions(false);
        });

        // hint from server when someone is close
        socket.on('guess_feedback', (data) => {
            const msg = `🔥 ${data.playerName} is close!`;
            setHintMessage(msg);
            // clear after a few seconds so it doesn't linger
            setTimeout(() => setHintMessage(''), 4000);
            // also add to chat so mobile users can see in messages history
            addMessage({ id: Date.now(), playerName: 'HINT', message: msg, isSystemMessage: true });
        });

        return () => {
            socket.off(socketEvents.NEW_ROUND);
            socket.off(socketEvents.WORD_OPTIONS);
            socket.off(socketEvents.CORRECT_GUESS);
            socket.off(socketEvents.ROUND_END);
            socket.off(socketEvents.GAME_END);
        };
    }, [setMaskedWord, setCurrentDrawer, setRound, setGameState, setWordOptions, setPlayers]);

    const handleChooseWord = (word) => {
        socket.emit(socketEvents.CHOOSE_WORD, {
            roomId,
            word
        });
        // Set the current word locally for the drawer so they can see it immediately
        setCurrentWord(word);
        const masked = word.split('').map(() => '_').join(' ');
        setMaskedWord(masked);
        setShowWordOptions(false);
    };

    const handleReturnHome = () => {
        window.location.reload();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4">
            {/* Word Selection Modal */}
            {showWordOptions && isCurrentDrawer && wordOptions.length > 0 && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-xl">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Choose a Word</h2>
                        <div className="space-y-3 mb-4">
                            {wordOptions.map((word, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleChooseWord(word)}
                                    className="w-full px-6 py-4 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition text-lg"
                                >
                                    {word}
                                </button>
                            ))}
                        </div>
                        <p className="text-gray-500 text-sm text-center">
                            Choose one of these words to draw!
                        </p>
                    </div>
                </div>
            )}

            {gameState === 'ROUND_END' && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-xl">
                        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Round End</h2>
                        <p className="text-center text-gray-600 mb-6">Next round starting soon...</p>
                        <ScoreBoard />
                    </div>
                </div>
            )}

            {gameState === 'GAME_END' && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-xl">
                        <h2 className="text-3xl font-bold text-center text-gold mb-6">🎉 Game Over!</h2>
                        <ScoreBoard />
                        <button
                            onClick={handleReturnHome}
                            className="w-full mt-6 px-6 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600"
                        >
                            Return Home
                        </button>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-white text-center mb-4">
                    <h1 className="text-3xl font-bold">🎨 Together</h1>
                    <p className="text-lg">Room: <span className="font-mono">{roomId}</span></p>
                </div>

                {/* Main Game Area */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Canvas and Canvas Controls */}
                    <div className="xl:col-span-3 space-y-4">
                        {/* Top Bar */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Timer />
                    <div className="bg-white rounded-lg p-4 shadow text-center">
                        <p className="text-sm text-gray-600 mb-1">Current Word</p>
                        <p className="text-3xl font-mono font-bold text-blue-600 tracking-widest">
                            {isCurrentDrawer ? (useGameStore.getState().currentWord || maskedWord || '_ _ _') : (maskedWord || '_ _ _')}
                        </p>
                    </div>
                </div>
                {/* hint message banner */}
                {hintMessage && (
                    <div className="mt-2 bg-yellow-300 text-yellow-900 rounded-lg p-2 text-center font-semibold">
                        {hintMessage}
                    </div>
                )}
                        {/* Canvas */}
                        <CanvasBoard />

                        {/* Color Picker */}
                        <ColorPicker />
                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-4">
                        {/* Chat */}
                        <div className="h-96">
                            <ChatBox />
                        </div>

                        {/* Players and Scores */}
                        <PlayerList />
                        <ScoreBoard />
                    </div>
                </div>
            </div>
        </div>
    );
}
