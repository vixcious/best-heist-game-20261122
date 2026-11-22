// Midnight Vault — tuning constants and the single palette every system shares.
// One file, one job: every number the game balances on lives here.
export const VIEW = { w: 1280, h: 720 };
export const HUD_H = 64;

export const PALETTE = {
  bg: '#14101f',
  floorA: '#251d38',
  floorB: '#2b2142',
  carpet: '#5a2e3a',
  carpetEdge: '#7a3f4c',
  wall: '#3a2f52',
  wallTop: '#4a3f66',
  outline: '#120d1c',
  caseGlass: '#6f5b8f',
  caseTrim: '#c9a227',
  gold: '#f2c14e',
  goldDark: '#b98a1e',
  diamond: '#9fe8ff',
  thief: '#e8e6f0',
  thiefHat: '#1c1a26',
  guard: '#4a6fa5',
  guardCap: '#2c4a73',
  coneGuard: 'rgba(242, 193, 78, 0.20)',
  coneGuardHot: 'rgba(242, 140, 40, 0.30)',
  coneCam: 'rgba(224, 82, 82, 0.18)',
  coneCamHot: 'rgba(224, 40, 40, 0.32)',
  smoke: 'rgba(200, 200, 210, 0.55)',
  hud: '#1d1730',
  text: '#f4f1ff',
  muted: '#a99ec7',
  alarmCalm: '#58b368',
  alarmWarm: '#f2c14e',
  alarmHot: '#e05252',
  exit: '#58b368',
};

export const TUNE = {
  thiefWalk: 178,
  thiefSneak: 102,
  thiefRadius: 13,
  guardWalk: 80,
  guardChase: 168,
  guardRadius: 14,
  coneHalf: 0.61, // ~35 degrees each side
  coneRange: 235,
  camHalf: 0.5, // ~29 degrees each side
  camRange: 270,
  alarmDecay: 1.6,
  smokeMax: 3,
  smokeRadius: 74,
  smokeLife: 6,
  empMax: 2,
  empRange: 330,
  empLife: 6,
  crackTime: 1.6,
  guardCatchDist: 26,
  lootDiamond: 500,
  lootGold: 100,
  lootPainting: 150,
};
