// Component ledakan dari Figma "BOOM Race Condition" (36:918).
// Dipakai bersama oleh ketiga ronde saat race condition / tabrakan terjadi.
import boomBurst from '../../assets/game/figma-round1/boom-burst.svg';
import boomInner from '../../assets/game/figma-round1/boom-inner.svg';

export default function BoomRaceCondition() {
  return (
    <div
      className="pointer-events-none absolute z-20"
      style={{ left: 90, top: 378.5, width: 210, height: 210 }}
    >
      <img src={boomBurst} alt="" className="absolute inset-0 h-full w-full" />
      <img
        src={boomInner}
        alt=""
        className="absolute"
        style={{ left: 46, top: 46, width: 118, height: 118 }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="block whitespace-nowrap text-[44px] leading-none text-white [text-shadow:0_4px_0_#8a0f18]"
          style={{ transform: 'rotate(8deg)' }}
        >
          BOOM!
        </span>
      </div>
    </div>
  );
}
