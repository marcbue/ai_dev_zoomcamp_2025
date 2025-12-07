// Centralized mock API layer
// All backend calls are mocked here for easy replacement with real API later

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  score: number;
  mode: 'passthrough' | 'walls';
  date: string;
}

export interface ActivePlayer {
  id: string;
  username: string;
  score: number;
  mode: 'passthrough' | 'walls';
  startedAt: string;
}

export interface GameResult {
  score: number;
  mode: 'passthrough' | 'walls';
}

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data storage keys
const STORAGE_KEYS = {
  USER: 'snake_game_user',
  USERS: 'snake_game_users',
  LEADERBOARD: 'snake_game_leaderboard',
};

// Initialize mock data
const initializeMockData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.LEADERBOARD)) {
    const mockLeaderboard: LeaderboardEntry[] = [
      { id: '1', username: 'PixelMaster', score: 2450, mode: 'walls', date: '2024-01-15' },
      { id: '2', username: 'NeonViper', score: 2100, mode: 'passthrough', date: '2024-01-14' },
      { id: '3', username: 'RetroGamer', score: 1890, mode: 'walls', date: '2024-01-13' },
      { id: '4', username: 'ArcadeKing', score: 1750, mode: 'passthrough', date: '2024-01-12' },
      { id: '5', username: 'BitRunner', score: 1600, mode: 'walls', date: '2024-01-11' },
      { id: '6', username: 'CyberSnake', score: 1520, mode: 'passthrough', date: '2024-01-10' },
      { id: '7', username: 'GlowWorm', score: 1400, mode: 'walls', date: '2024-01-09' },
      { id: '8', username: 'NightCrawler', score: 1350, mode: 'passthrough', date: '2024-01-08' },
      { id: '9', username: 'PixelPython', score: 1200, mode: 'walls', date: '2024-01-07' },
      { id: '10', username: 'ElectricEel', score: 1100, mode: 'passthrough', date: '2024-01-06' },
    ];
    localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(mockLeaderboard));
  }
};

initializeMockData();

// Auth API
export const authApi = {
  async login(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
    await delay(500);
    
    const users: (User & { password: string })[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.USERS) || '[]'
    );
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      return { user: null, error: 'Invalid email or password' };
    }
    
    const { password: _, ...userWithoutPassword } = user;
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userWithoutPassword));
    
    return { user: userWithoutPassword, error: null };
  },

  async signup(username: string, email: string, password: string): Promise<{ user: User | null; error: string | null }> {
    await delay(500);
    
    const users: (User & { password: string })[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.USERS) || '[]'
    );
    
    if (users.find(u => u.email === email)) {
      return { user: null, error: 'Email already registered' };
    }
    
    if (users.find(u => u.username === username)) {
      return { user: null, error: 'Username already taken' };
    }
    
    const newUser = {
      id: crypto.randomUUID(),
      username,
      email,
      password,
      createdAt: new Date().toISOString(),
    };
    
    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    
    const { password: _, ...userWithoutPassword } = newUser;
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userWithoutPassword));
    
    return { user: userWithoutPassword, error: null };
  },

  async logout(): Promise<void> {
    await delay(200);
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  async getCurrentUser(): Promise<User | null> {
    await delay(100);
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    return user ? JSON.parse(user) : null;
  },
};

// Leaderboard API
export const leaderboardApi = {
  async getLeaderboard(mode?: 'passthrough' | 'walls'): Promise<LeaderboardEntry[]> {
    await delay(300);
    
    const leaderboard: LeaderboardEntry[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.LEADERBOARD) || '[]'
    );
    
    let filtered = leaderboard;
    if (mode) {
      filtered = leaderboard.filter(entry => entry.mode === mode);
    }
    
    return filtered.sort((a, b) => b.score - a.score).slice(0, 10);
  },

  async submitScore(result: GameResult): Promise<{ success: boolean; rank: number | null }> {
    await delay(300);
    
    const user = await authApi.getCurrentUser();
    if (!user) {
      return { success: false, rank: null };
    }
    
    const leaderboard: LeaderboardEntry[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.LEADERBOARD) || '[]'
    );
    
    const newEntry: LeaderboardEntry = {
      id: crypto.randomUUID(),
      username: user.username,
      score: result.score,
      mode: result.mode,
      date: new Date().toISOString().split('T')[0],
    };
    
    leaderboard.push(newEntry);
    leaderboard.sort((a, b) => b.score - a.score);
    
    localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(leaderboard));
    
    const rank = leaderboard.findIndex(e => e.id === newEntry.id) + 1;
    
    return { success: true, rank: rank <= 10 ? rank : null };
  },
};

// Active players API (for spectator mode)
export const playersApi = {
  async getActivePlayers(): Promise<ActivePlayer[]> {
    await delay(200);
    
    // Mock active players
    const mockPlayers: ActivePlayer[] = [
      { id: '1', username: 'PixelMaster', score: 450, mode: 'walls', startedAt: new Date(Date.now() - 120000).toISOString() },
      { id: '2', username: 'NeonViper', score: 320, mode: 'passthrough', startedAt: new Date(Date.now() - 90000).toISOString() },
      { id: '3', username: 'RetroGamer', score: 180, mode: 'walls', startedAt: new Date(Date.now() - 60000).toISOString() },
    ];
    
    return mockPlayers;
  },

  async getPlayerGame(playerId: string): Promise<ActivePlayer | null> {
    await delay(100);
    
    const players = await this.getActivePlayers();
    return players.find(p => p.id === playerId) || null;
  },
};
