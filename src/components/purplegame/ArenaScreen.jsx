import { useMemo } from 'react';
import { PLAYERS } from './gameConfig';
import arenaRing from '../../assets/game/arena-ring.png';
import boomImg from '../../assets/game/boom.png';

const BG_GRADIENT = 'bg-gradient-to-b from-[rgba(24,4,61,0.96)] to-[rgba(46,9,113,0.96)]';

function formatTime(sec) {
  const s = Math.max(0, sec);
  return `00:${String(s).padStart(2, '0')}`;
}

function PlayerPanel({ player, score, isMe, onPunch, disabled, align, showWait }) {
  const isTop = align === 'tl' || align === 'tr';
  const isLeft = align === 'tl' || align === 'bl';
  return (
    <div className={`absolute ${isTop ? 'top-[246px]' : 'top-[440px]'} ${isLeft ? 'left-[2px]' : 'left-[151px]'} h-[282px] w-[236px]`}>
      <button
        type="button"
        onClick={() => !disabled && isMe && onPunch(player.key)}
        className={`absolute ${isLeft ? 'left-[2px]' : 'left-[148px]'} ${isTop ? 'top-[-5px]' : 'top-[196px]'} h-[84px] w-[87px] rounded-full border-4 border-black/40 ${disabled && isMe ? 'opacity-40' : ''} ${isMe ? 'bg-[#ffb34d] active:scale-95' : 'bg-[#7a6b9a]'}`}
        aria-label={`Pukul ${player.name}`}
      >
        <span className={`block font-['Lilita_One'] text-[18px] text-white ${isTop ? 'rotate-180' : ''}`}>PUKUL!</span>
      </button>
      {showWait && (
        <div className={`absolute ${isLeft ? 'left-[103px]' : 'left-[18px]'} ${isTop ? 'top-[108px]' : 'top-[152px]'} grid h-[32px] w-[28px] place-items-center rounded-full bg-[#fff3dc] text-[#230063] border-2 border-black`}>
          <span className="font-['Lilita_One'] text-[14px]">⏳</span>
        </div>
      )}
      <div className={`absolute ${isLeft ? 'left-[54px]' : 'left-[47px]'} ${isTop ? 'top-[99px]' : 'top-[50px]'} grid h-[120px] w-[120px] place-items-center rounded-full`} style={{ background: `${player.color}22` }}>
        <span className="font-['Lilita_One'] text-white text-sm" style={{ color: player.color }}>{player.name}</span>
      </div>
      <div className={`absolute ${isLeft ? 'left-[117px]' : 'left-[60px]'} ${isTop ? 'top-[-15px]' : 'top-[252px]'} h-[52px] w-[63px] rounded-[5px] border border-black bg-[#230063] ${isTop ? 'opacity-70' : ''}`}>
        <p className={`text-center font-['Lilita_One'] text-[20px] leading-[26px]`} style={{ color: player.color }}>{score}</p>
        <p className={`text-center font-['Lilita_One'] text-[12px] leading-[14px] text-white ${isTop ? 'rotate-180' : ''}`}>{player.name}</p>
      </div>
    </div>
  );
}

export default function ArenaScreen({ round, timeLeft, scores, myKey, players, onPunch, toast, inRing, boom, heldSlots, waitIconFor }) {
  const roster = useMemo(() => {
    // Map room players to 4 slots by color order; fallback to placeholders
    const byOrder = [...PLAYERS];
    return byOrder.map((p, i) => ({ ...p, roomPlayer: players[i] || null }));
  }, [players]);

  const slotInfo = useMemo(() => {
    if (round.slots === 1) {
      return [{ filledBy: heldSlots[0] || null }];
    }
    if (round.slots === 2) {
      return [{ filledBy: heldSlots[0] || null }, { filledBy: heldSlots[1] || null }];
    }
    return [];
  }, [round.slots, heldSlots]);

  const ringLabel = boom ? 'BOOM!' : (round.mode === 'tanpa-aturan' ? 'RING' : (heldSlots.length ? (round.mode === 'mutex' ? 'TERKUNCI' : 'TERISI') : 'SIAP'));
  const fullSemaphore = round.mode === 'semaphore' && heldSlots.length >= 2;

  return (
    <div className={`relative h-full w-full overflow-hidden ${BG_GRADIENT}`}>
      <p className="absolute left-1/2 top-[92px] w-[344px] -translate-x-1/2 text-center font-['Lilita_One'] text-[52px] leading-[1] text-[#ffc83d] sm:text-[64px]">
        {round.title}
      </p>
      <p className="absolute left-1/2 top-[174px] w-[365px] max-w-[92%] -translate-x-1/2 text-center font-['Lilita_One'] text-[14px] leading-[1.3] text-[#c5cee1]">
        {round.subtitle}
      </p>

      <div className="absolute left-[13px] top-[55px] h-[27px] w-[111px] rounded-[10px] border-b-[5px] border-black bg-[#ff6262]">
        <p className="text-center font-['Lilita_One'] text-[13px] leading-[22px] text-white">{round.badge}</p>
      </div>

      <div className="absolute left-1/2 top-[248px] h-[472px] w-[472px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_30%_30%,#6b2fa8_0%,#3a146f_45%,#1a0636_100%)] opacity-90" />
      <img src={arenaRing} alt="" className="pointer-events-none absolute left-1/2 top-[389px] h-[188px] w-[188px] -translate-x-1/2 object-contain opacity-95" />
      <div className={`absolute left-1/2 top-[403px] h-[160px] w-[160px] -translate-x-1/2 rounded-full border-[6px] ${fullSemaphore ? 'border-[#ffcf5a]' : 'border-[#ffcf5a]/70'}`} />
      {fullSemaphore && <div className="absolute left-1/2 top-[413px] h-[140px] w-[140px] -translate-x-1/2 rounded-full border-[4px] border-[#ff6262]/80" />}
      <div className="absolute left-1/2 top-[430px] grid h-[103px] w-[138px] -translate-x-1/2 place-items-center rounded-[18px] bg-[#2b115c]/80 border-2 border-[#7b4fd1]">
        <p className={`font-['Lilita_One'] text-[20px] ${boom ? 'text-[#ff6262]' : 'text-[#ffe08a]'}`}>{ringLabel}</p>
        {round.mode !== 'tanpa-aturan' && (
          <div className="mt-1 flex gap-2">
            {slotInfo.map((s, i) => (
              <span key={i} className={`grid h-[26px] w-[26px] place-items-center rounded-md border-2 border-black text-[10px] font-bold ${s.filledBy ? 'bg-[#ffe08a] text-[#230063]' : 'bg-[#230063] text-white/70'}`} title={round.mode === 'mutex' ? 'Slot Kunci' : 'Slot Semaphore'}>
                {s.filledBy ? s.filledBy[0].toUpperCase() : '•'}
              </span>
            ))}
          </div>
        )}
      </div>
      {boom && (
        <div className="pointer-events-none absolute left-1/2 top-[360px] -translate-x-1/2">
          <img src={boomImg} alt="BOOM" className="h-[150px] w-[150px] object-contain drop-shadow-xl" />
          <span className="absolute inset-0 grid place-items-center font-['Lilita_One'] text-[28px] text-white [text-shadow:0_3px_0_#000]">BOOM!</span>
        </div>
      )}

      {roster.map((p, i) => (
        <PlayerPanel
          key={p.key}
          player={p}
          score={scores[p.key]}
          isMe={p.key === myKey}
          disabled={p.key !== myKey}
          onPunch={onPunch}
          align={['bl','tl','tr','br'][i]}
          showWait={waitIconFor === p.key}
        />
      ))}

      {toast && (
        <div className="absolute left-1/2 top-[203px] w-[350px] -translate-x-1/2 rounded-md px-2 py-1 text-center font-['Lilita_One'] text-[14px] text-[#fff3dc] [text-shadow:0_2px_0_#000]">
          {toast}
        </div>
      )}

      <div className="absolute left-1/2 top-[759px] h-[52px] w-[159px] -translate-x-1/2 rounded-[5px] border border-black bg-[#230063]">
        <p className="text-center font-['Lilita_One'] text-[36px] leading-[52px] text-white">{formatTime(timeLeft)}</p>
      </div>
    </div>
  );
}
