import { playSound, setSoundEnabled } from "./sound.js";
import { ROWS, COLS, DIFFICULTIES, CREATURES, buildBoard, hintFor } from "./game.js";

const app = document.getElementById("app");
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ── state ─────────────────────────────────────────────────────────────────────
const state = {
  screen: "home",
  difficulty: null,
  board: [],
  shotsLeft: 0,
  total: 0,
  found: 0,
  mood: "happy",
  line: "",
  soundOn: true,
};

try {
  const s = JSON.parse(localStorage.getItem("blip_settings") || "{}");
  if (typeof s.soundOn === "boolean") state.soundOn = s.soundOn;
} catch (_) {}

setSoundEnabled(state.soundOn);

// ── helpers ───────────────────────────────────────────────────────────────────
const setState = (patch) => {
  Object.assign(state, typeof patch === "function" ? patch(state) : patch);
  render();
};

const saveSound = () => {
  try { localStorage.setItem("blip_settings", JSON.stringify({ soundOn: state.soundOn })); } catch (_) {}
};

// ── Captain Blip mascot ───────────────────────────────────────────────────────
const blip = (mood, size = "130px") => {
  const happy = mood === "happy", sad = mood === "sad";
  const mouth = happy
    ? `<div style="position:absolute;top:66%;left:38%;width:24%;height:16%;background:#8a3540;border:3px solid #2b2b2b;border-radius:10px 10px 60px 60px;overflow:hidden;z-index:6;"><div style="position:absolute;bottom:-6%;left:28%;width:44%;height:55%;background:#ef8a93;border-radius:50%;"></div></div>`
    : sad
    ? `<div style="position:absolute;top:75%;left:40%;width:20%;height:9%;border:3px solid #2b2b2b;border-bottom:none;border-radius:60px 60px 0 0;background:transparent;z-index:6;"></div>`
    : `<div style="position:absolute;top:70%;left:40%;width:20%;height:9%;border:3px solid #2b2b2b;border-top:none;border-radius:0 0 60px 60px;background:transparent;z-index:6;"></div>`;

  return `<div style="position:relative;width:${size};height:${size};">
    <div class="blip-bob" style="position:absolute;inset:0;">
      <div style="position:absolute;top:13%;left:3%;width:94%;height:17%;background:#27384d;border:3px solid #18222e;border-radius:50%;z-index:1;"></div>
      <div style="position:absolute;top:-1%;left:23%;width:54%;height:27%;background:#2f4761;border:3px solid #18222e;border-radius:42% 42% 26% 26%;z-index:1;"></div>
      <div style="position:absolute;top:4%;left:42%;width:16%;height:16%;background:#ffd23f;border:3px solid #18222e;border-radius:50%;z-index:2;"></div>
      <div style="position:absolute;top:29%;left:18%;width:64%;height:61%;background:#f2c189;border:3px solid #2b2b2b;border-radius:50% 50% 48% 48%;z-index:2;"></div>
      <div style="position:absolute;top:34%;left:24%;width:58%;height:6%;background:#15202c;transform:rotate(-9deg);border-radius:4px;z-index:4;"></div>
      <div style="position:absolute;top:45%;left:31%;width:16%;height:17%;background:#fff;border:3px solid #2b2b2b;border-radius:50%;z-index:5;"><div style="position:absolute;width:52%;height:52%;bottom:14%;left:24%;background:#1a1a1a;border-radius:50%;"></div></div>
      <div style="position:absolute;top:45%;left:55%;width:15%;height:16%;background:#15202c;border:3px solid #15202c;border-radius:50%;z-index:5;"></div>
      <div style="position:absolute;top:64%;left:27%;width:9%;height:6.5%;background:#ef9aa0;border-radius:50%;opacity:0.8;z-index:3;"></div>
      <div style="position:absolute;top:64%;left:63%;width:9%;height:6.5%;background:#ef9aa0;border-radius:50%;opacity:0.8;z-index:3;"></div>
      ${mouth}
    </div>
  </div>`;
};

// ── creature reveal ───────────────────────────────────────────────────────────
const eye = (left) =>
  `<span style="position:absolute;top:24%;left:${left};width:24%;height:24%;background:#fff;border-radius:50%;border:2px solid #2b2b2b;display:flex;align-items:flex-end;justify-content:center;"><span style="width:42%;height:42%;background:#1a1a1a;border-radius:50%;margin-bottom:14%;"></span></span>`;

const creatureHTML = (color) =>
  `<span class="creature-pop" style="position:absolute;inset:9%;border-radius:48% 48% 46% 46%;border:2.5px solid #2b2b2b;background:${color};">${eye("22%")}${eye("54%")}</span>`;

// ── board ─────────────────────────────────────────────────────────────────────
const boardHTML = () => {
  const colLabels = Array.from("ABCDEFG").map(l => `<span>${l}</span>`).join("");
  const rowLabels = [1, 2, 3, 4].map(n => `<span>${n}</span>`).join("");
  const cells = state.board.map((cell, i) => {
    let inner = `<span class="cell-water">~</span>`;
    if (cell.revealed && cell.treasure) inner = creatureHTML(cell.creature.color);
    if (cell.revealed && !cell.treasure) inner = `<span class="cell-miss">✕</span>`;
    const row = Math.floor(i / COLS) + 1;
    const col = String.fromCharCode(65 + i % COLS);
    return `<button class="cell${cell.revealed ? " revealed" : ""}" data-cell="${i}"${cell.revealed ? " disabled" : ""} aria-label="Row ${row}, column ${col}">${inner}</button>`;
  }).join("");

  return `<div class="sea-board">
    <div class="board-grid">
      <div></div>
      <div class="col-labels">${colLabels}</div>
      <div class="row-labels">${rowLabels}</div>
      <div class="cells">${cells}</div>
    </div>
  </div>`;
};

// ── screens ───────────────────────────────────────────────────────────────────
const homeHTML = () => {
  const sndTxt = state.soundOn ? "♪ on" : "♪ off";
  return `<div class="screen screen-home">
    <div class="blip-float">${blip("happy", "170px")}</div>
    <h1 class="game-title">blip!</h1>
    <p class="tagline">Captain Blip needs a first mate.<br>Tap the sea, find the hidden beasts — before you run out of cannonballs!</p>
    <button class="btn-primary" data-action="levels">PLAY</button>
    <div class="rule-chips">
      <span class="chip">1 · tap to fire</span>
      <span class="chip">2 · hit = beast pops up</span>
      <span class="chip">3 · find them all to win</span>
    </div>
    <button class="btn-sound" data-action="sound">${sndTxt}</button>
  </div>`;
};

const levelsHTML = () =>
  `<div class="screen screen-levels">
    <h2 class="levels-title">pick your level</h2>
    <p class="levels-sub">More beasts hidden, fewer shots, less help.</p>
    <div class="level-cards">
      <button class="level-card" data-action="noob">
        <span class="lv-name noob">n00b</span>
        <span class="lv-desc">Beasts swim in <b>straight lines</b> — easy to track down.</span>
        <span class="lv-badge noob-badge">22 shots <span class="badge-sub">+ cheers</span></span>
      </button>
      <button class="level-card" data-action="ninja">
        <span class="lv-name ninja">ninja</span>
        <span class="lv-desc">Beasts hide <b>anywhere</b> — but I <b>whisper hints</b>.</span>
        <span class="lv-badge ninja-badge">16 shots <span class="badge-sub">+ hints</span></span>
      </button>
      <button class="level-card hacker-card" data-action="hacker">
        <span class="lv-name hacker">hacker</span>
        <span class="lv-desc hacker-desc">Beasts hide <b>anywhere</b>. <b>No hints.</b> Pure skill.</span>
        <span class="lv-badge hacker-badge">12 shots <span class="badge-sub hacker-sub">brutal</span></span>
      </button>
    </div>
    <button class="btn-back" data-action="home">← back</button>
  </div>`;

const playHTML = () => {
  const cfg = DIFFICULTIES[state.difficulty];
  const pips = Array.from({ length: state.total }, (_, i) =>
    `<span class="pip${i < state.found ? " pip-on" : ""}"></span>`
  ).join("");
  const sndCls = state.soundOn ? "" : " snd-off";

  return `<div class="screen screen-play">
    <div class="hud">
      <span class="hud-mode">${cfg.label} hunt</span>
      <span class="shots-left">${state.shotsLeft} <span class="shots-word">shots left</span></span>
      <div class="pips-group"><span class="pips-lbl">beasts</span><div class="pips">${pips}</div></div>
      <button class="btn-snd-sm${sndCls}" data-action="sound">♪</button>
    </div>
    <div class="play-area">
      ${boardHTML()}
      <div class="sidekick">
        ${blip(state.mood, "110px")}
        <div class="speech">${state.line}<span class="speech-tip"></span></div>
        <button class="btn-back" data-action="levels">give up · pick level</button>
      </div>
    </div>
  </div>`;
};

const winHTML = () => {
  const cfg = DIFFICULTIES[state.difficulty];
  const used = cfg.shots - state.shotsLeft;
  const pct = used > 0 ? Math.round((state.found / used) * 100) : 100;
  return `<div class="screen screen-end">
    <div class="blip-float">${blip("happy", "150px")}</div>
    <h2 class="end-title win-col">YOU WON!</h2>
    <p class="end-line">${state.line}</p>
    <div class="end-stats">
      <span class="stat-pill">${cfg.label}</span>
      <span class="stat-pill">${used} shots used</span>
      <span class="stat-pill">${pct}% aim</span>
    </div>
    <div class="end-btns">
      <button class="btn-primary" data-action="play-again">PLAY AGAIN</button>
      <button class="btn-secondary" data-action="levels">New level</button>
    </div>
  </div>`;
};

const loseHTML = () =>
  `<div class="screen screen-end">
    ${blip("sad", "150px")}
    <h2 class="end-title lose-col">OUT OF CANNONBALLS!</h2>
    <p class="end-line">${state.line}</p>
    <span class="stat-pill">Found ${state.found} of ${state.total} beasts</span>
    <div class="end-btns">
      <button class="btn-primary" data-action="play-again">TRY AGAIN</button>
      <button class="btn-secondary" data-action="levels">Easier level</button>
    </div>
  </div>`;

// ── render ────────────────────────────────────────────────────────────────────
const SCREENS = { home: homeHTML, levels: levelsHTML, play: playHTML, win: winHTML, lose: loseHTML };

const render = () => { app.innerHTML = (SCREENS[state.screen] || homeHTML)(); };

// ── game actions ──────────────────────────────────────────────────────────────
const startGame = (difficulty) => {
  playSound("click");
  const board = buildBoard(difficulty);
  const total = board.filter(c => c.treasure).length;
  const intros = {
    noob:   "Easy waters! Beasts swim in straight lines.",
    ninja:  "Sneaky beasts about — I'll whisper hints after misses!",
    hacker: "No hints out here, matey. Hunt sharp!",
  };
  setState({ screen: "play", difficulty, board, shotsLeft: DIFFICULTIES[difficulty].shots, total, found: 0, mood: "idle", line: intros[difficulty] });
};

const fire = (i) => {
  if (state.screen !== "play") return;
  const cell = state.board[i];
  if (cell.revealed || state.shotsLeft <= 0) return;

  playSound("blip");
  const board = state.board.map((c, idx) => idx === i ? { ...c, revealed: true } : c);
  const shots = state.shotsLeft - 1;
  let found = state.found;
  let mood, line;

  if (cell.treasure) {
    found++;
    playSound("hit");
    mood = "happy";
    line = pick([`Blip! Gotcha — a ${cell.creature.name}!`, `Haha, found a ${cell.creature.name}!`, `Yarr, it's a ${cell.creature.name}!`]);
  } else {
    playSound("miss");
    mood = "idle";
    line = pick(["Blip… just water.", "Splash! Nothing there.", "Empty sea — try again!"]);
  }

  setState({ board, found, shotsLeft: shots, mood, line });

  if (found >= state.total) {
    launchConfetti();
    setTimeout(() => finish("win"), 650);
  } else if (shots <= 0) {
    setTimeout(() => finish("lose"), 650);
  } else if (DIFFICULTIES[state.difficulty].hints && !cell.treasure) {
    setTimeout(() => {
      const hint = hintFor(state.board);
      if (hint) setState({ mood: "point", line: `Psst… I sense a beast in ${hint}!` });
    }, 500);
  }
};

const finish = (kind) => {
  playSound(kind === "win" ? "win" : "lose");
  const line = pick(
    kind === "win"
      ? ["We caught 'em all! Yo-ho-ho!", "Treasure hunters supreme!", "Every beast found — legendary!"]
      : ["They slipped away this time…", "So close, matey! One more go?", "The sea wins this round…"]
  );
  setState({ screen: kind, mood: kind === "win" ? "happy" : "sad", line });
};

const launchConfetti = () => {
  const colors = ["#ffd23f", "#0e7c86", "#e0552b", "#9b6dc7", "#36a06a", "#e36aa0"];
  for (let i = 0; i < 80; i++) {
    const el = document.createElement("div");
    el.className = "confetti";
    el.style.cssText = `left:${Math.random() * 100}vw;background:${colors[Math.floor(Math.random() * colors.length)]};width:${4 + Math.random() * 8}px;height:${4 + Math.random() * 8}px;border-radius:${Math.random() > 0.5 ? "50%" : "2px"};animation-duration:${1.5 + Math.random() * 2}s;animation-delay:${Math.random() * 0.5}s;`;
    document.body.appendChild(el);
    el.addEventListener("animationend", () => el.remove());
  }
};

// ── event delegation ──────────────────────────────────────────────────────────
document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (btn) {
    const a = btn.dataset.action;
    if (a === "home")       { playSound("click"); setState({ screen: "home" }); }
    else if (a === "levels"){ playSound("click"); setState({ screen: "levels" }); }
    else if (a === "noob")  { startGame("noob"); }
    else if (a === "ninja") { startGame("ninja"); }
    else if (a === "hacker"){ startGame("hacker"); }
    else if (a === "play-again") { startGame(state.difficulty); }
    else if (a === "sound") {
      const on = !state.soundOn;
      setSoundEnabled(on);
      saveSound();
      setState({ soundOn: on });
    }
  }
  const cell = e.target.closest("[data-cell]");
  if (cell && !cell.disabled) fire(+cell.dataset.cell);
});

// arrow-key navigation within the board
document.addEventListener("keydown", (e) => {
  if (state.screen !== "play") return;
  const active = document.activeElement;
  if (active?.dataset.cell === undefined) return;
  const deltas = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: COLS, ArrowUp: -COLS };
  const delta = deltas[e.key];
  if (delta === undefined) return;
  e.preventDefault();
  const next = +active.dataset.cell + delta;
  if (next >= 0 && next < ROWS * COLS) {
    document.querySelector(`[data-cell="${next}"]`)?.focus();
  }
});

// ── init ──────────────────────────────────────────────────────────────────────
render();
