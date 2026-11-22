// Midnight Vault — deterministic screenshot staging for ?shot=.
// One file, one job: each named shot freezes one readable moment of the heist
// so the screenshots are real renders of the game's own code, staged, not faked.
export function applyShot(game, name) {
  const { level, thief, guards, cameras, alarm } = game;

  if (name === 'start') {
    // Title over a live-looking room: patrols mid-route, cones sweeping, loot out.
    game.state = 'title';
    game.frozen = true;
    thief.x = 640;
    thief.y = 580;
    guards[0].x = 620;
    guards[0].y = 260;
    guards[0].facing = Math.PI / 2;
    guards[1].x = 300;
    guards[1].y = 500;
    guards[1].facing = 0;
    guards[2].x = 980;
    guards[2].y = 500;
    guards[2].facing = Math.PI;
    cameras[0].angle = -Math.PI / 2 - 0.5;
    cameras[1].angle = Math.PI - 0.4;
    cameras[2].angle = 0.4;
    alarm.value = 0;
    return;
  }

  if (name === 'play') {
    // Mid-heist: the thief sneaks behind the central case, Marco's cone closing in,
    // a camera sweeping the vault, alarm already warm.
    game.state = 'playing';
    game.frozen = true;
    thief.x = 560;
    thief.y = 420;
    thief.facing = -Math.PI / 2;
    thief.sneaking = true;
    guards[0].x = 620;
    guards[0].y = 260;
    guards[0].facing = Math.PI / 2;
    guards[0].suspicion = 0.62;
    guards[1].x = 300;
    guards[1].y = 500;
    guards[1].facing = 0;
    guards[2].x = 980;
    guards[2].y = 500;
    guards[2].facing = Math.PI;
    cameras[0].angle = -Math.PI / 2 + 0.35;
    cameras[1].angle = Math.PI - 0.5;
    cameras[2].angle = 0.3;
    alarm.value = 42;
    game.time = 47;
    return;
  }

  if (name === 'smoke') {
    // The escape: a smoke cloud hides the thief while Rosa searches, alarm hot.
    game.state = 'playing';
    game.frozen = true;
    thief.x = 700;
    thief.y = 560;
    thief.facing = Math.PI;
    thief.sneaking = true;
    thief.smokeLeft = 1;
    game.smokes.push({ x: 640, y: 500, r: 74, life: 6 });
    guards[0].x = 700;
    guards[0].y = 380;
    guards[0].facing = Math.PI / 2;
    guards[0].suspicion = 0.85;
    guards[1].x = 560;
    guards[1].y = 470;
    guards[1].facing = Math.PI / 4;
    guards[1].suspicion = 0.4;
    guards[2].x = 980;
    guards[2].y = 500;
    guards[2].facing = Math.PI;
    cameras[0].angle = -Math.PI / 2 + 0.6;
    cameras[1].angle = Math.PI + 0.3;
    cameras[2].angle = -0.3;
    alarm.value = 68;
    game.time = 96;
    return;
  }

  if (name === 'end') {
    // The payoff: diamond taken, thief at the exit, CLEAN GETAWAY screen.
    game.state = 'win';
    game.frozen = true;
    level.loot[0].taken = true;
    thief.hasDiamond = true;
    thief.lootValue = 800;
    thief.score = 800;
    thief.x = 640;
    thief.y = 660;
    guards[0].x = 500;
    guards[0].y = 300;
    guards[0].facing = Math.PI;
    guards[1].x = 300;
    guards[1].y = 500;
    guards[1].facing = 0;
    guards[2].x = 980;
    guards[2].y = 500;
    guards[2].facing = Math.PI;
    cameras[0].angle = -Math.PI / 2;
    cameras[1].angle = Math.PI;
    cameras[2].angle = 0;
    alarm.value = 54;
    game.time = 118;
  }
}
