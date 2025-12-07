import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authApi, leaderboardApi, playersApi } from '@/lib/api';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Auth API', () => {
  beforeEach(() => {
    localStorageMock.clear();
    localStorageMock.setItem('snake_game_users', JSON.stringify([]));
    localStorageMock.setItem('snake_game_leaderboard', JSON.stringify([]));
  });

  describe('signup', () => {
    it('creates a new user successfully', async () => {
      const result = await authApi.signup('testuser', 'test@example.com', 'password123');
      
      expect(result.error).toBeNull();
      expect(result.user).not.toBeNull();
      expect(result.user?.username).toBe('testuser');
      expect(result.user?.email).toBe('test@example.com');
    });

    it('returns error for duplicate email', async () => {
      await authApi.signup('user1', 'test@example.com', 'password123');
      const result = await authApi.signup('user2', 'test@example.com', 'password456');
      
      expect(result.error).toBe('Email already registered');
      expect(result.user).toBeNull();
    });

    it('returns error for duplicate username', async () => {
      await authApi.signup('testuser', 'test1@example.com', 'password123');
      const result = await authApi.signup('testuser', 'test2@example.com', 'password456');
      
      expect(result.error).toBe('Username already taken');
      expect(result.user).toBeNull();
    });

    it('sets current user after signup', async () => {
      await authApi.signup('testuser', 'test@example.com', 'password123');
      const currentUser = await authApi.getCurrentUser();
      
      expect(currentUser).not.toBeNull();
      expect(currentUser?.username).toBe('testuser');
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      await authApi.signup('testuser', 'test@example.com', 'password123');
      await authApi.logout();
    });

    it('logs in with correct credentials', async () => {
      const result = await authApi.login('test@example.com', 'password123');
      
      expect(result.error).toBeNull();
      expect(result.user).not.toBeNull();
      expect(result.user?.username).toBe('testuser');
    });

    it('returns error for invalid email', async () => {
      const result = await authApi.login('wrong@example.com', 'password123');
      
      expect(result.error).toBe('Invalid email or password');
      expect(result.user).toBeNull();
    });

    it('returns error for invalid password', async () => {
      const result = await authApi.login('test@example.com', 'wrongpassword');
      
      expect(result.error).toBe('Invalid email or password');
      expect(result.user).toBeNull();
    });

    it('sets current user after login', async () => {
      await authApi.login('test@example.com', 'password123');
      const currentUser = await authApi.getCurrentUser();
      
      expect(currentUser).not.toBeNull();
      expect(currentUser?.username).toBe('testuser');
    });
  });

  describe('logout', () => {
    it('clears current user', async () => {
      await authApi.signup('testuser', 'test@example.com', 'password123');
      await authApi.logout();
      const currentUser = await authApi.getCurrentUser();
      
      expect(currentUser).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    it('returns null when no user logged in', async () => {
      const currentUser = await authApi.getCurrentUser();
      expect(currentUser).toBeNull();
    });

    it('returns user when logged in', async () => {
      await authApi.signup('testuser', 'test@example.com', 'password123');
      const currentUser = await authApi.getCurrentUser();
      
      expect(currentUser).not.toBeNull();
      expect(currentUser?.username).toBe('testuser');
    });
  });
});

describe('Leaderboard API', () => {
  beforeEach(() => {
    localStorageMock.clear();
    localStorageMock.setItem('snake_game_users', JSON.stringify([]));
    localStorageMock.setItem('snake_game_leaderboard', JSON.stringify([
      { id: '1', username: 'Player1', score: 100, mode: 'walls', date: '2024-01-01' },
      { id: '2', username: 'Player2', score: 200, mode: 'passthrough', date: '2024-01-02' },
      { id: '3', username: 'Player3', score: 150, mode: 'walls', date: '2024-01-03' },
    ]));
  });

  describe('getLeaderboard', () => {
    it('returns all entries sorted by score', async () => {
      const entries = await leaderboardApi.getLeaderboard();
      
      expect(entries.length).toBe(3);
      expect(entries[0].score).toBe(200);
      expect(entries[1].score).toBe(150);
      expect(entries[2].score).toBe(100);
    });

    it('filters by mode', async () => {
      const wallsEntries = await leaderboardApi.getLeaderboard('walls');
      
      expect(wallsEntries.length).toBe(2);
      expect(wallsEntries.every(e => e.mode === 'walls')).toBe(true);
    });

    it('returns max 10 entries', async () => {
      const manyEntries = Array.from({ length: 15 }, (_, i) => ({
        id: `${i}`,
        username: `Player${i}`,
        score: i * 100,
        mode: 'walls' as const,
        date: '2024-01-01',
      }));
      localStorageMock.setItem('snake_game_leaderboard', JSON.stringify(manyEntries));
      
      const entries = await leaderboardApi.getLeaderboard();
      expect(entries.length).toBe(10);
    });
  });

  describe('submitScore', () => {
    beforeEach(async () => {
      await authApi.signup('testuser', 'test@example.com', 'password123');
    });

    it('submits score when logged in', async () => {
      const result = await leaderboardApi.submitScore({ score: 500, mode: 'walls' });
      
      expect(result.success).toBe(true);
      expect(result.rank).toBe(1);
    });

    it('fails when not logged in', async () => {
      await authApi.logout();
      const result = await leaderboardApi.submitScore({ score: 500, mode: 'walls' });
      
      expect(result.success).toBe(false);
      expect(result.rank).toBeNull();
    });

    it('returns null rank for low scores', async () => {
      const result = await leaderboardApi.submitScore({ score: 50, mode: 'walls' });
      
      expect(result.success).toBe(true);
      expect(result.rank).toBeNull();
    });
  });
});

describe('Players API', () => {
  describe('getActivePlayers', () => {
    it('returns mock active players', async () => {
      const players = await playersApi.getActivePlayers();
      
      expect(Array.isArray(players)).toBe(true);
      expect(players.length).toBeGreaterThan(0);
      expect(players[0]).toHaveProperty('id');
      expect(players[0]).toHaveProperty('username');
      expect(players[0]).toHaveProperty('score');
      expect(players[0]).toHaveProperty('mode');
    });
  });

  describe('getPlayerGame', () => {
    it('returns player by id', async () => {
      const players = await playersApi.getActivePlayers();
      const player = await playersApi.getPlayerGame(players[0].id);
      
      expect(player).not.toBeNull();
      expect(player?.id).toBe(players[0].id);
    });

    it('returns null for invalid id', async () => {
      const player = await playersApi.getPlayerGame('invalid-id');
      expect(player).toBeNull();
    });
  });
});
