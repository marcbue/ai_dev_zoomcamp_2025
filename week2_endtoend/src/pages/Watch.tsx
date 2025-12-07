import { useState } from 'react';
import { ActivePlayer } from '@/lib/api';
import { PlayerList } from '@/components/watch/PlayerList';
import { SpectatorView } from '@/components/watch/SpectatorView';

const Watch = () => {
  const [selectedPlayer, setSelectedPlayer] = useState<ActivePlayer | null>(null);

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-display font-bold text-center text-primary text-glow mb-8">
          SPECTATOR MODE
        </h1>

        <div className="grid lg:grid-cols-[300px_1fr] gap-8">
          {/* Player list sidebar */}
          <div className="arcade-border bg-card rounded-lg p-4">
            <PlayerList
              onSelectPlayer={setSelectedPlayer}
              selectedPlayerId={selectedPlayer?.id}
            />
          </div>

          {/* Spectator view */}
          <div className="flex items-center justify-center">
            {selectedPlayer ? (
              <SpectatorView key={selectedPlayer.id} player={selectedPlayer} />
            ) : (
              <div className="arcade-border bg-card rounded-lg p-8 text-center max-w-md">
                <p className="text-muted-foreground mb-2">
                  Select a player to watch
                </p>
                <p className="text-xs text-muted-foreground">
                  Watch live games from other players and learn their strategies
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Watch;
