import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useGame } from '@/hooks/useGame';
import { GameBoard } from '@/components/game/GameBoard';
import { GameControls } from '@/components/game/GameControls';
import { MobileControls } from '@/components/game/MobileControls';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const {
    gameState,
    startGame,
    pauseGame,
    resetGame,
    setDirection,
    setMode,
    submitScore,
  } = useGame({
    onGameOver: async (score) => {
      if (user && score > 0) {
        const result = await submitScore();
        if (result.rank) {
          toast({
            title: '🏆 New High Score!',
            description: `You ranked #${result.rank} on the leaderboard!`,
          });
        }
      }
    },
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-primary text-glow mb-2">
          NEON SNAKE
        </h1>
        <p className="text-muted-foreground text-sm">
          {user ? `Playing as ${user.username}` : 'Login to save your scores'}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start w-full max-w-4xl">
        {/* Game board */}
        <div className="flex-1 w-full max-w-[500px]">
          <GameBoard gameState={gameState} />
          <MobileControls
            onDirection={setDirection}
            disabled={gameState.status !== 'playing'}
          />
        </div>

        {/* Controls panel */}
        <div className="w-full max-w-[250px] arcade-border bg-card rounded-lg p-6">
          <GameControls
            status={gameState.status}
            mode={gameState.mode}
            score={gameState.score}
            onStart={startGame}
            onPause={pauseGame}
            onReset={resetGame}
            onModeChange={setMode}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
