// Midnight Vault — the game loop and state machine: title, playing, caught, win.
// One file, one job: it wires input, level, thief, guards, cameras, alarm and
// rendering together and owns the frame. Everything else is a module it calls.
import { VIEW } from './config.js';
import { buildLevel } from './level.js';
import { createInput } from './input.js';
import { createThief, updateThief } from './thief.js';
import { createGuards, updateGuards } from './guards.js';
import { createCameras, updateCameras } from './cameras.js';
import { createAlarm } from './alarm.js';
import { createAudio } from './audio.js';
import { render } from './render.js';
import { applyShot } from './shots.js';

const canvas = document.getElementById('game');
canvas.width = VIEW.w;
canvas.height = VIEW.h;
const ctx = canvas.getContext('2d');

const input = createInput(canvas);
const audio = createAudio();

function newGame() {
  const level = buildLevel();
  const game = {
    state: 'title',
    frozen: false,
    time: 0,
    level,
    thief: createThief(level.thiefStart),
    guards: createGuards(level.guards),
    cameras: createCameras(level.cameras),
    alarm: createAlarm(),
    smokes: [],
    audio,
  };
  // The thief module looks up live cameras through the level for its EMP.
  level.camerasLive = game.cameras;
  return game;
}

let game = newGame();

// Screenshot staging: ?shot=start|play|smoke|end freezes one readable moment.
const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
if (shot) applyShot(game, shot);

// Test hook: the trial harness reads the live state through this, never the DOM.
window.__gameState = () => ({
  state: game.state,
  frozen: game.frozen,
  time: Math.round(game.time * 10) / 10,
  thief: {
    x: Math.round(game.thief.x),
    y: Math.round(game.thief.y),
    hasDiamond: game.thief.hasDiamond,
    lootValue: game.thief.lootValue,
    smokeLeft: game.thief.smokeLeft,
    empLeft: game.thief.empLeft,
    crack: Math.round(game.thief.crack * 100) / 100,
  },
  alarm: Math.round(game.alarm.value * 10) / 10,
  alarmStage: game.alarm.stage(),
  guards: game.guards.map((g) => ({
    name: g.name,
    x: Math.round(g.x),
    y: Math.round(g.y),
    suspicion: Math.round(g.suspicion * 100) / 100,
    alerted: g.alerted,
    seesThief: g.seesThief,
  })),
  cameras: game.cameras.map((c) => ({
    x: c.x,
    y: c.y,
    angle: Math.round(c.angle * 100) / 100,
    disabled: Math.round(c.disabled * 10) / 10,
    seesThief: c.seesThief,
  })),
  lootTaken: game.level.loot.filter((l) => l.taken).length,
  smokes: game.smokes.length,
});

let last = performance.now();
let prevAlerted = 0;
let prevSirenStage = 'CALM';

function frame(now) {
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;

  if (!game.frozen) {
    if (game.state === 'title') {
      if (input.held('confirm') || input.takeClick()) {
        input.clear('confirm');
        audio.unlock();
        game.state = 'playing';
      }
    } else if (game.state === 'playing') {
      game.time += dt;
      const events = {};
      updateThief(game.thief, dt, input, game.level, game.smokes, events);
      for (const s of game.smokes) s.life -= dt;
      game.smokes = game.smokes.filter((s) => s.life > 0);

      const caught = updateGuards(game.guards, dt, game.thief, game.level, game.smokes, game.alarm);
      updateCameras(game.cameras, dt, game.thief, game.level, game.smokes, game.alarm);
      const anyoneSees =
        game.guards.some((g) => g.seesThief) || game.cameras.some((c) => c.seesThief);
      game.alarm.update(dt, anyoneSees);

      // Sounds for the moments that matter.
      const alertedNow = game.guards.filter((g) => g.alerted).length;
      if (alertedNow > prevAlerted) audio.alert();
      prevAlerted = alertedNow;
      if (events.picked) audio.pickup();
      if (events.smoked) audio.smoke();
      if (events.emped) audio.emp();
      if (events.cracked) audio.pickup();
      const stage = game.alarm.stage();
      if (stage !== prevSirenStage) {
        audio.setSiren(stage === 'HUNT');
        prevSirenStage = stage;
      }

      if (caught === 'caught' || game.alarm.tripped()) {
        if (game.alarm.tripped() && caught !== 'caught') {
          game.thief.caughtReason = 'The alarm hit 100% — the museum locked down.';
        }
        game.state = 'caught';
        audio.setSiren(false);
        audio.caught();
      } else if (events.won) {
        game.state = 'win';
        audio.setSiren(false);
        audio.win();
      }
    } else if (game.state === 'caught' || game.state === 'win') {
      if (input.held('restart') || input.takeClick()) {
        game = newGame();
        prevAlerted = 0;
        prevSirenStage = 'CALM';
      }
    }
  }

  render(ctx, game);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
