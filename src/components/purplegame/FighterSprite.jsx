// Komponen fighter bersama untuk seluruh ronde.
// Posisi/langkah diambil dari component Figma "STICKMAN RING" (639:7919),
// sedangkan empat pose jalan diambil dari "STICKMAN JALAN" (639:7920).
// Ikon stun berasal dari frame Figma "04b Race Condition Stun" (81:2199).
import { memo, useEffect, useLayoutEffect, useRef } from 'react';
import stunIcon from '../../assets/game/figma-round1/ikon-stun.svg';
import waitIcon from '../../assets/game/figma-ikon-tunggu.svg';
import walkMerah1 from '../../assets/game/figma-round1/walk-merah-1.svg';
import walkMerah2 from '../../assets/game/figma-round1/walk-merah-2-normalized.svg';
import walkMerah3 from '../../assets/game/figma-round1/walk-merah-3.svg';
import walkMerah4 from '../../assets/game/figma-round1/walk-merah-4-normalized.svg';
import walkKuning1 from '../../assets/game/figma-round1/walk-kuning-1.svg';
import walkKuning2 from '../../assets/game/figma-round1/walk-kuning-2-normalized.svg';
import walkKuning3 from '../../assets/game/figma-round1/walk-kuning-3.svg';
import walkBiru1 from '../../assets/game/figma-round1/walk-biru-1.svg';
import walkBiru2 from '../../assets/game/figma-round1/walk-biru-2-normalized.svg';
import walkBiru3 from '../../assets/game/figma-round1/walk-biru-3.svg';
import walkBiru4 from '../../assets/game/figma-round1/walk-biru-4-normalized.svg';
import walkHijau1 from '../../assets/game/figma-round1/walk-hijau-1.svg';
import walkHijau2 from '../../assets/game/figma-round1/walk-hijau-2-normalized.svg';
import walkHijau3 from '../../assets/game/figma-round1/walk-hijau-3.svg';

// Frame 2/4 sudah dinormalisasi ke viewBox penuh yang sama dengan frame 1/3,
// jadi keempat pose bisa dipakai bergantian tanpa mengubah ukuran fighter.
const WALK_FRAMES = {
  merah: [walkMerah1, walkMerah2, walkMerah3, walkMerah4],
  kuning: [walkKuning1, walkKuning2, walkKuning3, walkKuning2],
  biru: [walkBiru1, walkBiru2, walkBiru3, walkBiru4],
  hijau: [walkHijau1, walkHijau2, walkHijau3, walkHijau2],
};

// Figma menempatkan sprite di dalam wrapper 133x133, lalu meng-centre-kan
// gambar di dalamnya. Memakai wrapper 120x120 menggeser tengah rotasi dan
// membuat fighter kiri-atas (kuning) terlihat lebih jauh dari ring.
const FIGHTER_BOX = {
  merah: { width: 133.455, height: 133.293 },
  kuning: { width: 133.131, height: 133.611 },
  biru: { width: 133.536, height: 133.209 },
  hijau: { width: 133.363, height: 133.386 },
};

// Tinggi gambar tetap 120px seperti tampilan saat ini; hanya kotak rotasinya
// yang dikembalikan ke ukuran Figma.
const SPRITE_HEIGHT = 120;

// Sprite dasar Figma menghadap ke atas. Rotasi ini membuat setiap fighter
// menghadap piala di tengah ring dari pojoknya masing-masing.
const FACE_RING_ROTATION = {
  kuning: 136.15,
  biru: -135.47,
  merah: 45.51,
  hijau: -46.61,
};

// Titik kiri-atas sprite di dalam wrapper pemain (237x282 / 238x286),
// untuk langkah 0..6.
const RING_STEPS = {
  merah: [
    [54, 50],
    [61.78, 42.08],
    [69.55, 34.15],
    [77.33, 26.23],
    [85.1, 18.3],
    [92.88, 10.38],
    [100.65, 2.45],
  ],
  kuning: [
    [55.25, 99.29],
    [63.01, 107.03],
    [70.78, 114.76],
    [78.55, 122.5],
    [86.31, 130.23],
    [94.08, 137.97],
    [101.84, 145.7],
  ],
  biru: [
    [47.1, 104.37],
    [39.59, 111.69],
    [32.07, 119],
    [24.56, 126.32],
    [17.04, 133.63],
    [9.53, 140.95],
    [2.01, 148.26],
  ],
  hijau: [
    [50, 49],
    [42.07, 41.29],
    [34.14, 33.57],
    [26.22, 25.86],
    [18.29, 18.15],
    [10.36, 10.44],
    [2.43, 2.72],
  ],
};

// Pemetaan langkah -> frame jalan seperti pada component Figma Pemain*.
const STEP_FRAME = [1, 2, 3, 4, 3, 2, 1];

function FighterSprite({
  color,
  step = 0,
  walking = false,
  walkFrame = 1,
  speed = 1,
  stunned = false,
  waiting = false,
  holding = false,
  boom = false,
  punchSignal = 0,
  canPredict = false,
}) {
  const points = RING_STEPS[color] || RING_STEPS.merah;
  const box = FIGHTER_BOX[color] || FIGHTER_BOX.merah;
  const safeStep = Math.min(6, Math.max(0, step));
  const frameIndex = walking
    ? ((walkFrame - 1) % 4 + 4) % 4
    : STEP_FRAME[safeStep] - 1;
  const src = (WALK_FRAMES[color] || WALK_FRAMES.merah)[frameIndex];
  const stepMs = 60 / (speed || 1);

  // The host used to animate by changing `step` every 60ms and relying on a
  // CSS transition. Guests receive those steps as network snapshots with
  // jitter, so the transition kept restarting at random intervals and remote
  // fighters looked choppy. Every client now drives its own rAF interpolation
  // toward the target step at the same fixed speed, so motion is identical.
  const wrapperRef = useRef(null);
  const motionRef = useRef({ current: safeStep, target: safeStep, last: 0 });
  // Read by the rAF loop without restarting it on every step/waiting change.
  const snapRef = useRef({ waiting, boom, stunned, safeStep });
  snapRef.current = { waiting, boom, stunned, safeStep };

  // A guest predicts ONLY the first visual step of its own fighter, so the
  // PUKUL button feels instant. It never guesses the gate, lock hold, BOOM or
  // walk-home timing — every rule decision is still made by the host.
  const predictRef = useRef({ active: false, startedAt: 0 });
  const lastPunchSignalRef = useRef(punchSignal);

  useEffect(() => {
    // Only a NEW signal triggers prediction. A remount at the next round must
    // not replay the previous round's last punch.
    if (!canPredict || !punchSignal || punchSignal === lastPunchSignalRef.current) {
      return;
    }
    lastPunchSignalRef.current = punchSignal;
    predictRef.current = { active: true, startedAt: performance.now() };
  }, [canPredict, punchSignal]);

  useEffect(() => {
    if (!canPredict) predictRef.current.active = false;
  }, [canPredict]);

  // Position is owned exclusively by the rAF loop, never by React's style
  // prop. If JSX kept writing left/top, a step change would jump one frame to
  // the target before the interpolation caught up.
  useLayoutEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const [x, y] = points[Math.round(motionRef.current.current)];
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
  }, [points]);

  useEffect(() => {
    motionRef.current.target = safeStep;
  }, [safeStep]);

  useEffect(() => {
    const motion = motionRef.current;
    motion.last = 0;
    let raf = 0;
    const frame = (now) => {
      const dt = motion.last ? Math.min(now - motion.last, 100) : stepMs;
      motion.last = now;

      const {
        waiting: isWaiting,
        boom: isBoom,
        stunned: isStunned,
        safeStep: snapStep,
      } = snapRef.current;

      let target = motion.target;
      const predict = predictRef.current;
      if (predict.active) {
        const elapsed = now - predict.startedAt;
        // Host confirmation (step >= 1) or any correction ends the prediction.
        // 360ms also covers the 320ms gate-knockdown window.
        if (snapStep >= 1 || isWaiting || isBoom || isStunned || elapsed > 360) {
          predict.active = false;
        } else {
          target = Math.max(target, Math.min(1, elapsed / stepMs));
        }
      }

      const diff = target - motion.current;
      // Jitter can make the authoritative target jump two steps at once.
      // Catch up a little faster instead of trailing the host forever.
      const catchUp = Math.abs(diff) > 1.5 ? 1.5 : 1;
      const maxMove = (dt / stepMs) * catchUp;
      // Only snap for explicit "teleport" events or a big authoritative
      // correction. A normal walk-home moves one step per snapshot, so a
      // delayed packet must NOT be treated as a reset — that used to yank
      // remote fighters back several steps mid-animation.
      const teleport =
        (snapStep === 0 && (isWaiting || isBoom || diff <= -5)) ||
        Math.abs(diff) >= 3;
      if (teleport) {
        motion.current = target;
      } else if (Math.abs(diff) <= maxMove) {
        motion.current = target;
      } else {
        motion.current += Math.sign(diff) * maxMove;
      }

      const lo = Math.floor(motion.current);
      const hi = Math.min(6, lo + 1);
      const t = motion.current - lo;
      const x0 = points[lo][0];
      const y0 = points[lo][1];
      const x1 = points[hi][0];
      const y1 = points[hi][1];
      if (wrapperRef.current) {
        wrapperRef.current.style.left = `${x0 + (x1 - x0) * t}px`;
        wrapperRef.current.style.top = `${y0 + (y1 - y0) * t}px`;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [points, stepMs]);

  return (
    <div
      ref={wrapperRef}
      className="pointer-events-none absolute flex items-center justify-center select-none"
      style={{ width: box.width, height: box.height }}
    >
      <div
        className={`flex items-center justify-center ${holding ? 'fighter-hitting' : ''}`}
      >
        <img
          src={src}
          alt=""
          draggable="false"
          className="block max-w-none select-none"
          style={{
            width: 'auto',
            height: SPRITE_HEIGHT,
            transform: `rotate(${FACE_RING_ROTATION[color] ?? 0}deg)`,
            opacity: stunned ? 0.75 : 1,
          }}
        />
      </div>
      {stunned && (
        <img
          src={stunIcon}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute z-20 block max-w-none animate-pulse"
          style={{
            left: '50%',
            // Figma "04b Race Condition Stun" menaruh ikon ~8px di dalam
            // wrapper fighter, tidak mengambang di atasnya.
            top: 8,
            width: 32,
            height: 32,
            transform: 'translateX(-50%)',
            filter: 'drop-shadow(0 2px 0 rgba(0,0,0,0.6))',
          }}
        />
      )}
      {waiting && !stunned && (
        <img
          src={waitIcon}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute z-20 block max-w-none animate-pulse"
          style={{
            left: '50%',
            // Posisi mengikuti "Ikon Tunggu" pada frame Figma mutex.
            top: 8,
            width: 28,
            height: 32,
            transform: 'translateX(-50%)',
            filter: 'drop-shadow(0 2px 0 rgba(0,0,0,0.6))',
          }}
        />
      )}
    </div>
  );
}

// Props are all primitives, so memo skips re-rendering a fighter when only
// unrelated state (timer, log, another player's step) changed in a snapshot.
export default memo(FighterSprite);
