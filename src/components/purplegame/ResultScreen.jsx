export default function ResultScreen({ ranking, boomCount, onExit }) {
  const [first, second, third, fourth] = ranking;
  const podium = [second, first, third].filter(Boolean);

  return (
    <div className="relative h-full w-full overflow-y-auto bg-gradient-to-b from-[rgba(24,4,61,0.96)] to-[rgba(46,9,113,0.96)] px-4 pb-6 pt-10 text-white scrollbar-hide">
      <p className="text-center font-['Lilita_One'] text-[14px] text-[#c5cee1]">Hasil Akhir</p>
      <h1 className="mt-2 text-center font-['Lilita_One'] text-[46px] leading-[0.95] text-[#ffc83d] [text-shadow:0_4px_0_#4a1f00]">RING CHAMPION</h1>
      <p className="mt-2 text-center font-['Lilita_One'] text-[16px] text-white">{first?.name} menang!</p>

      <div className="mt-8 flex items-end justify-center gap-2">
        {podium.map((p, idx) => {
          const heights = ['h-[84px]', 'h-[114px]', 'h-[64px]'];
          const ranks = [2, 1, 3];
          const labels = [second?.name, first?.name, third?.name];
          return (
            <div key={p.key} className="flex w-[96px] flex-col items-center">
              <div className="mb-2 grid h-[90px] w-[90px] place-items-center rounded-full border-4 border-[#ffd36b] bg-[#2b115c]" style={{ boxShadow: `0 0 0 3px ${p.color}55 inset` }}>
                <span className="font-['Lilita_One'] text-sm" style={{ color: p.color }}>{p.name}</span>
              </div>
              <div className={`w-full rounded-t-[10px] border-x-2 border-t-2 border-[#ffd36b] bg-[#5b2aa8] ${heights[idx]} grid place-items-start pt-1`}>
                <span className="w-full text-center font-['Lilita_One'] text-[28px] text-[#ffd36b]">{ranks[idx]}</span>
              </div>
              <p className="mt-1 font-['Lilita_One'] text-[12px] text-[#c5cee1]">{labels[idx]}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-5 rounded-[14px] border-2 border-[#7b4fd1] bg-[#1e0b45]/90 p-3">
        <div className="grid grid-cols-[1.2fr_0.5fr_0.5fr_0.5fr_0.7fr_0.5fr_0.5fr] gap-1 text-center font-['Lilita_One'] text-[10px] text-[#c5cee1]">
          <span>Nama</span><span>R1</span><span>R2</span><span>R3</span><span>Trofi</span><span>Boom</span><span>Total</span>
        </div>
        <div className="mt-2 space-y-1">
          {ranking.map((p, i) => (
            <div key={p.key} className="grid grid-cols-[1.2fr_0.5fr_0.5fr_0.5fr_0.7fr_0.5fr_0.5fr] gap-1 rounded-md bg-white/5 px-1 py-1 text-center font-['Lilita_One'] text-[11px]">
              <span style={{ color: p.color }} className="text-left pl-1">{p.name}</span>
              <span>{p.rounds[0]}</span><span>{p.rounds[1]}</span><span>{p.rounds[2]}</span>
              <span>{p.trophies}</span><span>{i === 0 ? Math.ceil(boomCount/2) : 0}</span><span>{p.score}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 border-t border-white/20 pt-2 text-center font-['Lilita_One'] text-[12px] text-[#c5cee1]">
          <span>Total Ledakan: {boomCount} kali</span>
          <p className="mt-1 text-[10px]">Catatan: Boom/race condition tercatat pada ronde Tanpa Aturan.</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onExit}
        className="mt-5 h-[56px] w-full rounded-[20px] border-[3px] border-brand-dark bg-gradient-to-b from-[#FFE96B] to-[#FFB619] font-['Lilita_One'] text-[25px] tracking-[1px] text-brand-dark shadow-[0_5px_0_#0A1A4A] active:translate-y-[2px] active:shadow-[0_3px_0_#0A1A4A]"
      >
        MAIN LAGI
      </button>
      <button
        type="button"
        onClick={onExit}
        className="mt-3 h-[46px] w-full rounded-[18px] border-[3px] border-brand-dark bg-gradient-to-b from-[#86BBFF] to-[#4A88E0] font-['Lilita_One'] text-[16px] text-white shadow-[0_5px_0_#0A1A4A] active:translate-y-[2px] active:shadow-[0_3px_0_#0A1A4A]"
      >
        Kembali ke judul
      </button>
    </div>
  );
}
