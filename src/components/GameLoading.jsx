import { useEffect, useState } from 'react';
import latarLoading from '../assets/game/loading/latar-loading.png';
import glowPlatform from '../assets/game/loading/glow-platform.svg';
import shadowPink from '../assets/game/loading/shadow-pink.svg';
import shadowBlue from '../assets/game/loading/shadow-blue.svg';
import stickmanHijau from '../assets/lobby/stickman-hijau.svg';
import stickmanMerah from '../assets/lobby/stickman-merah.svg';
import stickmanBlue from '../assets/game/loading/stickman-blue.svg';
import sparkle1 from '../assets/game/loading/sparkle-1.svg';
import sparkle2 from '../assets/game/loading/sparkle-2.svg';
import sparkle3 from '../assets/game/loading/sparkle-3.svg';
import sparkle4 from '../assets/game/loading/sparkle-4.svg';
import progressStripes from '../assets/game/loading/progress-stripes.svg';

function MemuatDots() {
  const [dots, setDots] = useState(1);

  useEffect(() => {
    const id = setInterval(() => setDots((d) => (d % 3) + 1), 450);
    return () => clearInterval(id);
  }, []);

  return (
    <p
      className="absolute font-['Baloo_2'] text-[17px] font-extrabold leading-[24px] tracking-[2.04px] text-white"
      style={{ left: 152, top: 683, width: 95, height: 24 }}
      data-node-id="284:2606"
    >
      {'MEMUAT' + '.'.repeat(dots)}
    </p>
  );
}

function LoadingBar({ progress = 0 }) {
  const clamped = Math.max(0, Math.min(100, progress));
  // track inner: 323 wide, 2px border, 1px inset -> fill area max ~317px
  const fillWidth = Math.max(6, (clamped / 100) * 317);

  return (
    <div
      className="absolute rounded-[18px] border-2 border-[rgba(255,255,255,0.4)] bg-[#0a1447]"
      style={{
        left: 38,
        top: 716,
        width: 323,
        height: 36,
        boxShadow: '0px 5px 2px rgba(0,0,0,0.5)',
      }}
      data-node-id="284:2553"
    >
      <div
        className="absolute overflow-hidden rounded-[15px] bg-[#ffc929]"
        style={{ left: 1, top: 1, height: 30, width: fillWidth, transition: 'width 180ms linear' }}
        data-node-id="241:2562"
      >
        <img
          src={progressStripes}
          alt=""
          className="absolute left-0 top-0 h-[30px] w-[360px] max-w-none"
          data-node-id="284:2556"
        />
      </div>
    </div>
  );
}

export default function GameLoading({ progress, tip = 'Jangan cuma nonton, ikut bertarung!' }) {
  const [autoProgress, setAutoProgress] = useState(8);

  useEffect(() => {
    if (typeof progress === 'number') return undefined;
    const id = setInterval(() => {
      setAutoProgress((p) => {
        if (p >= 92) return p;
        const step = p < 40 ? 4 : p < 70 ? 2 : 1;
        return Math.min(92, p + step);
      });
    }, 220);
    return () => clearInterval(id);
  }, [progress]);

  const value = typeof progress === 'number' ? progress : autoProgress;

  return (
    <div className="relative h-full w-full overflow-hidden bg-white" data-node-id="240:2553">
      <img
        src={latarLoading}
        alt=""
        className="absolute inset-0 h-full w-full object-cover pointer-events-none"
        data-node-id="240:2554"
      />

      <img src={glowPlatform} alt="" className="absolute" style={{ left: 9, top: 590, width: 380, height: 84 }} data-node-id="240:2633" />
      <img src={shadowPink} alt="" className="absolute" style={{ left: 33, top: 631, width: 136, height: 14 }} data-node-id="240:2635" />
      <img src={shadowBlue} alt="" className="absolute" style={{ left: 236, top: 631, width: 128, height: 14 }} data-node-id="240:2636" />

      <img src={stickmanHijau} alt="" className="absolute" style={{ left: 131, top: 404, width: 146, height: 218 }} data-node-id="240:2637" />
      <img src={stickmanMerah} alt="" className="absolute" style={{ left: 17, top: 373, width: 168, height: 276 }} data-node-id="240:2653" />
      <img src={stickmanBlue} alt="" className="absolute" style={{ left: 220, top: 379, width: 160, height: 269 }} data-node-id="240:2669" />

      <div
        className="absolute flex items-center justify-center"
        style={{ left: 201, top: 115.34, width: 393.163, height: 79.487, transform: 'translateX(-50%)' }}
        data-node-id="241:2553"
      >
        <div style={{ transform: 'rotate(-2.01deg)' }}>
          <p
            className="text-center font-['Baloo_2'] text-[60px] font-extrabold leading-[84px]"
            style={{
              width: 391.093,
              height: 65.786,
              background: 'linear-gradient(180deg, #FFFFFF 20%, #B8E0FF 85%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: 'none',
              filter: 'drop-shadow(0px 5px 0px #0A1A4A)',
            }}
          >
            PARTY PARTY
          </p>
        </div>
      </div>

      <img src={sparkle1} alt="" className="absolute" style={{ left: 18, top: 112, width: 26, height: 26 }} data-node-id="240:2689" />
      <img src={sparkle2} alt="" className="absolute" style={{ left: 327, top: 112, width: 16, height: 16 }} data-node-id="240:2692" />
      <img src={sparkle3} alt="" className="absolute" style={{ left: 210, top: 75, width: 14, height: 14 }} data-node-id="240:2695" />
      <img src={sparkle4} alt="" className="absolute" style={{ left: 25, top: 533, width: 12, height: 12 }} data-node-id="240:2698" />
      <img src={sparkle4} alt="" className="absolute" style={{ left: 348, top: 435, width: 12, height: 12 }} data-node-id="240:2701" />

      <div
        className="absolute flex items-center justify-center"
        style={{ left: 199, top: 181.79, width: 402.132, height: 100.427, transform: 'translateX(-50%)' }}
        data-node-id="241:2554"
      >
        <div style={{ transform: 'rotate(-2.37deg)' }}>
          <p
            className="text-center font-['Baloo_2'] text-[84px] font-extrabold leading-[84px]"
            style={{
              width: 399,
              background: 'linear-gradient(180deg, #FFE047 20%, #FF991A 85%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0px 5px 0px #0A1A4A)',
            }}
          >
            YEAH
          </p>
        </div>
      </div>

      <div
        className="absolute flex items-center justify-center rounded-[100px] bg-[#ffcf33]"
        style={{
          left: 125,
          top: 284,
          width: 152,
          height: 35,
          boxShadow: '0px 3px 0px 0px #0a204f',
        }}
        data-node-id="228:14165"
      >
        <p
          className="text-center font-['Baloo_2'] text-[19px] font-extrabold leading-[26px] tracking-[0.57px] text-black"
          style={{ width: 116 }}
          data-node-id="241:2559"
        >
          1–4 PEMAIN
        </p>
      </div>

      <MemuatDots />
      <LoadingBar progress={value} />

      <p
        className="absolute text-center font-['Baloo_2'] text-[14px] font-bold leading-[23px] text-white"
        style={{ left: 200, top: 786, width: 280, height: 22, transform: 'translateX(-50%)' }}
        data-node-id="241:2574"
      >
        {tip}
      </p>
    </div>
  );
}
