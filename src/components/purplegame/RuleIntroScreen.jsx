// Popup aturan tiap ronde, berbasis Figma frame 81:2363 "05 Intro Ronde 1".
// Arena tetap dirender di belakang scrim supaya posisi komponen konsisten
// dengan layar pertarungan.
import ArenaScene from './ArenaScene';

export default function RuleIntroScreen({
  round,
  timeLeft,
  scores,
  myKey,
  players,
  onStart,
  isHost = false,
}) {
  const rule = round.rule || {};
  const paragraphs = rule.paragraphs || [];

  return (
    <div className="relative h-full w-full overflow-hidden">
      <ArenaScene
        round={round}
        timeLeft={timeLeft}
        scores={scores}
        myKey={myKey}
        players={players}
        fighters={{}}
        walkFrame={1}
        showAllButtons
      />

      {/* Scrim dan kartu intro harus di atas seluruh isi arena (termasuk slot
          kunci), supaya kunci tidak menutupi teks popup seperti di Figma. */}
      <div className="pointer-events-none absolute inset-0 z-20 bg-[rgba(15,5,40,0.86)]" />

      <div
        className="absolute z-30 flex flex-col items-center gap-[8px] overflow-hidden rounded-[24px] border-4 border-[#ffcf3a] bg-[#2b1660] p-[20px]"
        style={{ left: 22, top: 268, width: 346 }}
      >
        <p className="w-full text-center text-[34px] leading-normal text-[#ffcf3a] text-title-outline">
          {rule.cardTitle || `Ronde ${round.round}: ${round.title}`}
        </p>
        {paragraphs.map((paragraph) => (
          <p
            key={paragraph}
            className="w-full text-center font-['Baloo_2'] text-[15px] font-semibold leading-normal text-white"
          >
            {paragraph}
          </p>
        ))}
        {isHost ? (
          <button
            type="button"
            onClick={onStart}
            className="mt-[4px] h-[56px] w-full shrink-0 rounded-[10px] border-b-[5px] border-black bg-[#ff6262] text-[26px] leading-none text-white active:translate-y-[2px] active:border-b-[3px]"
          >
            MULAI!
          </button>
        ) : (
          <p className="mt-[8px] w-full text-center font-['Baloo_2'] text-[14px] font-semibold text-white/80">
            Menunggu host memulai...
          </p>
        )}
      </div>
    </div>
  );
}
