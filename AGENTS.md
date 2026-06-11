# Blip — Agent & Developer Guide

## Project

Single-player browser hidden-location deduction game. A 3-cell ship is hidden on a 4×7 grid; the player fires shots until the ship sinks, time runs out, or it becomes mathematically impossible to win.

## Stack

- Vanilla JS, ES modules, no build step, no dependencies.
- Bun for the dev server and test runner.
- Web Audio API for procedural sound effects.
- CSS custom properties for per-mode theming.

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
        ├── game.js        # pure game logic — ship placement, isAborted, constants
        ├── main.js        # UI layer — DOM, events, timer, state machine
        ├── matrix.js      # Matrix rain canvas (Hacker mode)
        └── sound.js       # Web Audio sound effects
```

**Hard boundary:** `game.js` is pure logic with zero DOM or browser API access. Keep it that way — it is what makes the unit tests fast and reliable.

## Grid

- **4 rows × 7 columns** = 28 cells total, indexed `0..27` (flat: `row * COLS + col`)
- `ROWS = 4`, `COLS = 7` exported from `game.js` — never hardcode these values elsewhere
- Consecutive placement is horizontal **or** vertical (chosen randomly); hacker mode is fully random (non-adjacent cells allowed)

## Difficulty modes

| Mode   | Attempts | Timer | Placement   | Early abort rule              |
|--------|----------|-------|-------------|-------------------------------|
| N00b   | 6        | 15 s  | Consecutive | sections remaining > attempts |
| Ninja  | 4        | 10 s  | Consecutive | sections remaining > attempts |
| Hacker | 3        | 5 s   | Random      | sections remaining > attempts |

Each hit adds +5 s to the clock. All modes are `strict: true`, so a miss in Hacker immediately triggers abort (3 sections left, only 2 shots remain).

## Code style

- Keep code **simple and concise**. Prefer direct expressions over abstractions.
- No comments unless the _why_ is genuinely non-obvious.
- No TypeScript, no transpilation — plain ES2020+ that browsers understand natively.
- No defensive error handling for internal paths; validate only at real boundaries (user input, storage).
- Do not introduce helpers, wrappers, or indirection for things used once.
- Three similar lines is fine; extract only when a pattern repeats meaningfully.
- CSS follows the same principle — use custom properties for theming variants, not duplicated rule-sets.

## Testing

- Tests live in `tests/game.test.js` and cover `game.js` only.
- Use `bun:test` (`describe` / `it` / `expect`).
- Test pure logic. Do **not** mock the DOM or Web Audio; instead keep logic out of `main.js` so it never needs mocking.
- Each new exported function in `game.js` must have corresponding unit tests.
- Property-based style is preferred for randomised functions — run the assertion 30–50 times in a loop.

## Commit messages

All commits must follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).

```
<type>[(<scope>)][!]: <subject>
```

- **type** — lowercase, one of: `feat`, `fix`, `chore`, `test`, `docs`, `style`, `refactor`, `perf`, `ci`, `build`, `revert`
- **scope** — optional, lowercase, e.g. `feat(timer):` or `fix(game):`
- **`!`** — optional, marks a breaking change
- **subject** — imperative mood, no period, max 72 chars total (including type and scope)

```
feat(game): add consecutive ship placement for n00b mode
fix(timer): prevent countdown going below zero
chore: update bun to v1.2
test(game): cover isAborted edge cases
docs: document difficulty abort rules in AGENTS.md
```

Enforcement: `.githooks/commit-msg` validates every commit locally. Activate once per clone with:

```bash
git config core.hooksPath .githooks
```

## What not to do

- Do not add a framework, bundler, or package manager dependency.
- Do not touch `BOARD_SIZE`, `SHIP_LENGTH`, or difficulty constants without updating tests.
- Do not add sounds, animations, or visual effects to `game.js`.
