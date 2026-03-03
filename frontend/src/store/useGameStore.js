import { create } from 'zustand';

export const useGameStore = create((set) => ({
    // Room state
    roomId: null,
    playerId: null,
    playerName: null,
    isHost: false,
    
    // Players
    players: [],
    currentDrawer: null,
    
    // Game state
    gameState: 'LOBBY', // LOBBY, CHOOSING, DRAWING, ROUND_END, GAME_END
    round: 1,
    maxRounds: 3,
    currentWord: '',
    maskedWord: '',
    wordOptions: [],
    
    // Timer
    timer: 0,
    wordSelectionTimer: 0,
    
    // Chat
    messages: [],
    
    // Drawing
    drawingData: [],
    
    // UI
    selectedColor: '#000000',
    brushSize: 3,
    
    // Actions
    setRoomId: (roomId) => set({ roomId }),
    setPlayerId: (playerId) => set({ playerId }),
    setPlayerName: (playerName) => set({ playerName }),
    setIsHost: (isHost) => set({ isHost }),
    setPlayers: (players) => set({ players }),
    setCurrentDrawer: (currentDrawer) => set({ currentDrawer }),
    setGameState: (gameState) => set({ gameState }),
    setRound: (round) => set({ round }),
    setCurrentWord: (currentWord) => set({ currentWord }),
    setMaskedWord: (maskedWord) => set({ maskedWord }),
    setWordOptions: (wordOptions) => set({ wordOptions }),
    setTimer: (timer) => set({ timer }),
    setWordSelectionTimer: (wordSelectionTimer) => set({ wordSelectionTimer }),
    addMessage: (message) => set((state) => ({
        messages: [...state.messages, message]
    })),
    clearMessages: () => set({ messages: [] }),
    addDrawingData: (data) => set((state) => ({
        drawingData: [...state.drawingData, data]
    })),
    clearDrawingData: () => set({ drawingData: [] }),
    setSelectedColor: (selectedColor) => set({ selectedColor }),
    setBrushSize: (brushSize) => set({ brushSize }),
    
    // Reset game
    resetGame: () => set({
        gameState: 'LOBBY',
        players: [],
        currentDrawer: null,
        round: 1,
        currentWord: '',
        maskedWord: '',
        wordOptions: [],
        timer: 0,
        wordSelectionTimer: 0,
        messages: [],
        drawingData: []
    })
}));
