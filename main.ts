// Midnight Vault — the entrypoint that hands the game in to make.fun.
// It copies this repository's game/ and screenshots/ beside it into the output
// directory and writes the dossier.json the judge reads, using the vendored
// make.fun library. Node 22, standard library only, no network, no build step.
//
// Local check: mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Local play:  node serve.ts, then open http://localhost:8080

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Fail loudly, before copying anything, when the game entrypoint is missing:
// a dossier for an empty game would pass the copy step and fail the gate.
if (!existsSync(join(here, 'game', 'index.html'))) {
  throw new Error('game/index.html is missing — nothing to hand in');
}

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The caps mirror the gate's own: at most 4 screenshots of 256 KiB, a game of
// at most 993 files and 48 MiB, and a dossier text of at most 160 KiB.
const dossier = buildDossier(out, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(out, 'dossier.json'), dossier);
console.log(`Midnight Vault handed in: dossier.json is ${dossier.length} bytes.`);
