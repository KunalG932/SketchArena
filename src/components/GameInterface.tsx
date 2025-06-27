import React from 'react';
import { Clock, Eye, Palette, MessageSquare } from 'lucide-react';
import { DrawingCanvas } from './DrawingCanvas';
import { ChatInterface } from './ChatInterface';
import { PlayerList } from './PlayerList';
import { useSocket } from '../hooks/useSocket';

interface GameInterfaceProps {
  onEndGame: () => void;
}

export const GameInterface: React.FC<GameInterfaceProps> = ({ onEndGame }) => {
  const { gameState, currentUserId } = useSocket();
  
  const isDrawer = gameState.currentDrawer === currentUserId;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (gameState.timeLeft > 60) return 'text-green-400';
    if (gameState.timeLeft > 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Handle game end
  React.useEffect(() => {
    if (gameState.gameState === 'finished') {
      onEndGame();
    }
  }, [gameState.gameState, onEndGame]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      {/* Game Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-4 border border-white/20 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <Clock className={`mr-2 ${getTimeColor()}`} size={24} />
                <span className={`text-2xl font-bold ${getTimeColor()}`}>
                  {formatTime(gameState.timeLeft)}
                </span>
              </div>
              
              <div className="flex items-center text-white">
                <span className="text-lg font-semibold">
                  Round {gameState.currentRound}/{gameState.totalRounds}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {isDrawer ? (
                <div className="flex items-center bg-orange-500/20 rounded-2xl px-4 py-2 border border-orange-500/40">
                  <Palette className="text-orange-400 mr-2" size={20} />
                  <span className="text-white font-semibold">Drawing: {gameState.currentWord}</span>
                </div>
              ) : (
                <div className="flex items-center bg-blue-500/20 rounded-2xl px-4 py-2 border border-blue-500/40">
                  <Eye className="text-blue-400 mr-2" size={20} />
                  <span className="text-white font-semibold">Guessing</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Game Content */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Drawing Canvas - Takes up most space */}
          <div className="lg:col-span-2">
            <DrawingCanvas isDrawer={isDrawer} />
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-1">
            <ChatInterface isDrawer={isDrawer} />
          </div>

          {/* Player List */}
          <div className="lg:col-span-1">
            <PlayerList 
              players={gameState.players} 
              currentUserId={currentUserId}
              currentDrawer={gameState.currentDrawer}
            />
          </div>
        </div>
      </div>

      {/* Mobile Layout Adjustments */}
      <div className="lg:hidden mt-6">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          <button className="flex items-center bg-white/10 rounded-2xl px-4 py-2 whitespace-nowrap">
            <MessageSquare className="mr-2" size={16} />
            <span className="text-white text-sm">Chat</span>
          </button>
          <button className="flex items-center bg-white/10 rounded-2xl px-4 py-2 whitespace-nowrap">
            <Eye className="mr-2" size={16} />
            <span className="text-white text-sm">Players</span>
          </button>
        </div>
      </div>
    </div>
  );
};