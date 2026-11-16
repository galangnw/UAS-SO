import crown from '../assets/lobby/crown.svg';
import glow from '../assets/lobby/glow-1.svg';
import removeIcon from '../assets/lobby/remove.svg';
import removeX from '../assets/lobby/remove-x.svg';
import sparkleIcon from '../assets/lobby/sparkle-2.svg';
import goyangBlue from '../assets/lobby/anim/goyang-blue.png';
import goyangOrange from '../assets/lobby/anim/goyang-orange.png';
import goyangPink from '../assets/lobby/anim/goyang-pink.png';
import goyangYellow from '../assets/lobby/anim/goyang-yellow.png';

const AVATARS = {
  pink: goyangPink,
  blue: goyangBlue,
  orange: goyangOrange,
  yellow: goyangYellow,
};

export default function PlayerCard({
  player,
  isMe,
  canKick,
  onKick,
  color = 'pink',
  decorated = false,
}) {
  const avatar = AVATARS[color] || AVATARS[player.avatarColor] || AVATARS.pink;

  return (
    <div className="relative h-[206px] overflow-hidden rounded-[22px] border-2 border-white/60 bg-white/[0.16] shadow-[0_4px_6px_0_rgba(10,26,74,0.3)]">
      {decorated && (
        <img
          src={sparkleIcon}
          alt=""
          className="pointer-events-none absolute left-[41px] top-[82px] h-[22px] w-[22px]"
        />
      )}

      {player.isHost && (
        <span className="absolute left-[10px] top-[8px] flex h-[16px] items-center gap-1 rounded-full border-2 border-brand-dark bg-[#FFD23F] px-2 py-[2px]">
          <img src={crown} alt="" className="h-3 w-3.5" />
          <span className="text-[10.5px] font-extrabold leading-[13px] text-brand-dark">
            HOST
          </span>
        </span>
      )}

      {isMe && (
        <span className="absolute right-[9px] top-[7px] flex h-[17px] w-[47px] items-center justify-center rounded-full border-2 border-brand-dark bg-white text-[10.5px] font-extrabold leading-[13px] text-brand-dark">
          KAMU
        </span>
      )}

      {canKick && (
        <button
          type="button"
          onClick={onKick}
          aria-label={`Keluarkan ${player.name}`}
          className="absolute right-[14px] top-[11px] h-7 w-7"
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
        className="pointer-events-none absolute left-1/2 top-[116px] h-[26px] w-[130px] -translate-x-1/2"
      />

      <div
        aria-hidden="true"
        className="stickman-goyang pointer-events-none absolute left-1/2 top-px h-[133px] w-[80px] -translate-x-1/2"
        style={{ backgroundImage: `url(${avatar})` }}
      />

      <p className="absolute left-1/2 top-[142.5px] max-w-[150px] -translate-x-1/2 truncate rounded-full bg-brand-dark px-[14px] py-[2px] text-[12px] font-extrabold leading-[15px] text-white">
        {player.name}
      </p>

      <p
        className={`absolute left-1/2 top-[170.5px] flex -translate-x-1/2 items-center justify-center whitespace-nowrap rounded-full px-3 py-[2px] font-extrabold ${
          player.isReady
            ? 'w-[77px] border-[2.5px] border-brand-dark bg-gradient-to-b from-[#FFE96B] to-[#FFB619] text-[11.5px] leading-[14px] text-brand-dark'
            : 'w-[110px] border-[2.5px] border-[#2E58B8] bg-white/[0.85] text-[10.5px] leading-[13px] tracking-[0.42px] text-[#2E58B8]'
        }`}
      >
        {player.isReady ? 'SIAP' : 'MENUNGGU'}
      </p>
    </div>
  );
}
