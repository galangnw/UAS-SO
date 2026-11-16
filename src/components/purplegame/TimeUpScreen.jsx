import timeupRing from '../../assets/game/timeup-ring.png';

export default function TimeUpScreen({ round, onContinue }) {
  const nextText = round.nextLabel ? `Berikutnya: ${round.nextLabel}` : 'Menuju hasil akhir...';
  return (
    <button
      type="button"
      onClick={onContinue}
      className="relative h-full w-full overflow-hidden bg-gradient-to-b from-[rgba(24,4,61,0.96)] to-[rgba(46,9,113,0.96)] text-left"
    >
      <div className="absolute left-1/2 top-[248px] h-[472px] w-[472px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_30%_30%,#6b2fa8_0%,#3a146f_45%,#1a0636_100%)] opacity-90" />
      <img src={timeupRing} alt="" className="pointer-events-none absolute left-1/2 top-[389px] h-[188px] w-[188px] -translate-x-1/2 object-contain opacity-95" />
      <div className="absolute left-1/2 top-[403px] h-[160px] w-[160px] -translate-x-1/2 rounded-full border-[6px] border-[#ffcf5a]/70" />
      <div className="absolute left-1/2 top-[445px] grid h-[77px] w-[77px] -translate-x-1/2 place-items-center rounded-full bg-[#2b115c]/80 border-2 border-[#7b4fd1]">
        <span className="font-['Lilita_One'] text-[#ffe08a] text-sm">00:00</span>
      </div>

      <p className="absolute left-1/2 top-[100px] w-[390px] -translate-x-1/2 text-center font-['Lilita_One'] text-[46px] leading-[1] text-[#ffc83d]">
        WAKTU HABIS!
      </p>
      <p className="absolute left-1/2 top-[167px] w-[390px] -translate-x-1/2 text-center font-['Lilita_One'] text-[15px] text-[#c5cee1]">
        Ronde {round.round}/3 selesai
      </p>
      <p className="absolute left-1/2 top-[198px] w-[390px] -translate-x-1/2 text-center font-['Lilita_One'] text-[15px] text-[#c5cee1]">
        {nextText}
      </p>

      <div className="absolute left-1/2 top-[759px] h-[52px] w-[159px] -translate-x-1/2 rounded-[5px] border border-black bg-[#230063]">
        <p className="text-center font-['Lilita_One'] text-[36px] leading-[52px] text-white">00:00</p>
      </div>
      <p className="absolute bottom-8 left-1/2 -translate-x-1/2 font-['Lilita_One'] text-xs text-white/70">Ketuk untuk lanjut</p>
    </button>
  );
}
