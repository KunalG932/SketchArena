import { Server } from 'socket.io';
import { createServer } from 'http';

const rooms = new Map();
const players = new Map();

const words = [
  'ELEPHANT', 'BUTTERFLY', 'RAINBOW', 'MOUNTAIN', 'OCEAN', 'GUITAR', 'PIZZA', 'ROCKET',
  'FLOWER', 'CASTLE', 'DRAGON', 'BICYCLE', 'SUNSET', 'PENGUIN', 'LIGHTHOUSE', 'TREASURE'
];

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function getRandomWord() {
  return words[Math.floor(Math.random() * words.length)];
}

function createRoom(hostId, hostName) {
  const roomCode = generateRoomCode();
  const room = {
    code: roomCode,
    hostId,
    players: new Map(),
    gameState: 'waiting', // waiting, playing, finished
    currentRound: 0,
    totalRounds: 5,
    currentDrawer: null,
    currentWord: null,
    timeLeft: 0,
    roundStartTime: null,
    scores: new Map()
  };
  
  rooms.set(roomCode, room);
  return room;
}

function addPlayerToRoom(roomCode, playerId, playerName, coins = 100) {
  const room = rooms.get(roomCode);
  if (!room) return null;
  
  const player = {
    id: playerId,
    name: playerName,
    coins,
    score: 0,
    isReady: false,
    isOnline: true,
    hasGuessed: false
  };
  
  room.players.set(playerId, player);
  room.scores.set(playerId, 0);
  players.set(playerId, { roomCode, ...player });
  
  return room;
}

function startGame(roomCode) {
  const room = rooms.get(roomCode);
  if (!room || room.players.size < 2) return false;
  
  room.gameState = 'playing';
  room.currentRound = 1;
  room.currentDrawer = Array.from(room.players.keys())[0];
  room.currentWord = getRandomWord();
  room.timeLeft = 90;
  room.roundStartTime = Date.now();
  
  // Reset player states
  room.players.forEach(player => {
    player.hasGuessed = false;
  });
  
  return true;
}

function nextRound(roomCode) {
  const room = rooms.get(roomCode);
  if (!room) return false;
  
  if (room.currentRound >= room.totalRounds) {
    room.gameState = 'finished';
    return true;
  }
  
  room.currentRound++;
  const playerIds = Array.from(room.players.keys());
  const currentDrawerIndex = playerIds.indexOf(room.currentDrawer);
  room.currentDrawer = playerIds[(currentDrawerIndex + 1) % playerIds.length];
  room.currentWord = getRandomWord();
  room.timeLeft = 90;
  room.roundStartTime = Date.now();
  
  // Reset player states
  room.players.forEach(player => {
    player.hasGuessed = false;
  });
  
  return true;
}

function handleGuess(roomCode, playerId, guess) {
  const room = rooms.get(roomCode);
  if (!room || room.gameState !== 'playing' || playerId === room.currentDrawer) {
    return { correct: false, points: 0 };
  }
  
  const player = room.players.get(playerId);
  if (!player || player.hasGuessed) {
    return { correct: false, points: 0 };
  }
  
  const isCorrect = guess.toLowerCase().trim() === room.currentWord.toLowerCase();
  
  if (isCorrect) {
    player.hasGuessed = true;
    const timeBonus = Math.max(0, Math.floor((room.timeLeft / 90) * 50));
    const points = 50 + timeBonus;
    
    player.score += points;
    player.coins += Math.floor(points / 2);
    room.scores.set(playerId, player.score);
    
    // Award points to drawer too
    const drawer = room.players.get(room.currentDrawer);
    if (drawer) {
      drawer.score += 25;
      drawer.coins += 12;
      room.scores.set(room.currentDrawer, drawer.score);
    }
    
    return { correct: true, points };
  }
  
  return { correct: false, points: 0 };
}

export default function handler(req, res) {
  if (!res.socket.server.io) {
    console.log('Setting up Socket.IO server...');
    
    const httpServer = createServer();
    const io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });
    
    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);
      
      socket.on('create-room', ({ playerName, coins }) => {
        const room = createRoom(socket.id, playerName);
        addPlayerToRoom(room.code, socket.id, playerName, coins);
        
        socket.join(room.code);
        socket.emit('room-created', {
          roomCode: room.code,
          players: Array.from(room.players.values())
        });
      });
      
      socket.on('join-room', ({ roomCode, playerName, coins }) => {
        const room = addPlayerToRoom(roomCode, socket.id, playerName, coins);
        
        if (room) {
          socket.join(roomCode);
          socket.emit('room-joined', {
            roomCode,
            players: Array.from(room.players.values())
          });
          
          socket.to(roomCode).emit('player-joined', {
            player: room.players.get(socket.id),
            players: Array.from(room.players.values())
          });
        } else {
          socket.emit('join-error', { message: 'Room not found' });
        }
      });
      
      socket.on('player-ready', ({ roomCode }) => {
        const room = rooms.get(roomCode);
        if (room && room.players.has(socket.id)) {
          room.players.get(socket.id).isReady = true;
          
          io.to(roomCode).emit('player-ready-update', {
            playerId: socket.id,
            players: Array.from(room.players.values())
          });
        }
      });
      
      socket.on('start-game', ({ roomCode }) => {
        const room = rooms.get(roomCode);
        if (room && room.hostId === socket.id) {
          if (startGame(roomCode)) {
            io.to(roomCode).emit('game-started', {
              gameState: room.gameState,
              currentRound: room.currentRound,
              totalRounds: room.totalRounds,
              currentDrawer: room.currentDrawer,
              currentWord: room.currentWord,
              timeLeft: room.timeLeft,
              players: Array.from(room.players.values())
            });
            
            // Start timer
            const timer = setInterval(() => {
              room.timeLeft--;
              
              if (room.timeLeft <= 0) {
                clearInterval(timer);
                
                if (nextRound(roomCode)) {
                  if (room.gameState === 'finished') {
                    const results = Array.from(room.players.values())
                      .sort((a, b) => b.score - a.score)
                      .map(player => ({
                        id: player.id,
                        name: player.name,
                        finalScore: player.score,
                        coinsEarned: Math.floor(player.score / 2),
                        correctGuesses: 0 // This would need tracking
                      }));
                    
                    io.to(roomCode).emit('game-finished', { results });
                  } else {
                    io.to(roomCode).emit('next-round', {
                      currentRound: room.currentRound,
                      currentDrawer: room.currentDrawer,
                      currentWord: room.currentWord,
                      timeLeft: room.timeLeft,
                      players: Array.from(room.players.values())
                    });
                  }
                }
              } else {
                io.to(roomCode).emit('timer-update', { timeLeft: room.timeLeft });
              }
            }, 1000);
          }
        }
      });
      
      socket.on('drawing-data', ({ roomCode, drawingData }) => {
        socket.to(roomCode).emit('drawing-update', { drawingData });
      });
      
      socket.on('send-guess', ({ roomCode, guess }) => {
        const room = rooms.get(roomCode);
        if (room) {
          const player = room.players.get(socket.id);
          if (player) {
            const result = handleGuess(roomCode, socket.id, guess);
            
            const message = {
              id: Date.now().toString(),
              user: player.name,
              text: guess,
              isCorrectGuess: result.correct,
              timestamp: new Date(),
              points: result.points
            };
            
            io.to(roomCode).emit('new-message', message);
            
            if (result.correct) {
              io.to(roomCode).emit('correct-guess', {
                playerId: socket.id,
                playerName: player.name,
                points: result.points,
                players: Array.from(room.players.values())
              });
            }
          }
        }
      });
      
      socket.on('send-message', ({ roomCode, message }) => {
        const room = rooms.get(roomCode);
        if (room) {
          const player = room.players.get(socket.id);
          if (player) {
            const chatMessage = {
              id: Date.now().toString(),
              user: player.name,
              text: message,
              isCorrectGuess: false,
              timestamp: new Date()
            };
            
            io.to(roomCode).emit('new-message', chatMessage);
          }
        }
      });
      
      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        
        const playerData = players.get(socket.id);
        if (playerData) {
          const room = rooms.get(playerData.roomCode);
          if (room) {
            room.players.delete(socket.id);
            socket.to(playerData.roomCode).emit('player-left', {
              playerId: socket.id,
              players: Array.from(room.players.values())
            });
            
            if (room.players.size === 0) {
              rooms.delete(playerData.roomCode);
            }
          }
          players.delete(socket.id);
        }
      });
    });
    
    res.socket.server.io = io;
  }
  
  res.end();
}