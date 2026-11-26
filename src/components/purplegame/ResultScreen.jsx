import podiumMerah1 from '../../assets/game/podium/podium-merah-1.svg';
import podiumMerah2 from '../../assets/game/podium/podium-merah-2.svg';
import podiumMerah3 from '../../assets/game/podium/podium-merah-3.svg';
import podiumBiru1 from '../../assets/game/podium/podium-biru-1.svg';
import podiumBiru2 from '../../assets/game/podium/podium-biru-2.svg';
import podiumBiru3 from '../../assets/game/podium/podium-biru-3.svg';
import podiumHijau1 from '../../assets/game/podium/podium-hijau-1.svg';
import podiumHijau2 from '../../assets/game/podium/podium-hijau-2.svg';
import podiumHijau3 from '../../assets/game/podium/podium-hijau-3.svg';
import podiumKuning1 from '../../assets/game/podium/podium-kuning-1.svg';
import podiumKuning2 from '../../assets/game/podium/podium-kuning-2.svg';
import podiumKuning3 from '../../assets/game/podium/podium-kuning-3.svg';
import { COLOR_HEX } from '../../config/playerColors';

const RESULT_COLORS = COLOR_HEX;

const PODIUM_SPRITES = {
  'merah-1': podiumMerah1,
  'merah-2': podiumMerah2,
  'merah-3': podiumMerah3,
  'biru-1': podiumBiru1,
  'biru-2': podiumBiru2,
  'biru-3': podiumBiru3,
  'hijau-1': podiumHijau1,
  'hijau-2': podiumHijau2,
  'hijau-3': podiumHijau3,
  'kuning-1': podiumKuning1,
  'kuning-2': podiumKuning2,
  'kuning-3': podiumKuning3,
};

const TABLE_ORDER = ['merah', 'biru', 'hijau', 'kuning'];

function Sticker({ playerKey, rank, left, top }) {
  const sprite = PODIUM_SPRITES[`${playerKey}-${rank}`];
  if (!sprite) return null;

  return (
    <div
      className="pointer-events-none absolute h-[235px] w-[120px] overflow-hidden"
      style={{ left, top }}
      aria-hidden="true"
    >
      <img
        src={sprite}
        alt=""
        className="absolute block max-w-none"
        style={{ left: rank === 2 ? 26 : 23, top: 103.4, width: 74, height: 131 }}
      />
    </div>
  );
}

function PodiumBlock({ player, rank, left, top, height, numberTop, spriteLeft, spriteTop }) {
  if (!player) return null;

  return (
    <>
      <div
        className="absolute w-[96px] rounded-[8px] border-3 border-black"
        style={{ left, top, height, backgroundColor: RESULT_COLORS[player.key] || '#4d8dff' }}
      >
        <span
          className="absolute w-[96px] text-center text-[32px] leading-[normal] text-white"
          style={{ top: numberTop - top }}
        >
          {rank}
        </span>
      </div>
      <p
        className="absolute w-[96px] -translate-x-1/2 truncate text-center text-[11px] leading-[normal] text-white"
        style={{ left: left + 48, top: 446 }}
        title={player.name}
      >
        {player.name}
      </p>
      <Sticker playerKey={player.key} rank={rank} left={spriteLeft} top={spriteTop} />
    </>
  );
}

function TableHeader({ children, left }) {
  return (
    <span
      className="absolute h-[11px] w-[30px] -translate-x-1/2 whitespace-nowrap text-center text-[10px] leading-[normal] text-[#ffc83d]"
      style={{ left, top: 502 }}
    >
      {children}
    </span>
  );
}

function TableCell({ children, left, top, color = '#ffffff', width = 30, title }) {
  return (
    <span
      className="absolute h-[15px] -translate-x-1/2 overflow-hidden text-ellipsis whitespace-nowrap text-center text-[13px] leading-[normal]"
      style={{ left, top, width, color }}
      title={title}
    >
      {children}
    </span>
  );
}

export default function ResultScreen({
  ranking,
  boomCount,
  boomByPlayer = {},
  isHost = false,
  onOpenSummary,
  onExit,
}) {
  const [first, second, third] = ranking;
  const rankByKey = Object.fromEntries(ranking.map((player, index) => [player.key, index]));

  return (
    <div className="relative h-full w-full animate-[hitung-in_300ms_ease-out] overflow-hidden bg-gradient-to-b from-[rgba(24,4,61,0.96)] to-[rgba(46,9,113,0.96)] font-['Lilita_One'] text-white">
      <p className="absolute left-[195px] top-[70px] w-[390px] -translate-x-1/2 whitespace-nowrap text-center text-[14px] leading-[normal] text-[#ffc83d]">
        HASIL AKHIR
      </p>

      <button
        type="button"
        onClick={onOpenSummary}
        className="absolute left-[14px] top-[43px] flex h-[28px] w-[89px] items-center justify-center rounded-[12px] border-2 border-black bg-[#230063] px-[10px] py-[5px] drop-shadow-[0px_4px_0px_#0c0030] active:translate-y-[2px] active:drop-shadow-[0px_2px_0px_#0c0030]"
      >
        <span className="whitespace-nowrap text-[12px] leading-[normal] text-[#ffc83d]">
          RINGKASAN
        </span>
      </button>

      <div className="absolute left-[196.23px] top-[73.46px] flex h-[76.411px] w-[392.467px] -translate-x-1/2 items-center justify-center">
        <p className="w-[390px] -rotate-[4.2deg] text-center text-[42px] leading-[normal] text-[#ffc83d]">
          RING CHAMPION
        </p>
      </div>
      <p className="absolute left-[195px] top-[168px] w-[390px] -translate-x-1/2 truncate px-4 text-center text-[15px] leading-[normal] text-[#c5cee1]" title={first?.name ? `${first.name} menang!` : ''}>
        {first?.name} menang!
      </p>

      <PodiumBlock
        player={second}
        rank={2}
        left={40}
        top={382}
        height={84}
        numberTop={386}
        spriteLeft={25}
        spriteTop={148}
      />
      <PodiumBlock
        player={first}
        rank={1}
        left={147}
        top={352}
        height={114}
        numberTop={356}
        spriteLeft={135}
        spriteTop={113}
      />
      <PodiumBlock
        player={third}
        rank={3}
        left={254}
        top={402}
        height={64}
        numberTop={406}
        spriteLeft={242}
        spriteTop={168}
      />

      <div className="absolute left-[28px] top-[492px] h-[132px] w-[334px] rounded-[10px] border-3 border-black bg-[#230063]" />
      <TableHeader left={62}>PETINJU</TableHeader>
      <TableHeader left={112}>R1</TableHeader>
      <TableHeader left={150}>R2</TableHeader>
      <TableHeader left={188}>R3</TableHeader>
      <TableHeader left={236}>TOTAL</TableHeader>
      <TableHeader left={277}>BOOM</TableHeader>
      <TableHeader left={333}>JUARA</TableHeader>

      {TABLE_ORDER.map((key, row) => {
        const player = ranking.find((item) => item.key === key);
        const place = rankByKey[key];
        const label = place === 0 ? 'Juara' : place === 1 ? '2' : place === 2 ? '3' : '-';
        const top = 526 + row * 24;
        return (
          <div key={key}>
            <TableCell left={62} top={top} width={70} color={RESULT_COLORS[key]} title={player?.name || key}>
              {player?.name || key}
            </TableCell>
            {[0, 1, 2].map((round) => (
              <TableCell key={round} left={112 + round * 38} top={top}>
                {player?.rounds?.[round] ?? 0}
              </TableCell>
            ))}
            <TableCell left={236} top={top}>
              {player?.score ?? 0}
            </TableCell>
            <TableCell left={277} top={top}>
              {boomByPlayer[key] ?? 0}
            </TableCell>
            <TableCell left={333} top={top}>
              {label}
            </TableCell>
          </div>
        );
      })}

      <div className="absolute left-[28px] top-[628px] flex h-[16px] w-[334px] items-center justify-center gap-[4px] overflow-hidden whitespace-nowrap text-[13px] leading-[normal]">
        <span className="text-[#d9ccff]">Total ledakan Race Condition:</span>
        <span className="text-[#ffcf3a]">{boomCount}</span>
        <span className="text-[#d9ccff]">kali</span>
      </div>
      <p className="absolute left-[195px] top-[648px] h-[24px] w-[334px] -translate-x-1/2 text-center text-[10px] leading-[normal] text-[#d9ccff]">
        Tanpa aturan: data rusak karena tabrakan. Mutex: aman tapi antre. Semaphore: aman dan lebih banyak yang lewat.
      </p>

      {isHost ? (
        <button
          type="button"
          onClick={onExit}
          className="absolute left-[28px] top-[682px] flex h-[64px] w-[334px] items-center justify-center rounded-[10px] border-b-5 border-black bg-[#3ddc84] text-[20px] font-black leading-normal text-[#06241a] active:translate-y-[2px] active:border-b-[3px]"
        >
          LANJUT KE GAME 2
        </button>
      ) : (
        <div className="absolute left-[28px] top-[682px] flex h-[64px] w-[334px] items-center justify-center rounded-[10px] border-b-5 border-black bg-[rgba(10,79,166,0.9)] text-[16px] font-bold leading-normal text-white">
          Menunggu host melanjutkan...
        </div>
      )}
      <div className="absolute left-[28px] top-[758px] flex h-[46px] w-[334px] items-center justify-center rounded-[10px] border-2 border-white px-2 text-center text-[11px] leading-[normal] text-white">
        {isHost
          ? 'Tekan tombol di atas untuk masuk ke game berikutnya.'
          : 'Host akan memindahkan semua pemain ke game berikutnya.'}
      </div>
    </div>
  );
}
