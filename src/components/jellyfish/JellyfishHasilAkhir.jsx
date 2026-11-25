import { useEffect, useState } from 'react';
import latarLaut from '../../assets/game/jellyfish/latar-laut.svg';
import jaring from '../../assets/game/jellyfish/jaring.svg';
import uburFrameA from '../../assets/game/jellyfish/ubur-ubur-xl-a.svg';
import uburFrameB from '../../assets/game/jellyfish/ubur-ubur-xl-b.svg';
import { COLOR_HEX, COLOR_NAMES } from '../../config/playerColors';
import { PLAYER_DEFS } from './jellyfishScenario';

const DEFAULT_PLAYERS = [
  { id: 'P1', name: 'Merah', color: COLOR_HEX.merah, text: '#fff', r1: 0, r2: 0, r3: 0 },
  { id: 'P2', name: 'Hijau', color: COLOR_HEX.hijau, text: '#fff', r1: 0, r2: 0, r3: 0 },
  { id: 'P3', name: 'Biru', color: COLOR_HEX.biru, text: '#fff', r1: 0, r2: 0, r3: 0 },
  { id: 'P4', name: 'Kuning', color: COLOR_HEX.kuning, text: '#06203a', r1: 0, r2: 0, r3: 0 },
];

const DEF_BY_KEY = Object.fromEntries(PLAYER_DEFS.map((p) => [p.id, p]));

function total(p) {
  return (p.r1 || 0) + (p.r2 || 0) + (p.r3 || 0);
}

function rowsFromGameEnd(gameEnd) {
  const standings = gameEnd?.finalStandings || gameEnd?.standings;
  if (!Array.isArray(standings) || standings.length === 0) return null;
  return standings.map((s) => {
    const def = DEF_BY_KEY[s.playerKey] || DEF_BY_KEY[s.id] || {};
    const playerKey = s.playerKey || s.id || def.id;
    return {
      id: playerKey,
      name: s.name || COLOR_NAMES[s.avatarColor] || def.name || playerKey || 'Pemain',
      color: COLOR_HEX[s.avatarColor] || def.color || s.color || '#4f8cff',
      text: def.text || s.text || '#fff',
      r1: s.r1 ?? s.round1 ?? 0,
      r2: s.r2 ?? s.round2 ?? 0,
      r3: s.r3 ?? s.round3 ?? 0,
      total: s.total ?? ((s.r1 ?? s.round1 ?? 0) + (s.r2 ?? s.round2 ?? 0) + (s.r3 ?? s.round3 ?? 0)),
    };
  });
}

export default function JellyfishHasilAkhir({
  players = DEFAULT_PLAYERS,
  gameEnd = null,
  isHost = false,
  onShowFinalScore,
}) {
  const [frame, setFrame] = useState('A');

  useEffect(() => {
    const id = setInterval(() => {
      setFrame((current) => (current === 'A' ? 'B' : 'A'));
    }, 450);
    return () => clearInterval(id);
  }, []);

  const gameRows = rowsFromGameEnd(gameEnd);
  const rows = (gameRows || players).map((p) => ({ ...p, total: p.total ?? total(p) }));
  const maxTotal = Math.max(...rows.map((r) => r.total), 0);
  const winners = rows.filter((r) => r.total === maxTotal).map((r) => r.name);
  const waitingForResult = !gameRows;

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0d6bd1] font-['Roboto',sans-serif]">
      <img src={latarLaut} alt="" className="absolute inset-0 h-full w-full object-cover" />

      <div className="relative z-10 flex h-full flex-col px-[22px] py-[30px]">
        <div className="h-[6px] w-px shrink-0" />

        <div className="flex shrink-0 items-end justify-center gap-[6px]">
          <img
            src={frame === 'A' ? uburFrameA : uburFrameB}
            alt=""
            className="h-[169.6px] w-[153.6px] shrink-0"
          />
          <img src={jaring} alt="" className="h-[86px] w-[43px] shrink-0" />
        </div>

        <div className="h-[8px] w-px shrink-0" />

        <p className="text-[11px] font-bold leading-normal text-[#d8ecff]">3 ronde selesai</p>

        <div className="h-[6px] w-px shrink-0" />

        <div className="shrink-0">
          <p className="text-[28px] font-black leading-[1.1] text-white" style={{ textShadow: '0px 2px 4px rgba(0,51,128,0.5)' }}>
            {waitingForResult
              ? 'Menunggu hasil...'
              : winners.length > 1 ? `Seri! ${winners.join(' & ')}` : `${winners[0]} Menang!`}
          </p>
        </div>

        <div className="h-[4px] w-px shrink-0" />
        <p className="text-[11px] font-normal leading-normal text-[#d8ecff]">
          {waitingForResult
            ? `Hasil akhir belum diterima dari server.${gameEnd ? ` (payload: ${Object.keys(gameEnd).join(',')})` : ''}`
            : 'Pemenang = total skor 3 ronde tertinggi'}
        </p>

        <div className="h-[12px] w-px shrink-0" />

        <div className="flex w-full shrink-0 items-center gap-[8px] px-[12px] text-[11px] font-bold leading-normal text-[#d8ecff]">
          <p className="min-w-0 flex-1">Pemain</p>
          <p className="w-[54px] shrink-0 text-center">Ronde 1</p>
          <p className="w-[54px] shrink-0 text-center">Ronde 2</p>
          <p className="w-[54px] shrink-0 text-center">Ronde 3</p>
        </div>

        <div className="h-[6px] w-px shrink-0" />

        <div className="flex w-full flex-col gap-[8px]">
          {rows.map((p) => (
            <div
              key={p.id}
              className="flex w-full items-center gap-[8px] rounded-[14px] border-2 bg-[rgba(10,79,166,0.78)] px-[12px] py-[10px]"
              style={{ borderColor: p.color }}
            >
              <div
                className="flex size-[30px] shrink-0 items-center justify-center rounded-[15px] border-2 border-white text-[11px] font-bold"
                style={{ background: p.color, color: p.text }}
              >
                {p.id}
              </div>
              <p className="min-w-0 flex-1 truncate text-[14px] font-bold leading-normal text-white" title={p.name}>
                {p.name}
              </p>
              <p className="w-[54px] shrink-0 text-center text-[18px] font-black leading-normal text-white">{p.r1}</p>
              <p className="w-[54px] shrink-0 text-center text-[18px] font-black leading-normal text-white">{p.r2}</p>
              <p className="w-[54px] shrink-0 text-center text-[18px] font-black leading-normal text-white">{p.r3}</p>
            </div>
          ))}
        </div>

        <div className="min-h-0 flex-1" />

        {isHost ? (
          <button
            type="button"
            onClick={onShowFinalScore}
            className="flex h-[54px] w-full shrink-0 items-center justify-center rounded-[16px] border-[3px] border-white bg-[#3ddc84] text-[15px] font-black leading-normal text-[#06241a] active:translate-y-[1px]"
          >
            Lihat Total Skor
          </button>
        ) : (
          <div className="flex h-[54px] w-full shrink-0 items-center justify-center rounded-[16px] border-[3px] border-white/60 bg-[rgba(10,79,166,0.55)] px-4 text-center text-[14px] font-bold text-white">
            Menunggu host...
          </div>
        )}
      </div>
    </div>
  );
}