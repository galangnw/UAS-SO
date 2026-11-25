// Tata letak arena Stick Brawl mengikuti frame Figma 25:1575 / 81:2363
// (390 x 844). Semua komponen fighter, ring, timer, dan tombol memakai
// posisi serta warna dari Figma, lalu dipakai ulang oleh setiap ronde.
import arenaGlow from '../../assets/game/figma-round1/arena-glow.png';
import centerTrophy from '../../assets/game/figma-round1/arena-trophy.png';
import garisKrisis from '../../assets/game/figma-round1/arena-garis-krisis.svg';
import tombolMerah from '../../assets/game/figma-round1/tombol-merah.svg';
import tombolKuning from '../../assets/game/figma-round1/tombol-kuning.svg';
import tombolBiru from '../../assets/game/figma-round1/tombol-biru.svg';
import tombolHijau from '../../assets/game/figma-round1/tombol-hijau.svg';
import slotKunci from '../../assets/game/figma-slot-kunci.svg';
import slotKunciMerah from '../../assets/game/figma-slot-kunci-merah.svg';
import slotKunciKuning from '../../assets/game/figma-slot-kunci-kuning.svg';
import slotKunciBiru from '../../assets/game/figma-slot-kunci-biru.svg';
import slotKunciHijau from '../../assets/game/figma-slot-kunci-hijau.svg';
import { REQUIRED_PLAYERS } from '../../config/gameRules';
import FighterSprite from './FighterSprite';
import BoomRaceCondition from './BoomRaceCondition';
import LogKejadian from './LogKejadian';

export const BG_GRADIENT =
  'bg-gradient-to-b from-[rgba(24,4,61,0.96)] to-[rgba(46,9,113,0.96)]';

const BUTTON_ASSETS = {
  merah: tombolMerah,
  kuning: tombolKuning,
  biru: tombolBiru,
  hijau: tombolHijau,
};

// "Slot Kunci Gerbang" Figma punya state warna sesuai pemegang kunci.
const LOCK_ASSETS = {
  merah: slotKunciMerah,
  kuning: slotKunciKuning,
  biru: slotKunciBiru,
  hijau: slotKunciHijau,
};

const PLAYER_LAYOUT = {
  merah: {
    left: 3,
    top: 440,
    width: 237,
    height: 282,
    button: { left: 2, top: 196, angle: 60.62 },
    score: { left: 111, top: 252 },
    scoreText: { left: 142.5, top: 256, width: 63, height: 16, size: 24, angle: 0, color: '#ff0000' },
    name: { left: 143, top: 281, width: 44, height: 14, angle: 0 },
  },
  kuning: {
    left: 2,
    top: 246,
    width: 237,
    height: 282,
    button: { left: 3, top: -5, angle: 119 },
    score: { left: 117, top: -15, opacity: 0.63 },
    scoreText: { left: 148.5, top: 18, width: 63, height: 16, size: 20, angle: 0, color: '#fffb00' },
    name: { left: 149.5, top: -5, width: 39, height: 13, angle: 0 },
  },
  biru: {
    left: 151,
    top: 245,
    width: 236,
    height: 284,
    button: { left: 148, top: -4, angle: -119 },
    score: { left: 60, top: -14 },
    scoreText: { left: 91.5, top: 17, width: 63, height: 16, size: 20, angle: 0, color: '#0040ff' },
    name: { left: 91.5, top: -4, width: 39, height: 13, angle: 0 },
  },
  hijau: {
    left: 152,
    top: 439,
    width: 238,
    height: 286,
    button: { left: 147, top: 198, angle: -61 },
    score: { left: 76, top: 253 },
    scoreText: { left: 107.5, top: 257, width: 63, height: 16, size: 20, angle: 0, color: '#2fff00' },
    name: { left: 108.5, top: 282, width: 39, height: 13, angle: 0 },
  },
};

function PunchButton({ color, config, interactive, disabled, onClick }) {
  const { left, top, angle } = config.button;

  return (
    <button
      type="button"
      onClick={interactive ? onClick : undefined}
      disabled={interactive ? disabled : false}
      aria-label={interactive ? 'PUKUL!' : undefined}
      tabIndex={interactive ? 0 : -1}
      className={`absolute block h-[84px] w-[87px] ${
        interactive
          ? 'cursor-pointer transition active:scale-95 disabled:cursor-default'
          : 'cursor-default'
      }`}
      style={{ left, top }}
    >
      <img src={BUTTON_ASSETS[color]} alt="" className="absolute inset-0 h-full w-full" />
      <span
        className="absolute whitespace-nowrap text-[20px] leading-none text-white"
        style={{
          left: 43.5,
          top: 42,
          transform: `translate(-50%, -50%) rotate(${angle}deg)`,
        }}
      >
        PUKUL!
      </span>
    </button>
  );
}

function ArenaPlayer({
  player,
  score,
  step,
  walking,
  walkFrame,
  speed,
  showButton,
  interactive,
  disabled,
  onPunch,
  waiting = false,
  holding = false,
  stunned = false,
  boom = false,
  fadingOut = false,
  fadeStyle,
  punchSignal = 0,
  canPredict = false,
}) {
  const layout = PLAYER_LAYOUT[player.key] || PLAYER_LAYOUT.merah;
  const scoreConfig = layout.scoreText;
  const nameConfig = layout.name;

  return (
    <div
      className={`absolute transition-opacity ease-in-out ${
        fadingOut ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
      style={{
        left: layout.left,
        top: layout.top,
        width: layout.width,
        height: layout.height,
        ...fadeStyle,
      }}
    >
      {showButton && !interactive && (
        <PunchButton
          color={player.key}
          config={layout}
          interactive={interactive}
          disabled={disabled || stunned}
          onClick={onPunch}
        />
      )}

      <FighterSprite
        color={player.key}
        step={step}
        walking={walking && !stunned}
        walkFrame={walkFrame}
        speed={speed}
        stunned={stunned}
        waiting={waiting}
        holding={holding}
        boom={boom}
        punchSignal={punchSignal}
        canPredict={canPredict}
      />

      <div
        className="absolute rounded-[5px] border border-black bg-[#230063]"
        style={{
          left: layout.score.left,
          top: layout.score.top,
          width: 63,
          height: 52,
          opacity: layout.score.opacity ?? 1,
        }}
      />
      <div
        className="absolute flex items-center justify-center whitespace-nowrap"
        style={{
          left: scoreConfig.left,
          top: scoreConfig.top,
          width: scoreConfig.width,
          height: scoreConfig.height,
          transform: `translateX(-50%) rotate(${scoreConfig.angle}deg)`,
        }}
      >
        <span
          className="block leading-[normal]"
          style={{ fontSize: scoreConfig.size, color: scoreConfig.color }}
        >
          {score}
        </span>
      </div>
      <div
        className="absolute flex items-center justify-center whitespace-nowrap"
        style={{
          left: nameConfig.left,
          top: nameConfig.top,
          width: nameConfig.width,
          height: nameConfig.height,
          transform: `translateX(-50%) rotate(${nameConfig.angle}deg)`,
        }}
      >
        <span className="block max-w-full truncate text-[12px] leading-[normal] text-white" title={player.name}>
          {player.name}
        </span>
      </div>
    </div>
  );
}

function formatTime(sec) {
  const value = Math.max(0, sec);
  return `00:${String(value).padStart(2, '0')}`;
}

export default function ArenaScene({
  round,
  timeLeft,
  scores,
  myKey,
  players,
  fighters,
  walkFrame = 1,
  speed = 1,
  onPunch,
  toast,
  boom,
  heldSlots = [],
  waiting = [],
  stunned = [],
  eventLog = [],
  logStep = 0,
  showAllButtons = false,
  timeUp = false,
  fadeDuration = 650,
  punchPending = false,
  punchSequence = 0,
  predictLocal = false,
  hasFullRoom = true,
  children,
}) {
  const locks = round.locks || 0;
  const fadeStyle = { transitionDuration: `${fadeDuration}ms` };
  const fadeOutClass = `transition-opacity ease-in-out ${
    timeUp ? 'pointer-events-none opacity-0' : 'opacity-100'
  }`;
  const nextText = round.nextLabel
    ? `Berikutnya: ${round.nextLabel}`
    : 'Menuju hasil akhir...';
  const myFighter = myKey ? fighters[myKey] || { step: 0, walking: true } : null;
  const showFixedPunch = !showAllButtons && Boolean(myKey);

  return (
    <div
      className={`relative mx-auto h-full w-full max-w-[390px] overflow-hidden ${BG_GRADIENT} font-['Lilita_One']`}
    >
      <div
        className={`absolute rounded-[10px] border-b-[5px] border-black bg-[#ff6262] ${fadeOutClass}`}
        style={{ left: 13, top: 55, width: 111, height: 27, ...fadeStyle }}
      >
        <span className="grid h-full w-full place-items-center text-[13px] leading-none text-white">
          {round.badge}
        </span>
      </div>

      {/* Judul ronde ringkas di samping badge, tanpa menutup panel log. */}
      <div
        className={`absolute flex items-center justify-center rounded-[10px] border-[1.5px] border-black bg-[#ffc83d] px-[6px] ${fadeOutClass}`}
        style={{ left: 247, top: 55, width: 130, height: 28, ...fadeStyle }}
      >
        <span className="whitespace-nowrap text-[15px] leading-none text-[#230063]">
          {round.title}
        </span>
      </div>

      {/* Log kejadian dipakai di semua ronde, bukan hanya demo lambat. */}
      <div className={fadeOutClass} style={fadeStyle}>
        <LogKejadian events={eventLog} step={logStep} />
      </div>

      <div
        aria-hidden={!timeUp}
        className={`pointer-events-none absolute inset-x-0 top-0 transition-opacity ease-in-out ${
          timeUp ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          ...fadeStyle,
          transitionDelay: timeUp ? `${Math.round(fadeDuration * 0.3)}ms` : '0ms',
        }}
      >
        <p className="absolute left-[195px] top-[100px] w-[390px] -translate-x-1/2 text-center text-[46px] leading-[normal] text-[#ffc83d] text-title-outline">
          WAKTU HABIS!
        </p>
        <p className="absolute left-[195px] top-[167px] h-[25px] w-[390px] -translate-x-1/2 text-center text-[15px] leading-[normal] text-[#c5cee1]">
          Ronde {round.round}/3 selesai
        </p>
        <p className="absolute left-[195px] top-[198px] h-[25px] w-[390px] -translate-x-1/2 text-center text-[15px] leading-[normal] text-[#c5cee1]">
          {nextText}
        </p>
      </div>

      <div
        className="pointer-events-none absolute"
        style={{ left: -40, top: 248, width: 472, height: 472 }}
      >
        <img src={arenaGlow} alt="" className="h-full w-full object-cover" />
      </div>
      <div
        className="pointer-events-none absolute aspect-square"
        style={{ left: '40.26%', right: '40%', top: 445 }}
      >
        <img src={centerTrophy} alt="" className="h-full w-full object-cover" />
      </div>
      <div
        className="pointer-events-none absolute"
        style={{ left: 115.5, top: 403.5, width: 160, height: 160 }}
      >
        <img
          src={garisKrisis}
          alt=""
          className="absolute"
          style={{ left: -2, top: -2, width: 164, height: 164 }}
        />
      </div>

      {/* Cincin dalam: batas zona yang hanya bisa dimasuki pemegang kunci. */}
      {locks > 0 && (
        <div
          className={`pointer-events-none absolute rounded-full border-2 border-dashed transition-colors ${
            heldSlots.length >= locks
              ? 'border-[#ff6262] opacity-100'
              : 'border-white/70 opacity-75'
          }`}
          style={{ left: 125.5, top: 413.5, width: 140, height: 140, ...fadeStyle }}
        />
      )}

      {locks > 0 && (
        <div
          className={`absolute flex ${fadeOutClass}`}
          style={{
            // Posisi horizontal mengikuti Figma 81:1791 / 26:1351
            // (tunggal x=180.5, dua kunci x=148.5 & 211.5 / gap 33).
            // Vertikal di tengah antara posisi lama (272) dan Figma
            // (376.5 / 382) agar tidak menutup papan skor maupun ring.
            left: locks === 1 ? 180.5 : 148.5,
            top: locks === 1 ? 324 : 327,
            gap: locks === 1 ? 0 : 33,
            ...fadeStyle,
          }}
        >
          {Array.from({ length: locks }).map((_, index) => {
            const holder = heldSlots[index];
            return (
              <div key={index} className="relative h-[30px] w-[30px]">
                <img
                  src={holder ? LOCK_ASSETS[holder] || slotKunci : slotKunci}
                  alt=""
                  className="h-full w-full"
                />
              </div>
            );
          })}
        </div>
      )}

      {players.map((player) => {
        const fighter = fighters[player.key] || { step: 0, walking: true };
        return (
          <ArenaPlayer
            key={player.key}
            player={player}
            score={scores[player.key] ?? 0}
            step={fighter.step}
            walking={fighter.walking}
            walkFrame={walkFrame}
            speed={speed}
            showButton={showAllButtons || player.key === myKey}
            interactive={!timeUp && !showAllButtons && player.key === myKey}
            disabled={!fighter.walking || (player.key === myKey && punchPending)}
            onPunch={() => onPunch?.(player.key)}
            waiting={waiting.includes(player.key)}
            holding={heldSlots.includes(player.key)}
            stunned={stunned.includes(player.key)}
            boom={boom}
            fadingOut={timeUp}
            fadeStyle={fadeStyle}
            punchSignal={player.key === myKey ? punchSequence : 0}
            canPredict={player.key === myKey ? predictLocal : false}
          />
        );
      })}

      {showFixedPunch && myFighter && (
        <div className={fadeOutClass} style={fadeStyle}>
          <PunchButton
            color={myKey}
            config={{ button: { left: 298, top: 650, angle: -45 } }}
            interactive={!timeUp}
            disabled={!myFighter.walking || stunned.includes(myKey) || punchPending}
            onClick={() => onPunch?.(myKey)}
          />
        </div>
      )}

      {boom && (
        <div className={fadeOutClass} style={fadeStyle}>
          <BoomRaceCondition />
        </div>
      )}

      {toast && (
        <div
          className={`pointer-events-none absolute z-30 flex h-[20px] w-[350px] items-center justify-center text-center text-[14px] text-[#fff3dc] [text-shadow:0_2px_0_#000] ${fadeOutClass}`}
          style={{ left: 20, top: 8, ...fadeStyle }}
        >
          {toast}
        </div>
      )}

      <div
        className="absolute rounded-[5px] border border-black bg-[#230063]"
        style={{ left: 130, top: 759, width: 159, height: 52 }}
      >
        <span
          className="absolute w-[120px] text-center text-[36px] leading-none text-white"
          style={{ left: 78 - 60, top: 6, height: 35 }}
        >
          {formatTime(timeLeft)}
        </span>
      </div>

      {!hasFullRoom && (
        <div
          className="pointer-events-none absolute inset-x-0 z-40 flex justify-center"
          style={{ top: 120 }}
        >
          <span className="rounded-[10px] border-2 border-black bg-[#ff6262] px-4 py-2 text-center text-[15px] leading-tight text-white [text-shadow:0_2px_0_#000]">
            Menunggu {REQUIRED_PLAYERS} pemain · pertarungan dijeda
          </span>
        </div>
      )}

      {children}
    </div>
  );
}
