[![Tests](https://github.com/clovisphere/blip/actions/workflows/test.yml/badge.svg)](https://github.com/clovisphere/blip/actions)
[![Release](https://img.shields.io/github/v/release/clovisphere/blip)](https://github.com/clovisphere/blip/releases)
[![Docker](https://img.shields.io/docker/v/clovisphere/blip?label=docker&logo=docker&logoColor=white)](https://hub.docker.com/r/clovisphere/blip)
[![Bun](https://img.shields.io/badge/Bun-1.2-black?logo=bun)](https://bun.sh)
[![Vanilla JS](https://img.shields.io/badge/Vanilla_JS-ES2020-yellow?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

<p align="center">
  <img src="public/img/captain-blip.png" alt="Captain Blip" width="160" />
</p>

**Blip** — a pirate-themed deduction game for ages 9–12. Six hidden sea creatures lurk on a 4×7 grid. Fire cannonballs to find them all before you run out of shots.

## How to play

1. Serve locally (see below) and open `http://localhost:3000`.
2. Pick a level: **n00b**, **ninja**, or **hacker**.
3. Tap any cell to fire a cannonball — a creature pops up on a hit, a ✕ marks a miss.
4. Find all 6 beasts to win. Run out of shots and it's game over.

## Levels

| Level   | Shots | Beasts hide…          | Hints? |
| ------- | ----- | --------------------- | ------ |
| n00b    | 22    | In straight lines     | No     |
| ninja   | 16    | Anywhere (scattered)  | Yes — Captain Blip whispers a row or column after each miss |
| hacker  | 12    | Anywhere (scattered)  | No     |

No timer — it's all about the shots.

## Running locally

**With Bun:**

```bash
bun run dev
```

**With Docker:**

```bash
docker build -t blip .
docker run -p 3000:3000 blip
```

Then open `http://localhost:3000`.

> **Note:** The game uses ES modules (`type="module"`), so opening `index.html` directly via `file://` won't work. A local server is required.

## Running tests

```bash
bun test
```

## Project structure

```
blip/
├── index.html
├── server.js             # Bun static file server
├── tests/
│   └── game.test.js      # unit tests (bun:test)
└── public/
    ├── css/style.css
    └── js/
        ├── game.js       # pure logic — board building, hints, constants
        ├── main.js       # UI — 5-screen state machine, DOM, events
        ├── matrix.js     # Matrix rain canvas (unused, kept for later)
        └── sound.js      # Web Audio sound effects
```

## Tech

- Vanilla JS (ES modules, no build step, no dependencies)
- Web Audio API for procedural sound effects
- Pure CSS/HTML Captain Blip mascot (pirate face, 3 moods)
- Fonts: [Bangers](https://fonts.google.com/specimen/Bangers) + [Patrick Hand](https://fonts.google.com/specimen/Patrick+Hand) via Google Fonts

## TODO

- [x] Unit tests (game logic — board placement, hints, adjacency)
- [x] Mobile touch support
- [x] Multiple creatures with per-type colours
- [x] Pirate/comic-book redesign with Captain Blip mascot
- [ ] End-to-end tests (Playwright)
- [x] Dockerfile for containerised deployment
- [x] Makefile with `dev`, `test`, `build`, and `docker` targets
- [x] CI workflow (GitHub Actions — build and push image to Docker Hub)
- [x] Custom favicon (Captain Blip)
- [x] Early-loss rule: end the game when shots remaining < beasts remaining (unwinnable state)
- [ ] Per-level theming: distinct background/palette for ninja and hacker to reflect increasing danger
- [x] Center the game layout on all screen sizes (mobile and large desktop)
