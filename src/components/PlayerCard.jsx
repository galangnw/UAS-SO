import crown from '../assets/lobby/crown.svg';
import glow from '../assets/lobby/glow-1.svg';
import removeIcon from '../assets/lobby/remove.svg';
import removeX from '../assets/lobby/remove-x.svg';
import sparkleIcon from '../assets/lobby/sparkle-2.svg';
import { AVATAR_SPRITES } from '../config/playerColors';

export default function PlayerCard({
  player,
  isMe,
  canKick,
  onKick,
  color = 'merah',
  decorated = false,
}) {
  const avatar =
    AVATAR_SPRITES[color] ||
    AVATAR_SPRITES[player.avatarColor] ||
    AVATAR_SPRITES.merah;

  return (
    <div className="relative h-51.5 overflow-hidden rounded-[22px] border-2 border-white/60 bg-white/16 shadow-[0_4px_6px_0_rgba(10,26,74,0.3)]">
      {decorated && (
        <img
          src={sparkleIcon}
          alt=""
          className="pointer-events-none absolute left-10.25 top-20.5 h-5.5 w-5.5"
        />
      )}

      {player.isHost && (
        <span className="absolute left-2.5 top-2 flex h-4 items-center gap-1 rounded-full border-2 border-brand-dark bg-[#FFD23F] px-2 py-0.5">
          <img src={crown} alt="" className="h-3 w-3.5" />
          <span className="text-[10.5px] font-extrabold leading-3.25 text-brand-dark">
            HOST
          </span>
        </span>
      )}

      {isMe && (
        <span className="absolute right-2.25 top-1.75 flex h-4.25 w-11.75 items-center justify-center rounded-full border-2 border-brand-dark bg-white text-[10.5px] font-extrabold leading-3.25 text-brand-dark">
          KAMU
        </span>
      )}

      {canKick && (
        <button
          type="button"
          onClick={onKick}
          aria-label={`Keluarkan ${player.name}`}
          className="absolute right-3.5 top-2.75 h-7 w-7"
        >
          <img
            src={removeIcon}
            alt=""
            className="absolute inset-0 h-full w-full"
          />
          <img
            src={removeX}
            alt=""
            className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2"
          />
        </button>
      )}

      <img
        src={glow}
        alt=""
        className="pointer-events-none absolute left-1/2 top-29 h-6.5 w-32.5 -translate-x-1/2"
      />

      <div
        aria-hidden="true"
        className="stickman-goyang pointer-events-none absolute left-1/2 top-px h-33.25 w-20 -translate-x-1/2"
        style={{ backgroundImage: `url(${avatar})` }}
      />

      <p className="absolute left-1/2 top-[142.5px] max-w-37.5 -translate-x-1/2 truncate rounded-full bg-brand-dark px-3.5 py-0.5 text-[12px] font-extrabold leading-3.75 text-white">
        {player.name}
      </p>

      <p
        className={`absolute left-1/2 top-[170.5px] flex -translate-x-1/2 items-center justify-center whitespace-nowrap rounded-full px-3 py-0.5 font-extrabold ${
          player.isReady
            ? 'w-19.25 border-[2.5px] border-brand-dark bg-linear-to-b from-[#FFE96B] to-[#FFB619] text-[11.5px] leading-3.5 text-brand-dark'
            : 'w-27.5 border-[2.5px] border-[#2E58B8] bg-white/85 text-[10.5px] leading-3.25 tracking-[0.42px] text-[#2E58B8]'
        }`}
      >
        {player.isReady ? 'SIAP' : 'MENUNGGU'}
      </p>
    </div>
  );
}
