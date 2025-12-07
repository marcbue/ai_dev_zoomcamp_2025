import { useState, useCallback, useEffect, useRef } from 'react';
import {
  GameState,
  GameMode,
  Direction,
  createInitialState,
  moveSnake,
  changeDirection,
  getAIDirection,
} from '@/lib/gameLogic';
import { leaderboardApi } from '@/lib/api';

interface UseGameOptions {
  mode?: GameMode;
  isSpectator?: boolean;
  onGameOver?: (score: number) => void;
}

export function useGame({ mode = 'walls', isSpectator = false, onGameOver }: UseGameOptions = {}) {
  const [gameState, setGameState] = useState<GameState>(() => createInitialState(mode));
  const gameLoopRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  const startGame = useCallback(() => {
    setGameState(prev => ({
      ...createInitialState(prev.mode),
      status: 'playing',
    }));
  }, []);

  const pauseGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      status: prev.status === 'playing' ? 'paused' : 'playing',
    }));
  }, []);

  const resetGame = useCallback(() => {
    setGameState(createInitialState(mode));
  }, [mode]);

  const setDirection = useCallback((direction: Direction) => {
    setGameState(prev => changeDirection(prev, direction));
  }, []);

  const setMode = useCallback((newMode: GameMode) => {
    setGameState(createInitialState(newMode));
  }, []);

  // Game loop
  useEffect(() => {
    if (gameState.status !== 'playing') {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }

    const gameLoop = (timestamp: number) => {
      if (timestamp - lastUpdateRef.current >= gameState.speed) {
        setGameState(prev => {
          if (prev.status !== 'playing') return prev;

          // AI control for spectator mode
          let stateToMove = prev;
          if (isSpectator) {
            const aiDirection = getAIDirection(prev);
            stateToMove = changeDirection(prev, aiDirection);
          }

          const newState = moveSnake(stateToMove);
          
          // Handle game over
          if (newState.status === 'gameOver' && prev.status === 'playing') {
            onGameOver?.(newState.score);
          }
          
          return newState;
        });
        lastUpdateRef.current = timestamp;
      }
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState.status, gameState.speed, isSpectator, onGameOver]);

  // Keyboard controls
  useEffect(() => {
    if (isSpectator) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const keyDirections: Record<string, Direction> = {
        ArrowUp: 'UP',
        ArrowDown: 'DOWN',
        ArrowLeft: 'LEFT',
        ArrowRight: 'RIGHT',
        w: 'UP',
        s: 'DOWN',
        a: 'LEFT',
        d: 'RIGHT',
        W: 'UP',
        S: 'DOWN',
        A: 'LEFT',
        D: 'RIGHT',
      };

      if (keyDirections[e.key]) {
        e.preventDefault();
        setDirection(keyDirections[e.key]);
      }

      if (e.key === ' ' && gameState.status !== 'idle') {
        e.preventDefault();
        pauseGame();
      }

      if (e.key === 'Enter' && (gameState.status === 'idle' || gameState.status === 'gameOver')) {
        e.preventDefault();
        startGame();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSpectator, gameState.status, setDirection, pauseGame, startGame]);

  const submitScore = useCallback(async () => {
    if (gameState.score > 0) {
      return leaderboardApi.submitScore({
        score: gameState.score,
        mode: gameState.mode,
      });
    }
    return { success: false, rank: null };
  }, [gameState.score, gameState.mode]);

  return {
    gameState,
    startGame,
    pauseGame,
    resetGame,
    setDirection,
    setMode,
    submitScore,
  };
}
