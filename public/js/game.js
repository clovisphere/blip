export const ROWS = 4;
export const COLS = 7;

export const DIFFICULTIES = {
  noob:   { shots: 22, scatter: false, hints: false, label: "n00b" },
  ninja:  { shots: 16, scatter: true,  hints: true,  label: "ninja" },
  hacker: { shots: 12, scatter: true,  hints: false, label: "hacker" },
};

export const CREATURES = [
  { name: "Octo",   color: "#9b6dc7" },
  { name: "Crab",   color: "#e0552b" },
  { name: "Eel",    color: "#36a06a" },
  { name: "Jelly",  color: "#e36aa0" },
  { name: "Shark",  color: "#4a86c0" },
  { name: "Puffer", color: "#e0a93a" },
];

const RUN_SETS = [[3, 3], [3, 2, 1], [2, 2, 2], [3, 2, 1]];

const hasAdjacent = (placed, i) => {
  const r = Math.floor(i / COLS), c = i % COLS;
  for (let dr = -1; dr <= 1; dr++)
    for (let dc = -1; dc <= 1; dc++) {
      if (!dr && !dc) continue;
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nc >= 0 && nr < ROWS && nc < COLS && placed[nr * COLS + nc]) return true;
    }
  return false;
};

export const buildBoard = (difficulty) => {
  const { scatter } = DIFFICULTIES[difficulty];
  const N = ROWS * COLS;
  const placed = new Array(N).fill(false);
  const assignments = new Array(N).fill(null);

  if (!scatter) {
    const runs = RUN_SETS[Math.floor(Math.random() * RUN_SETS.length)];
    runs.forEach((len, ci) => {
      let done = false, tries = 0;
      while (!done && tries++ < 300) {
        let idxs;
        if (Math.random() < 0.5) {
          const r = Math.floor(Math.random() * ROWS);
          const c = Math.floor(Math.random() * (COLS - len + 1));
          idxs = Array.from({ length: len }, (_, k) => r * COLS + c + k);
        } else {
          const c = Math.floor(Math.random() * COLS);
          const r = Math.floor(Math.random() * (ROWS - len + 1));
          idxs = Array.from({ length: len }, (_, k) => (r + k) * COLS + c);
        }
        if (idxs.every(i => !placed[i] && !hasAdjacent(placed, i))) {
          idxs.forEach(i => { placed[i] = true; assignments[i] = CREATURES[ci % CREATURES.length]; });
          done = true;
        }
      }
    });
  } else {
    let count = 0, guard = 0;
    while (count < CREATURES.length && guard++ < 600) {
      const i = Math.floor(Math.random() * N);
      if (!placed[i] && !hasAdjacent(placed, i)) {
        placed[i] = true;
        assignments[i] = CREATURES[count++];
      }
    }
  }

  return Array.from({ length: N }, (_, i) => ({
    treasure: placed[i],
    creature: assignments[i],
    revealed: false,
  }));
};

export const hintFor = (board) => {
  const hidden = board.reduce((acc, c, i) => (c.treasure && !c.revealed ? [...acc, i] : acc), []);
  if (!hidden.length) return null;
  const i = hidden[Math.floor(Math.random() * hidden.length)];
  return Math.random() < 0.5
    ? `column ${String.fromCharCode(65 + i % COLS)}`
    : `row ${Math.floor(i / COLS) + 1}`;
};
