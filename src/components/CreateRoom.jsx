import { useState } from 'react';
import { api } from '../lib/api';

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
      className="mx-auto flex w-full max-w-md flex-col gap-5 font-['Baloo_2']"
    >
      <label className="font-bold [text-shadow:2px_2px_0_#0A1A4A]">
        Nama room
        <input
          value={name}
          onChange={(event) => setName(event.target.value.slice(0, 20))}
          maxLength={20}
          required
          className="mt-1 w-full rounded-2xl border-2 border-[#0A1A4A] bg-linear-to-b from-white to-[#CADBFA] px-4 py-3 font-bold text-[#0A1A4A] shadow-[0_4px_0_#0A1A4A]"
        />
      </label>

      <fieldset>
        <legend className="mb-2 font-bold [text-shadow:2px_2px_0_#0A1A4A]">
          Privasi
        </legend>

        <div className="grid grid-cols-2 gap-3">
          {[false, true].map((privateRoom) => (
            <button
              key={String(privateRoom)}
              type="button"
              aria-pressed={isPrivate === privateRoom}
              onClick={() => setIsPrivate(privateRoom)}
              className={`rounded-2xl border-2 border-[#0A1A4A] p-3 font-black text-[#0A1A4A] shadow-[0_4px_0_#0A1A4A] ${
                isPrivate === privateRoom ? 'bg-[#FFA626]' : 'bg-[#EBF2FF]'
              }`}
            >
              {privateRoom ? 'PRIVAT' : 'PUBLIK'}
              <span className="block text-xs font-bold">
                {privateRoom ? 'Hanya dengan kode' : 'Siapa saja bisa gabung'}
              </span>
            </button>
          ))}
        </div>
      </fieldset>

      <div className="rounded-2xl border-2 border-[#0A1A4A] bg-[#EBF2FF] p-4 text-center font-black text-[#0A1A4A] shadow-[0_4px_0_#0A1A4A]">
        Maksimal 4 pemain · 3 game berurutan
      </div>

      {error && (
        <p role="alert" className="font-bold text-white">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="rounded-2xl border-2 border-[#0A1A4A] bg-linear-to-b from-[#FFE96B] to-[#FFB619] py-3 text-2xl font-black text-blue-950 shadow-[0_4px_0_#0A1A4A] disabled:opacity-60"
      >
        {loading ? 'MEMBUAT...' : 'BUAT ROOM'}
      </button>

      <button
        type="button"
        onClick={onBackToJoin}
        className="font-bold underline"
      >
        Kembali
      </button>
    </form>
  );
}