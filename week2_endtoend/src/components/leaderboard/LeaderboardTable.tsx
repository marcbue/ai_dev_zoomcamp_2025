import { useState, useEffect } from 'react';
import { leaderboardApi, LeaderboardEntry } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Trophy, Medal, Award } from 'lucide-react';

type FilterMode = 'all' | 'passthrough' | 'walls';

export function LeaderboardTable() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [filter, setFilter] = useState<FilterMode>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLeaderboard = async () => {
      setIsLoading(true);
      const data = await leaderboardApi.getLeaderboard(
        filter === 'all' ? undefined : filter
      );
      setEntries(data);
      setIsLoading(false);
    };
    loadLeaderboard();
  }, [filter]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-gold" />;
      case 2:
        return <Medal className="w-5 h-5 text-muted-foreground" />;
      case 3:
        return <Award className="w-5 h-5 text-neon-yellow" />;
      default:
        return <span className="w-5 text-center text-muted-foreground">{rank}</span>;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h1 className="text-3xl font-display font-bold text-center text-primary text-glow mb-8">
        LEADERBOARD
      </h1>

      {/* Filter buttons */}
      <div className="flex justify-center gap-2 mb-6">
        {(['all', 'passthrough', 'walls'] as FilterMode[]).map((mode) => (
          <Button
            key={mode}
            variant={filter === mode ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(mode)}
            className={cn(
              'text-xs capitalize',
              filter === mode && 'box-glow'
            )}
          >
            {mode === 'all' ? 'All Modes' : mode}
          </Button>
        ))}
      </div>

      {/* Leaderboard */}
      <div className="arcade-border bg-card rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">
            Loading...
          </div>
        ) : entries.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No scores yet. Be the first!
          </div>
        ) : (
          <div className="divide-y divide-border">
            {entries.map((entry, index) => (
              <div
                key={entry.id}
                className={cn(
                  'flex items-center gap-4 p-4 transition-colors hover:bg-muted/30',
                  index === 0 && 'bg-gold/10',
                  index === 1 && 'bg-muted/20',
                  index === 2 && 'bg-neon-yellow/10'
                )}
              >
                <div className="w-8 flex justify-center">
                  {getRankIcon(index + 1)}
                </div>
                <div className="flex-1">
                  <p className={cn(
                    'font-display font-semibold',
                    index === 0 && 'text-gold text-glow-gold',
                    index > 0 && 'text-primary'
                  )}>
                    {entry.username}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {entry.mode} • {entry.date}
                  </p>
                </div>
                <div className={cn(
                  'text-2xl font-display font-bold',
                  index === 0 && 'text-gold text-glow-gold',
                  index === 1 && 'text-muted-foreground',
                  index === 2 && 'text-neon-yellow',
                  index > 2 && 'text-primary'
                )}>
                  {entry.score}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
