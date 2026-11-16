import { useEffect, useRef, useState } from 'react';
import { api } from './lib/api';
import { socket } from './lib/socket';
import CreateRoom from './components/CreateRoom';
import JoinRoom from './components/JoinRoom';
import Lobby from './components/Lobby';
import Toast from './components/Toast';
import PurpleGame from './components/purplegame/PurpleGame';

function newGuestName() {
  return `Pemain${Math.floor(1000 + Math.random() * 9000)}`;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('join');
  const [roomCode, setRoomCode] = useState('');
  const [roomState, setRoomState] = useState(null);
  const [toast, setToast] = useState('');
  const [authError, setAuthError] = useState('');
  const leavingRef = useRef(false);

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
    if (!roomCode || !user?.userId) return undefined;

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
      if (typeof payload === 'string') {
        setToast(payload);
        return;
      }

      setToast({
        type: payload?.type || 'info',
        message: payload?.message || 'Terjadi kesalahan.',
      });
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

    let startTimer;
    const handleTournamentStarting = (payload) => {
      const countdown = Number(payload?.countdown ?? 3);
      setToast({
        type: 'info',
        message: `Game dimulai dalam ${countdown}...`,
      });
      clearTimeout(startTimer);
      startTimer = setTimeout(() => setView('game'), Math.max(0, countdown) * 1000);
    };

    const handleTournamentStarted = () => {
      clearTimeout(startTimer);
      setView('game');
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
    socket.on('tournament:started', handleTournamentStarted);
    socket.on('toast', handleToast);

    if (socket.connected) handleConnect();
    socket.connect();

    return () => {
      clearTimeout(startTimer);
      socket.off('connect', handleConnect);
      socket.off('connect_error', handleConnectError);
      socket.off('room:state', handleRoomState);
      socket.off('room:player_joined', handlePlayerJoined);
      socket.off('room:player_left', handlePlayerLeft);
      socket.off('room:player_ready', handlePlayerReady);
      socket.off('room:kicked', handleKicked);
      socket.off('room:disbanded', handleDisbanded);
      socket.off('tournament:starting', handleTournamentStarting);
      socket.off('tournament:started', handleTournamentStarted);
      socket.off('toast', handleToast);
      socket.disconnect();
    };
  }, [roomCode, user?.userId]);

  function enterRoom(code) {
    if (!user?.userId) {
      setToast('Room membutuhkan koneksi ke backend.');
      return;
    }

    setRoomState(null);
    setRoomCode(code);
    setView('lobby');
  }

  function leaveRoom() {
    if (leavingRef.current) return;
    leavingRef.current = true;

    if (socket.connected) {
      socket.emit('room:leave', { code: roomCode });
    }

    setTimeout(() => {
      socket.disconnect();
      setRoomState(null);
      setRoomCode('');
      setView('join');
      leavingRef.current = false;
    }, 300);
  }

  function toggleReady() {
    const myPlayer = roomState?.players?.find(
      (player) => player.userId === user?.userId,
    );

    if (!socket.connected || !myPlayer) return;

    socket.emit('room:set_ready', {
      code: roomCode,
      isReady: !myPlayer.isReady,
    });
  }

  function startTournament() {
    socket.emit('tournament:start', { code: roomCode });
  }

  function kickPlayer(targetUserId) {
    socket.emit('room:kick', { code: roomCode, targetUserId });
  }

  function exitGame() {
    setView('lobby');
  }

  if (!user) {
    return (
      <main className="grid min-h-screen place-items-center bg-blue-900 p-6 text-white">
        {authError || 'Menyiapkan pemain...'}
      </main>
    );
  }

  return (
    <main className="flex min-h-screen justify-center bg-blue-900 p-4 text-white">
      <section className="relative flex h-[min(844px,calc(100vh-2rem))] w-full max-w-[399px] flex-col overflow-hidden rounded-3xl border border-blue-800 bg-[url('/background.png')] bg-cover bg-center text-white shadow-2xl">
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

        {view === 'game' && (
          <PurpleGame
            roomState={roomState}
            userId={user.userId}
            onExit={exitGame}
          />
        )}

        <Toast toast={toast} />
      </section>
    </main>
  );
}
