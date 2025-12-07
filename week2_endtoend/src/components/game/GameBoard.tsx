import { GameState } from '@/lib/gameLogic';
import { cn } from '@/lib/utils';

interface GameBoardProps {
  gameState: GameState;
  className?: string;
}

export function GameBoard({ gameState, className }: GameBoardProps) {
  const { snake, food, gridSize, status, mode } = gameState;
  const cellSize = 100 / gridSize;

  return (
    <div className={cn('relative aspect-square w-full max-w-[500px]', className)}>
      {/* Grid background */}
      <div 
        className="absolute inset-0 arcade-border bg-background"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--grid)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--grid)) 1px, transparent 1px)
          `,
          backgroundSize: `${cellSize}% ${cellSize}%`,
        }}
      >
        {/* Scanlines overlay */}
        <div className="absolute inset-0 scanlines pointer-events-none opacity-30" />
        
        {/* Wall indicator for walls mode */}
        {mode === 'walls' && (
          <div className="absolute inset-0 border-4 border-destructive/50 pointer-events-none" />
        )}

        {/* Snake segments */}
        {snake.map((segment, index) => (
          <div
            key={index}
            className={cn(
              'absolute rounded-sm',
              index === 0 ? 'bg-primary z-10' : 'bg-primary/80',
              index === 0 && 'box-glow'
            )}
            style={{
              left: `${segment.x * cellSize}%`,
              top: `${segment.y * cellSize}%`,
              width: `${cellSize}%`,
              height: `${cellSize}%`,
              transform: 'scale(0.9)',
            }}
          />
        ))}

        {/* Food */}
        <div
          className="absolute rounded-full bg-food animate-pulse-glow"
          style={{
            left: `${food.x * cellSize}%`,
            top: `${food.y * cellSize}%`,
            width: `${cellSize}%`,
            height: `${cellSize}%`,
            transform: 'scale(0.8)',
            boxShadow: '0 0 10px hsl(var(--food)), 0 0 20px hsl(var(--food))',
          }}
        />

        {/* Game status overlay */}
        {status !== 'playing' && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <div className="text-center">
              {status === 'idle' && (
                <div>
                  <p className="text-primary text-glow text-sm mb-4">PRESS ENTER TO START</p>
                  <p className="text-muted-foreground text-xs">Use Arrow Keys or WASD</p>
                </div>
              )}
              {status === 'paused' && (
                <p className="text-secondary text-glow-cyan text-sm">PAUSED</p>
              )}
              {status === 'gameOver' && (
                <div>
                  <p className="text-destructive text-glow-pink text-sm mb-4">GAME OVER</p>
                  <p className="text-primary text-xs">Press ENTER to retry</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
