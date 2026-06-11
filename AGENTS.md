# Blip — Agent & Developer Guide

## Project

Single-player browser deduction game with a pirate/comic-book theme. Six hidden creatures are scattered on a 4×7 grid; the player fires cannonballs until all beasts are found, shots run out, or (in ninja mode) hints lead the way.

## Stack

- Vanilla JS, ES modules, no build step, no dependencies.
- Bun for the dev server and test runner.
- Web Audio API for procedural sound effects.
- Fonts: Bangers (headings) + Patrick Hand (body), loaded from Google Fonts.

## Running locally

```bash
bun run dev        # serves at http://localhost:3000
bun test           # run unit tests
```

## Project structure

```
battleship/
├── index.html
├── server.js              # Bun static file server
├── tests/
│   └── game.test.js       # unit tests (bun:test)
└── public/
    ├── css/style.css
    └── js/
        ├── game.js        # pure game logic — board building, hints, constants
        ├── main.js        # UI layer — 5-screen state machine, DOM, events
        ├── matrix.js      # Matrix rain canvas (unused, kept for later)
        └── sound.js       # Web Audio sound effects
```

**Hard boundary:** `game.js` is pure logic with zero DOM or browser API access. Keep it that way — it is what makes the unit tests fast and reliable.

## Grid

- **4 rows × 7 columns** = 28 cells total, indexed `0..27` (flat: `row * COLS + col`)
- `ROWS = 4`, `COLS = 7` exported from `game.js` — never hardcode these values elsewhere
- Column labels A–G, row labels 1–4

## Creatures & placement

Six creatures are hidden per game — one per entry in `CREATURES` (Octo, Crab, Eel, Jelly, Shark, Puffer). Each has a `name` and `color`.

Placement depends on mode:

| Mode   | Shots | Scatter | Hints | Placement style                                   |
|--------|-------|---------|-------|---------------------------------------------------|
| n00b   | 22    | false   | false | Consecutive runs (horizontal or vertical groups)  |
| ninja  | 16    | true    | true  | 6 individual scattered cells (non-adjacent)       |
| hacker | 12    | true    | false | 6 individual scattered cells (non-adjacent)       |

**Non-adjacent constraint:** no two creatures (from different runs/groups) may occupy 8-directionally adjacent cells.

**Hints (ninja only):** after each miss, Captain Blip whispers which column or row contains a hidden beast.

## Screens (main.js state machine)

`state.screen` cycles through: `home → levels → play → win / lose`

- **home** — mascot + title + PLAY button + rule chips + sound toggle
- **levels** — three level cards (noob / ninja / hacker)
- **play** — HUD (mode, shots, beast pips, sound) + board + sidekick
- **win / lose** — end screen with stats and replay actions

## Captain Blip mascot

Pure CSS/HTML pirate face, rendered by the `blip(mood, size)` function in `main.js`. Moods: `happy` (big smile), `sad` (frown), `idle` / `point` (small neutral curve). Uses `.blip-bob` CSS animation.

## Code style

- Keep code **simple and concise**. Prefer direct expressions over abstractions.
- No comments unless the _why_ is genuinely non-obvious.
- No TypeScript, no transpilation — plain ES2020+ that browsers understand natively.
- No defensive error handling for internal paths; validate only at real boundaries (user input, storage).
- Do not introduce helpers, wrappers, or indirection for things used once.
- Three similar lines is fine; extract only when a pattern repeats meaningfully.

## Testing

- Tests live in `tests/game.test.js` and cover `game.js` only.
- Use `bun:test` (`describe` / `it` / `expect`).
- Test pure logic. Do **not** mock the DOM or Web Audio; instead keep logic out of `main.js` so it never needs mocking.
- Each new exported function in `game.js` must have corresponding unit tests.
- Property-based style is preferred for randomised functions — run the assertion 20–40 times in a loop.

## Commit messages

All commits must follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).

```
<type>[(<scope>)][!]: <subject>
```

- **type** — lowercase, one of: `feat`, `fix`, `chore`, `test`, `docs`, `style`, `refactor`, `perf`, `ci`, `build`, `revert`
- **scope** — optional, lowercase, e.g. `feat(game):` or `fix(ui):`
- **`!`** — optional, marks a breaking change
- **subject** — imperative mood, no period, max 72 chars total (including type and scope)

Enforcement: `.githooks/commit-msg` validates every commit locally. Activate once per clone with:

```bash
git config core.hooksPath .githooks
```

## What not to do

- Do not add a framework, bundler, or package manager dependency.
- Do not touch difficulty constants or creature list without updating tests.
- Do not add sounds, animations, or visual effects to `game.js`.
- Do not add a timer — the game is shots-based only.
