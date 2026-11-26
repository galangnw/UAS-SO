

import { useState } from 'react';

const BG_GRADIENT =
  'bg-gradient-to-b from-[rgba(24,4,61,0.96)] to-[rgba(46,9,113,0.96)]';

const DURATION_OPTIONS = [10, 20, 30];

function Chip({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-w-0 flex-1 rounded-[10px] border-[1.5px] border-black px-2 py-[9px] text-[clamp(11px,3.4vw,15px)] leading-none active:translate-y-[1px] ${
        active
          ? 'bg-[#ffc83d] text-[#230063]'
          : 'bg-[#3d1d8f] text-[#c5cee1]'
      }`}
    >
      {label}
    </button>
  );
}

function Card({ title, hint, options, value, onChange, formatLabel }) {
  return (
    <section className="rounded-[12px] border border-black bg-[rgba(35,0,99,0.84)] px-[12px] py-[10px]">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-[16px] leading-none text-white">{title}</h2>
        <span className="text-[11px] leading-none text-[#c5cee1]">{hint}</span>
      </div>
      <div className="mt-[8px] flex gap-[8px]">
        {options.map((option) => {
          const raw = typeof option === 'object' ? option.value : option;
          return (
            <Chip
              key={raw}
              label={formatLabel(option)}
              active={value === raw}
              onClick={() => onChange(raw)}
            />
          );
        })}
      </div>
    </section>
  );
}

export default function SettingsScreen({ onBack, onStart }) {
  const [duration, setDuration] = useState(20);

  const start = () => {
    onStart?.({ duration });
  };

  return (
    <div
      className={`relative h-full w-full overflow-y-auto scrollbar-hide ${BG_GRADIENT} font-['Lilita_One']`}
    >
      <button
        type="button"
        onClick={onBack}
        aria-label="Kembali ke Stick Brawl"
        className="absolute left-[16px] top-[58px] z-10 grid h-[43px] w-[44px] place-items-center rounded-[12px] border-2 border-black bg-[#230063] text-[24px] leading-none text-[#ffc83d] shadow-[0_4px_0_#0c0030] active:translate-y-[2px] active:shadow-[0_2px_0_#0c0030]"
      >
        ‹
      </button>

      <div className="mx-auto flex min-h-full w-full max-w-[390px] flex-col px-[16px] pb-6 pt-[56px]">
        <h1 className="pl-[47px] text-[clamp(32px,11vw,44px)] leading-none text-[#ffc83d] text-title-outline">
          PENGATURAN
        </h1>
        <p className="mt-[10px] pl-[81px] text-[14px] leading-none text-[#c5cee1]">
          Atur simulasi sebelum bertarung
        </p>

        <div className="mt-[14px] flex flex-col gap-[14px]">
          <Card
            title="Format Game"
            hint="4 pemain · tetap"
            options={['R1 Tanpa Aturan', 'R2 Mutex', 'R3 Semaphore']}
            value={null}
            onChange={() => {}}
            formatLabel={(label) => label}
          />

          <Card
            title="Durasi Ronde"
            hint="waktu per ronde"
            options={DURATION_OPTIONS}
            value={duration}
            onChange={setDuration}
            formatLabel={(value) => `${value} dtk`}
          />
        </div>

        <div className="mt-[24px] flex flex-col gap-[8px]">
          <button
            type="button"
            onClick={() => start()}
            className="h-[51px] w-full rounded-[12px] border-2 border-black bg-[#ff6262] text-[24px] leading-none text-white active:translate-y-[2px]"
          >
            MULAI BERTARUNG
          </button>
          <p className="text-center text-[11px] leading-snug text-[#c5cee1]">
            Semaphore 2 slot: dua petinju boleh berada di ring sekaligus (Ronde 3)
          </p>
        </div>
      </div>
    </div>
  );
}
