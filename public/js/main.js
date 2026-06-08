import { playSound } from "./sound.js";
import { startMatrix, stopMatrix } from "./matrix.js";
import { BOARD_SIZE, SHIP_LENGTH, TIMER_BONUS, DIFFICULTIES, createShip, isAborted } from "./game.js";

const SUBTITLES = {
  n00b:   "Find and sink the hidden ship",
  ninja:  "Strike fast. Leave no trace.",
  hacker: "Perfect aim required",
};

const ABORT_MESSAGES = {
  ninja:  "Shadow lost — mission aborted.",
  hacker: "ACCESS DENIED. Target offline.",
};

const WIN_MESSAGES = {
  n00b:   (n) => `Splendid! Ship sunk in ${n} attempt${n > 1 ? "s" : ""}!`,
  ninja:  (n) => `Ghost strike. Target down in ${n}.`,
  hacker: (n) => `TARGET_DESTROYED. ${n}/${SHIP_LENGTH} CONFIRMED.`,
};

const HIT_ICON    = { n00b: "🚢", ninja: "💥", hacker: "☠"  };
const MISS_ICON   = { n00b: "🌊", ninja: "💨", hacker: "✗"  };
const REVEAL_ICON = { n00b: "⚓", ninja: "⚓", hacker: "?"  };

const GIVE_UP_LABELS = {
  n00b:   "⚑ Give up",
  ninja:  "⚑ Abandon",
  hacker: "⚑ ABORT",
};

let difficulty = "n00b";
let ship, shipPositions, guesses, attempts;

const board        = document.getElementById("board");
const msgEl        = document.getElementById("status");
const attemptsEl   = document.getElementById("attempts");
const timerEl      = document.getElementById("timer");
const subtitleEl   = document.querySelector(".subtitle");
const giveUp       = document.getElementById("give-up");
const replay       = document.getElementById("replay");
const winTag       = document.getElementById("win-tag");
const game         = document.getElementById("game");
const matrixCanvas = document.getElementById("matrix-bg");

let sonarTimer = null;
let countdownInterval = null;
let timeRemaining = 0;

const stopCountdown = () => {
  clearInterval(countdownInterval);
  countdownInterval = null;
  timerEl.textContent = "";
  timerEl.className = "";
};

const startCountdown = () => {
  stopCountdown();
  timeRemaining = DIFFICULTIES[difficulty].timer;
  const tick = () => {
    timerEl.textContent = `0:${String(timeRemaining).padStart(2, "0")}`;
    timerEl.className = timeRemaining <= 5 ? "urgent" : "";
    if (timeRemaining <= 5 && timeRemaining > 0) playSound("tick");
    if (timeRemaining === 0) {
      stopCountdown();
      msgEl.textContent = "Time's up — ship escaped!";
      playSound("lose");
      endGame(false);
      return;
    }
    timeRemaining--;
  };
  tick();
  countdownInterval = setInterval(tick, 1000);
};

const sonarDelay = () => {
  const remaining = DIFFICULTIES[difficulty].maxAttempts - attempts;
  if (remaining <= 1) return 650;
  if (remaining <= 3) return 1100;
  return 2000;
};

const scheduleSonar = () => {
  sonarTimer = setTimeout(() => {
    playSound("sonar");
    scheduleSonar();
  }, sonarDelay());
};

const stopSonar = () => { clearTimeout(sonarTimer); sonarTimer = null; };

const cells = () => [...board.querySelectorAll(".cell")];

const moveFocus = (delta) => {
  const all = cells();
  const idx = all.indexOf(document.activeElement);
  if (idx === -1) return;
  const next = all.at((idx + delta + all.length) % all.length);
  all.forEach((c) => c.setAttribute("tabindex", "-1"));
  next.setAttribute("tabindex", "0");
  next.focus();
};


const init = () => {
  const { timer } = DIFFICULTIES[difficulty];
  shipPositions = createShip(difficulty);
  ship = new Set(shipPositions);
  guesses = new Set();
  attempts = 0;

  stopSonar();
  stopCountdown();
  game.classList.remove("lost");
  winTag.classList.remove("visible");
  msgEl.textContent = "";
  attemptsEl.textContent = "";
  replay.classList.remove("visible");
  giveUp.classList.add("visible");
  board.innerHTML = "";
  board.style.pointerEvents = "auto";
  if (timer != null) startCountdown();

  for (let i = 0; i < BOARD_SIZE; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.setAttribute("role", "gridcell");
    cell.setAttribute("tabindex", i === 0 ? "0" : "-1");
    cell.setAttribute("aria-label", `Position ${i}`);
    cell.innerHTML = `<span class="cell-icon">·</span>`;
    cell.addEventListener("click", () => handleGuess(i, cell));
    board.appendChild(cell);
  }
};

const revealShip = () => {
  cells().forEach((cell, i) => {
    if (shipPositions.has(i) && !guesses.has(i)) {
      cell.classList.add("reveal");
      cell.querySelector(".cell-icon").textContent = REVEAL_ICON[difficulty];
      cell.setAttribute("aria-label", `Position ${i} — ship was here`);
    }
  });
};

const launchFire = (onComplete) => {
  const allCells = cells();
  if (!allCells.length) { onComplete?.(); return; }
  allCells.forEach((cell, i) => {
    cell.style.animationDelay = `${i * 60}ms`;
    cell.classList.add("burning");
    cell.addEventListener("animationend", () => {
      cell.remove();
      if (i === allCells.length - 1) onComplete?.();
    }, { once: true });
  });
};

const endGame = (won, giveUpMsg = "") => {
  stopSonar();
  stopCountdown();
  board.style.pointerEvents = "none";
  giveUp.classList.remove("visible");
  replay.classList.add("visible");
  if (won) {
    winTag.classList.add("visible");
  } else {
    game.classList.add("lost");
    revealShip();
    if (giveUpMsg) setTimeout(() => { msgEl.textContent = giveUpMsg; }, 600);
    setTimeout(() => launchFire(() => { if (giveUpMsg) msgEl.textContent = ""; }), 1500);
  }
};

const handleGuess = (index, cell) => {
  if (guesses.has(index)) {
    msgEl.textContent = "Already guessed that position!";
    playSound("dupe");
    return;
  }

  guesses.add(index);
  attempts++;
  if (attempts === 1) scheduleSonar();

  const { maxAttempts, strict } = DIFFICULTIES[difficulty];
  const isHit = ship.delete(index);
  if (isHit && DIFFICULTIES[difficulty].timer != null) timeRemaining += TIMER_BONUS;
  cell.classList.add(isHit ? "hit" : "miss");
  cell.querySelector(".cell-icon").textContent = isHit ? HIT_ICON[difficulty] : MISS_ICON[difficulty];
  cell.setAttribute("aria-label", `Position ${index} — ${isHit ? "hit" : "miss"}`);

  const hits = SHIP_LENGTH - ship.size;
  attemptsEl.textContent = `Attempts: ${attempts} / ${maxAttempts}  ·  Hits: ${hits} / ${SHIP_LENGTH}`;

  if (ship.size === 0) {
    msgEl.textContent = WIN_MESSAGES[difficulty](attempts);
    playSound("win");
    launchConfetti();
    endGame(true);
  } else if (attempts >= maxAttempts) {
    msgEl.textContent = "Out of attempts — ship escaped!";
    playSound("lose");
    endGame(false);
  } else if (isAborted(strict, ship.size, maxAttempts - attempts)) {
    msgEl.textContent = ABORT_MESSAGES[difficulty];
    playSound("lose");
    endGame(false);
  } else {
    msgEl.textContent = isHit
      ? `Hit! ${ship.size} section${ship.size > 1 ? "s" : ""} remaining.`
      : `Miss! ${maxAttempts - attempts} attempt${maxAttempts - attempts > 1 ? "s" : ""} left.`;
    playSound(isHit ? "hit" : "miss");
  }
};

const launchConfetti = () => {
  const colors = ["#e6a817", "#0a9e8f", "#cc3333", "#f4f2ed", "#2a9d8f", "#e9c46a"];
  for (let i = 0; i < 80; i++) {
    const el = document.createElement("div");
    el.className = "confetti";
    el.style.cssText = `
      left: ${Math.random() * 100}vw;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      width: ${4 + Math.random() * 8}px;
      height: ${4 + Math.random() * 8}px;
      border-radius: ${Math.random() > 0.5 ? "50%" : "2px"};
      animation-duration: ${1.5 + Math.random() * 2}s;
      animation-delay: ${Math.random() * 0.5}s;
    `;
    document.body.appendChild(el);
    el.addEventListener("animationend", () => el.remove());
  }
};

board.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight" || e.key === "ArrowDown") {
    e.preventDefault();
    moveFocus(1);
  } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
    e.preventDefault();
    moveFocus(-1);
  } else if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    document.activeElement?.click();
  }
});

const applyDifficulty = (diff) => {
  difficulty = diff;
  document.body.className = `diff-${diff}`;
  subtitleEl.textContent = SUBTITLES[diff];
  giveUp.textContent = GIVE_UP_LABELS[diff];
  if (diff === "hacker") startMatrix(matrixCanvas);
  else stopMatrix(matrixCanvas);
};

document.querySelectorAll(".diff-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelector(".diff-btn.active")?.classList.remove("active");
    btn.classList.add("active");
    applyDifficulty(btn.dataset.diff);
    game.classList.add("fading");
    setTimeout(() => {
      init();
      game.classList.remove("fading");
    }, 200);
  });
});

applyDifficulty(difficulty);

giveUp.addEventListener("click", () => {
  playSound("lose");
  endGame(false, "You gave up — ship revealed!");
});

replay.addEventListener("click", init);
init();
