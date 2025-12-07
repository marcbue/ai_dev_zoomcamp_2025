import { useEffect, useState } from 'react';
import { ActivePlayer } from '@/lib/api';
import { GameBoard } from '@/components/game/GameBoard';
import { useGame } from '@/hooks/useGame';
import { cn } from '@/lib/utils';
import { Eye, User, Zap } from 'lucide-react';

interface SpectatorViewProps {
  player: ActivePlayer;
}

export function SpectatorView({ player }: SpectatorViewProps) {
  const [simulatedScore, setSimulatedScore] = useState(player.score);
  
  const { gameState, startGame } = useGame({
    mode: player.mode,
    isSpectator: true,
    onGameOver: () => {
      // Restart after a delay for continuous spectating
      setTimeout(startGame, 2000);
    },
  });

  // Start the game when component mounts
  useEffect(() => {
    startGame();
  }, [startGame, player.id]);

  // Update simulated score
  useEffect(() => {
    if (gameState.status === 'playing') {
      setSimulatedScore(player.score + gameState.score);
    }
  }, [gameState.score, player.score, gameState.status]);

  return (
    <div className="space-y-4">
      {/* Player info header */}
      <div className="arcade-border bg-card rounded-lg p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-secondary animate-pulse" />
            <span className="text-xs text-muted-foreground">WATCHING</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              <span className="font-display font-bold text-primary text-glow">
                {player.username}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">SCORE</p>
            <p className="text-2xl font-display font-bold text-primary text-glow">
              {simulatedScore}
            </p>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
          <span className={cn(
            'px-2 py-1 rounded capitalize',
            player.mode === 'walls' ? 'bg-destructive/20 text-destructive' : 'bg-secondary/20 text-secondary'
          )}>
            {player.mode}
          </span>
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Speed: {Math.round(1000 / gameState.speed)}x
          </span>
        </div>
      </div>

      {/* Game board */}
      <div className="relative">
        <GameBoard gameState={gameState} />
        
        {/* Spectator overlay */}
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-background/80 px-2 py-1 rounded text-xs text-secondary">
          <Eye className="w-3 h-3" />
          Spectating
        </div>
      </div>
    </div>
  );
}
