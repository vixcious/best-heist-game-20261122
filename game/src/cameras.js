// Midnight Vault — the security cameras: sweeping cones that feed the alarm.
// One file, one job: everything a camera does lives here.
import { TUNE } from './config.js';
import { hasLineOfSight } from './level.js';

export function createCameras(defs) {
  return defs.map((d) => ({
    x: d.x,
    y: d.y,
    base: d.base, // centre of the sweep, radians
    amp: d.amp, // sweep amplitude, radians
    speed: d.speed,
    t: Math.random() * 6, // desync the sweeps
    angle: d.base,
    disabled: 0, // seconds left of EMP blackout
    seesThief: false,
  }));
}

function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

export function updateCameras(cameras, dt, thief, level, smokes, alarm) {
  for (const cam of cameras) {
    if (cam.disabled > 0) {
      cam.disabled -= dt;
      cam.seesThief = false;
      continue;
    }
    cam.t += dt;
    cam.angle = cam.base + Math.sin(cam.t * cam.speed) * cam.amp;

    const dx = thief.x - cam.x;
    const dy = thief.y - cam.y;
    const dist = Math.hypot(dx, dy);
    let sees = false;
    if (dist <= TUNE.camRange) {
      const ang = Math.atan2(dy, dx);
      if (Math.abs(angleDiff(ang, cam.angle)) <= TUNE.camHalf) {
        sees = hasLineOfSight(cam.x, cam.y, thief.x, thief.y, level.solids, smokes);
      }
    }
    cam.seesThief = sees;
    if (sees) {
      // A camera spots fast — standing in its red cone is the quickest way to trip the alarm.
      alarm.add(16 * dt);
    }
  }
}
