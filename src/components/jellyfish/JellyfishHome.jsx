import latarLaut from '../../assets/game/jellyfish/latar-laut.svg';
import jaring from '../../assets/game/jellyfish/jaring.svg';
import uburFrameA from '../../assets/game/jellyfish/ubur-ubur-xl-a.svg';
import uburFrameB from '../../assets/game/jellyfish/ubur-ubur-xl-b.svg';
import { useEffect, useState } from 'react';
import { REQUIRED_PLAYERS } from '../../config/gameRules';

const RULES = [
  {
    num: '1',
    title: 'No Prevention',
    desc: 'Bebas rebut, deadlock gampang kejadian',
  },
  {
    num: '2',
    title: 'Resource Ordering',
    desc: 'Harus ambil urut dari nomor kecil',
  },
  {
    num: '3',
    title: 'Banker’s Algorithm',
    desc: 'Ambilan yang bikin tidak aman ditolak',
  },
];

export default function JellyfishHome({ isHost = false, onStart, devPreview = false, playerCount = 0 }) {
  const [frame, setFrame] = useState('A');
  const canStart = playerCount >= REQUIRED_PLAYERS;

  useEffect(() => {
    const id = setInterval(() => {
      setFrame((current) => (current === 'A' ? 'B' : 'A'));
    }, 450);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0d6bd1] font-['Roboto',sans-serif]">
      <img
        src={latarLaut}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />

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

        <div className="h-[10px] w-px shrink-0" />

        <h1
          className="shrink-0 text-[30px] font-black leading-normal text-white"
          style={{ textShadow: '0px 2px 4px rgba(0,51,128,0.5)' }}
        >
          Jellyfish Deadlock
        </h1>

        <div className="h-[6px] w-px shrink-0" />

        <p className="shrink-0 text-[12px] font-normal leading-[1.5] text-[#d8ecff]">
          Tangkap resource, jangan sampai saling kunci. Main bareng teman, tiap
          orang di HP masing-masing.
        </p>

        <div className="h-[18px] w-px shrink-0" />

        <div className="shrink-0 rounded-[16px] border-[1.5px] border-white bg-[rgba(10,79,166,0.78)] p-[16px]">
          <p className="text-[11px] font-bold leading-normal text-[#d8ecff]">
            3 ronde · 30 detik per ronde
          </p>

          <div className="mt-[12px] flex flex-col gap-[12px]">
            {RULES.map((rule) => (
              <div key={rule.num} className="flex items-center gap-[12px]">
                <div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[13px] border-2 border-white bg-[#e8509a]">
                  <span className="text-[12px] font-black leading-normal text-white">
                    {rule.num}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-bold leading-normal text-white">
                    {rule.title}
                  </p>
                  <p className="text-[11px] font-normal leading-normal text-[#d8ecff]">
                    {rule.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1" />

        {isHost ? (
          <button
            type="button"
            onClick={canStart ? onStart : undefined}
            disabled={!canStart}
            className={`flex h-[54px] w-full shrink-0 items-center justify-center rounded-[16px] border-[3px] border-white text-[15px] font-black leading-normal active:translate-y-[1px] ${
              canStart
                ? 'bg-[#3ddc84] text-[#06241a]'
                : 'cursor-not-allowed bg-white/25 text-white/70'
            }`}
          >
            {canStart
              ? 'Mulai Game'
              : `Menunggu pemain (${playerCount}/${REQUIRED_PLAYERS})`}
          </button>
        ) : (
          <div className="flex w-full shrink-0 flex-col gap-2">
            <div className="flex h-[54px] w-full items-center justify-center rounded-[16px] border-[3px] border-white/60 bg-[rgba(10,79,166,0.55)] px-4 text-center text-[14px] font-bold leading-normal text-white">
              Menunggu host memulai...
            </div>
            {devPreview && onStart && (
              <button
                type="button"
                onClick={onStart}
                className="flex h-[40px] w-full items-center justify-center rounded-[12px] border border-white/60 bg-white/10 text-[12px] font-bold text-white active:translate-y-[1px]"
              >
                Preview dev: lihat penjelasan
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
