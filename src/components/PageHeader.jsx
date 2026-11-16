import backButton from '../assets/lobby/back-button.svg';
import chevron from '../assets/lobby/chevron.svg';
import sparkle1 from '../assets/lobby/sparkle-1.svg';

export default function PageHeader({ title, onBack }) {
  return (
    <header className="relative h-[81px] shrink-0">
      <button
        type="button"
        onClick={onBack}
        aria-label="Kembali"
        className="absolute left-[17.5px] top-[17.5px] z-10 h-[47px] w-[47px]"
      >
        <img
          src={backButton}
          alt=""
          className="absolute -left-[3.5px] -top-[3.5px] h-[57px] w-[54px] max-w-none"
        />
        <img
          src={chevron}
          alt=""
          className="absolute left-[13px] top-[13px] h-5 w-5"
        />
      </button>

      <h1 className="pointer-events-none absolute left-1/2 top-[24px] w-full -translate-x-1/2 text-center text-[25px] font-extrabold leading-[34px] text-white [text-shadow:0_3px_0_#0A1A4A]">
        {title}
      </h1>

      <img
        src={sparkle1}
        alt=""
        className="pointer-events-none absolute left-[184px] top-[63px] h-3 w-3"
      />
    </header>
  );
}
