import { describe, it, expect } from "bun:test";
import { ROWS, COLS, DIFFICULTIES, CREATURES, buildBoard, hintFor } from "../public/js/game.js";

const TOTAL_CELLS  = ROWS * COLS;
const TOTAL_BEASTS = CREATURES.length;

const adjTo = (board, i) => {
  const r = Math.floor(i / COLS), c = i % COLS;
  for (let dr = -1; dr <= 1; dr++)
    for (let dc = -1; dc <= 1; dc++) {
      if (!dr && !dc) continue;
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nc >= 0 && nr < ROWS && nc < COLS && board[nr * COLS + nc].treasure) return true;
    }
  return false;
};

describe("constants", () => {
  it("ROWS is 4",  () => expect(ROWS).toBe(4));
  it("COLS is 7",  () => expect(COLS).toBe(7));
});

describe("DIFFICULTIES config", () => {
  it("noob has 22 shots, no scatter, no hints", () => {
    expect(DIFFICULTIES.noob.shots).toBe(22);
    expect(DIFFICULTIES.noob.scatter).toBe(false);
    expect(DIFFICULTIES.noob.hints).toBe(false);
  });

  it("ninja has 16 shots, scatter enabled, hints enabled", () => {
    expect(DIFFICULTIES.ninja.shots).toBe(16);
    expect(DIFFICULTIES.ninja.scatter).toBe(true);
    expect(DIFFICULTIES.ninja.hints).toBe(true);
  });

  it("hacker has 12 shots, scatter enabled, no hints", () => {
    expect(DIFFICULTIES.hacker.shots).toBe(12);
    expect(DIFFICULTIES.hacker.scatter).toBe(true);
    expect(DIFFICULTIES.hacker.hints).toBe(false);
  });

  it("all modes have a non-empty display label", () => {
    Object.values(DIFFICULTIES).forEach(cfg => {
      expect(typeof cfg.label).toBe("string");
      expect(cfg.label.length).toBeGreaterThan(0);
    });
  });
});

describe("CREATURES", () => {
  it("has 6 creatures", () => expect(CREATURES.length).toBe(6));

  it("each creature has a name and a hex color", () => {
    CREATURES.forEach(c => {
      expect(typeof c.name).toBe("string");
      expect(c.color).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });

  it("all creature names are unique", () => {
    const names = CREATURES.map(c => c.name);
    expect(new Set(names).size).toBe(names.length);
  });
});

describe("buildBoard", () => {
  it("returns exactly ROWS × COLS cells", () => {
    expect(buildBoard("noob").length).toBe(TOTAL_CELLS);
  });

  it("all cells start unrevealed", () => {
    buildBoard("ninja").forEach(c => expect(c.revealed).toBe(false));
  });

  it("has exactly 6 treasures in all modes", () => {
    for (const mode of ["noob", "ninja", "hacker"]) {
      expect(buildBoard(mode).filter(c => c.treasure).length).toBe(TOTAL_BEASTS);
    }
  });

  it("every treasure cell has a creature with name and color", () => {
    buildBoard("noob").filter(c => c.treasure).forEach(c => {
      expect(c.creature).toBeTruthy();
      expect(typeof c.creature.name).toBe("string");
      expect(c.creature.color).toMatch(/^#/);
    });
  });

  it("non-treasure cells have null creature", () => {
    buildBoard("hacker").filter(c => !c.treasure).forEach(c => {
      expect(c.creature).toBeNull();
    });
  });

  it("hacker: no two beasts are adjacent (20 boards)", () => {
    for (let t = 0; t < 20; t++) {
      const board = buildBoard("hacker");
      board.forEach((cell, i) => {
        if (cell.treasure) expect(adjTo(board, i)).toBe(false);
      });
    }
  });

  it("ninja: no two beasts are adjacent (20 boards)", () => {
    for (let t = 0; t < 20; t++) {
      const board = buildBoard("ninja");
      board.forEach((cell, i) => {
        if (cell.treasure) expect(adjTo(board, i)).toBe(false);
      });
    }
  });

  it("noob: always places exactly 6 treasures (30 boards)", () => {
    for (let t = 0; t < 30; t++) {
      expect(buildBoard("noob").filter(c => c.treasure).length).toBe(TOTAL_BEASTS);
    }
  });
});

describe("hintFor", () => {
  it("returns null when no hidden treasures remain", () => {
    const board = buildBoard("ninja").map(c => ({ ...c, revealed: true }));
    expect(hintFor(board)).toBeNull();
  });

  it("returns a string when hidden treasures exist", () => {
    const hint = hintFor(buildBoard("ninja"));
    expect(typeof hint).toBe("string");
    expect(hint.length).toBeGreaterThan(0);
  });

  it("hint matches 'column X' or 'row N' format (40 samples)", () => {
    for (let t = 0; t < 40; t++) {
      expect(hintFor(buildBoard("ninja"))).toMatch(/^(column [A-G]|row [1-4])$/);
    }
  });

  it("returns non-null when only one hidden treasure remains", () => {
    const base = buildBoard("ninja");
    const hiddenIdx = base.reduce((acc, c, i) => c.treasure ? [...acc, i] : acc, []);
    const board = base.map((c, i) => hiddenIdx.slice(0, -1).includes(i) ? { ...c, revealed: true } : c);
    expect(hintFor(board)).not.toBeNull();
  });
});
