import { describe, it, expect } from 'vitest';
import {
  createInitialState,
  generateFood,
  getOppositeDirection,
  isValidDirectionChange,
  moveSnake,
  changeDirection,
  getAIDirection,
  GRID_SIZE,
  Direction,
  GameState,
} from '@/lib/gameLogic';

describe('Game Logic', () => {
  describe('createInitialState', () => {
    it('creates initial state with walls mode by default', () => {
      const state = createInitialState();
      expect(state.mode).toBe('walls');
      expect(state.status).toBe('idle');
      expect(state.score).toBe(0);
      expect(state.snake.length).toBe(3);
      expect(state.direction).toBe('RIGHT');
    });

    it('creates initial state with passthrough mode', () => {
      const state = createInitialState('passthrough');
      expect(state.mode).toBe('passthrough');
    });

    it('snake starts at center of grid', () => {
      const state = createInitialState();
      const center = Math.floor(GRID_SIZE / 2);
      expect(state.snake[0].x).toBe(center);
      expect(state.snake[0].y).toBe(center);
    });
  });

  describe('generateFood', () => {
    it('generates food not on snake', () => {
      const snake = [
        { x: 5, y: 5 },
        { x: 4, y: 5 },
        { x: 3, y: 5 },
      ];
      
      for (let i = 0; i < 100; i++) {
        const food = generateFood(snake);
        const onSnake = snake.some(s => s.x === food.x && s.y === food.y);
        expect(onSnake).toBe(false);
      }
    });

    it('generates food within grid bounds', () => {
      const snake = [{ x: 5, y: 5 }];
      
      for (let i = 0; i < 100; i++) {
        const food = generateFood(snake);
        expect(food.x).toBeGreaterThanOrEqual(0);
        expect(food.x).toBeLessThan(GRID_SIZE);
        expect(food.y).toBeGreaterThanOrEqual(0);
        expect(food.y).toBeLessThan(GRID_SIZE);
      }
    });
  });

  describe('getOppositeDirection', () => {
    it('returns opposite direction', () => {
      expect(getOppositeDirection('UP')).toBe('DOWN');
      expect(getOppositeDirection('DOWN')).toBe('UP');
      expect(getOppositeDirection('LEFT')).toBe('RIGHT');
      expect(getOppositeDirection('RIGHT')).toBe('LEFT');
    });
  });

  describe('isValidDirectionChange', () => {
    it('allows perpendicular direction changes', () => {
      expect(isValidDirectionChange('UP', 'LEFT')).toBe(true);
      expect(isValidDirectionChange('UP', 'RIGHT')).toBe(true);
      expect(isValidDirectionChange('DOWN', 'LEFT')).toBe(true);
      expect(isValidDirectionChange('DOWN', 'RIGHT')).toBe(true);
      expect(isValidDirectionChange('LEFT', 'UP')).toBe(true);
      expect(isValidDirectionChange('LEFT', 'DOWN')).toBe(true);
      expect(isValidDirectionChange('RIGHT', 'UP')).toBe(true);
      expect(isValidDirectionChange('RIGHT', 'DOWN')).toBe(true);
    });

    it('prevents reversing direction', () => {
      expect(isValidDirectionChange('UP', 'DOWN')).toBe(false);
      expect(isValidDirectionChange('DOWN', 'UP')).toBe(false);
      expect(isValidDirectionChange('LEFT', 'RIGHT')).toBe(false);
      expect(isValidDirectionChange('RIGHT', 'LEFT')).toBe(false);
    });

    it('allows same direction', () => {
      expect(isValidDirectionChange('UP', 'UP')).toBe(true);
      expect(isValidDirectionChange('DOWN', 'DOWN')).toBe(true);
      expect(isValidDirectionChange('LEFT', 'LEFT')).toBe(true);
      expect(isValidDirectionChange('RIGHT', 'RIGHT')).toBe(true);
    });
  });

  describe('moveSnake', () => {
    it('does not move when not playing', () => {
      const state = createInitialState();
      const newState = moveSnake(state);
      expect(newState.snake).toEqual(state.snake);
    });

    it('moves snake head in direction', () => {
      const state: GameState = {
        ...createInitialState(),
        status: 'playing',
        snake: [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }],
      };

      const newState = moveSnake(state);
      expect(newState.snake[0]).toEqual({ x: 11, y: 10 });
    });

    it('moves in all directions correctly', () => {
      const directions: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
      const expectedMoves = {
        UP: { x: 10, y: 9 },
        DOWN: { x: 10, y: 11 },
        LEFT: { x: 9, y: 10 },
        RIGHT: { x: 11, y: 10 },
      };

      directions.forEach(dir => {
        const state: GameState = {
          ...createInitialState(),
          status: 'playing',
          direction: dir,
          nextDirection: dir,
          snake: [{ x: 10, y: 10 }, { x: 10, y: 10 }, { x: 10, y: 10 }],
        };

        const newState = moveSnake(state);
        expect(newState.snake[0]).toEqual(expectedMoves[dir]);
      });
    });

    it('wraps around in passthrough mode', () => {
      const state: GameState = {
        ...createInitialState('passthrough'),
        status: 'playing',
        direction: 'RIGHT',
        nextDirection: 'RIGHT',
        snake: [{ x: GRID_SIZE - 1, y: 10 }, { x: GRID_SIZE - 2, y: 10 }],
      };

      const newState = moveSnake(state);
      expect(newState.snake[0].x).toBe(0);
      expect(newState.status).toBe('playing');
    });

    it('wraps around all edges in passthrough mode', () => {
      // Test right edge
      let state: GameState = {
        ...createInitialState('passthrough'),
        status: 'playing',
        direction: 'RIGHT',
        nextDirection: 'RIGHT',
        snake: [{ x: GRID_SIZE - 1, y: 10 }],
      };
      expect(moveSnake(state).snake[0].x).toBe(0);

      // Test left edge
      state = {
        ...createInitialState('passthrough'),
        status: 'playing',
        direction: 'LEFT',
        nextDirection: 'LEFT',
        snake: [{ x: 0, y: 10 }],
      };
      expect(moveSnake(state).snake[0].x).toBe(GRID_SIZE - 1);

      // Test top edge
      state = {
        ...createInitialState('passthrough'),
        status: 'playing',
        direction: 'UP',
        nextDirection: 'UP',
        snake: [{ x: 10, y: 0 }],
      };
      expect(moveSnake(state).snake[0].y).toBe(GRID_SIZE - 1);

      // Test bottom edge
      state = {
        ...createInitialState('passthrough'),
        status: 'playing',
        direction: 'DOWN',
        nextDirection: 'DOWN',
        snake: [{ x: 10, y: GRID_SIZE - 1 }],
      };
      expect(moveSnake(state).snake[0].y).toBe(0);
    });

    it('game over on wall collision in walls mode', () => {
      const state: GameState = {
        ...createInitialState('walls'),
        status: 'playing',
        direction: 'RIGHT',
        nextDirection: 'RIGHT',
        snake: [{ x: GRID_SIZE - 1, y: 10 }, { x: GRID_SIZE - 2, y: 10 }],
      };

      const newState = moveSnake(state);
      expect(newState.status).toBe('gameOver');
    });

    it('game over on self collision', () => {
      const state: GameState = {
        ...createInitialState(),
        status: 'playing',
        direction: 'LEFT',
        nextDirection: 'LEFT',
        snake: [
          { x: 10, y: 10 },
          { x: 11, y: 10 },
          { x: 11, y: 11 },
          { x: 10, y: 11 },
          { x: 9, y: 11 },
          { x: 9, y: 10 },
        ],
      };

      const newState = moveSnake(state);
      expect(newState.status).toBe('gameOver');
    });

    it('grows snake and increases score when eating food', () => {
      const state: GameState = {
        ...createInitialState(),
        status: 'playing',
        direction: 'RIGHT',
        nextDirection: 'RIGHT',
        snake: [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }],
        food: { x: 6, y: 5 },
        score: 0,
      };

      const newState = moveSnake(state);
      expect(newState.snake.length).toBe(4);
      expect(newState.score).toBe(10);
      expect(newState.food).not.toEqual({ x: 6, y: 5 });
    });

    it('removes tail when not eating food', () => {
      const state: GameState = {
        ...createInitialState(),
        status: 'playing',
        direction: 'RIGHT',
        nextDirection: 'RIGHT',
        snake: [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }],
        food: { x: 15, y: 15 },
      };

      const newState = moveSnake(state);
      expect(newState.snake.length).toBe(3);
      expect(newState.snake[2]).toEqual({ x: 4, y: 5 });
    });
  });

  describe('changeDirection', () => {
    it('changes direction when valid', () => {
      const state: GameState = {
        ...createInitialState(),
        status: 'playing',
        direction: 'RIGHT',
      };

      const newState = changeDirection(state, 'UP');
      expect(newState.nextDirection).toBe('UP');
    });

    it('does not change to opposite direction', () => {
      const state: GameState = {
        ...createInitialState(),
        status: 'playing',
        direction: 'RIGHT',
        nextDirection: 'RIGHT',
      };

      const newState = changeDirection(state, 'LEFT');
      expect(newState.nextDirection).toBe('RIGHT');
    });

    it('does not change direction when not playing', () => {
      const state: GameState = {
        ...createInitialState(),
        status: 'paused',
        direction: 'RIGHT',
        nextDirection: 'RIGHT',
      };

      const newState = changeDirection(state, 'UP');
      expect(newState.nextDirection).toBe('RIGHT');
    });
  });

  describe('getAIDirection', () => {
    it('returns a valid direction', () => {
      const state: GameState = {
        ...createInitialState(),
        status: 'playing',
        snake: [{ x: 10, y: 10 }, { x: 9, y: 10 }],
        food: { x: 15, y: 10 },
      };

      const aiDirection = getAIDirection(state);
      expect(['UP', 'DOWN', 'LEFT', 'RIGHT']).toContain(aiDirection);
    });

    it('does not return opposite direction', () => {
      for (let i = 0; i < 50; i++) {
        const state: GameState = {
          ...createInitialState(),
          status: 'playing',
          direction: 'RIGHT',
          snake: [{ x: 10, y: 10 }, { x: 9, y: 10 }],
          food: { x: 5, y: 10 },
        };

        const aiDirection = getAIDirection(state);
        expect(aiDirection).not.toBe('LEFT');
      }
    });

    it('avoids walls in walls mode', () => {
      const state: GameState = {
        ...createInitialState('walls'),
        status: 'playing',
        direction: 'RIGHT',
        snake: [{ x: GRID_SIZE - 1, y: 10 }, { x: GRID_SIZE - 2, y: 10 }],
        food: { x: 5, y: 10 },
      };

      for (let i = 0; i < 50; i++) {
        const aiDirection = getAIDirection(state);
        expect(aiDirection).not.toBe('RIGHT');
      }
    });
  });
});
