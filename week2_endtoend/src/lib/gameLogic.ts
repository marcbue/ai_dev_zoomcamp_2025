// Snake game core logic

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
export type GameMode = 'passthrough' | 'walls';
export type GameStatus = 'idle' | 'playing' | 'paused' | 'gameOver';

export interface Position {
  x: number;
  y: number;
}

export interface GameState {
  snake: Position[];
  food: Position;
  direction: Direction;
  nextDirection: Direction;
  score: number;
  status: GameStatus;
  mode: GameMode;
  gridSize: number;
  speed: number;
}

export const INITIAL_SPEED = 150;
export const MIN_SPEED = 50;
export const SPEED_INCREASE = 5;
export const GRID_SIZE = 20;

export const createInitialState = (mode: GameMode = 'walls'): GameState => {
  const center = Math.floor(GRID_SIZE / 2);
  return {
    snake: [
      { x: center, y: center },
      { x: center - 1, y: center },
      { x: center - 2, y: center },
    ],
    food: generateFood([{ x: center, y: center }, { x: center - 1, y: center }, { x: center - 2, y: center }]),
    direction: 'RIGHT',
    nextDirection: 'RIGHT',
    score: 0,
    status: 'idle',
    mode,
    gridSize: GRID_SIZE,
    speed: INITIAL_SPEED,
  };
};

export const generateFood = (snake: Position[]): Position => {
  let food: Position;
  do {
    food = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (snake.some(segment => segment.x === food.x && segment.y === food.y));
  return food;
};

export const getOppositeDirection = (direction: Direction): Direction => {
  const opposites: Record<Direction, Direction> = {
    UP: 'DOWN',
    DOWN: 'UP',
    LEFT: 'RIGHT',
    RIGHT: 'LEFT',
  };
  return opposites[direction];
};

export const isValidDirectionChange = (current: Direction, next: Direction): boolean => {
  return next !== getOppositeDirection(current);
};

export const moveSnake = (state: GameState): GameState => {
  if (state.status !== 'playing') return state;

  const head = { ...state.snake[0] };
  const direction = state.nextDirection;

  // Move head based on direction
  switch (direction) {
    case 'UP':
      head.y -= 1;
      break;
    case 'DOWN':
      head.y += 1;
      break;
    case 'LEFT':
      head.x -= 1;
      break;
    case 'RIGHT':
      head.x += 1;
      break;
  }

  // Handle wall collision based on mode
  if (state.mode === 'passthrough') {
    // Wrap around
    if (head.x < 0) head.x = GRID_SIZE - 1;
    if (head.x >= GRID_SIZE) head.x = 0;
    if (head.y < 0) head.y = GRID_SIZE - 1;
    if (head.y >= GRID_SIZE) head.y = 0;
  } else {
    // Wall collision = game over
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      return { ...state, status: 'gameOver', direction };
    }
  }

  // Check self collision
  if (state.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
    return { ...state, status: 'gameOver', direction };
  }

  // Create new snake with head
  const newSnake = [head, ...state.snake];

  // Check if food eaten
  const ateFood = head.x === state.food.x && head.y === state.food.y;
  
  if (!ateFood) {
    newSnake.pop(); // Remove tail if no food eaten
  }

  return {
    ...state,
    snake: newSnake,
    food: ateFood ? generateFood(newSnake) : state.food,
    score: ateFood ? state.score + 10 : state.score,
    direction,
    speed: ateFood ? Math.max(MIN_SPEED, state.speed - SPEED_INCREASE) : state.speed,
  };
};

export const changeDirection = (state: GameState, newDirection: Direction): GameState => {
  if (state.status !== 'playing') return state;
  
  if (isValidDirectionChange(state.direction, newDirection)) {
    return { ...state, nextDirection: newDirection };
  }
  return state;
};

// AI logic for spectator mode simulation
export const getAIDirection = (state: GameState): Direction => {
  const head = state.snake[0];
  const food = state.food;
  const possibleDirections: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
  
  // Filter out opposite direction
  const validDirections = possibleDirections.filter(
    d => isValidDirectionChange(state.direction, d)
  );

  // Filter out directions that would cause immediate collision
  const safeDirections = validDirections.filter(d => {
    const newHead = { ...head };
    switch (d) {
      case 'UP': newHead.y -= 1; break;
      case 'DOWN': newHead.y += 1; break;
      case 'LEFT': newHead.x -= 1; break;
      case 'RIGHT': newHead.x += 1; break;
    }

    // Check wall collision in walls mode
    if (state.mode === 'walls') {
      if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
        return false;
      }
    }

    // Check self collision
    return !state.snake.some(s => s.x === newHead.x && s.y === newHead.y);
  });

  if (safeDirections.length === 0) {
    return state.direction; // No safe move, keep current direction
  }

  // Prefer direction towards food
  const foodDirection = safeDirections.find(d => {
    switch (d) {
      case 'UP': return food.y < head.y;
      case 'DOWN': return food.y > head.y;
      case 'LEFT': return food.x < head.x;
      case 'RIGHT': return food.x > head.x;
    }
    return false;
  });

  // Add some randomness (30% chance to not go directly to food)
  if (foodDirection && Math.random() > 0.3) {
    return foodDirection;
  }

  // Random safe direction
  return safeDirections[Math.floor(Math.random() * safeDirections.length)];
};
