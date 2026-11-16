import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';
import { socket } from '../lib/socket';
import PageHeader from './PageHeader';
import game4 from '../assets/lobby/game-4.svg';
import game5 from '../assets/lobby/game-5.svg';
import line from '../assets/lobby/line.svg';
import sparkle2 from '../assets/lobby/sparkle-2.svg';
import sparkle3 from '../assets/lobby/sparkle-3.svg';
import sparkle4 from '../assets/lobby/sparkle-4.svg';

const POLL_MS = 10000;
const CODE_LENGTH = 6;
const EMPTY_DIGITS = Array.from({ length: CODE_LENGTH }, () => '');

function RoomCard({ room, disabled, onJoin }) {
  const maxPlayers = Math.min(room.maxPlayers || 4, 4);
  const currentPlayers = Math.min(room.currentPlayers || 0, maxPlayers);
  const full = currentPlayers >= maxPlayers;

  return (
    <div className="relative h-[60px] w-full shrink-0 rounded-[18px] border-[3px] border-brand-dark bg-gradient-to-b from-white to-[#CADBFA] shadow-[0_5px_0_#0A1A4A]">
      <p className="absolute left-[18px] top-[4px] max-w-[150px] truncate text-[20px] font-extrabold leading-[40px] text-[#12307A]">
        {room.name}
      </p>

      <p className="absolute left-[18px] top-[38px] text-[11.5px] font-bold leading-[15px] text-[#12307A]">
        {currentPlayers}/{maxPlayers} pemain
      </p>

      <div className="absolute left-[170px] top-[25px] flex gap-[7px]">
        {Array.from({ length: maxPlayers }).map((_, index) => (
          <img
            key={index}
            src={index < currentPlayers ? game5 : game4}
            alt=""
            className="h-[17px] w-[17px]"
          />
        ))}
      </div>

      {full ? (
        <span className="absolute right-[12px] top-[14px] grid h-[33px] w-[78px] place-items-center rounded-[18px] border-[3px] border-brand-dark bg-[#C0C0C0] text-[12px] font-extrabold leading-[23px] text-[#12307A] shadow-[0_3px_0_#0A1A4A]">
          PENUH
        </span>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => onJoin(room.code)}
          className="absolute right-[12px] top-[14px] h-[33px] w-[78px] rounded-[18px] border-[3px] border-brand-dark bg-gradient-to-b from-[#FFE96B] to-[#FFB619] text-[12px] font-extrabold leading-[23px] text-[#12307A] shadow-[0_3px_0_#0A1A4A] active:translate-y-[1px] active:shadow-[0_2px_0_#0A1A4A] disabled:opacity-60"
        >
          GABUNG
        </button>
      )}
    </div>
  );
}

export default function JoinRoom({
  onSwitchToCreate,
  onJoinRoom,
  onToast,
  onBack,
}) {
  const [digits, setDigits] = useState(EMPTY_DIGITS);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const inFlight = useRef(false);
  const mounted = useRef(true);
  const inputsRef = useRef([]);

  const loadRooms = useCallback(
    async ({ silent = true, force = false } = {}) => {
      // Jangan menumpuk request: lewati jika request sebelumnya belum selesai.
      if (inFlight.current) return false;

      // Polling tidak boleh jalan saat tab tidak terlihat.
      if (silent && document.hidden && !force) return false;

      inFlight.current = true;

      try {
        const data = await api('/rooms');

        if (mounted.current) {
          setRooms(Array.isArray(data) ? data : []);
        }

        return true;
      } catch {
        // Polling yang gagal tidak boleh mengosongkan daftar yang sudah ada.
        if (mounted.current && !silent) {
          setRooms([]);
        }

        return false;
      } finally {
        inFlight.current = false;

        if (mounted.current) {
          setLoadingRooms(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    mounted.current = true;

    // Socket hanya sinyal: saat ada perubahan room, ambil ulang data lewat REST.
    const handleRoomsUpdated = () => loadRooms();

    // Muat pertama kali (tetap jalan meskipun tab sedang tidak terlihat).
    // Ditunda ke microtask agar tidak memicu cascading render di body effect.
    const initialTimer = setTimeout(() => loadRooms({ silent: false }), 0);

    // Polling tetap ada sebagai cadangan bila event socket terlewat.
    const timer = setInterval(() => loadRooms({ silent: true }), POLL_MS);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadRooms({ silent: true });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    socket.on('rooms:updated', handleRoomsUpdated);

    // Sambungkan bila perlu, tetapi jangan pernah disconnect di halaman ini:
    // socket yang sama dipakai halaman room setelah user bergabung.
    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      mounted.current = false;
      clearTimeout(initialTimer);
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      socket.off('rooms:updated', handleRoomsUpdated);
    };
  }, [loadRooms]);

  async function refreshRooms() {
    setRefreshing(true);

    const updated = await loadRooms({ silent: true, force: true });

    if (!mounted.current) return;

    setRefreshing(false);
    if (updated) onToast?.('Daftar room diperbarui');
  }

  async function joinRoom(roomCode) {
    const normalizedCode = roomCode.trim().toUpperCase();

    if (normalizedCode.length !== CODE_LENGTH) {
      setError(`Masukkan kode room lengkap (${CODE_LENGTH} karakter).`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api(`/rooms/${encodeURIComponent(normalizedCode)}`);
      onJoinRoom?.(normalizedCode);
    } catch (err) {
      setError(err.message || 'Gagal bergabung ke room.');
    } finally {
      if (mounted.current) setLoading(false);
    }
  }

  function handleDigitChange(index, value) {
    const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, '');

    setError('');
    setDigits((current) => {
      const next = [...current];
      next[index] = clean.slice(-1);
      return next;
    });

    if (clean && index < CODE_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleDigitKeyDown(index, event) {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      event.preventDefault();
      setDigits((current) => {
        const next = [...current];
        next[index - 1] = '';
        return next;
      });
      inputsRef.current[index - 1]?.focus();
      return;
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      inputsRef.current[index - 1]?.focus();
      return;
    }

    if (event.key === 'ArrowRight' && index < CODE_LENGTH - 1) {
      event.preventDefault();
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handlePaste(event) {
    const pasted = event.clipboardData
      .getData('text')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, CODE_LENGTH);

    if (!pasted) return;

    event.preventDefault();
    setError('');

    const next = Array.from({ length: CODE_LENGTH }, () => '');
    pasted.split('').forEach((character, index) => {
      next[index] = character;
    });

    setDigits(next);
    inputsRef.current[Math.min(pasted.length, CODE_LENGTH - 1)]?.focus();
  }

  const code = digits.join('');

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden font-['Baloo_2']">
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
        <PageHeader
          title="GABUNG ROOM"
          onBack={onBack || (() => onToast?.('Kamu sudah di halaman utama'))}
        />

        <div className="shrink-0 px-[18px]">
          <p className="pl-[4px] text-[14px] font-extrabold leading-[18px] text-white [text-shadow:0_2px_0_#0A1A4A]">
            Masukkan kode room
          </p>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              joinRoom(code);
            }}
          >
            <div
              className="mt-[11px] flex justify-center gap-[9px]"
              onPaste={handlePaste}
            >
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => {
                    inputsRef.current[index] = element;
                  }}
                  value={digit}
                  onChange={(event) =>
                    handleDigitChange(index, event.target.value)
                  }
                  onKeyDown={(event) => handleDigitKeyDown(index, event)}
                  onFocus={(event) => event.target.select()}
                  maxLength={1}
                  autoComplete="off"
                  placeholder="_"
                  aria-label={`Karakter kode room ${index + 1}`}
                  className="h-[66px] min-w-0 max-w-[52px] flex-1 rounded-[18px] border-[3px] border-brand-dark bg-gradient-to-b from-white to-[#CADBFA] text-center text-[40px] font-extrabold leading-none text-[#12307A] shadow-[0_5px_0_#0A1A4A] outline-none placeholder:text-[#12307A] focus:from-[#FFF6C2]"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-[39px] h-[54px] w-full rounded-[18px] border-[3px] border-brand-dark bg-gradient-to-b from-[#FFE96B] to-[#FFB619] text-[32px] font-extrabold leading-[23px] text-[#12307A] shadow-[0_5px_0_#0A1A4A] active:translate-y-[2px] active:shadow-[0_3px_0_#0A1A4A] disabled:opacity-60"
            >
              {loading ? 'MENGECEK...' : 'GABUNG'}
            </button>
          </form>

          <div className="flex h-[33px] items-center justify-center">
            {error && (
              <p
                role="alert"
                className="line-clamp-2 max-w-full px-2 text-center text-[12px] font-bold leading-[14px] text-[#FFE96B] [text-shadow:0_2px_0_#0A1A4A]"
              >
                {error}
              </p>
            )}
          </div>

          <div className="relative flex h-[18px] items-center justify-center">
            <img
              src={line}
              alt=""
              className="absolute left-[-5px] h-[2px] w-[92px]"
            />
            <img
              src={line}
              alt=""
              className="absolute right-[-1px] h-[2px] w-[92px]"
            />
            <p className="relative text-[15px] font-extrabold leading-[18px] text-white [text-shadow:0_2px_0_#0A1A4A]">
              ATAU PILIH ROOM PUBLIK
            </p>
          </div>
        </div>

        <div className="scrollbar-hide mt-[23px] min-h-0 flex-1 overflow-y-auto px-[18px]">
          <div className="flex flex-col gap-[19px] pb-[10px]">
            {rooms.map((room) => (
              <RoomCard
                key={room.roomId || room.code}
                room={room}
                disabled={loading}
                onJoin={joinRoom}
              />
            ))}
          </div>

          {loadingRooms && (
            <p className="mt-8 text-center text-[14px] font-extrabold text-white [text-shadow:0_2px_0_#0A1A4A]">
              Memuat daftar room...
            </p>
          )}

          {!loadingRooms && rooms.length === 0 && (
            <p className="mt-8 text-center text-[14px] font-extrabold text-white [text-shadow:0_2px_0_#0A1A4A]">
              Belum ada room publik.
            </p>
          )}
        </div>

        <div className="relative z-10 shrink-0 px-[15px] pb-[12px]">
          <button
            type="button"
            onClick={onSwitchToCreate}
            className="h-[56px] w-full rounded-[20px] border-[3px] border-brand-dark bg-gradient-to-b from-[#FFE96B] to-[#FFB619] text-[26px] font-extrabold leading-[36px] tracking-[0.52px] text-[#12307A] shadow-[0_5px_0_#0A1A4A] active:translate-y-[2px] active:shadow-[0_3px_0_#0A1A4A]"
          >
            BUAT ROOM
          </button>

          <button
            type="button"
            disabled={loadingRooms || refreshing}
            onClick={refreshRooms}
            className="mt-[17px] h-[50px] w-full rounded-[30px] bg-[rgba(131,198,253,0.4)] text-[20px] font-extrabold leading-[24px] text-white disabled:opacity-60"
          >
            {loadingRooms || refreshing ? 'Memuat...' : 'Refresh'}
          </button>
        </div>
      </div>
    </div>
  );
}
