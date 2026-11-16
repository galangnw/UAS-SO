import { useState } from 'react';
import { api } from '../lib/api';
import PageHeader from './PageHeader';
import editIcon from '../assets/lobby/edit-icon.svg';
import lockIcon from '../assets/lobby/lock-icon.svg';
import lockIconLg from '../assets/lobby/lock-icon-lg.svg';
import game1 from '../assets/lobby/game-1.svg';
import game2 from '../assets/lobby/game-2.svg';
import game3 from '../assets/lobby/game-3.svg';
import sparkle2 from '../assets/lobby/sparkle-2.svg';
import sparkle3 from '../assets/lobby/sparkle-3.svg';
import sparkle4 from '../assets/lobby/sparkle-4.svg';

const LABEL =
  "block pl-[4px] text-[14px] font-extrabold leading-[18px] text-white [text-shadow:0_2px_0_#0A1A4A]";
const GAME_ICONS = [game1, game2, game3];

export default function CreateRoom({ user, onCreated, onBackToJoin }) {
  const [name, setName] = useState(`Room ${user?.name || 'Pemain'}`.slice(0, 20));
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setError('');

    const roomName = name.trim();

    if (!roomName || roomName.length > 20) {
      setError('Nama room harus 1–20 karakter.');
      return;
    }

    if (!user?.userId) {
      setError('Data pemain belum tersedia. Muat ulang halaman.');
      return;
    }

    setLoading(true);

    try {
      const room = await api('/rooms', {
        method: 'POST',
        body: JSON.stringify({
          name: roomName,
          isPrivate,
          userId: user.userId,
        }),
      });

      if (!room?.code) {
        throw new Error('Response backend tidak menyertakan kode room.');
      }

      onCreated?.(room.code);
    } catch (err) {
      setError(err.message || 'Gagal membuat room.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="relative flex h-full min-h-0 flex-col overflow-hidden font-['Baloo_2']"
    >
      <div className="pointer-events-none absolute inset-0 z-0">
        <img
          src={sparkle2}
          alt=""
          className="absolute left-[337px] top-[431px] h-6 w-6"
        />
        <img
          src={sparkle3}
          alt=""
          className="absolute left-[307px] top-[717px] h-5 w-5"
        />
        <img
          src={sparkle4}
          alt=""
          className="absolute left-[27px] top-[535px] h-[10px] w-[10px]"
        />
      </div>

      <div className="relative z-10 flex h-full min-h-0 flex-col">
        <PageHeader title="BUAT ROOM" onBack={onBackToJoin} />

        <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-[18px]">
          <label htmlFor="room-name" className={LABEL}>
            Nama room
          </label>

          <div className="relative mt-[14px] h-[54px]">
            <input
              id="room-name"
              value={name}
              onChange={(event) => setName(event.target.value.slice(0, 20))}
              maxLength={20}
              required
              autoComplete="off"
              className="h-full w-full rounded-[18px] border-[3px] border-brand-dark bg-gradient-to-b from-white to-[#CADBFA] pl-[17px] pr-[52px] text-[17px] font-extrabold leading-[22px] text-[#12307A] shadow-[0_5px_0_#0A1A4A] outline-none focus:from-[#FFF6C2]"
            />
            <img
              src={editIcon}
              alt=""
              className="pointer-events-none absolute right-[22px] top-[17px] h-5 w-5"
            />
          </div>

          <p className={`mt-[19px] ${LABEL}`}>Privasi</p>

          <div
            role="group"
            aria-label="Privasi"
            className="mt-[11px] grid grid-cols-2 gap-[14px]"
          >
            <button
              type="button"
              aria-pressed={!isPrivate}
              onClick={() => setIsPrivate(false)}
              className={`flex h-[62px] flex-col items-center justify-center gap-[2px] rounded-[18px] border-[3px] border-brand-dark shadow-[0_5px_0_#0A1A4A] ${
                !isPrivate ? 'bg-[#FFA626]' : 'bg-[#EBF2FF]'
              }`}
            >
              <span className="text-[18px] font-extrabold leading-[23px] text-[#12307A]">
                PUBLIK
              </span>
              <span
                className={`text-[11.5px] font-bold leading-[15px] ${
                  !isPrivate ? 'text-[#12307A]' : 'text-[#2B4FA1]'
                }`}
              >
                Siapa saja bisa gabung
              </span>
            </button>

            <button
              type="button"
              aria-pressed={isPrivate}
              onClick={() => setIsPrivate(true)}
              className={`flex h-[62px] flex-col items-center justify-center gap-[2px] rounded-[18px] border-[3px] border-brand-dark shadow-[0_5px_0_#0A1A4A] ${
                isPrivate ? 'bg-[#FFA626]' : 'bg-[#EBF2FF]'
              }`}
            >
              <span className="text-[18px] font-extrabold leading-[23px] text-[#12307A]">
                PRIVAT
              </span>
              <span
                className={`text-[11.5px] font-bold leading-[15px] ${
                  isPrivate ? 'text-[#12307A]' : 'text-[#2B4FA1]'
                }`}
              >
                Hanya dengan kode
              </span>
            </button>
          </div>

          <p className={`mt-[30px] ${LABEL}`}>Jumlah pemain</p>

          <div className="relative ml-[4px] mt-[9px] h-[66px] w-[112px] rounded-[18px] border-[3px] border-brand-dark bg-[#EBF2FF] shadow-[0_5px_0_#0A1A4A]">
            <img
              src={lockIcon}
              alt=""
              className="absolute left-[8px] top-[8px] h-[17px] w-[15px]"
            />
            <p className="absolute left-0 top-[11.5px] w-full text-center text-[21px] font-extrabold leading-[27px] text-[#12307A]">
              4
            </p>
            <p className="absolute left-0 top-[41px] w-full text-center text-[12px] font-bold leading-[16px] text-[#12307A]">
              pemain
            </p>
          </div>

          <p className={`mt-[27px] ${LABEL}`}>Permainan</p>

          <div className="relative mt-[13px] h-[67px] w-full rounded-[18px] border-[3px] border-brand-dark bg-gradient-to-b from-white to-[#CADBFA] shadow-[0_5px_0_#0A1A4A]">
            {GAME_ICONS.map((icon, index) => (
              <div
                key={icon}
                className="absolute top-[18.5px] h-[30px] w-[30px]"
                style={{ left: `${19 + index * 38}px` }}
              >
                <img
                  src={icon}
                  alt=""
                  className="absolute -left-[2.5px] -top-[2.5px] h-[35px] w-[35px]"
                />
                <span className="absolute inset-0 grid place-items-center text-[14px] font-extrabold leading-[18px] text-white">
                  {index + 1}
                </span>
              </div>
            ))}

            <p className="absolute left-[139px] top-px text-[17px] font-extrabold leading-[22px] text-[#12307A]">
              3 Ronde Berurutan
            </p>
            <p className="absolute left-[139px] top-[26px] w-[170px] text-[11px] font-bold leading-[14px] text-[#12307A]">
              Tanpa Aturan · Mutex · Semaphore
            </p>

            <img
              src={lockIconLg}
              alt=""
              className="absolute right-[21px] top-[22px] h-[22px] w-5"
            />
          </div>

          <p className={`mt-[23px] ${LABEL}`}>Kode room</p>

          <div className="relative mt-[13px] h-[60px] w-full rounded-[18px] border-[3px] border-brand-dark bg-gradient-to-b from-white to-[#CADBFA] shadow-[0_5px_0_#0A1A4A]">
            <p className="absolute left-[17px] top-[10px] text-[31px] font-extrabold leading-[40px] tracking-[3.72px] text-[#12307A]">
              ------
            </p>
            <p className="absolute right-[17px] top-[22.5px] w-[154px] text-right text-[11.5px] font-bold leading-[15px] text-[#12307A]">
              dibuat otomatis
            </p>
          </div>
        </div>

        <div className="relative z-10 shrink-0 px-[18px] pb-[19px]">
          {error && (
            <p
              role="alert"
              className="mb-2 text-center text-[12px] font-bold text-[#FFE96B] [text-shadow:0_2px_0_#0A1A4A]"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="h-[56px] w-full rounded-[20px] border-[3px] border-brand-dark bg-gradient-to-b from-[#FFE96B] to-[#FFB619] text-[26px] font-extrabold leading-[36px] tracking-[0.52px] text-[#12307A] shadow-[0_5px_0_#0A1A4A] active:translate-y-[2px] active:shadow-[0_3px_0_#0A1A4A] disabled:opacity-60"
          >
            {loading ? 'MEMBUAT...' : 'BUAT ROOM'}
          </button>
        </div>
      </div>
    </form>
  );
}
