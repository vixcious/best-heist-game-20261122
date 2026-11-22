// Midnight Vault — the museum floor: walls, cover, loot, patrols and cameras.
// One file, one job: everything about the room's layout lives here, no logic.
import { VIEW, HUD_H } from './config.js';

// Every rectangle the thief, guards and sight-lines collide with.
export function buildLevel() {
  const walls = [
    // Outer shell (HUD occupies the top 64 px; the playfield starts below it).
    { x: 24, y: HUD_H + 8, w: 1232, h: 16 }, // top
    { x: 24, y: 696, w: 1232, h: 16 }, // bottom
    { x: 24, y: HUD_H + 8, w: 16, h: 624 }, // left
    { x: 1240, y: HUD_H + 8, w: 16, h: 624 }, // right
    // Vault chamber: a U open at the bottom, guarding the Star Diamond.
    { x: 520, y: 112, w: 240, h: 16 },
    { x: 520, y: 112, w: 16, h: 116 },
    { x: 744, y: 112, w: 16, h: 116 },
    // Two interior walls that split the hall into lanes.
    { x: 420, y: 330, w: 16, h: 190 },
    { x: 844, y: 200, w: 16, h: 190 },
  ];

  // Display cases: low cover — they block movement and sight, the thief hides behind them.
  const cases = [
    { x: 180, y: 180, w: 110, h: 60 },
    { x: 890, y: 180, w: 110, h: 60 },
    { x: 180, y: 520, w: 110, h: 60 },
    { x: 890, y: 520, w: 110, h: 60 },
    { x: 560, y: 330, w: 160, h: 56 },
    { x: 300, y: 380, w: 60, h: 110 },
    { x: 920, y: 380, w: 60, h: 110 },
  ];

  const pillars = [
    { x: 300, y: 140, w: 30, h: 30 },
    { x: 950, y: 140, w: 30, h: 30 },
    { x: 300, y: 600, w: 30, h: 30 },
    { x: 950, y: 600, w: 30, h: 30 },
  ];

  const solids = [...walls, ...cases, ...pillars];

  const vault = { x: 640, y: 196 }; // the Star Diamond pedestal
  // The pedestal itself is solid: the thief cracks the vault from beside it.
  solids.push({ x: vault.x - 26, y: vault.y - 16, w: 52, h: 32 });
  const exit = { x: 600, y: 676, w: 80, h: 20 }; // green door, bottom centre

  // Loot sits on open floor, never inside a case or wall: every piece must be
  // walkable-to, or the thief can see it but never pocket it.
  const loot = [
    { kind: 'diamond', x: vault.x, y: vault.y, value: 500, taken: false, label: 'STAR DIAMOND' },
    { kind: 'gold', x: 235, y: 280, value: 100, taken: false, label: 'GOLD' },
    { kind: 'gold', x: 1045, y: 210, value: 100, taken: false, label: 'GOLD' },
    { kind: 'gold', x: 235, y: 610, value: 100, taken: false, label: 'GOLD' },
    { kind: 'painting', x: 470, y: 450, value: 150, taken: false, label: 'PAINTING' },
    { kind: 'painting', x: 1010, y: 450, value: 150, taken: false, label: 'PAINTING' },
  ];

  const guards = [
    // Big central loop, kept in open lanes with clearance from every wall and case.
    {
      name: 'MARCO',
      waypoints: [
        { x: 140, y: 290 },
        { x: 800, y: 290 },
        { x: 800, y: 660 },
        { x: 140, y: 660 },
      ],
      start: { x: 140, y: 290 },
    },
    // West wing.
    {
      name: 'ROSA',
      waypoints: [
        { x: 150, y: 300 },
        { x: 150, y: 660 },
        { x: 380, y: 660 },
        { x: 380, y: 300 },
      ],
      start: { x: 150, y: 300 },
    },
    // East wing.
    {
      name: 'VIK',
      waypoints: [
        { x: 1130, y: 300 },
        { x: 1130, y: 660 },
        { x: 1020, y: 660 },
        { x: 1020, y: 300 },
      ],
      start: { x: 1130, y: 300 },
    },
  ];

  const cameras = [
    // On a stand below the vault, sweeping up over the diamond and its entrance.
    // (A mount inside the chamber would stare at the back of the pedestal: the
    // pedestal blocks every sight-line from above to the spot where the thief
    // stands to crack it. From below, the camera sees the crack itself.)
    { x: 640, y: 300, base: -Math.PI / 2, amp: 0.7, speed: 0.55 },
    // Right wall, watches the east wing.
    { x: 1232, y: 380, base: Math.PI, amp: 0.8, speed: 0.7 },
    // Left wall, watches the west wing.
    { x: 48, y: 380, base: 0, amp: 0.8, speed: 0.6 },
  ];

  return {
    walls,
    cases,
    pillars,
    solids,
    vault,
    exit,
    loot,
    guards,
    cameras,
    thiefStart: { x: 640, y: 600 },
    bounds: { x0: 40, y0: HUD_H + 24, x1: 1240, y1: 696 },
  };
}

// Line of sight: sample points along the segment; blocked by any solid or smoke cloud.
export function hasLineOfSight(x1, y1, x2, y2, solids, smokes) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.hypot(dx, dy);
  const steps = Math.max(4, Math.ceil(dist / 14));
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const px = x1 + dx * t;
    const py = y1 + dy * t;
    for (const s of solids) {
      if (px >= s.x - 2 && px <= s.x + s.w + 2 && py >= s.y - 2 && py <= s.y + s.h + 2) return false;
    }
    for (const s of smokes) {
      if (Math.hypot(px - s.x, py - s.y) < s.r) return false;
    }
  }
  return true;
}

// Circle (radius r) against a rectangle: true when they overlap.
export function circleHitsRect(cx, cy, r, rect) {
  const nx = Math.max(rect.x, Math.min(cx, rect.x + rect.w));
  const ny = Math.max(rect.y, Math.min(cy, rect.y + rect.h));
  return (cx - nx) * (cx - nx) + (cy - ny) * (cy - ny) < r * r;
}

// Slide a circle (entity with x, y, r) by (dx, dy) against solids, axis by axis,
// so it glides along walls instead of passing through them. Returns distance moved.
export function slideMove(entity, dx, dy, solids, bounds) {
  const moved = { x: entity.x, y: entity.y };
  let nx = entity.x + dx;
  for (const s of solids) {
    if (circleHitsRect(nx, entity.y, entity.r, s)) {
      nx = dx > 0 ? s.x - entity.r : s.x + s.w + entity.r;
    }
  }
  nx = Math.max(bounds.x0 + entity.r, Math.min(bounds.x1 - entity.r, nx));
  let ny = entity.y + dy;
  for (const s of solids) {
    if (circleHitsRect(nx, ny, entity.r, s)) {
      ny = dy > 0 ? s.y - entity.r : s.y + s.h + entity.r;
    }
  }
  ny = Math.max(bounds.y0 + entity.r, Math.min(bounds.y1 - entity.r, ny));
  entity.x = nx;
  entity.y = ny;
  return Math.hypot(entity.x - moved.x, entity.y - moved.y);
}

export { VIEW };
