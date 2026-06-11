export const ROWS        = 4;
export const COLS        = 7;
export const SHIP_LENGTH = 3;
export const TIMER_BONUS = 5;

export const DIFFICULTIES = {
  n00b:   { maxAttempts: 6, consecutive: true,  timer: 15, strict: true },
  ninja:  { maxAttempts: 4, consecutive: true,  timer: 10, strict: true },
  hacker: { maxAttempts: 3, consecutive: false, timer: 5,  strict: true },
};

export const randomPositions = () => {
  const indices = Array.from({ length: ROWS * COLS }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return new Set(indices.slice(0, SHIP_LENGTH));
};

export const consecutivePositions = () => {
  if (Math.random() < 0.5) {
    const row = Math.floor(Math.random() * ROWS);
    const col = Math.floor(Math.random() * (COLS - SHIP_LENGTH + 1));
    return new Set(Array.from({ length: SHIP_LENGTH }, (_, i) => row * COLS + col + i));
  }
  const row = Math.floor(Math.random() * (ROWS - SHIP_LENGTH + 1));
  const col = Math.floor(Math.random() * COLS);
  return new Set(Array.from({ length: SHIP_LENGTH }, (_, i) => (row + i) * COLS + col));
};

export const createShip = (difficulty) =>
  DIFFICULTIES[difficulty].consecutive ? consecutivePositions() : randomPositions();

export const isAborted = (strict, shipSize, attemptsLeft) => strict && shipSize > attemptsLeft;
