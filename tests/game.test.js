import { describe, it, expect } from "bun:test";
import {
  ROWS,
  COLS,
  SHIP_LENGTH,
  TIMER_BONUS,
  DIFFICULTIES,
  randomPositions,
  consecutivePositions,
  createShip,
  isAborted,
} from "../public/js/game.js";

const inBounds = (set) => [...set].every((v) => v >= 0 && v < ROWS * COLS);

const isHorizontal = (set) => {
  const sorted = [...set].sort((a, b) => a - b);
  const sameRow = sorted.every((v) => Math.floor(v / COLS) === Math.floor(sorted[0] / COLS));
  const consecutive = sorted.every((v, i) => i === 0 || v === sorted[i - 1] + 1);
  return sameRow && consecutive;
};

const isVertical = (set) => {
  const sorted = [...set].sort((a, b) => a - b);
  return sorted.every((v, i) => i === 0 || v === sorted[i - 1] + COLS);
};

const isConsecutive2D = (set) => isHorizontal(set) || isVertical(set);

describe("randomPositions", () => {
  it("returns exactly SHIP_LENGTH positions", () => {
    expect(randomPositions().size).toBe(SHIP_LENGTH);
  });

  it("all positions are within board bounds", () => {
    for (let i = 0; i < 50; i++) expect(inBounds(randomPositions())).toBe(true);
  });
});

describe("consecutivePositions", () => {
  it("returns exactly SHIP_LENGTH positions", () => {
    expect(consecutivePositions().size).toBe(SHIP_LENGTH);
  });

  it("positions are always consecutive horizontally or vertically", () => {
    for (let i = 0; i < 50; i++) expect(isConsecutive2D(consecutivePositions())).toBe(true);
  });

  it("positions are within board bounds", () => {
    for (let i = 0; i < 50; i++) expect(inBounds(consecutivePositions())).toBe(true);
  });

  it("horizontal ships stay within their row", () => {
    for (let i = 0; i < 50; i++) {
      const pos = consecutivePositions();
      if (isHorizontal(pos)) {
        const sorted = [...pos].sort((a, b) => a - b);
        expect(Math.floor(sorted[0] / COLS)).toBe(Math.floor(sorted[sorted.length - 1] / COLS));
      }
    }
  });

  it("vertical ships stay within their column", () => {
    for (let i = 0; i < 50; i++) {
      const pos = consecutivePositions();
      if (isVertical(pos)) {
        const sorted = [...pos].sort((a, b) => a - b);
        expect(sorted[0] % COLS).toBe(sorted[sorted.length - 1] % COLS);
      }
    }
  });
});

describe("createShip", () => {
  it("n00b always places ship consecutively", () => {
    for (let i = 0; i < 30; i++) expect(isConsecutive2D(createShip("n00b"))).toBe(true);
  });

  it("ninja always places ship consecutively", () => {
    for (let i = 0; i < 30; i++) expect(isConsecutive2D(createShip("ninja"))).toBe(true);
  });

  it("hacker places a valid-sized ship within bounds", () => {
    for (let i = 0; i < 30; i++) {
      const ship = createShip("hacker");
      expect(ship.size).toBe(SHIP_LENGTH);
      expect(inBounds(ship)).toBe(true);
    }
  });
});

describe("isAborted", () => {
  it("never aborts when not strict", () => {
    expect(isAborted(false, 3, 0)).toBe(false);
    expect(isAborted(false, 2, 1)).toBe(false);
  });

  it("does not abort when ship sections <= remaining attempts", () => {
    expect(isAborted(true, 1, 1)).toBe(false);
    expect(isAborted(true, 2, 3)).toBe(false);
  });

  it("aborts when ship sections exceed remaining attempts", () => {
    expect(isAborted(true, 3, 2)).toBe(true);
    expect(isAborted(true, 2, 1)).toBe(true);
    expect(isAborted(true, 1, 0)).toBe(true);
  });
});

describe("constants", () => {
  it("ROWS is 4", () => {
    expect(ROWS).toBe(4);
  });

  it("COLS is 7", () => {
    expect(COLS).toBe(7);
  });

  it("SHIP_LENGTH is 3", () => {
    expect(SHIP_LENGTH).toBe(3);
  });

  it("TIMER_BONUS is 5 seconds", () => {
    expect(TIMER_BONUS).toBe(5);
  });
});

describe("DIFFICULTIES config", () => {
  it("n00b has generous attempts and timer", () => {
    expect(DIFFICULTIES.n00b.timer).toBe(15);
    expect(DIFFICULTIES.n00b.strict).toBe(true);
    expect(DIFFICULTIES.n00b.maxAttempts).toBe(6);
  });

  it("ninja and hacker are strict", () => {
    expect(DIFFICULTIES.ninja.strict).toBe(true);
    expect(DIFFICULTIES.hacker.strict).toBe(true);
  });

  it("hacker uses random placement", () => {
    expect(DIFFICULTIES.hacker.consecutive).toBe(false);
  });
});
