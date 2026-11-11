import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function JoinRoom({ onSwitchToCreate, onJoinRoom, onToast }) {
  const [code, setCode] = useState('');
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadRooms() {
      try {
        const data = await api('/rooms');
        if (!cancelled) setRooms(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setRooms([]);
      } finally {
        if (!cancelled) setLoadingRooms(false);
      }
    }

    loadRooms();

    return () => {
      cancelled = true;
    };
  }, []);

  async function refreshRooms() {
    setLoadingRooms(true);

    try {
      const data = await api('/rooms');
      setRooms(Array.isArray(data) ? data : []);
      onToast?.('Daftar room diperbarui');
    } catch {
      setRooms([]);
    } finally {
      setLoadingRooms(false);
    }
  }

  async function joinRoom(roomCode) {
    const normalizedCode = roomCode.trim().toUpperCase();

    if (!normalizedCode) {
      setError('Masukkan kode room.');
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
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col font-['Baloo_2']">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          joinRoom(code);
        }}
      >
        <label className="mb-2 block font-bold [text-shadow:2px_2px_0_#0A1A4A]">
          Masukkan kode room
          <input
            value={code}
            onChange={(event) =>
              setCode(
                event.target.value
                  .toUpperCase()
                  .replace(/[^A-Z0-9]/g, '')
                  .slice(0, 6),
              )
            }
            maxLength={6}
            placeholder="X7K9P2"
            autoComplete="off"
            className="mt-2 w-full rounded-2xl border-2 border-[#0A1A4A] bg-linear-to-b from-white to-[#CADBFA] px-4 py-3 text-center text-3xl font-black tracking-[0.3em] text-[#0A1A4A] shadow-[0_4px_0_#0A1A4A]"
          />
        </label>

        <button
          type="submit"
          disabled={loading || !code.trim()}
          className="mb-5 w-full rounded-2xl border-2 border-[#0A1A4A] bg-linear-to-b from-[#FFE96B] to-[#FFB619] py-3 text-2xl font-black text-blue-950 shadow-[0_4px_0_#0A1A4A] disabled:opacity-60"
        >
          {loading ? 'MENGECEK...' : 'GABUNG'}
        </button>
      </form>

      <h2 className="mb-3 text-center text-xl font-black">
        ATAU PILIH ROOM PUBLIK
      </h2>

      {error && (
        <p role="alert" className="mb-3 font-bold text-white">
          {error}
        </p>
      )}

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto">
        {rooms.map((room) => (
          <div
            key={room.roomId || room.code}
            className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-2xl border-2 border-[#0A1A4A] bg-linear-to-b from-white to-[#CADBFA] p-3 text-[#0A1A4A] shadow-[0_4px_0_#0A1A4A]"
          >
            <div className="min-w-0">
              <p className="truncate font-extrabold">{room.name}</p>
              <p className="text-sm font-bold">
                {room.currentPlayers}/{room.maxPlayers} pemain
              </p>
            </div>

            <span className="font-bold">{room.code}</span>

            <button
              type="button"
              disabled={loading}
              onClick={() => joinRoom(room.code)}
              className="rounded-xl border-2 border-[#0A1A4A] bg-[#FFB619] px-3 py-2 text-sm font-black disabled:opacity-60"
            >
              GABUNG
            </button>
          </div>
        ))}

        {!loadingRooms && rooms.length === 0 && (
          <p className="text-center font-bold">Belum ada room publik.</p>
        )}

        {loadingRooms && (
          <p className="text-center font-bold">Memuat daftar room...</p>
        )}
      </div>

      <button
        type="button"
        disabled={loadingRooms}
        onClick={refreshRooms}
        className="my-3 rounded-full bg-white/20 py-2 font-black disabled:opacity-60"
      >
        {loadingRooms ? 'Memuat...' : 'Refresh'}
      </button>

      <button
        type="button"
        onClick={onSwitchToCreate}
        className="rounded-2xl border-2 border-[#0A1A4A] bg-linear-to-b from-[#FFE96B] to-[#FFB619] py-3 text-2xl font-black text-blue-950 shadow-[0_4px_0_#0A1A4A]"
      >
        BUAT ROOM
      </button>
    </div>
  );
}