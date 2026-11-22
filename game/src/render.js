// Midnight Vault — everything the player sees, drawn on one canvas.
// One file, one job: no game logic here, only drawing. Thick dark outlines,
// flat colours, one palette — the whole game reads at a glance, even shrunk.
import { VIEW, HUD_H, PALETTE, TUNE } from './config.js';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawCone(ctx, x, y, angle, half, range, fill) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, angle - half, angle + half);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function drawRoom(ctx, level) {
  // Floor: two-tone checker, then the red carpet runner down the middle.
  const tile = 64;
  for (let ty = HUD_H + 24; ty < 696; ty += tile) {
    for (let tx = 40; tx < 1240; tx += tile) {
      const odd = (Math.floor(tx / tile) + Math.floor(ty / tile)) % 2 === 0;
      ctx.fillStyle = odd ? PALETTE.floorA : PALETTE.floorB;
      ctx.fillRect(tx, ty, tile, tile);
    }
  }
  ctx.fillStyle = PALETTE.carpet;
  ctx.fillRect(600, 240, 80, 440);
  ctx.strokeStyle = PALETTE.carpetEdge;
  ctx.lineWidth = 3;
  ctx.strokeRect(600, 240, 80, 440);

  // Exit door, bottom centre, green and labelled.
  const e = level.exit;
  ctx.fillStyle = PALETTE.exit;
  ctx.strokeStyle = PALETTE.outline;
  ctx.lineWidth = 3;
  roundRect(ctx, e.x, e.y, e.w, e.h, 6);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#0e2b16';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('EXIT', e.x + e.w / 2, e.y + e.h / 2 + 1);

  // Walls.
  for (const w of level.walls) {
    ctx.fillStyle = PALETTE.wallTop;
    ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.fillStyle = PALETTE.wall;
    ctx.fillRect(w.x, w.y + 4, w.w, w.h - 4);
    ctx.strokeStyle = PALETTE.outline;
    ctx.lineWidth = 3;
    ctx.strokeRect(w.x, w.y, w.w, w.h);
  }

  // Display cases: glass tops with gold trim.
  for (const c of level.cases) {
    ctx.fillStyle = PALETTE.caseGlass;
    roundRect(ctx, c.x, c.y, c.w, c.h, 8);
    ctx.fill();
    ctx.strokeStyle = PALETTE.caseTrim;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.strokeStyle = PALETTE.outline;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(c.x + 8, c.y + c.h / 2);
    ctx.lineTo(c.x + c.w - 8, c.y + c.h / 2);
    ctx.stroke();
  }

  // Pillars.
  for (const p of level.pillars) {
    ctx.fillStyle = PALETTE.wallTop;
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.strokeStyle = PALETTE.outline;
    ctx.lineWidth = 3;
    ctx.strokeRect(p.x, p.y, p.w, p.h);
  }

  // Vault pedestal + the Star Diamond.
  const v = level.vault;
  ctx.fillStyle = '#3a2f52';
  ctx.strokeStyle = PALETTE.outline;
  ctx.lineWidth = 3;
  roundRect(ctx, v.x - 26, v.y - 16, 52, 32, 6);
  ctx.fill();
  ctx.stroke();
  const diamond = level.loot[0];
  if (!diamond.taken) {
    ctx.fillStyle = PALETTE.diamond;
    ctx.beginPath();
    ctx.moveTo(v.x, v.y - 22);
    ctx.lineTo(v.x + 13, v.y - 8);
    ctx.lineTo(v.x, v.y + 6);
    ctx.lineTo(v.x - 13, v.y - 8);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#e8fbff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = PALETTE.diamond;
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('STAR DIAMOND', v.x, v.y - 34);
  }
}

function drawLoot(ctx, level) {
  for (const item of level.loot) {
    if (item.taken || item.kind === 'diamond') continue;
    if (item.kind === 'gold') {
      ctx.fillStyle = PALETTE.gold;
      ctx.strokeStyle = PALETTE.outline;
      ctx.lineWidth = 3;
      roundRect(ctx, item.x - 14, item.y - 8, 28, 16, 3);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = PALETTE.goldDark;
      ctx.fillRect(item.x - 14, item.y + 2, 28, 6);
    } else {
      // Painting: a framed canvas on the floor (stolen art, rolled in a tube).
      ctx.fillStyle = '#7a5c2e';
      ctx.strokeStyle = PALETTE.outline;
      ctx.lineWidth = 3;
      roundRect(ctx, item.x - 16, item.y - 11, 32, 22, 3);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#c9a227';
      ctx.fillRect(item.x - 10, item.y - 5, 20, 10);
    }
  }
}

function drawCones(ctx, guards, cameras) {
  for (const g of guards) {
    const hot = g.suspicion > 0.5 || g.alerted;
    drawCone(
      ctx, g.x, g.y, g.facing, TUNE.coneHalf, TUNE.coneRange,
      hot ? PALETTE.coneGuardHot : PALETTE.coneGuard,
    );
  }
  for (const cam of cameras) {
    if (cam.disabled > 0) continue;
    drawCone(
      ctx, cam.x, cam.y, cam.angle, TUNE.camHalf, TUNE.camRange,
      cam.seesThief ? PALETTE.coneCamHot : PALETTE.coneCam,
    );
  }
}

function drawSmoke(ctx, smokes) {
  for (const s of smokes) {
    ctx.fillStyle = PALETTE.smoke;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(s.x - s.r * 0.4, s.y - s.r * 0.25, s.r * 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(s.x + s.r * 0.4, s.y + s.r * 0.2, s.r * 0.55, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawThief(ctx, thief) {
  ctx.save();
  ctx.translate(thief.x, thief.y);
  // Shadow.
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(0, thief.r - 2, thief.r, thief.r * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();
  // Body: dark suit, pale shirt, wide-brim hat.
  ctx.fillStyle = PALETTE.thiefHat;
  ctx.beginPath();
  ctx.arc(0, 0, thief.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PALETTE.thief;
  ctx.beginPath();
  ctx.arc(0, 0, thief.r - 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PALETTE.thiefHat;
  ctx.beginPath();
  ctx.ellipse(0, -2, thief.r + 2, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  // Facing tick.
  ctx.strokeStyle = PALETTE.thiefHat;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(Math.cos(thief.facing) * (thief.r + 5), Math.sin(thief.facing) * (thief.r + 5));
  ctx.stroke();
  ctx.restore();

  // Vault-crack progress ring.
  if (thief.crack > 0 && thief.crack < 1) {
    ctx.strokeStyle = PALETTE.diamond;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(thief.x, thief.y, thief.r + 10, -Math.PI / 2, -Math.PI / 2 + thief.crack * Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = PALETTE.text;
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CRACKING…', thief.x, thief.y - thief.r - 16);
  }
}

function drawGuards(ctx, guards) {
  for (const g of guards) {
    ctx.save();
    ctx.translate(g.x, g.y);
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(0, g.r - 2, g.r, g.r * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = g.alerted ? '#c94f4f' : PALETTE.guard;
    ctx.strokeStyle = PALETTE.outline;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, g.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Cap + badge.
    ctx.fillStyle = PALETTE.guardCap;
    ctx.beginPath();
    ctx.arc(0, -3, g.r - 5, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = PALETTE.gold;
    ctx.beginPath();
    ctx.arc(0, 3, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Name + suspicion bar.
    ctx.fillStyle = PALETTE.text;
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(g.name, g.x, g.y - g.r - 18);
    if (g.suspicion > 0.05) {
      ctx.fillStyle = '#3a2f52';
      ctx.fillRect(g.x - 16, g.y - g.r - 14, 32, 5);
      ctx.fillStyle = g.suspicion > 0.7 ? '#e05252' : '#f2c14e';
      ctx.fillRect(g.x - 16, g.y - g.r - 14, 32 * g.suspicion, 5);
    }
    if (g.alerted) {
      ctx.fillStyle = '#ff5a5a';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText('!', g.x, g.y - g.r - 26);
    } else if (g.suspicion > 0.5) {
      ctx.fillStyle = '#f2c14e';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText('?', g.x, g.y - g.r - 26);
    }
  }
}

function drawCameras(ctx, cameras) {
  for (const cam of cameras) {
    ctx.save();
    ctx.translate(cam.x, cam.y);
    ctx.rotate(cam.angle);
    ctx.fillStyle = cam.disabled > 0 ? '#555' : '#c94f4f';
    ctx.strokeStyle = PALETTE.outline;
    ctx.lineWidth = 3;
    roundRect(ctx, -4, -7, 22, 14, 4);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = cam.disabled > 0 ? '#333' : '#ff8a8a';
    ctx.beginPath();
    ctx.arc(18, 0, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    if (cam.disabled > 0) {
      ctx.fillStyle = PALETTE.muted;
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`OFF ${Math.ceil(cam.disabled)}s`, cam.x, cam.y + 26);
    }
  }
}

function drawHUD(ctx, game) {
  const { thief, alarm, time } = game;
  ctx.fillStyle = PALETTE.hud;
  ctx.fillRect(0, 0, VIEW.w, HUD_H);
  ctx.strokeStyle = PALETTE.outline;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, HUD_H);
  ctx.lineTo(VIEW.w, HUD_H);
  ctx.stroke();

  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillStyle = PALETTE.text;
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('MIDNIGHT VAULT', 20, 22);
  ctx.fillStyle = PALETTE.muted;
  ctx.font = '13px sans-serif';
  const objective = thief.hasDiamond
    ? 'Diamond secured — reach the EXIT!'
    : 'Steal the STAR DIAMOND, then reach the EXIT.';
  ctx.fillText(objective, 20, 46);

  // Alarm meter, centre: the number the whole heist hangs on.
  const ax = 470;
  const aw = 340;
  ctx.fillStyle = PALETTE.text;
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('ALARM', ax, 20);
  ctx.fillStyle = '#0e0a18';
  roundRect(ctx, ax + 70, 10, aw, 20, 6);
  ctx.fill();
  const stage = alarm.stage();
  const col =
    stage === 'HUNT' ? PALETTE.alarmHot : stage === 'SUSPICIOUS' ? PALETTE.alarmWarm : PALETTE.alarmCalm;
  ctx.fillStyle = col;
  if (alarm.value > 0) {
    roundRect(ctx, ax + 70, 10, (aw * alarm.value) / 100, 20, 6);
    ctx.fill();
  }
  ctx.strokeStyle = PALETTE.outline;
  ctx.lineWidth = 2;
  roundRect(ctx, ax + 70, 10, aw, 20, 6);
  ctx.stroke();
  ctx.fillStyle = col;
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText(`${stage} ${Math.floor(alarm.value)}%`, ax + 70, 46);

  // Right: loot, tools, time.
  ctx.textAlign = 'right';
  ctx.fillStyle = PALETTE.gold;
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText(`LOOT $${thief.lootValue}`, 1260, 20);
  ctx.fillStyle = PALETTE.text;
  ctx.font = '14px sans-serif';
  const mm = String(Math.floor(time / 60)).padStart(2, '0');
  const ss = String(Math.floor(time % 60)).padStart(2, '0');
  ctx.fillText(`SMOKE x${thief.smokeLeft}   EMP x${thief.empLeft}   ${mm}:${ss}`, 1260, 46);
}

function drawSpottedFlash(ctx, game) {
  const seen = game.guards.some((g) => g.seesThief) || game.cameras.some((c) => c.seesThief);
  if (!seen || game.state !== 'playing') return;
  ctx.strokeStyle = 'rgba(224, 82, 82, 0.85)';
  ctx.lineWidth = 10;
  ctx.strokeRect(5, HUD_H + 5, VIEW.w - 10, VIEW.h - HUD_H - 10);
  ctx.fillStyle = '#ff5a5a';
  ctx.font = 'bold 26px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SPOTTED!', VIEW.w / 2, HUD_H + 40);
}

function overlay(ctx, title, lines, accent) {
  ctx.fillStyle = 'rgba(10, 7, 18, 0.72)';
  ctx.fillRect(0, HUD_H, VIEW.w, VIEW.h - HUD_H);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = accent;
  ctx.font = 'bold 64px sans-serif';
  ctx.fillText(title, VIEW.w / 2, 250);
  ctx.fillStyle = PALETTE.text;
  ctx.font = '20px sans-serif';
  lines.forEach((line, i) => {
    ctx.fillText(line, VIEW.w / 2, 330 + i * 34);
  });
}

export function render(ctx, game) {
  const { level } = game;
  ctx.clearRect(0, 0, VIEW.w, VIEW.h);
  ctx.fillStyle = PALETTE.bg;
  ctx.fillRect(0, 0, VIEW.w, VIEW.h);

  drawRoom(ctx, level);
  drawLoot(ctx, level);
  drawCones(ctx, game.guards, game.cameras);
  drawSmoke(ctx, game.smokes);
  drawThief(ctx, game.thief);
  drawGuards(ctx, game.guards);
  drawCameras(ctx, game.cameras);
  drawHUD(ctx, game);
  drawSpottedFlash(ctx, game);

  if (game.state === 'title') {
    overlay(ctx, 'MIDNIGHT VAULT', [
      'One room. Three guards. Three cameras. One diamond.',
      'WASD / arrows to move — SHIFT to sneak — hold SPACE at the vault to crack it',
      'Click to throw a smoke bomb — E to EMP the nearest camera',
      'Grab the STAR DIAMOND, then slip out the green EXIT before the alarm hits 100%.',
      '',
      'PRESS ENTER OR CLICK TO START',
    ], PALETTE.gold);
  } else if (game.state === 'caught') {
    overlay(ctx, 'CAUGHT!', [
      game.thief.caughtReason || 'The alarm hit 100% — the museum locked down.',
      `Loot pocketed: $${game.thief.lootValue}`,
      '',
      'PRESS R TO TRY AGAIN',
    ], '#ff5a5a');
  } else if (game.state === 'win') {
    const timeBonus = Math.max(0, 300 - Math.floor(game.time) * 2);
    overlay(ctx, 'CLEAN GETAWAY!', [
      `Loot: $${game.thief.lootValue}   Time bonus: $${timeBonus}`,
      `Final score: $${game.thief.score + timeBonus}`,
      `Time: ${String(Math.floor(game.time / 60)).padStart(2, '0')}:${String(Math.floor(game.time % 60)).padStart(2, '0')}   Alarm at escape: ${Math.floor(game.alarm.value)}%`,
      '',
      'PRESS R TO PLAY AGAIN',
    ], PALETTE.alarmCalm);
  }
}
