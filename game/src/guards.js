// Midnight Vault — the guards: patrols, vision cones, suspicion and the chase.
// One file, one job: everything a guard does lives here.
import { TUNE } from './config.js';
import { hasLineOfSight, slideMove } from './level.js';

export function createGuards(defs) {
  return defs.map((d) => ({
    name: d.name,
    x: d.start.x,
    y: d.start.y,
    r: TUNE.guardRadius,
    waypoints: d.waypoints,
    wp: 1, // next waypoint index
    facing: 0,
    suspicion: 0, // 0..1; full means the guard has made the thief
    alerted: false,
    alertCooldown: 0,
    loseTimer: 0,
    seesThief: false,
    stuckTimer: 0, // no progress toward the waypoint: skip it, never stand still
  }));
}

function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

// True when the thief stands inside the guard's cone with a clear sight-line.
export function guardSeesThief(guard, thief, level, smokes) {
  const dx = thief.x - guard.x;
  const dy = thief.y - guard.y;
  const dist = Math.hypot(dx, dy);
  if (dist > TUNE.coneRange) return false;
  const ang = Math.atan2(dy, dx);
  if (Math.abs(angleDiff(ang, guard.facing)) > TUNE.coneHalf) return false;
  return hasLineOfSight(guard.x, guard.y, thief.x, thief.y, level.solids, smokes);
}

export function updateGuards(guards, dt, thief, level, smokes, alarm) {
  for (const g of guards) {
    g.seesThief = guardSeesThief(g, thief, level, smokes);
    const dist = Math.hypot(thief.x - g.x, thief.y - g.y);

    if (g.seesThief) {
      // Closer, faster and louder thieves are made sooner; sneaking buys time.
      const closeness = 1.6 - (dist / TUNE.coneRange) * 0.8;
      const pace = thief.sneaking ? 0.3 : thief.moving ? 0.9 : 0.55;
      g.suspicion = Math.min(1, g.suspicion + dt * pace * closeness * 0.85);
      g.loseTimer = 0;
    } else {
      g.suspicion = Math.max(0, g.suspicion - dt * 0.22);
    }

    if (g.alertCooldown > 0) g.alertCooldown -= dt;

    // Suspicion full: the guard raises the alarm once and gives chase.
    if (g.suspicion >= 1 && !g.alerted && g.alertCooldown <= 0) {
      g.alerted = true;
      g.alertCooldown = 8;
      alarm.add(20);
    }

    if (g.alerted) {
      // Chase the thief's last seen spot; give up after 4 s blind.
      const speed = TUNE.guardChase * alarm.speedMult();
      const ang = Math.atan2(thief.y - g.y, thief.x - g.x);
      g.facing = ang;
      slideMove(g, Math.cos(ang) * speed * dt, Math.sin(ang) * speed * dt, level.solids, level.bounds);
      if (!g.seesThief) {
        g.loseTimer += dt;
        if (g.loseTimer > 4) {
          g.alerted = false;
          g.suspicion = 0.4;
        }
      } else {
        g.loseTimer = 0;
      }
      // Caught: the guard lays a hand on the thief.
      if (dist < TUNE.guardCatchDist) {
        thief.caughtReason = `Caught by ${g.name} — a guard got a hand on you.`;
        return 'caught';
      }
    } else {
      // Patrol: walk the waypoint loop, facing the direction of travel.
      // Walls slide the guard along their face; if a route is ever blocked,
      // the guard gives up on that waypoint instead of standing still.
      const target = g.waypoints[g.wp];
      const dx = target.x - g.x;
      const dy = target.y - g.y;
      const d = Math.hypot(dx, dy);
      const speed = TUNE.guardWalk * alarm.speedMult();
      if (d < 6) {
        g.wp = (g.wp + 1) % g.waypoints.length;
        g.stuckTimer = 0;
      } else {
        g.facing = Math.atan2(dy, dx);
        const moved = slideMove(
          g,
          (dx / d) * speed * dt,
          (dy / d) * speed * dt,
          level.solids,
          level.bounds,
        );
        if (moved < speed * dt * 0.25) {
          g.stuckTimer += dt;
          if (g.stuckTimer > 2) {
            g.wp = (g.wp + 1) % g.waypoints.length;
            g.stuckTimer = 0;
          }
        } else {
          g.stuckTimer = 0;
        }
      }
    }
  }
  return null;
}
