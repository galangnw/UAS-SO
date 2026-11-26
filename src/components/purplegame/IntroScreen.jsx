

import arenaGlow from '../../assets/game/arena-ring.png';
import centerTrophy from '../../assets/game/arena-bg.png';

import jalanMerah from '../../assets/game/intro-jalan-merah2.svg';
import jalanKuning from '../../assets/game/intro-jalan-kuning2.svg';
import jalanBiru from '../../assets/game/intro-jalan-biru2.svg';
import jalanHijau from '../../assets/game/intro-jalan-hijau2.svg';

const BG_GRADIENT =
  'bg-gradient-to-b from-[rgba(24,4,61,0.96)] to-[rgba(46,9,113,0.96)]';

const ROUND_CARDS = [
  {
    n: '1',
    label: 'Tanpa Aturan',
    left: 28,
    numberLeft: 63.5,
    labelLeft: 68,
    color: 'text-[#ff4d4d]',
  },
  {
    n: '2',
    label: 'Mutex',
    left: 156,
    numberLeft: 193.5,
    labelLeft: 194,
    color: 'text-[#0026ff]',
  },
  {
    n: '3',
    label: 'Semaphore',
    left: 285,
    numberLeft: 323.5,
    labelLeft: 324,
    color: 'text-[#00ff08]',
  },
];

const FIGHTERS = [
  {
    sprite: jalanKuning,
    left: 73.2,
    top: 362.59,
    width: 132.694,
    height: 134.001,
    rotate: 136.15,
  },
  {
    sprite: jalanBiru,
    left: 168,
    top: 359,
    width: 133.099,
    height: 133.637,
    rotate: -135.47,
  },
  {
    sprite: jalanMerah,
    left: 73,
    top: 452,
    width: 133.66,
    height: 133.078,
    rotate: 45.51,
  },
  {
    sprite: jalanHijau,
    left: 171,
    top: 454,
    width: 134.241,
    height: 132.402,
    rotate: -46.61,
  },
];

function Fighter({ sprite, left, top, width, height, rotate }) {
  return (
    <div
      className="pointer-events-none absolute flex select-none items-center justify-center"
      style={{ left, top, width, height }}
    >
      <div style={{ transform: `rotate(${rotate}deg)` }}>
        <div className="relative overflow-hidden" style={{ width: 71.24, height: 117.38 }}>
          <div
            className="absolute"
            style={{ top: '39.5%', right: '11.67%', bottom: '9.25%', left: '13.33%' }}
          >
            <div
              className="absolute"
              style={{ top: '-4.16%', right: '-2.46%', bottom: '-1.68%', left: '-4.68%' }}
            >
              <img
                src={sprite}
                alt=""
                draggable="false"
                className="block h-full w-full select-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function IntroScreen({ onStart, isHost = false, isStarting = false }) {
  return (
    <div
      className={`relative h-full w-full overflow-hidden ${BG_GRADIENT} font-['Lilita_One']`}
    >

      <div
        className="absolute flex -translate-x-1/2 items-center justify-center"
        style={{ left: 194.95, top: 82, width: 197.905, height: 92.59 }}
      >
        <div className="flex-none -rotate-[2.86deg]">
          <p className="text-center text-[64px] leading-[normal] text-[#fff1cf] text-title-outline [text-shadow:0_4px_0_#0A1A4A]">
            STICK
          </p>
        </div>
      </div>
      <div
        className="absolute flex -translate-x-1/2 items-center justify-center"
        style={{ left: 195, top: 134.52, width: 349.152, height: 107.951 }}
      >
        <div className="flex-none -rotate-[4.2deg]">
          <p className="text-center text-[96px] leading-[normal] text-[#ffc83d] text-title-outline [text-shadow:0_4px_0_#0A1A4A]">
            BRAWL
          </p>
        </div>
      </div>
      <p
        className="absolute -translate-x-1/2 text-center text-[13px] leading-[normal] text-[#c5cee1]"
        style={{ left: 194.5, top: 267, width: 365, height: 25 }}
      >
        Rebut piala di tengah ring. Pukul, lari, dan belajar race condition.
      </p>

      <img
        src={arenaGlow}
        alt=""
        className="pointer-events-none absolute object-cover"
        style={{ left: 14, top: 300, width: 348, height: 348 }}
      />
      {FIGHTERS.map((fighter) => (
        <Fighter key={fighter.sprite} {...fighter} />
      ))}
      <img
        src={centerTrophy}
        alt=""
        className="pointer-events-none absolute object-contain"
        style={{ left: 149, top: 435, width: 77, height: 77 }}
      />

      {isHost && !isStarting ? (
        <button
          type="button"
          onClick={onStart}
          className="absolute rounded-[10px] border-b-[5px] border-black bg-[#ff6262] text-center text-[28px] leading-[normal] text-white active:translate-y-[2px] active:border-b-[3px]"
          style={{ left: 28, top: 659, width: 334, height: 64 }}
        >
          MULAI BERTARUNG
        </button>
      ) : (
        <div
          className="absolute grid place-items-center rounded-[10px] border border-black/40 bg-[#230063] px-4 text-center text-[14px] leading-tight text-[#c5cee1]"
          style={{ left: 28, top: 659, width: 334, height: 64 }}
        >
          {isHost
            ? 'Menyiapkan pertarungan...'
            : 'Menunggu host memulai pertarungan...'}
        </div>
      )}

      {ROUND_CARDS.map((card) => (
        <div key={card.n}>
          <div
            className="absolute rounded-[5px] border border-black bg-[#230063]"
            style={{ left: card.left, top: 744, width: 77, height: 46 }}
          />
          <span
            className={`absolute -translate-x-1/2 text-center text-[28px] leading-[normal] ${card.color}`}
            style={{ left: card.numberLeft, top: 744, width: 13, height: 28 }}
          >
            {card.n}
          </span>
          <span
            className="absolute -translate-x-1/2 text-center text-[10px] leading-[normal] text-white"
            style={{ left: card.labelLeft, top: 774, width: 64, height: 15 }}
          >
            {card.label}
          </span>
        </div>
      ))}
    </div>
  );
}
