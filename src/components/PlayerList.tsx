import React from 'react';
import { Crown, Coins, User } from 'lucide-react';

interface Player {
  id: string;
  name: string;
  coins: number;
  score: number;
  isReady: boolean;
  isOnline: boolean;
  hasGuessed: boolean;
}

interface PlayerListProps {
  players: Player[];
  currentUserId: string;
  currentDrawer: string | null;
}

export const PlayerList: React.FC<PlayerListProps> = ({ players, currentUserId, currentDrawer }) => {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-4 border border-white/20">
      <div className="flex items-center mb-4">
        <Crown className="text-yellow-400 mr-2" size={20} />
        <h3 className="text-white font-semibold">Players</h3>
      </div>

      <div className="space-y-3">
        {sortedPlayers.map((player, index) => (
          <div
            key={player.id}
            className={`flex items-center justify-between p-3 rounded-2xl transition-all duration-200 ${
              player.id === currentUserId
                ? 'bg-blue-500/20 border border-blue-500/40'
                : player.id === currentDrawer
                ? 'bg-orange-500/20 border border-orange-500/40'
                : 'bg-white/5 border border-white/10'
            }`}
          >
            <div className="flex items-center">
              <div className="relative mr-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                  <User className="text-white" size={20} />
                </div>
                {index === 0 && (
                  <Crown className="absolute -top-1 -right-1 text-yellow-400" size={16} />
                )}
                {player.id === currentDrawer && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-orange-500 rounded-full border-2 border-white" />
                )}
                <div className={`absolute -bottom-1 -left-1 w-3 h-3 rounded-full border-2 border-white ${
                  player.isOnline ? 'bg-green-400' : 'bg-gray-400'
                }`} />
              </div>
              
              <div>
                <div className="flex items-center">
                  <span className="text-white font-medium">
                    {player.name}
                    {player.id === currentUserId && ' (You)'}
                  </span>
                  {player.id === currentDrawer && (
                    <span className="ml-2 text-xs bg-orange-500 text-white px-2 py-1 rounded-full">
                      Drawing
                    </span>
                  )}
                  {player.hasGuessed && player.id !== currentDrawer && (
                    <span className="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                      Guessed
                    </span>
                  )}
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <span className="mr-3">Score: {player.score}</span>
                  <div className="flex items-center text-yellow-300">
                    <Coins size={14} className="mr-1" />
                    <span>{player.coins}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-bold text-white">#{index + 1}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};