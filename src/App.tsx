import React, { useState } from 'react';
import { GameLobby } from './components/GameLobby';
import { GameInterface } from './components/GameInterface';
import { GameResults } from './components/GameResults';
import { useSocket } from './hooks/useSocket';

type GameState = 'lobby' | 'playing' | 'results';

function App() {
  const [gameState, setGameState] = useState<GameState>('lobby');
  const [userCoins, setUserCoins] = useState(250);
  const { gameState: socketGameState, gameResults } = useSocket();

  const handleStartGame = () => {
    setGameState('playing');
  };

  const handleEndGame = () => {
    setGameState('results');
    // Update coins based on game results
    const userResult = gameResults.find(p => p.name === 'You');
    if (userResult) {
      setUserCoins(prev => prev + userResult.coinsEarned);
    }
  };

  const handlePlayAgain = () => {
    setGameState('playing');
  };

  const handleBackToLobby = () => {
    setGameState('lobby');
  };

  // Auto-transition to results when game finishes
  React.useEffect(() => {
    if (socketGameState.gameState === 'finished' && gameState === 'playing') {
      handleEndGame();
    }
  }, [socketGameState.gameState, gameState]);

  switch (gameState) {
    case 'lobby':
      return <GameLobby onStartGame={handleStartGame} userCoins={userCoins} />;
    case 'playing':
      return <GameInterface onEndGame={handleEndGame} />;
    case 'results':
      return (
        <GameResults
          onPlayAgain={handlePlayAgain}
          onBackToLobby={handleBackToLobby}
        />
      );
    default:
      return <GameLobby onStartGame={handleStartGame} userCoins={userCoins} />;
  }
}

export default App;