import { useEffect, useState } from 'react';
import latarLaut from '../../assets/game/jellyfish/latar-laut.svg';
import uburFrameA from '../../assets/game/jellyfish/ubur-ubur-m-a.svg';

function JellyfishBadge({ number, borderColor }) {
  return (
    <div className="relative h-[56px] w-[48px] shrink-0">
      <img src={uburFrameA} alt="" className="absolute left-0 top-[3px] h-[53px] w-[48px]" />
      <div
        className="absolute left-[13px] top-[10px] flex h-[22px] w-[22px] items-center justify-center rounded-[11px] border-[3px] bg-white"
        style={{ borderColor }}
      >
        <span className="text-[11px] font-bold leading-normal text-[#06203a]">{number}</span>
      </div>
    </div>
  );
}

export default function JellyfishRound2Briefing({ isHost = false, onStart, devPreview = false }) {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setPulse((v) => !v), 450);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0d6bd1] font-['Roboto',sans-serif]">
      <img src={latarLaut} alt="" className="absolute inset-0 h-full w-full object-cover" />

      <div className="relative z-10 flex h-full flex-col px-[22px] py-[30px]">
        <div className="flex items-start gap-[6px]">
          <div className="h-[8px] w-[8px] rounded-[4px] bg-white/50" />
          <div className="h-[8px] w-[22px] rounded-[4px] bg-[#e8509a]" />
          <div className="h-[8px] w-[8px] rounded-[4px] bg-white/50" />
        </div>

        <div className="h-[22px] w-px shrink-0" />

        <p className="text-[11px] font-bold leading-normal text-[#d8ecff]">
          Ronde 2 dari 3 · Resource Ordering
        </p>

        <div className="h-[8px] w-px shrink-0" />

        <h1
          className="text-[28px] font-black leading-normal text-white"
          style={{ textShadow: '0px 2px 4px rgba(0,51,128,0.5)' }}
        >
          Harus urut!
        </h1>

        <div className="h-[18px] w-px shrink-0" />

        <div className="shrink-0 rounded-[16px] border-[1.5px] border-white bg-[rgba(10,79,166,0.78)] p-[16px]">
          <div className={`flex items-center gap-[8px] ${pulse ? 'translate-y-[-1px]' : 'translate-y-0'}`}>
            <JellyfishBadge number="1" borderColor="#4f8cff" />
            <p className="text-[16px] font-bold text-white">›</p>
            <JellyfishBadge number="2" borderColor="#4f8cff" />
            <p className="text-[16px] font-bold text-white">›</p>
            <JellyfishBadge number="3" borderColor="#4f8cff" />
            <p className="text-[16px] font-bold text-white">›</p>
            <JellyfishBadge number="4" borderColor="#4f8cff" />
          </div>

          <div className="h-[8px] w-px" />

          <p className="text-[10px] font-normal leading-normal text-[#d8ecff]">
            Nomor kecil dulu, baru nomor besar
          </p>
        </div>

        <div className="h-[14px] w-px shrink-0" />

        <div className="flex shrink-0 flex-col gap-[6px] text-[14px] font-normal leading-[1.55] text-white">
          <p>Tangkap ubur-ubur dari nomor terkecil dulu.</p>
          <p>Tidak bisa saling kunci, tapi kamu harus sabar antre.</p>
        </div>

        <div className="h-[8px] w-px shrink-0" />

        <p className="shrink-0 text-[11px] font-normal leading-[1.5] text-[#d8ecff]">
          Misi: tangkap 6 ubur-ubur sesuai angka di panelmu pakai jaring, lalu lari ke
          EXIT. LEPAS melepas semua ubur-ubur yang kamu pegang. Saat deadlock, semua
          yang terlibat kena penalti. Tiap pemain main di HP masing-masing.
        </p>

        <div className="h-[16px] w-px shrink-0" />

        <p className="shrink-0 text-[12px] font-bold leading-normal text-white">
          Skor sementara: Merah 240 · Hijau 180 · Biru 205 · Kuning 120
        </p>

        <div className="min-h-0 flex-1" />

        {isHost ? (
          <button
            type="button"
            onClick={onStart}
            className="flex h-[54px] w-full shrink-0 items-center justify-center rounded-[16px] border-[3px] border-white bg-[#3ddc84] text-[15px] font-black leading-normal text-[#06241a] active:translate-y-[1px]"
          >
            Mulai Ronde 2
          </button>
        ) : (
          <div className="flex w-full shrink-0 flex-col gap-2">
            <div className="flex h-[54px] w-full items-center justify-center rounded-[16px] border-[3px] border-white/60 bg-[rgba(10,79,166,0.55)] px-4 text-center text-[14px] font-bold leading-normal text-white">
              Menunggu host memulai ronde 2...
            </div>
            {devPreview && onStart && (
              <button
                type="button"
                onClick={onStart}
                className="flex h-[40px] w-full items-center justify-center rounded-[12px] border border-white/60 bg-white/10 text-[12px] font-bold text-white active:translate-y-[1px]"
              >
                Preview dev: mulai ronde 2
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
