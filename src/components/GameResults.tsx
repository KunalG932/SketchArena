import React from 'react';
import { Trophy, Coins, Star, RotateCcw, Home } from 'lucide-react';
import { useSocket } from '../hooks/useSocket';

interface GameResultsProps {
  onPlayAgain: () => void;
  onBackToLobby: () => void;
}

export const GameResults: React.FC<GameResultsProps> = ({ 
  onPlayAgain, 
  onBackToLobby 
}) => {
  const { gameResults } = useSocket();
  
  if (!gameResults.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 w-full max-w-md border border-white/20 shadow-2xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Loading Results...</h2>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  const winner = gameResults[0];

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="text-yellow-400" size={24} />;
      case 1:
        return <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>;
      case 2:
        return <div className="w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>;
      default:
        return <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-white font-bold text-sm">{index + 1}</div>;
    }
  };

  const getRankGradient = (index: number) => {
    switch (index) {
      case 0:
        return 'from-yellow-500 to-orange-600';
      case 1:
        return 'from-gray-400 to-gray-600';
      case 2:
        return 'from-orange-400 to-orange-600';
      default:
        return 'from-gray-600 to-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 w-full max-w-2xl border border-white/20 shadow-2xl">
        {/* Winner Celebration */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-4">
            <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl">
              <Trophy className="text-white" size={48} />
            </div>
            <div className="absolute -top-2 -right-2">
              <Star className="text-yellow-300" size={20} />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-2">Game Over!</h1>
          <p className="text-2xl text-yellow-300 font-semibold">
            🎉 {winner.name} Wins! 🎉
          </p>
          <p className="text-blue-200 mt-2">
            Final Score: {winner.finalScore} points
          </p>
        </div>

        {/* Results List */}
        <div className="space-y-3 mb-8">
          {gameResults.map((player, index) => (
            <div
              key={player.id}
              className={`bg-gradient-to-r ${getRankGradient(index)} p-4 rounded-2xl border border-white/20 shadow-lg`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {getRankIcon(index)}
                  <div className="ml-4">
                    <h3 className="text-white font-bold text-lg">
                      {player.name}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-white/80">
                        {player.correctGuesses} correct guesses
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-white mb-1">
                    {player.finalScore}
                  </div>
                  <div className="flex items-center text-yellow-300">
                    <Coins size={16} className="mr-1" />
                    <span className="font-semibold">+{player.coinsEarned}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          <button
            onClick={onPlayAgain}
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <RotateCcw className="mr-2" size={20} />
            Play Again
          </button>
          
          <button
            onClick={onBackToLobby}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Home className="mr-2" size={20} />
            Back to Lobby
          </button>
        </div>

        {/* Stats Summary */}
        <div className="mt-6 p-4 bg-white/5 rounded-2xl border border-white/10">
          <div className="text-center text-gray-300 text-sm">
            <p>Thanks for playing SketchArena!</p>
            <p className="mt-1">Share with friends and earn more coins! 🎨</p>
          </div>
        </div>
      </div>
    </div>
  );
};