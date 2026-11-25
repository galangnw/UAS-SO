import background from '../../assets/overall/peringkat-keseluruhan-bg.png';
import sparkleOne from '../../assets/overall/sparkle-1.svg';
import sparkleTwo from '../../assets/overall/sparkle-2.svg';
import crown from '../../assets/lobby/crown.svg';
import { AVATAR_SPRITES } from '../../config/playerColors';

const RANK_COLORS = {
  1: '#FFD23F',
  2: '#D9E6FF',
  3: '#F5A96B',
};

function ScoreBlock({ label, score, rounds, accent }) {
  const detail = (rounds || [])
    .map((value, index) => `R${index + 1} ${value}`)
    .join(' • ');

  return (
    <div className="rounded-[9px] border border-white/25 bg-white/12 px-[6px] py-[3px]">
      <div className="flex items-center justify-between gap-[4px]">
        <span className="text-[9px] font-extrabold tracking-[0.4px] text-[#d8ecff]">
          {label}
        </span>
        <span className="text-[15px] font-black leading-[1.05]" style={{ color: accent }}>
          {score ?? 0}
        </span>
      </div>
      <p className="mt-[1px] truncate text-[9px] font-bold leading-[1.2] text-white/75" title={detail}>
        {detail || '-'}
      </p>
    </div>
  );
}

function ResultRow({ player, isMe, color }) {
  const avatar =
    AVATAR_SPRITES[color] ||
    AVATAR_SPRITES[player.avatarColor] ||
    AVATAR_SPRITES.merah;
  const rankColor = RANK_COLORS[player.rank] || '#8AB4F8';

  return (
    <div
      className={`relative flex h-[136px] shrink-0 gap-[6px] overflow-hidden rounded-[15px] border-2 bg-[rgba(8,28,82,0.76)] px-[7px] py-[6px] shadow-[0_4px_0_rgba(5,16,56,0.55)] ${
        isMe ? 'border-[#ffd23f]' : 'border-white/45'
      }`}
    >
      <div className="relative w-[55px] shrink-0">
        <span
          className="absolute left-0 top-0 flex h-[22px] min-w-[22px] items-center justify-center rounded-full border-2 border-brand-dark px-[4px] text-[11px] font-black leading-none text-brand-dark"
          style={{ backgroundColor: rankColor }}
        >
          {player.rank}
        </span>
        {player.rank === 1 && (
          <img src={crown} alt="" className="absolute right-[1px] top-[1px] h-[15px] w-[18px]" />
        )}
        <div
          aria-hidden="true"
          className="stickman-goyang pointer-events-none absolute left-[1px] top-[18px] h-33.25 w-20 origin-top-left scale-[0.7]"
          style={{ backgroundImage: `url(${avatar})` }}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between gap-[4px]">
          <p className="truncate text-[13px] font-extrabold leading-tight text-white" title={player.name}>
            {player.name}
            {isMe ? ' (KAMU)' : ''}
          </p>
          <div className="flex shrink-0 items-baseline gap-[3px]">
            <span className="text-[8px] font-extrabold text-[#d8ecff]">TOTAL</span>
            <span className="text-[21px] font-black leading-none text-title-outline text-brand-yellow">
              {player.totalScore ?? 0}
            </span>
          </div>
        </div>

        <div className="mt-[5px] grid grid-cols-2 gap-[6px]">
          <ScoreBlock
            label="GAME 1"
            score={player.game1Score}
            rounds={player.game1Rounds}
            accent="#6BFF7B"
          />
          <ScoreBlock
            label="GAME 2"
            score={player.game2Score}
            rounds={player.game2Rounds}
            accent="#7FC0FF"
          />
        </div>

        <p className="mt-auto text-[9px] font-bold leading-[1.2] text-white/70">
          {player.playerKey ? `Kursi ${player.playerKey}` : 'Semua ronde selesai'}
        </p>
      </div>
    </div>
  );
}

export default function OverallScore({
  payload = null,
  isHost = false,
  userId = null,
  onBackToLobby,
  onPlayAgain,
}) {
  const rows = [...(payload?.players || [])].sort((a, b) => a.rank - b.rank);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#081a4a] font-['Baloo_2',sans-serif]">
      <img
        src={background}
        alt=""
        className="pointer-events-none absolute -left-[4px] top-0 h-full w-[399px] max-w-none object-cover"
      />
      <img src={sparkleOne} alt="" className="pointer-events-none absolute left-[46%] top-[58px] h-[12px] w-[12px]" />
      <img src={sparkleTwo} alt="" className="pointer-events-none absolute left-[55px] top-[156px] h-[22px] w-[22px]" />

      <div className="relative z-10 flex h-full flex-col px-[18px] pb-[18px] pt-[26px]">
        <div className="shrink-0 text-center">
          <h1 className="text-title-outline font-['Lilita_One'] text-[25px] leading-[1.02] text-brand-yellow">
            PERINGKAT KESELURUHAN
          </h1>
          <p className="mt-[4px] text-[11px] font-bold leading-none text-[#d8ecff]">
            Akumulasi skor game 1 + game 2
          </p>
        </div>

        <div className="mt-[12px] flex min-h-0 flex-1 flex-col gap-[7px] overflow-y-auto scrollbar-hide pr-[2px]">
          {rows.length > 0 ? (
            rows.map((player) => (
              <ResultRow
                key={player.userId}
                player={player}
                color={player.avatarColor}
                isMe={Boolean(userId && player.userId === userId)}
              />
            ))
          ) : (
            <div className="flex h-full items-center justify-center rounded-[16px] border-2 border-white/40 bg-[rgba(8,28,82,0.7)] px-6 text-center text-[14px] font-bold text-white">
              Menyiapkan skor akhir...
            </div>
          )}
        </div>

        <div className="mt-[10px] flex shrink-0 flex-col gap-[8px]">
          <button
            type="button"
            onClick={onBackToLobby}
            disabled={!isHost}
            className="flex h-[47px] w-full items-center justify-center rounded-[14px] border-[3px] border-white bg-[rgba(10,79,166,0.9)] text-[14px] font-black text-white transition disabled:cursor-not-allowed disabled:border-white/40 disabled:bg-[rgba(10,79,166,0.5)] disabled:text-white/60 active:translate-y-[1px]"
          >
            Kembali Ke Lobby
          </button>
          <button
            type="button"
            onClick={onPlayAgain}
            disabled={!isHost}
            className="flex h-[47px] w-full items-center justify-center rounded-[14px] border-[3px] border-white bg-brand-green text-[14px] font-black text-[#06241a] transition disabled:cursor-not-allowed disabled:border-white/40 disabled:bg-[#3a9d5c] disabled:text-white/70 active:translate-y-[1px]"
          >
            Main Lagi
          </button>
          {!isHost && (
            <p className="text-center text-[11px] font-bold text-[#d8ecff]">Menunggu host...</p>
          )}
        </div>
      </div>
    </div>
  );
}
