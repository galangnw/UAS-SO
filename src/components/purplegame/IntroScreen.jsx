export default function IntroScreen({ onStart }) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-b from-[rgba(24,4,61,0.96)] to-[rgba(46,9,113,0.96)] font-['Baloo_2']">
      <div className="-translate-x-1/2 absolute left-1/2 top-[82px] rotate-[-2.86deg]">
        <p className="text-center font-['Lilita_One'] text-[64px] leading-[1] text-[#fff1cf] [text-shadow:0_4px_0_#0A1A4A]">STICK</p>
      </div>
      <div className="-translate-x-1/2 absolute left-1/2 top-[134px] rotate-[-4.2deg]">
        <p className="text-center font-['Lilita_One'] text-[96px] leading-[0.85] text-[#ffc83d] [text-shadow:0_4px_0_#0A1A4A]">BRAWL</p>
      </div>
      <p className="absolute left-1/2 top-[267px] w-[365px] max-w-[92%] -translate-x-1/2 text-center font-['Lilita_One'] text-[13px] leading-[1.4] text-[#c5cee1]">
        Rebut piala di tengah ring. Pukul, lari, dan belajar race condition.
      </p>

      <div className="absolute left-1/2 top-[320px] h-[320px] w-[320px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_30%_30%,#7b3fc2_0%,#3a146f_45%,#1a0636_100%)] border-[6px] border-[#b07cff]/30 shadow-[0_0_0_8px_rgba(255,255,255,0.03)_inset]">
        <div className="absolute inset-[18%] rounded-full border-[6px] border-[#ffcf5a]/60" />
        <div className="absolute left-1/2 top-1/2 h-[72px] w-[72px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2b115c] border-2 border-[#7b4fd1] grid place-items-center">
          <span className="font-['Lilita_One'] text-[#ffd36b] text-lg">🏆</span>
        </div>
        {[
          { c: 'bg-red-500', p: 'left-[22%] top-[55%]' },
          { c: 'bg-yellow-400', p: 'left-[35%] top-[30%]' },
          { c: 'bg-blue-500', p: 'left-[58%] top-[28%]' },
          { c: 'bg-green-500', p: 'left-[68%] top-[55%]' },
        ].map((f, i) => (
          <div key={i} className={`absolute ${f.p} h-10 w-8 rounded-full ${f.c} border-2 border-black/30`} />
        ))}
      </div>

      <button
        type="button"
        onClick={onStart}
        className="absolute left-1/2 top-[659px] h-[64px] w-[334px] max-w-[86%] -translate-x-1/2 rounded-[10px] border-b-[5px] border-black bg-[#ff6262] font-['Lilita_One'] text-[28px] text-white shadow-[0_4px_0_#00000040] active:translate-y-[2px]"
      >
        MULAI BERTARUNG
      </button>

      <div className="absolute left-1/2 top-[744px] flex w-[334px] max-w-[86%] -translate-x-1/2 gap-3">
        {[
          { n: '1', label: 'Tanpa Aturan', color: 'text-[red]' },
          { n: '2', label: 'Mutex', color: 'text-[#0026ff]' },
          { n: '3', label: 'Semaphore', color: 'text-[#00ff08]' },
        ].map((m) => (
          <div key={m.n} className="flex-1 rounded-[5px] border border-black bg-[#230063] py-1 text-center">
            <p className={`font-['Lilita_One'] text-[28px] leading-[1] ${m.color}`}>{m.n}</p>
            <p className="font-['Lilita_One'] text-[10px] text-white">{m.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
