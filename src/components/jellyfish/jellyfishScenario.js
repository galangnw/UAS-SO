

import { COLOR_HEX, COLOR_NAMES } from '../../config/playerColors';

export const ARENA_W = 374;
export const ARENA_H = 547.36;
export const CATCH_RADIUS = 34;
export const EXIT_POS = { x: 185, y: 273 };
export const EXIT_RADIUS = 34;
export const ROUND_SECONDS = 30;
export const TICK_MS = 120;
export const DEADLOCK_RECOVERY_MS = 2000;

export const JELLY_COLORS = {
  1: '#4f8cff', 2: '#4f8cff', 3: '#4f8cff', 4: '#4f8cff',
  5: '#ff6b6b', 6: '#ff6b6b', 7: '#3ddc84', 8: '#3ddc84',
  9: '#3ddc84', 10: '#ffc93c', 11: '#ffc93c', 12: '#ffc93c',
};

export const PLAYER_DEFS = [
  { id: 'P1', name: COLOR_NAMES.merah, color: COLOR_HEX.merah, text: '#fff', start: { x: 139, y: 426 }, targets: [2, 3, 4, 5, 6, 7] },
  { id: 'P2', name: COLOR_NAMES.hijau, color: COLOR_HEX.hijau, text: '#fff', start: { x: 214, y: 426 }, targets: [4, 5, 6, 7, 8, 9] },
  { id: 'P3', name: COLOR_NAMES.biru, color: COLOR_HEX.biru, text: '#fff', start: { x: 139, y: 102 }, targets: [7, 8, 9, 10, 11, 12] },
  { id: 'P4', name: COLOR_NAMES.kuning, color: COLOR_HEX.kuning, text: '#fff', start: { x: 289, y: 264 }, targets: [10, 11, 12, 1, 2, 3] },
];

function mulberry32(seed) {
  let t = seed >>> 0;
  return function rand() {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function makeScenario(seed = 48213) {
  const rand = mulberry32(seed);
  const minX = 44;
  const maxX = ARENA_W - 44;
  const minY = 54;
  const maxY = ARENA_H - 54;
  const minDistPlayer = 95;
  const minDistExit = 90;
  const minDistJelly = 58;
  const placed = [];

  const jellies = Array.from({ length: 12 }, (_, i) => {
    const id = i + 1;
    let x = minX;
    let y = minY;
    for (let attempt = 0; attempt < 300; attempt += 1) {
      const cx = minX + rand() * (maxX - minX);
      const cy = minY + rand() * (maxY - minY);
      const tooClosePlayer = PLAYER_DEFS.some((p) => Math.hypot(cx - p.start.x, cy - p.start.y) < minDistPlayer);
      const tooCloseExit = Math.hypot(cx - EXIT_POS.x, cy - EXIT_POS.y) < minDistExit;
      const tooCloseJelly = placed.some((p) => Math.hypot(cx - p.x, cy - p.y) < minDistJelly);
      if (!tooClosePlayer && !tooCloseExit && !tooCloseJelly) {
        x = cx;
        y = cy;
        break;
      }
    }
    placed.push({ x, y });
    const angle = rand() * Math.PI * 2;
    const speed = 1.6 + rand() * 1.2;
    return {
      id,
      x,
      y,
      color: JELLY_COLORS[id],
      owner: null,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
    };
  });

  return { seed, jellies };
}

export function makeInitialPlayers() {
  return PLAYER_DEFS.map((p) => ({
    ...p,
    pos: { ...p.start },
    held: [],
    score: 0,
    exited: false,
    exitTime: null,
    deadlocksInvolved: 0,
    rejectedRequests: 0,
    wants: null,
    blockedBy: null,
  }));
}

export function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

export function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function calcRoundScore(p, { finishOrder = [] } = {}) {
  const base = 100;
  const resourceBonus = p.held.length * 50;
  const finishedBonus = p.exited ? 200 : 0;
  const deadlockPenalty = (p.deadlocksInvolved || 0) * 15;
  const noDeadlockBonus = (p.deadlocksInvolved || 0) === 0 ? 100 : 0;
  const rank = finishOrder.indexOf(p.id);
  const speedBonus = rank === 0 ? 100 : rank === 1 ? 75 : rank === 2 ? 50 : rank === 3 ? 25 : 0;
  return Math.max(0, base + resourceBonus + finishedBonus - deadlockPenalty + noDeadlockBonus + speedBonus);
}