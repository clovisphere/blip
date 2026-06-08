```
.-')    .-') _   _  .-')          .-. .-')     ('-.                  .-') _   ,---. 
( OO ). (  OO) ) ( \( -O )         \  ( OO )  _(  OO)                (  OO) )  |   | 
(_)---\_)/     '._ ,------.  ,-.-') ,--. ,--. (,------.        ,-.-') /     '._ |   | 
/    _ | |'--...__)|   /`. ' |  |OO)|  .'   /  |  .---'        |  |OO)|'--...__)|   | 
\  :` `. '--.  .--'|  /  | | |  |  \|      /,  |  |            |  |  \'--.  .--'|   | 
'..`''.)   |  |   |  |_.' | |  |(_/|     ' _)(|  '--.         |  |(_/   |  |   |  .' 
.-._)   \   |  |   |  .  '.',|  |_.'|  .   \   |  .--'        ,|  |_.'   |  |   `--'  
\       /   |  |   |  |\  \(_|  |   |  |\   \  |  `---.      (_|  |      |  |   .--.  
`-----'    `--'   `--' '--' `--'   `--' '--'  `------'        `--'      `--'   '--'  
               — battleship —
```

A single-player battleship game played in the browser. Find and sink the hidden 3-cell ship on a 7-cell grid before you run out of attempts — or time.

## How to play

1. Open `index.html` in a browser (or serve it locally — see below).
2. Pick a difficulty: **N00b**, **Ninja**, or **Hacker**.
3. Click a grid cell to fire. Hits and misses show distinct icons per mode.
4. Sink all three ship sections to win. Hit **Play again** to reset.

## Difficulty modes

| Mode   | Attempts | Timer | Ship placement | Rule |
|--------|----------|-------|----------------|------|
| 🐣 N00b   | 6 | — | Consecutive | — |
| 🥷 Ninja  | 4 | 10 s | Consecutive | Ends early if remaining attempts can't cover remaining hits |
| 👾 Hacker | 3 | 5 s  | Random | Any miss ends the game immediately |

- In **Ninja** and **Hacker** modes a 10 s / 5 s countdown starts when the game begins.
- Each hit adds **+5 seconds** to the clock.
- Letting the timer reach zero is an instant loss.

## Cell icons

| Event | N00b | Ninja | Hacker |
|-------|------|-------|--------|
| Hit   | 🚢 | 💥 | ☠ |
| Miss  | 🌊 | 💨 | ✗ |
| Reveal (loss) | ⚓ | ⚓ | ? |

## Running locally

```bash
bun run dev
```

Then open `http://localhost:3000`.

Or with Python if you don't have Bun:

```bash
python -m http.server 3000
```

> **Note:** The game uses ES modules (`type="module"`), so opening `index.html` directly via `file://` will fail in most browsers due to CORS restrictions. A local server is required.

## Project structure

```
battleship/
├── index.html
├── package.json
├── server.js             # Bun static file server
└── public/
    ├── css/style.css
    └── js/
        ├── main.js       # game logic
        ├── matrix.js     # Matrix rain canvas (Hacker mode)
        └── sound.js      # Web Audio sound effects
```

## TODO

- [ ] Migrate to TypeScript
- [ ] Add unit tests (game logic — ship placement, hit/miss, abort conditions)
- [ ] Add end-to-end tests (Playwright)
- [ ] Bundle with Vite or esbuild
- [ ] Mobile touch improvements
- [ ] High score persistence across difficulty resets
- [ ] Multiplayer / PvP mode

## Tech

- Vanilla JS (ES modules, no build step)
- Web Audio API for procedural sound effects (hit, miss, win, lose, sonar, tick)
- CSS animations — per-cell fire burn on loss, confetti on win, vignette in Ninja mode, Matrix rain in Hacker mode
- Per-mode theming via CSS custom properties (amber / dark teal / terminal green)
