import React, { useState } from 'react';
import { Users, Plus, Hash, Play, Coins, Crown } from 'lucide-react';
import { useSocket } from '../hooks/useSocket';

interface GameLobbyProps {
  onStartGame: () => void;
  userCoins: number;
}

export const GameLobby: React.FC<GameLobbyProps> = ({ onStartGame, userCoins }) => {
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [showNameInput, setShowNameInput] = useState(true);
  
  const {
    isConnected,
    roomCode,
    players,
    currentUserId,
    createRoom,
    joinRoom,
    setPlayerReady,
    startGame
  } = useSocket();

  const handleCreateRoom = () => {
    if (playerName.trim()) {
      createRoom(playerName.trim(), userCoins);
      setShowNameInput(false);
    }
  };

  const handleJoinRoom = () => {
    if (roomCodeInput.length >= 4 && playerName.trim()) {
      joinRoom(roomCodeInput.toUpperCase(), playerName.trim(), userCoins);
      setShowNameInput(false);
    }
  };

  const handleStartGame = () => {
    startGame();
    onStartGame();
  };

  const currentPlayer = players.find(p => p.id === currentUserId);
  const isHost = players.length > 0 && players[0].id === currentUserId;
  const canStartGame = players.length >= 2 && players.filter(p => p.isReady).length >= 2;

  if (showNameInput) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 w-full max-w-md border border-white/20 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">SketchArena</h1>
            <p className="text-blue-200">Draw, Guess, Win Coins!</p>
          </div>

          <div className="flex items-center justify-center mb-6 bg-yellow-500/20 rounded-2xl p-4">
            <Coins className="text-yellow-400 mr-2" size={24} />
            <span className="text-yellow-300 font-semibold text-lg">{userCoins} Coins</span>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Enter your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-2xl py-4 px-4 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
              maxLength={20}
            />

            <button
              onClick={handleCreateRoom}
              disabled={!playerName.trim() || !isConnected}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
            >
              <Plus className="mr-2" size={20} />
              Create Room
            </button>

            <div className="relative">
              <Hash className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Enter room code"
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                className="w-full bg-white/10 border border-white/20 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                maxLength={8}
              />
            </div>

            <button
              onClick={handleJoinRoom}
              disabled={roomCodeInput.length < 4 || !playerName.trim() || !isConnected}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
            >
              <Users className="mr-2" size={20} />
              Join Room
            </button>

            {!isConnected && (
              <p className="text-center text-red-400 text-sm">Connecting to server...</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!roomCode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 w-full max-w-md border border-white/20 shadow-2xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Joining Room...</h2>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl mb-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Room: {roomCode}</h2>
            <p className="text-blue-200">Share this code with friends!</p>
            {isHost && (
              <div className="flex items-center justify-center mt-2">
                <Crown className="text-yellow-400 mr-1" size={16} />
                <span className="text-yellow-300 text-sm">You are the host</span>
              </div>
            )}
          </div>

          <div className="space-y-3 mb-6">
            {players.map((player, index) => (
              <div
                key={player.id}
                className={`flex items-center justify-between p-4 rounded-2xl border ${
                  player.id === currentUserId
                    ? 'bg-blue-500/20 border-blue-500/40'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex items-center">
                  <div className="flex items-center mr-3">
                    {index === 0 && <Crown className="text-yellow-400 mr-2" size={16} />}
                    <div className={`w-3 h-3 rounded-full ${player.isReady ? 'bg-green-400' : 'bg-gray-400'}`} />
                  </div>
                  <span className="text-white font-medium">
                    {player.name}
                    {player.id === currentUserId && ' (You)'}
                  </span>
                </div>
                <div className="flex items-center text-yellow-300">
                  <Coins size={16} className="mr-1" />
                  <span className="font-semibold">{player.coins}</span>
                </div>
              </div>
            ))}
          </div>

          {currentPlayer && !currentPlayer.isReady && (
            <button
              onClick={setPlayerReady}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 mb-4"
            >
              Ready Up!
            </button>
          )}

          {isHost && canStartGame ? (
            <button
              onClick={handleStartGame}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Play className="mr-2" size={20} />
              Start Game
            </button>
          ) : (
            <div className="text-center">
              <p className="text-gray-300 mb-2">
                {!canStartGame ? 'Waiting for players to be ready...' : 'Waiting for host to start...'}
              </p>
              <p className="text-sm text-gray-400">Need at least 2 ready players to start</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};