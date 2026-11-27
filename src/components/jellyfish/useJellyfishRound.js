import { useCallback, useEffect, useRef, useState } from 'react';
import { socket } from '../../lib/socket';
import {
  ARENA_W,
  ARENA_H,
  CATCH_RADIUS,
  ROUND_SECONDS,
  PLAYER_DEFS,
  clamp,
  dist,
} from './jellyfishScenario';

const MOVE_SEND_MS = 120;
const CATCH_SCAN_MS = 100;
const SYNC_SNAP_DISTANCE = 60;
const SYNC_EASE = 0.35;

function getPlayerDef(playerKey) {
  return PLAYER_DEFS.find((p) => p.id === playerKey) || PLAYER_DEFS[0];
}

function speedBonus(finishOrder, userId) {
  const rank = finishOrder.indexOf(userId);
  return rank === 0 ? 100 : rank === 1 ? 75 : rank === 2 ? 50 : rank === 3 ? 25 : 0;
}

export function calcClientRoundScore(player, finishOrder = [], roundDeadlocks = 0) {
  if (!player) return 0;
  const base = 100;
  const resourceBonus = (player.held?.length || 0) * 50;
  const finishedBonus = player.exited ? 200 : 0;
  const deadlockPenalty = (roundDeadlocks || 0) * 15;
  const noDeadlockBonus = (roundDeadlocks || 0) === 0 ? 100 : 0;
  return Math.max(0, base + resourceBonus + finishedBonus - deadlockPenalty + noDeadlockBonus + speedBonus(finishOrder, player.userId));
}

export function useJellyfishRound({ roomCode, userId, snapshot, requestResult, roundNumber }) {
  const [joystickActive, setJoystickActive] = useState(false);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [posState, setPosState] = useState({ key: null, pos: null });

  const roundKey = `${roomCode}:${roundNumber}`;
  const localPos = posState.key === roundKey ? posState.pos : null;

  const moveDirRef = useRef({ x: 0, y: 0 });
  const joystickRef = useRef(null);
  const localPosRef = useRef(null);
  const lastMoveSentRef = useRef(0);
  const writeLocalPos = useCallback((pos) => {
    localPosRef.current = pos;
    setPosState({ key: roundKey, pos });
  }, [roundKey]);
  const lastCatchSentRef = useRef({ id: null, at: 0 });
  const baselineRef = useRef({ round: null, byUser: {} });
  const latestRef = useRef({
    meX: null,
    meY: null,
    meExited: false,
    meHeldKey: '',
    targets: [],
    jellies: [],
  });

  const me = snapshot?.players?.find((p) => p.userId === userId) || null;
  const myDef = getPlayerDef(me?.playerKey || 'P1');
  const targets = myDef.targets;
  const meX = me?.x;
  const meY = me?.y;
  const meId = me?.userId;
  const meExited = me?.exited;
  const meHeldKey = (me?.held || []).join(',');

  useEffect(() => {
    if (!snapshot || snapshot.round !== roundNumber) return;
    if (baselineRef.current.round !== snapshot.round) {
      const byUser = {};
      for (const p of snapshot.players || []) {
        byUser[p.userId] = {
          deadlocksInvolved: p.deadlocksInvolved || 0,
          rejectedRequests: p.rejectedRequests || 0,
        };
      }
      baselineRef.current = { round: snapshot.round, byUser };
    }
  }, [snapshot, roundNumber]);

  useEffect(() => {
    latestRef.current = {
      meX,
      meY,
      meExited: Boolean(meExited),
      meHeldKey,
      targets,
      jellies: snapshot?.jellies || [],
    };
  }, [meX, meY, meExited, meHeldKey, targets, snapshot]);

  useEffect(() => {
    localPosRef.current = null;
    moveDirRef.current = { x: 0, y: 0 };
    lastMoveSentRef.current = 0;
    lastCatchSentRef.current = { id: null, at: 0 };
  }, [roomCode, roundNumber]);

  useEffect(() => {
    if (!meId || meX == null || meY == null) return;
    const serverPos = { x: meX, y: meY };
    if (!localPosRef.current) {
      writeLocalPos(serverPos);
      return;
    }

    const d = dist(localPosRef.current, serverPos);
    if (d > SYNC_SNAP_DISTANCE) {
      writeLocalPos(serverPos);
      return;
    }
    if (d > 2) {
      writeLocalPos({
        x: localPosRef.current.x + (serverPos.x - localPosRef.current.x) * SYNC_EASE,
        y: localPosRef.current.y + (serverPos.y - localPosRef.current.y) * SYNC_EASE,
      });
    }
  }, [meX, meY, meId, writeLocalPos]);

  const statusFromRequest = (() => {
    if (!requestResult || requestResult.userId !== userId) return null;
    if (requestResult.ok) {
      return { text: requestResult.message || `R${requestResult.resourceId} ditangkap`, kind: 'safe' };
    }
    const msg = requestResult.message ||
      (requestResult.reason === 'rejected_order' ? `DITOLAK: urutan salah untuk R${requestResult.resourceId}` :
       requestResult.reason === 'rejected_unsafe' ? `TIDAK AMAN: R${requestResult.resourceId} ditolak` :
       requestResult.reason === 'too_far' ? 'Terlalu jauh dari ubur-ubur' :
       requestResult.reason === 'blocked' ? `R${requestResult.resourceId} sedang dipegang pemain lain` : 'Permintaan ditolak');
    return {
      text: msg,
      kind: requestResult.reason === 'rejected_unsafe' || requestResult.reason === 'rejected_order' ? 'unsafe' : 'info',
    };
  })();

  const roundDeadlocksFor = useCallback((player) => {
    if (!player) return 0;
    const base = baselineRef.current.round === snapshot?.round
      ? baselineRef.current.byUser[player.userId]?.deadlocksInvolved ?? 0
      : 0;
    return Math.max(0, (player.deadlocksInvolved || 0) - base);
  }, [snapshot?.round]);

  const roundRejectedFor = useCallback((player) => {
    if (!player) return 0;
    const base = baselineRef.current.round === snapshot?.round
      ? baselineRef.current.byUser[player.userId]?.rejectedRequests ?? 0
      : 0;
    return Math.max(0, (player.rejectedRequests || 0) - base);
  }, [snapshot?.round]);

  const resetJoystick = useCallback(() => {
    moveDirRef.current = { x: 0, y: 0 };
    setJoystickActive(false);
    setKnobPos({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    window.addEventListener('pointerup', resetJoystick);
    window.addEventListener('pointercancel', resetJoystick);
    return () => {
      window.removeEventListener('pointerup', resetJoystick);
      window.removeEventListener('pointercancel', resetJoystick);
    };
  }, [resetJoystick]);

  const updateJoystick = useCallback((clientX, clientY) => {
    const el = joystickRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;
    const maxR = 20;
    const mag = Math.hypot(dx, dy) || 1;
    const clampedMag = Math.min(mag, maxR);
    setKnobPos({ x: (dx / mag) * clampedMag, y: (dy / mag) * clampedMag });
    const active = mag > 4;
    setJoystickActive(active);
    moveDirRef.current = active ? { x: dx / mag, y: dy / mag } : { x: 0, y: 0 };
  }, []);

  const handleJoystickPointerDown = useCallback((e) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    updateJoystick(e.clientX, e.clientY);
  }, [updateJoystick]);

  const handleJoystickPointerMove = useCallback((e) => {
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) updateJoystick(e.clientX, e.clientY);
  }, [updateJoystick]);

  const roundActive = snapshot?.round === roundNumber &&
    (snapshot?.status === 'playing' || snapshot?.status === 'deadlock_recovery') &&
    !meExited;

  useEffect(() => {
    if (!roomCode || !userId || !roundActive) return undefined;

    const id = setInterval(() => {
      const latest = latestRef.current;
      const pos = localPosRef.current ||
        (latest.meX != null && latest.meY != null ? { x: latest.meX, y: latest.meY } : null);
      if (!pos) return;

      const dir = moveDirRef.current;
      let next = pos;
      if (dir.x !== 0 || dir.y !== 0) {
        const speed = 10;
        next = {
          x: clamp(pos.x + dir.x * speed, 20, ARENA_W - 20),
          y: clamp(pos.y + dir.y * speed, 20, ARENA_H - 20),
        };
        writeLocalPos(next);
      }

      const now = Date.now();
      if (socket.connected && now - lastMoveSentRef.current >= MOVE_SEND_MS) {
        lastMoveSentRef.current = now;
        socket.emit('jellyfish:move', { code: roomCode, x: next.x, y: next.y });
      }

      if (socket.connected && now - lastCatchSentRef.current.at >= CATCH_SCAN_MS) {
        const held = latest.meHeldKey ? latest.meHeldKey.split(',').map(Number) : [];
        const catchPos = latest.meX != null && latest.meY != null
          ? { x: latest.meX, y: latest.meY }
          : next;
        const allowBlockedRequest = roundNumber === 1;
        const targetJellies = latest.jellies
          .filter((j) => {
            if (!latest.targets.includes(j.id) || held.includes(j.id)) return false;
            if (!j.owner) return true;
            return allowBlockedRequest && j.owner !== userId;
          })
          .map((j) => ({ j, d: dist(catchPos, j) }))
          .filter((x) => x.d <= CATCH_RADIUS)
          .sort((a, b) => a.d - b.d);
        const candidate = targetJellies[0]?.j;
        if (candidate && (lastCatchSentRef.current.id !== candidate.id || now - lastCatchSentRef.current.at > 500)) {
          lastCatchSentRef.current = { id: candidate.id, at: now };
          socket.emit('jellyfish:request_resource', { code: roomCode, resourceId: candidate.id });
        }
      }
    }, 80);

    return () => clearInterval(id);
  }, [roomCode, userId, roundNumber, roundActive, writeLocalPos]);

  const handleLepas = useCallback(() => {
    if (!roomCode || !socket.connected) return;
    socket.emit('jellyfish:release', { code: roomCode });
  }, [roomCode]);

  const finishOrder = snapshot?.finishOrder || [];
  const effectiveRoundOver = snapshot?.round === roundNumber ? (snapshot.status === 'round_end' || snapshot.status === 'game_end') : false;

  const deadlock = snapshot?.deadlock || null;
  const statusFromDeadlock = deadlock ? 'DEADLOCK: siklus terdeteksi' : null;
  const statusText = statusFromRequest?.text || statusFromDeadlock || '';
  const statusKind = statusFromRequest?.kind || (deadlock ? 'unsafe' : 'info');

  const displayMe = me ? {
    ...me,
    x: localPos?.x ?? me.x,
    y: localPos?.y ?? me.y,
  } : null;

  // eslint-disable-next-line react-hooks/refs -- baselineRef is write-on-round-change, read for render derivation
  const myRoundDeadlocks = roundDeadlocksFor(me);
  // eslint-disable-next-line react-hooks/refs -- baselineRef is write-on-round-change, read for render derivation
  const myRoundRejected = roundRejectedFor(me);
  const myScore = calcClientRoundScore(displayMe, finishOrder, myRoundDeadlocks);

  const otherPlayers = (snapshot?.players || []).filter((p) => p.userId !== userId);
  const scoreFor = (p) => calcClientRoundScore(p, finishOrder, roundDeadlocksFor(p));
  // eslint-disable-next-line react-hooks/refs -- baselineRef read for render derivation
  const totalRoundRejected = (snapshot?.players || []).reduce((sum, p) => sum + roundRejectedFor(p), 0);
  // eslint-disable-next-line react-hooks/refs -- baselineRef read for render derivation
  const totalRoundDeadlocks = (snapshot?.players || []).reduce((sum, p) => sum + roundDeadlocksFor(p), 0);

  return {
    joystickRef,
    joystickActive,
    knobPos,
    handleJoystickPointerDown,
    handleJoystickPointerMove,
    resetJoystick,
    handleLepas,
    me: displayMe,
    myDef,
    targets,
    otherPlayers,
    jellies: snapshot?.jellies || [],
    timeLeft: snapshot?.round === roundNumber ? (snapshot?.timeLeft ?? ROUND_SECONDS) : ROUND_SECONDS,
    statusText,
    statusKind,
    roundOver: effectiveRoundOver,
    deadlock,
    finishOrder,
    myScore,
    myRoundDeadlocks,
    myRoundRejected,
    totalRoundRejected,
    totalRoundDeadlocks,
    roundDeadlocksFor,
    roundRejectedFor,
    scoreFor,
  };
}

