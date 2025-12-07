import { useState, useEffect } from 'react';
import { playersApi, ActivePlayer } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Eye, Clock, RefreshCw } from 'lucide-react';

interface PlayerListProps {
  onSelectPlayer: (player: ActivePlayer) => void;
  selectedPlayerId?: string;
}

export function PlayerList({ onSelectPlayer, selectedPlayerId }: PlayerListProps) {
  const [players, setPlayers] = useState<ActivePlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadPlayers = async () => {
    setIsLoading(true);
    const data = await playersApi.getActivePlayers();
    setPlayers(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadPlayers();
    // Refresh every 10 seconds
    const interval = setInterval(loadPlayers, 10000);
    return () => clearInterval(interval);
  }, []);

  const getPlayTime = (startedAt: string) => {
    const start = new Date(startedAt);
    const now = new Date();
    const diff = Math.floor((now.getTime() - start.getTime()) / 1000);
    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-semibold text-primary text-lg">
          Active Players
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={loadPlayers}
          disabled={isLoading}
        >
          <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
        </Button>
      </div>

      {isLoading && players.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          Loading players...
        </div>
      ) : players.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          No active players
        </div>
      ) : (
        <div className="space-y-2">
          {players.map((player) => (
            <Button
              key={player.id}
              variant={selectedPlayerId === player.id ? 'default' : 'outline'}
              className={cn(
                'w-full justify-start h-auto py-3 px-4',
                selectedPlayerId === player.id && 'box-glow'
              )}
              onClick={() => onSelectPlayer(player)}
            >
              <div className="flex items-center gap-3 w-full">
                <Eye className="w-4 h-4 text-secondary flex-shrink-0" />
                <div className="flex-1 text-left">
                  <p className="font-display font-semibold truncate">
                    {player.username}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="capitalize">{player.mode}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {getPlayTime(player.startedAt)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-display font-bold text-primary">
                    {player.score}
                  </p>
                </div>
              </div>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
