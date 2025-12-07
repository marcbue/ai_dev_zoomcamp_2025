import { Button } from '@/components/ui/button';
import { GameMode, GameStatus } from '@/lib/gameLogic';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GameControlsProps {
  status: GameStatus;
  mode: GameMode;
  score: number;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onModeChange: (mode: GameMode) => void;
  disabled?: boolean;
}

export function GameControls({
  status,
  mode,
  score,
  onStart,
  onPause,
  onReset,
  onModeChange,
  disabled,
}: GameControlsProps) {
  return (
    <div className="space-y-6">
      {/* Score display */}
      <div className="text-center">
        <p className="text-muted-foreground text-xs mb-1">SCORE</p>
        <p className="text-4xl font-display font-bold text-primary text-glow">{score}</p>
      </div>

      {/* Mode selection */}
      <div className="space-y-2">
        <p className="text-muted-foreground text-xs text-center">MODE</p>
        <div className="flex gap-2">
          <Button
            variant={mode === 'passthrough' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onModeChange('passthrough')}
            disabled={status === 'playing'}
            className={cn(
              'flex-1 text-xs',
              mode === 'passthrough' && 'box-glow'
            )}
          >
            Pass-Through
          </Button>
          <Button
            variant={mode === 'walls' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onModeChange('walls')}
            disabled={status === 'playing'}
            className={cn(
              'flex-1 text-xs',
              mode === 'walls' && 'box-glow'
            )}
          >
            Walls
          </Button>
        </div>
      </div>

      {/* Game controls */}
      <div className="flex gap-2 justify-center">
        {status === 'idle' || status === 'gameOver' ? (
          <Button
            onClick={onStart}
            disabled={disabled}
            className="box-glow"
          >
            <Play className="w-4 h-4 mr-2" />
            {status === 'gameOver' ? 'Retry' : 'Start'}
          </Button>
        ) : (
          <Button
            onClick={onPause}
            disabled={disabled}
            variant="secondary"
            className="box-glow-cyan"
          >
            {status === 'paused' ? (
              <>
                <Play className="w-4 h-4 mr-2" />
                Resume
              </>
            ) : (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </>
            )}
          </Button>
        )}
        <Button
          onClick={onReset}
          disabled={disabled || status === 'idle'}
          variant="outline"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Instructions */}
      <div className="text-center text-muted-foreground text-xs space-y-1">
        <p>Arrow Keys / WASD to move</p>
        <p>Space to pause</p>
        {mode === 'passthrough' ? (
          <p className="text-secondary">Walls wrap around</p>
        ) : (
          <p className="text-destructive">Walls = Game Over</p>
        )}
      </div>
    </div>
  );
}
