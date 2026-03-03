import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const socket = io(SOCKET_URL, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 10,
    transports: ['websocket']
});

export const socketEvents = {
    // Client -> Server
    CREATE_ROOM: 'create_room',
    JOIN_ROOM: 'join_room',
    START_GAME: 'start_game',
    CHOOSE_WORD: 'choose_word',
    DRAW: 'draw',
    CLEAR_CANVAS: 'clear_canvas',
    CHAT_MESSAGE: 'chat_message',
    GUESS_WORD: 'guess_word',
    LIKE_DRAWING: 'like_drawing',
    DISLIKE_DRAWING: 'dislike_drawing',
    
    // Server -> Client
    ROOM_JOINED: 'room_joined',
    PLAYER_JOINED: 'player_joined',
    PLAYER_LEFT: 'player_left',
    GAME_STARTED: 'game_started',
    WORD_OPTIONS: 'word_options',
    WORD_SELECTION_TIMER: 'word_selection_timer',
    NEW_ROUND: 'new_round',
    DRAW: 'draw',
    CORRECT_GUESS: 'correct_guess',
    WORD_REVEALED: 'word_revealed',
    GUESS_FEEDBACK: 'guess_feedback',
    UPDATE_SCORES: 'update_scores',
    TIMER_UPDATE: 'timer_update',
    ROUND_END: 'round_end',
    GAME_END: 'game_end',
    CLEAR_CANVAS: 'clear_canvas',
    CHAT_MESSAGE: 'chat_message',
    DRAWING_LIKED: 'drawing_liked',
    DRAWING_DISLIKED: 'drawing_disliked',
    ERROR: 'error'
};

export default socket;
