import { useState } from 'react';
import PlayerCard from './PlayerCard';
import backButton from '../assets/lobby/back-button.svg';
import chevron from '../assets/lobby/chevron.svg';
import game1 from '../assets/lobby/game-1.svg';
import game2 from '../assets/lobby/game-2.svg';
import game3 from '../assets/lobby/game-3.svg';
import sparkle1 from '../assets/lobby/sparkle-1.svg';

const CARD_COLORS = ['pink', 'blue', 'orange', 'yellow'];
const GAME_ICONS = [game1, game2, game3];
const GAME_SUBTITLE = 'Stick Brawl · Jellyfish Deadlock · Game 3';

function Header({ onBack }) {
  return (
    <header className="relative mt-[18px] h-[47px] shrink-0">
      <button
        type="button"
        onClick={onBack}
        aria-label="Kembali"
        className="absolute left-0 top-0 z-10 h-[47px] w-[47px]"
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

      <h1 className="pointer-events-none absolute left-1/2 top-[7px] w-full -translate-x-1/2 text-center text-[24px] font-extrabold leading-[32px] text-white [text-shadow:0_3px_0_#0A1A4A]">
        RUANG TUNGGU
      </h1>

      <img
        src={sparkle1}
        alt=""
        className="pointer-events-none absolute left-1/2 top-[43px] -ml-4 h-3 w-3"
      />
    </header>
  );
}

export default function Lobby({
  roomCode,
  roomState,
  userId,
  onLeave,
  onToggleReady,
  onKick,
  onStart,
  onToast,
}) {
  const [confirmDisband, setConfirmDisband] = useState(false);

  if (!roomState) {
    return (
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden font-['Baloo_2']">
        <div className="scrollbar-hide flex min-h-0 flex-1 flex-col overflow-y-auto px-[18px]">
          <Header onBack={onLeave} />

          <p className="mt-10 text-center font-bold text-white [text-shadow:0_2px_0_#0A1A4A]">
            Menghubungkan ke room {roomCode}...
          </p>
        </div>
      </div>
    );
  }

  const { room = {}, players = [] } = roomState;
  const meInfo = roomState.me || {};
  const myId = meInfo.userId || userId;
  const me = players.find((player) => player.userId === myId);
  const isHost = meInfo.isHost ?? Boolean(me?.isHost);
  const canStart = players.length > 1 && players.every((player) => player.isReady);
  const code = room.code || roomCode;

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      onToast?.({ type: 'success', message: 'Kode room disalin' });
    } catch {
      onToast?.({ type: 'error', message: 'Gagal menyalin kode room' });
    }
  };

  const start = () => {
    if (!canStart) return;
    onStart?.();
  };

  const back = () => {
    if (isHost) {
      setConfirmDisband(true);
      return;
    }

    onLeave?.();
  };

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden font-['Baloo_2']">
      <div className="scrollbar-hide flex min-h-0 flex-1 flex-col overflow-y-auto px-[18px] pb-[15px]">
        <Header onBack={back} />

        <div className="mt-[14px] grid grid-cols-2 gap-x-[14px] gap-y-[13px]">
          {players.map((player, index) => (
            <PlayerCard
              key={player.userId}
              player={player}
              color={CARD_COLORS[index % CARD_COLORS.length]}
              decorated={index === 0}
              isMe={player.userId === myId}
              canKick={isHost && player.userId !== myId}
              onKick={() => onKick?.(player.userId)}
            />
          ))}
        </div>

        <div className="mt-4 flex h-[68px] shrink-0 items-center rounded-[18px] border-[3px] border-brand-dark bg-gradient-to-b from-white to-[#CADBFA] px-[19px] shadow-[0_5px_0_#0A1A4A]">
          <div className="flex shrink-0 gap-[9px]">
            {GAME_ICONS.map((icon, index) => (
              <span
                key={icon}
                className="relative grid h-[30px] w-[30px] place-items-center"
              >
                <img
                  src={icon}
                  alt=""
                  className="absolute inset-0 h-full w-full"
                />
                <span className="relative text-[14px] font-extrabold leading-[18px] text-white">
                  {index + 1}
                </span>
              </span>
            ))}
          </div>

          <div className="ml-3 min-w-0 -translate-y-[1px]">
            <p className="text-[16px] font-extrabold leading-[21px] text-[#12307A]">
              3 Game Berurutan
            </p>
            <p className="truncate text-[10.5px] font-bold leading-[21px] text-[#12307A]">
              {GAME_SUBTITLE}
            </p>
          </div>
        </div>

        <div className="mt-[18px] flex h-[55px] shrink-0 items-center justify-between rounded-[18px] border-[2.5px] border-[#3B63C4] bg-gradient-to-b from-[#13307A] to-[#0A1A4A] pl-[19.5px] pr-[21.5px]">
          <span className="text-[13px] font-extrabold leading-[17px] text-white">
            Kode room
          </span>
          <span className="text-[27px] font-extrabold leading-[36px] tracking-[3.24px] text-[#FFD84A]">
            {code}
          </span>
        </div>

        {isHost ? (
          <div className="flex flex-col">
            <button
              type="button"
              onClick={copyCode}
              className="mt-[14px] h-[48px] shrink-0 rounded-[18px] border-[3px] border-brand-dark bg-gradient-to-b from-[#86BBFF] to-[#4A88E0] text-[14px] font-extrabold text-white [text-shadow:0_2px_0_#0A1A4A] shadow-[0_5px_0_#0A1A4A] active:translate-y-[2px] active:shadow-[0_3px_0_#0A1A4A]"
            >
              Salin kode
            </button>

            <button
              type="button"
              onClick={start}
              disabled={!canStart}
              className={`mt-[23px] h-[56px] shrink-0 rounded-[20px] border-[3px] border-brand-dark text-[25px] font-extrabold leading-[34px] tracking-[1px] shadow-[0_5px_0_#0A1A4A] ${
                canStart
                  ? 'bg-gradient-to-b from-[#FFE96B] to-[#FFB619] text-brand-dark active:translate-y-[2px] active:shadow-[0_3px_0_#0A1A4A]'
                  : 'bg-gradient-to-b from-[#DEE0EB] to-[#A3ABBD] text-[#596378]'
              }`}
            >
              MULAI
            </button>

            {!canStart && (
              <p className="mt-[9px] text-center text-[12px] font-extrabold text-white">
                Menunggu semua pemain siap
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col">
            <p className="mt-[29px] text-center text-[16px] font-extrabold leading-[17px] text-white">
              Menunggu host memulai permainan...
            </p>

            <button
              type="button"
              onClick={() => onToggleReady?.()}
              disabled={!me}
              className="mt-[39px] h-[56px] shrink-0 rounded-[20px] border-[3px] border-brand-dark bg-[#73FF78] text-[25px] font-extrabold leading-[34px] tracking-[1px] text-[#12307A] shadow-[0_5px_0_#0A1A4A] active:translate-y-[2px] active:shadow-[0_3px_0_#0A1A4A] disabled:opacity-60"
            >
              {me?.isReady ? 'BATAL SIAP' : 'SIAP'}
            </button>
          </div>
        )}
      </div>

      {confirmDisband && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-6">
          <div className="w-full max-w-[300px] rounded-[22px] border-[3px] border-brand-dark bg-white p-5 text-center shadow-[0_6px_0_#0A1A4A]">
            <p className="text-[22px] font-extrabold text-brand-dark">
              Bubarkan room?
            </p>
            <p className="mt-1 text-sm font-bold text-slate-600">
              Semua pemain akan dikeluarkan.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setConfirmDisband(false)}
                className="rounded-[14px] border-2 border-brand-dark bg-[#EBF2FF] py-2 text-lg font-extrabold text-brand-dark"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmDisband(false);
                  onLeave?.();
                }}
                className="rounded-[14px] border-2 border-brand-dark bg-brand-red py-2 text-lg font-extrabold text-white"
              >
                Ya
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
