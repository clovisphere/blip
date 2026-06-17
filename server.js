const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname === "/" ? "/index.html" : url.pathname;
    const file = Bun.file(import.meta.dir + path);
    if (await file.exists()) return new Response(file);
    return new Response("Not found", { status: 404 });
  },
});

const t = (s) => `\x1b[36m${s}\x1b[0m`; // teal
const y = (s) => `\x1b[33m${s}\x1b[0m`; // yellow
const b = (s) => `\x1b[1m${s}\x1b[0m`;  // bold
const d = (s) => `\x1b[2m${s}\x1b[0m`;  // dim
const w = (s) => `\x1b[97m${s}\x1b[0m`; // bright white

// L: 18 visible chars each. Face box: ║ at col 2 & 13, 10-char content inside.
// G: 33 visible chars each (3-char row label + 1 border + 7×(3-char cell + 1 border) = 33).
const L = [
  `                  `,
  ` ${t("╔══════════╗")}     `,
  ` ${t("║")} ${y("★ BLIP ★")} ${t("║")}     `,
  ` ${t("╚══╦════╦══╝")}     `,
  ` ${t("╔══╩════╩══╗")}     `,
  ` ${t("║")}${w("(•)")}${t("───")} ${d("[■]")}${t("║")}     `,
  ` ${t("║")} ${d("·──────·")} ${t("║")}     `,
  ` ${t("║")}   ${t("\\__/")}   ${t("║")}     `,
  ` ${t("╚══════════╝")}     `,
  `                  `,
];

const G = [
  `     A   B   C   D   E   F   G  `,
  `   ┌───┬───┬───┬───┬───┬───┬───┐`,
  ` 1 │ ${t("~")} │ ${t("~")} │ ${t("~")} │ ${t("~")} │ ${t("~")} │ ${t("~")} │ ${t("~")} │`,
  `   ├───┼───┼───┼───┼───┼───┼───┤`,
  ` 2 │ ${t("~")} │ ${t("~")} │ ${t("~")} │ ${t("~")} │ ${t("~")} │ ${t("~")} │ ${t("~")} │`,
  `   ├───┼───┼───┼───┼───┼───┼───┤`,
  ` 3 │ ${t("~")} │ ${t("~")} │ ${t("~")} │ ${t("~")} │ ${t("~")} │ ${t("~")} │ ${t("~")} │`,
  `   ├───┼───┼───┼───┼───┼───┼───┤`,
  ` 4 │ ${t("~")} │ ${t("~")} │ ${t("~")} │ ${t("~")} │ ${t("~")} │ ${t("~")} │ ${t("~")} │`,
  `   └───┴───┴───┴───┴───┴───┴───┘`,
];

const art = L.map((l, i) => l + G[i]).join("\n");

console.log(`
${art}

  ${b("B L I P !")}  ${d("— hunt the hidden beasts")}

  ${d(`→  http://localhost:${server.port}`)}
`);
