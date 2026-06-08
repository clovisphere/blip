import { describe, it, expect } from "bun:test";
import {
  BOARD_SIZE,
  SHIP_LENGTH,
  TIMER_BONUS,
  DIFFICULTIES,
  randomPositions,
  consecutivePositions,
  createShip,
  isAborted,
} from "../public/js/game.js";

const isConsecutive = (set) => {
  const sorted = [...set].sort((a, b) => a - b);
  return sorted.every((v, i) => i === 0 || v === sorted[i - 1] + 1);
};

const inBounds = (set) => [...set].every((v) => v >= 0 && v < BOARD_SIZE);

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

  it("positions are always consecutive", () => {
    for (let i = 0; i < 50; i++) expect(isConsecutive(consecutivePositions())).toBe(true);
  });

  it("positions are within board bounds", () => {
    for (let i = 0; i < 50; i++) expect(inBounds(consecutivePositions())).toBe(true);
  });
});

describe("createShip", () => {
  it("n00b always places ship consecutively", () => {
    for (let i = 0; i < 30; i++) expect(isConsecutive(createShip("n00b"))).toBe(true);
  });

  it("ninja always places ship consecutively", () => {
    for (let i = 0; i < 30; i++) expect(isConsecutive(createShip("ninja"))).toBe(true);
  });

  it("hacker places a valid-sized ship", () => {
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
  it("BOARD_SIZE is 7", () => {
    expect(BOARD_SIZE).toBe(7);
  });

  it("SHIP_LENGTH is 3", () => {
    expect(SHIP_LENGTH).toBe(3);
  });

  it("TIMER_BONUS is 5 seconds", () => {
    expect(TIMER_BONUS).toBe(5);
  });
});

describe("DIFFICULTIES config", () => {
  it("n00b is forgiving — generous timer, not strict", () => {
    expect(DIFFICULTIES.n00b.timer).toBe(15);
    expect(DIFFICULTIES.n00b.strict).toBe(false);
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
