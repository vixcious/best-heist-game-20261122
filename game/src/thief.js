// Midnight Vault — the thief: movement, hiding, tools and the vault crack.
// One file, one job: everything the player character does lives here.
import { TUNE } from './config.js';
import { circleHitsRect } from './level.js';

export function createThief(start) {
  return {
    x: start.x,
    y: start.y,
    r: TUNE.thiefRadius,
    facing: -Math.PI / 2, // looking up the room
    sneaking: false,
    moving: false,
    smokeLeft: TUNE.smokeMax,
    empLeft: TUNE.empMax,
    crack: 0, // 0..1 progress on the vault
    hasDiamond: false,
    score: 0,
    lootValue: 0,
    caughtReason: '',
  };
}

// Move with axis separation so the thief slides along walls instead of sticking.
function moveWithCollision(thief, dx, dy, solids, bounds) {
  let nx = thief.x + dx;
  for (const s of solids) {
    if (circleHitsRect(nx, thief.y, thief.r, s)) {
      nx = dx > 0 ? s.x - thief.r : s.x + s.w + thief.r;
    }
  }
  nx = Math.max(bounds.x0 + thief.r, Math.min(bounds.x1 - thief.r, nx));
  let ny = thief.y + dy;
  for (const s of solids) {
    if (circleHitsRect(nx, ny, thief.r, s)) {
      ny = dy > 0 ? s.y - thief.r : s.y + s.h + thief.r;
    }
  }
  ny = Math.max(bounds.y0 + thief.r, Math.min(bounds.y1 - thief.r, ny));
  thief.x = nx;
  thief.y = ny;
}

// Returns events the main loop turns into sound and score: { picked, smoked, emped, cracked, won }.
export function updateThief(thief, dt, input, level, smokes, events) {
  const ix =
    (input.held('right') ? 1 : 0) - (input.held('left') ? 1 : 0);
  const iy =
    (input.held('down') ? 1 : 0) - (input.held('up') ? 1 : 0);
  thief.sneaking = input.held('sneak');
  thief.moving = ix !== 0 || iy !== 0;

  if (thief.moving) {
    const len = Math.hypot(ix, iy);
    const speed = thief.sneaking ? TUNE.thiefSneak : TUNE.thiefWalk;
    const vx = (ix / len) * speed * dt;
    const vy = (iy / len) * speed * dt;
    thief.facing = Math.atan2(vy, vx);
    moveWithCollision(thief, vx, vy, level.solids, level.bounds);
    thief.crack = 0; // moving breaks the crack
  }

  // Throw a smoke bomb where the mouse clicked (left click, in range, if any left).
  const click = input.takeClick();
  if (click && thief.smokeLeft > 0) {
    const d = Math.hypot(click.x - thief.x, click.y - thief.y);
    if (d <= 340) {
      smokes.push({ x: click.x, y: click.y, r: TUNE.smokeRadius, life: TUNE.smokeLife });
      thief.smokeLeft -= 1;
      events.smoked = true;
    }
  }

  // EMP: E key disables the nearest live camera inside range.
  if (input.held('emp') && thief.empLeft > 0) {
    input.clear('emp');
    let best = null;
    let bestD = TUNE.empRange;
    for (const cam of level.camerasLive) {
      if (cam.disabled > 0) continue;
      const d = Math.hypot(cam.x - thief.x, cam.y - thief.y);
      if (d < bestD) {
        bestD = d;
        best = cam;
      }
    }
    if (best) {
      best.disabled = TUNE.empLife;
      thief.empLeft -= 1;
      events.emped = true;
    }
  }

  // Crack the vault: hold SPACE beside the diamond pedestal.
  const nearVault = Math.hypot(thief.x - level.vault.x, thief.y - level.vault.y) < 58;
  const diamond = level.loot[0];
  if (nearVault && !diamond.taken && input.held('crack')) {
    thief.crack += dt / TUNE.crackTime;
    if (thief.crack >= 1) {
      diamond.taken = true;
      thief.hasDiamond = true;
      thief.lootValue += diamond.value;
      thief.score += diamond.value;
      events.cracked = true;
    }
  } else if (!input.held('crack')) {
    thief.crack = Math.max(0, thief.crack - dt * 0.5);
  }

  // Walk over loose loot to pocket it.
  for (const item of level.loot) {
    if (item.taken || item.kind === 'diamond') continue;
    if (Math.hypot(thief.x - item.x, thief.y - item.y) < 30) {
      item.taken = true;
      thief.lootValue += item.value;
      thief.score += item.value;
      events.picked = item;
    }
  }

  // Reach the green exit door with the diamond: clean getaway.
  if (thief.hasDiamond) {
    const e = level.exit;
    if (
      thief.x > e.x - 6 &&
      thief.x < e.x + e.w + 6 &&
      thief.y > e.y - 14 &&
      thief.y < e.y + e.h + 10
    ) {
      events.won = true;
    }
  }
  return events;
}
