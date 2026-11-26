

const MECHANISMS = [
  { label: 'Tanpa Aturan', short: 'Tanpa Aturan', color: '#ff6262' },
  { label: 'Mutex', short: 'Mutex', color: '#3ddc84' },
  { label: 'Semaphore', short: 'Semaphore', color: '#4d8dff' },
];

const CONCLUSION =
  'Tanpa aturan: pukulan masuk banyak tapi sering BOOM. Mutex: ledakan hilang, pukulan masuk turun karena pemain bergiliran. Semaphore (2 slot): aman seperti Mutex dengan lebih banyak slot bersamaan.';

function MetricRow({ label, values }) {
  return (
    <div className="flex w-full items-center gap-[4px] text-[14px] leading-[normal] text-white">
      <span className="w-[96px] shrink-0 text-[#c5cee1]">{label}</span>
      {values.map((value, i) => (
        <span key={i} className="min-w-px flex-1 text-center">
          {value}
        </span>
      ))}
    </div>
  );
}

export default function SummaryScreen({ rounds, boomByRound, roundScores, onBack }) {
  const booms = MECHANISMS.map((_, i) => boomByRound?.[i] ?? 0);
  const maxBoom = Math.max(1, ...booms);
  const punches = MECHANISMS.map((_, i) =>
    Object.values(roundScores || {}).reduce((total, values) => total + (values?.[i] || 0), 0),
  );
  const duration = rounds?.[0]?.duration ?? 20;
  const slots = rounds?.[rounds.length - 1]?.locks ?? 2;

  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-b from-[rgba(24,4,61,0.96)] to-[rgba(46,9,113,0.96)] font-['Lilita_One'] text-white">
      <p className="absolute left-[76px] top-[56px] whitespace-nowrap text-[44px] leading-[normal] text-[#ffc83d]">
        RINGKASAN
      </p>
      <div className="absolute left-0 top-[108px] flex h-[15px] w-[390px] items-center justify-center gap-[6px] overflow-hidden whitespace-nowrap text-[13px] leading-[normal] text-[#c5cee1]">
        <span>Hasil {rounds?.length ?? 3} ronde · 4 pemain</span>
        <span>·</span>
        <span>{duration} dtk per ronde</span>
        <span>·</span>
        <span>Semaphore {slots} slot</span>
      </div>

      <div className="absolute left-[16px] top-[138px] flex w-[358px] flex-col items-start gap-[10px]">
        <div className="w-full rounded-[12px] border border-black bg-[rgba(35,0,99,0.84)] px-[12px] py-[10px]">
          <div className="flex w-full items-center justify-between whitespace-nowrap leading-[normal]">
            <p className="text-[16px] text-white">Jumlah Ledakan</p>
            <p className="text-[11px] text-[#c5cee1]">makin kecil makin aman</p>
          </div>
          <div className="mt-[8px] flex w-full items-end gap-[8px]">
            {MECHANISMS.map((mechanism, i) => (
              <div key={mechanism.label} className="flex min-w-px flex-1 flex-col items-center gap-[4px]">
                <p className="whitespace-nowrap text-[22px] leading-[normal] text-white">{booms[i]}</p>
                <div
                  className="h-[4px] rounded-[6px] border-[1.5px] border-black"
                  style={{
                    width: `${Math.max(8, (booms[i] / maxBoom) * 64)}px`,
                    backgroundColor: mechanism.color,
                  }}
                />
                <p className="whitespace-nowrap text-[12px] leading-[normal] text-[#c5cee1]">
                  {mechanism.short}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full rounded-[12px] border border-black bg-[rgba(35,0,99,0.84)] px-[12px] py-[10px]">
          <p className="text-[16px] leading-[normal] text-white">Perbandingan Metrik</p>
          <div className="mt-[6px] flex w-full items-center gap-[4px] text-[11px] leading-[normal] text-[#ffc83d]">
            <span className="w-[96px] shrink-0" />
            {MECHANISMS.map((mechanism) => (
              <span key={mechanism.label} className="min-w-px flex-1 text-center">
                {mechanism.label}
              </span>
            ))}
          </div>
          <div className="mt-[6px] flex flex-col gap-[6px]">
            <MetricRow label="Ledakan" values={booms} />
            <MetricRow label="Pukulan masuk" values={punches} />
          </div>
        </div>

        <div className="w-full rounded-[12px] border border-black bg-[rgba(35,0,99,0.84)] px-[12px] py-[10px]">
          <p className="text-[16px] leading-[normal] text-white">Kesimpulan</p>
          <p className="mt-[8px] text-[13px] leading-[normal] text-white">{CONCLUSION}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onBack}
        className="absolute left-[16px] top-[621px] flex h-[46px] w-[358px] items-center justify-center rounded-[12px] border-2 border-black bg-[#ffc83d] px-[24px] text-[24px] leading-[normal] text-[#230063] drop-shadow-[0px_4px_0px_#0c0030] active:translate-y-[2px] active:drop-shadow-[0px_2px_0px_#0c0030]"
      >
        KEMBALI
      </button>
    </div>
  );
}
