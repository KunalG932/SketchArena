import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface Player {
  id: string;
  name: string;
  coins: number;
  score: number;
  isReady: boolean;
  isOnline: boolean;
  hasGuessed: boolean;
}

interface Message {
  id: string;
  user: string;
  text: string;
  isCorrectGuess?: boolean;
  timestamp: Date;
  points?: number;
}

interface GameState {
  gameState: 'waiting' | 'playing' | 'finished';
  currentRound: number;
  totalRounds: number;
  currentDrawer: string | null;
  currentWord: string | null;
  timeLeft: number;
  players: Player[];
}

interface ResultPlayer {
  id: string;
  name: string;
  finalScore: number;
  coinsEarned: number;
  correctGuesses: number;
}

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [gameState, setGameState] = useState<GameState>({
    gameState: 'waiting',
    currentRound: 0,
    totalRounds: 5,
    currentDrawer: null,
    currentWord: null,
    timeLeft: 0,
    players: []
  });
  const [gameResults, setGameResults] = useState<ResultPlayer[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  useEffect(() => {
    // Connect to Socket.IO server
    socketRef.current = io(process.env.NODE_ENV === 'production' 
      ? 'https://your-vercel-app.vercel.app' 
      : 'http://localhost:3001'
    );

    const socket = socketRef.current;

    socket.on('connect', () => {
      setIsConnected(true);
      setCurrentUserId(socket.id);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('room-created', ({ roomCode: code, players: roomPlayers }) => {
      setRoomCode(code);
      setPlayers(roomPlayers);
    });

    socket.on('room-joined', ({ roomCode: code, players: roomPlayers }) => {
      setRoomCode(code);
      setPlayers(roomPlayers);
    });

    socket.on('join-error', ({ message }) => {
      alert(`Error joining room: ${message}`);
    });

    socket.on('player-joined', ({ players: roomPlayers }) => {
      setPlayers(roomPlayers);
    });

    socket.on('player-left', ({ players: roomPlayers }) => {
      setPlayers(roomPlayers);
    });

    socket.on('player-ready-update', ({ players: roomPlayers }) => {
      setPlayers(roomPlayers);
    });

    socket.on('game-started', (newGameState) => {
      setGameState(newGameState);
      setMessages([{
        id: Date.now().toString(),
        user: 'System',
        text: `Round ${newGameState.currentRound} started! Start guessing!`,
        timestamp: new Date()
      }]);
    });

    socket.on('next-round', (newGameState) => {
      setGameState(prev => ({ ...prev, ...newGameState }));
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        user: 'System',
        text: `Round ${newGameState.currentRound} started!`,
        timestamp: new Date()
      }]);
    });

    socket.on('timer-update', ({ timeLeft }) => {
      setGameState(prev => ({ ...prev, timeLeft }));
    });

    socket.on('new-message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    socket.on('correct-guess', ({ playerName, points, players: roomPlayers }) => {
      setPlayers(roomPlayers);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        user: 'System',
        text: `${playerName} guessed correctly! +${points} points`,
        timestamp: new Date()
      }]);
    });

    socket.on('drawing-update', ({ drawingData }) => {
      // This will be handled by the drawing canvas component
      window.dispatchEvent(new CustomEvent('drawing-update', { detail: drawingData }));
    });

    socket.on('game-finished', ({ results }) => {
      setGameResults(results);
      setGameState(prev => ({ ...prev, gameState: 'finished' }));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const createRoom = (playerName: string, coins: number) => {
    if (socketRef.current) {
      socketRef.current.emit('create-room', { playerName, coins });
    }
  };

  const joinRoom = (roomCode: string, playerName: string, coins: number) => {
    if (socketRef.current) {
      socketRef.current.emit('join-room', { roomCode, playerName, coins });
    }
  };

  const setPlayerReady = () => {
    if (socketRef.current && roomCode) {
      socketRef.current.emit('player-ready', { roomCode });
    }
  };

  const startGame = () => {
    if (socketRef.current && roomCode) {
      socketRef.current.emit('start-game', { roomCode });
    }
  };

  const sendDrawingData = (drawingData: string) => {
    if (socketRef.current && roomCode) {
      socketRef.current.emit('drawing-data', { roomCode, drawingData });
    }
  };

  const sendGuess = (guess: string) => {
    if (socketRef.current && roomCode) {
      socketRef.current.emit('send-guess', { roomCode, guess });
    }
  };

  const sendMessage = (message: string) => {
    if (socketRef.current && roomCode) {
      socketRef.current.emit('send-message', { roomCode, message });
    }
  };

  return {
    isConnected,
    roomCode,
    players,
    messages,
    gameState,
    gameResults,
    currentUserId,
    createRoom,
    joinRoom,
    setPlayerReady,
    startGame,
    sendDrawingData,
    sendGuess,
    sendMessage
  };
};