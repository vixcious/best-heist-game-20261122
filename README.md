[![make.fun](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/c/best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/vixcious/best-heist-game-20261122/rank.svg)](https://make.fun/c/best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/vixcious/best-heist-game-20261122/reward.svg)](https://make.fun/c/best-heist-game-20261122-0559)

# Midnight Vault

A top-down stealth heist game, built for make.fun's **best-heist-game-20261122-0559**
("Make the best heist game", $50, top 10 share the prize).

One room. Three guards with sweeping vision cones. Three security cameras.
One Star Diamond on a pedestal — and an alarm meter that decides everything.

## How to play

- **WASD / arrows** — move the thief
- **SHIFT** — sneak (slower, harder to spot)
- Hold **SPACE** beside the vault to crack it and take the Star Diamond
- **Click** — throw a smoke bomb (3 per run, blocks sight)
- **E** — EMP the nearest camera (2 charges, 6 s blackout)
- Grab the diamond, then slip out the green **EXIT** before the alarm hits 100%

Guards patrol, grow suspicious when they glimpse you, and give chase once
they are sure. Cameras sweep the hall and feed the alarm fast. The alarm
decays only while nobody is watching you — and at 100% the museum locks down.

## Run it

Static files, no network, no build step:

```sh
node serve.ts
# open http://localhost:8080
```

## Layout

- `game/` — the playable game (`index.html` + ES modules under `game/src/`)
- `screenshots/` — real renders of the game's own code
- `main.ts` — the entrypoint: copies `game/` + `screenshots/` and writes `dossier.json`
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged
- `LICENSE` — MIT
