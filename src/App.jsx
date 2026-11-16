<<<<<<< HEAD
import { useEffect, useRef, useState } from 'react';
import { api } from './lib/api';
import { socket } from './lib/socket';
import CreateRoom from './components/CreateRoom';
import JoinRoom from './components/JoinRoom';
import Lobby from './components/Lobby';
import Toast from './components/Toast';
=======
import { useEffect, useState } from 'react';
import { api, createRoomSocket } from './lib/api';
import CreateRoom from './components/CreateRoom';
import JoinRoom from './components/JoinRoom';
>>>>>>> 94e911e2c5920961426dbb809e762ecf642e1d89

function newGuestName() {
  return `Pemain${Math.floor(1000 + Math.random() * 9000)}`;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('join');
<<<<<<< HEAD
=======
  const [socket, setSocket] = useState(null);
>>>>>>> 94e911e2c5920961426dbb809e762ecf642e1d89
  const [roomCode, setRoomCode] = useState('');
  const [roomState, setRoomState] = useState(null);
  const [toast, setToast] = useState('');
  const [authError, setAuthError] = useState('');
<<<<<<< HEAD
  const leavingRef = useRef(false);
=======
>>>>>>> 94e911e2c5920961426dbb809e762ecf642e1d89

  useEffect(() => {
    let cancelled = false;

    async function initializeGuest() {
      try {
        const saved = JSON.parse(
          localStorage.getItem('kernel-clash-user') || 'null',
        );

        if (saved?.userId) {
          if (!cancelled) setUser(saved);
          return;
        }

        const guest = await api('/auth/guest', {
          method: 'POST',
          body: JSON.stringify({
            name: newGuestName(),
            avatarColor: 'pink',
          }),
        });

        localStorage.setItem('kernel-clash-user', JSON.stringify(guest));
        localStorage.setItem('userId', guest.userId);

        if (!cancelled) setUser(guest);
      } catch (err) {
        if (cancelled) return;

        setAuthError(err.message || 'Backend belum tersedia.');
        setUser({
          name: newGuestName(),
          avatarColor: 'pink',
          userId: null,
          offline: true,
        });
      }
    }

    initializeGuest();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!toast) return undefined;

    const timer = setTimeout(() => setToast(''), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
<<<<<<< HEAD
    if (!roomCode || !user?.userId) return undefined;
=======
    if (!socket || !roomCode || !user?.userId) return undefined;
>>>>>>> 94e911e2c5920961426dbb809e762ecf642e1d89

    const handleConnect = () => {
      socket.emit('auth', user.userId);
      socket.emit('room:join', { code: roomCode });
    };

    const handleRoomState = (state) => setRoomState(state);

    const handlePlayerJoined = (player) => {
      setRoomState((current) => {
        if (!current) return current;

        const players = current.players || [];
        if (players.some((item) => item.userId === player.userId)) {
          return current;
        }

        return { ...current, players: [...players, player] };
      });
    };

    const handlePlayerLeft = ({ userId }) => {
      setRoomState((current) =>
        current
          ? {
              ...current,
              players: (current.players || []).filter(
                (player) => player.userId !== userId,
              ),
            }
          : current,
      );
    };

    const handlePlayerReady = ({ userId, isReady }) => {
      setRoomState((current) =>
        current
          ? {
              ...current,
              players: (current.players || []).map((player) =>
                player.userId === userId ? { ...player, isReady } : player,
              ),
            }
          : current,
      );
    };

    const handleToast = (payload) => {
<<<<<<< HEAD
      if (typeof payload === 'string') {
        setToast(payload);
        return;
      }

      setToast({
        type: payload?.type || 'info',
        message: payload?.message || 'Terjadi kesalahan.',
      });
=======
      setToast(payload?.message || 'Terjadi kesalahan.');
>>>>>>> 94e911e2c5920961426dbb809e762ecf642e1d89
    };

    const handleKicked = () => {
      setToast('Kamu dikeluarkan dari room.');
      setRoomState(null);
      setRoomCode('');
      setView('join');
    };

    const handleDisbanded = () => {
      setToast('Room telah dibubarkan.');
      setRoomState(null);
      setRoomCode('');
      setView('join');
    };

    const handleTournamentStarting = (payload) => {
<<<<<<< HEAD
      setToast({
        type: 'info',
        message: `Game dimulai dalam ${payload?.countdown ?? 3}...`,
      });
=======
      setToast(`Turnamen dimulai! Minigame ${payload?.firstMinigame || 1}`);
>>>>>>> 94e911e2c5920961426dbb809e762ecf642e1d89
    };

    const handleConnectError = () => {
      setToast('Koneksi ke server room gagal.');
    };

    socket.on('connect', handleConnect);
    socket.on('connect_error', handleConnectError);
    socket.on('room:state', handleRoomState);
    socket.on('room:player_joined', handlePlayerJoined);
    socket.on('room:player_left', handlePlayerLeft);
    socket.on('room:player_ready', handlePlayerReady);
    socket.on('room:kicked', handleKicked);
    socket.on('room:disbanded', handleDisbanded);
    socket.on('tournament:starting', handleTournamentStarting);
    socket.on('toast', handleToast);

<<<<<<< HEAD
    // Jika socket sudah terhubung (mis. reconnect), langsung auth + join.
    if (socket.connected) handleConnect();
=======
>>>>>>> 94e911e2c5920961426dbb809e762ecf642e1d89
    socket.connect();

    return () => {
      socket.off('connect', handleConnect);
      socket.off('connect_error', handleConnectError);
      socket.off('room:state', handleRoomState);
      socket.off('room:player_joined', handlePlayerJoined);
      socket.off('room:player_left', handlePlayerLeft);
      socket.off('room:player_ready', handlePlayerReady);
      socket.off('room:kicked', handleKicked);
      socket.off('room:disbanded', handleDisbanded);
      socket.off('tournament:starting', handleTournamentStarting);
      socket.off('toast', handleToast);
      socket.disconnect();
    };
<<<<<<< HEAD
  }, [roomCode, user?.userId]);
=======
  }, [socket, roomCode, user?.userId]);
>>>>>>> 94e911e2c5920961426dbb809e762ecf642e1d89

  function enterRoom(code) {
    if (!user?.userId) {
      setToast('Room membutuhkan koneksi ke backend.');
      return;
    }

    setRoomState(null);
    setRoomCode(code);
<<<<<<< HEAD
=======
    setSocket(createRoomSocket());
>>>>>>> 94e911e2c5920961426dbb809e762ecf642e1d89
    setView('lobby');
  }

  function leaveRoom() {
<<<<<<< HEAD
    if (leavingRef.current) return;
    leavingRef.current = true;

    if (socket.connected) {
      socket.emit('room:leave', { code: roomCode });
    }

    // Beri server waktu memproses room:leave sebelum socket diputus.
    setTimeout(() => {
      socket.disconnect();
      setRoomState(null);
      setRoomCode('');
      setView('join');
      leavingRef.current = false;
    }, 300);
=======
    if (socket?.connected) {
      socket.emit('room:leave', { code: roomCode });
      socket.disconnect();
    }

    setSocket(null);
    setRoomState(null);
    setRoomCode('');
    setView('join');
>>>>>>> 94e911e2c5920961426dbb809e762ecf642e1d89
  }

  function toggleReady() {
    const myPlayer = roomState?.players?.find(
      (player) => player.userId === user?.userId,
    );

<<<<<<< HEAD
    if (!socket.connected || !myPlayer) return;
=======
    if (!socket?.connected || !myPlayer) return;
>>>>>>> 94e911e2c5920961426dbb809e762ecf642e1d89

    socket.emit('room:set_ready', {
      code: roomCode,
      isReady: !myPlayer.isReady,
    });
  }

  function startTournament() {
<<<<<<< HEAD
    socket.emit('tournament:start', { code: roomCode });
  }

  function kickPlayer(targetUserId) {
    socket.emit('room:kick', { code: roomCode, targetUserId });
=======
    socket?.emit('tournament:start', { code: roomCode });
  }

  function kickPlayer(targetUserId) {
    socket?.emit('room:kick', { code: roomCode, targetUserId });
>>>>>>> 94e911e2c5920961426dbb809e762ecf642e1d89
  }

  if (!user) {
    return (
      <main className="grid min-h-screen place-items-center bg-blue-900 p-6 text-white">
        {authError || 'Menyiapkan pemain...'}
      </main>
    );
  }

<<<<<<< HEAD
  return (
    <main className="flex min-h-screen justify-center bg-blue-900 p-4 text-white">
      <section className="relative flex h-[min(844px,calc(100vh-2rem))] w-full max-w-[399px] flex-col overflow-hidden rounded-3xl border border-blue-800 bg-[url('/background.png')] bg-cover bg-center text-white shadow-2xl">
=======
  const me = roomState?.me;
  const myPlayer = roomState?.players?.find(
    (player) => player.userId === user.userId,
  );

  return (
    <main className="flex min-h-screen justify-center bg-blue-900 p-4 text-white">
      <section className="relative flex min-h-[min(863px,calc(100vh-2rem))] w-full max-w-md flex-col rounded-3xl border border-blue-800 bg-[url('/background.png')] bg-cover bg-center p-6 text-white shadow-2xl">
        {view !== 'lobby' && (
          <header className="mb-6 flex items-center justify-between font-['Baloo_2']">
            <button
              type="button"
              onClick={() => setView('join')}
              aria-label="Kembali"
              className="h-14 w-14 rounded-full border-4 border-[#0A1A4A] bg-[#2A4DA8] text-3xl font-bold"
            >
              ‹
            </button>

            <h1 className="text-center text-3xl font-black [text-shadow:2px_2px_0_#0A1A4A]">
              {view === 'join' ? 'GABUNG ROOM' : 'BUAT ROOM'}
            </h1>

            <span className="w-8" />
          </header>
        )}

>>>>>>> 94e911e2c5920961426dbb809e762ecf642e1d89
        {view === 'join' && (
          <JoinRoom
            onSwitchToCreate={() => setView('create')}
            onJoinRoom={enterRoom}
            onToast={setToast}
          />
        )}

        {view === 'create' && (
          <CreateRoom
            user={user}
            onBackToJoin={() => setView('join')}
            onCreated={enterRoom}
          />
        )}

        {view === 'lobby' && (
<<<<<<< HEAD
          <Lobby
            roomCode={roomCode}
            roomState={roomState}
            userId={user.userId}
            onLeave={leaveRoom}
            onToggleReady={toggleReady}
            onKick={kickPlayer}
            onStart={startTournament}
            onToast={setToast}
          />
        )}

        <Toast toast={toast} />
=======
          <div className="flex flex-1 flex-col gap-4 font-['Baloo_2']">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-black">LOBI</h1>
              <button
                type="button"
                onClick={leaveRoom}
                className="rounded-xl bg-white/20 px-4 py-2 font-bold"
              >
                Keluar
              </button>
            </div>

            <p className="text-center text-xl font-black">
              Kode room: {roomCode}
            </p>

            {!roomState ? (
              <p className="text-center">Menghubungkan ke room...</p>
            ) : (
              <>
                <p className="text-center">
                  {roomState.players?.length || 0}/
                  {roomState.room?.maxPlayers || 4} pemain
                </p>

                <div className="space-y-2">
                  {(roomState.players || []).map((player) => (
                    <div
                      key={player.userId}
                      className="flex items-center justify-between rounded-xl bg-white/20 p-3"
                    >
                      <span>
                        {player.name}
                        {player.isHost ? ' 👑' : ''}
                        {' — '}
                        {player.isReady ? 'SIAP' : 'MENUNGGU'}
                      </span>

                      {me?.isHost && !player.isHost && (
                        <button
                          type="button"
                          onClick={() => kickPlayer(player.userId)}
                          className="rounded-lg bg-red-500 px-2 py-1 font-bold"
                        >
                          Keluarkan
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={toggleReady}
                  className="rounded-xl bg-[#FFB619] p-3 font-black text-blue-950"
                >
                  {myPlayer?.isReady ? 'BATAL SIAP' : 'SIAP'}
                </button>

                {me?.isHost && (
                  <button
                    type="button"
                    onClick={startTournament}
                    className="rounded-xl bg-[#FFE96B] p-3 font-black text-blue-950"
                  >
                    MULAI TURNAMEN
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {toast && (
          <div
            role="status"
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border-2 border-[#0A1A4A] bg-white px-5 py-3 font-bold text-[#0A1A4A] shadow-lg"
          >
            {toast}
          </div>
        )}
>>>>>>> 94e911e2c5920961426dbb809e762ecf642e1d89
      </section>
    </main>
  );
}