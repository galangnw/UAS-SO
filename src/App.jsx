import { useEffect, useRef, useState } from 'react';
import { api } from './lib/api';
import { socket } from './lib/socket';
import CreateRoom from './components/CreateRoom';
import JoinRoom from './components/JoinRoom';
import Lobby from './components/Lobby';
import Toast from './components/Toast';
import ResponsiveStage from './components/ResponsiveStage';
import PurpleGame from './components/purplegame/PurpleGame';
import JellyfishHome from './components/jellyfish/JellyfishHome';
import JellyfishRound1Briefing from './components/jellyfish/JellyfishRound1Briefing';
import JellyfishRound1 from './components/jellyfish/JellyfishRound1';
import JellyfishRound2Briefing from './components/jellyfish/JellyfishRound2Briefing';
import JellyfishRound2 from './components/jellyfish/JellyfishRound2';
import JellyfishRound3Briefing from './components/jellyfish/JellyfishRound3Briefing';
import JellyfishRound3 from './components/jellyfish/JellyfishRound3';
import JellyfishHasilAkhir from './components/jellyfish/JellyfishHasilAkhir';
import OverallScore from './components/final/OverallScore';
import GameLoading from './components/GameLoading';

// (dev mode removed - game runs in main flow)

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('join');
  const [roomCode, setRoomCode] = useState('');
  const [roomState, setRoomState] = useState(null);
  const [toast, setToast] = useState('');
  const [authError, setAuthError] = useState('');
  const [jellyfishSnapshot, setJellyfishSnapshot] = useState(null);
  const [jellyfishRequestResult, setJellyfishRequestResult] = useState(null);
  const [jellyfishGameEnd, setJellyfishGameEnd] = useState(null);
  const [finalScore, setFinalScore] = useState(null);
  const leavingRef = useRef(false);
  const jellyfishSnapshotRef = useRef(null);
  const jellyfishJoinedRef = useRef('');

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

        // Backend yang menetapkan nama (Merah/Hijau/Biru/Kuning) berdasarkan
        // warna kursi saat pemain join room.
        const guest = await api('/auth/guest', {
          method: 'POST',
          body: JSON.stringify({
            name: 'Merah',
            avatarColor: 'merah',
          }),
        });

        localStorage.setItem('kernel-clash-user', JSON.stringify(guest));
        localStorage.setItem('userId', guest.userId);

        if (!cancelled) setUser(guest);
      } catch (err) {
        if (cancelled) return;

        setAuthError(err.message || 'Backend belum tersedia.');
        setUser({
          name: 'Merah',
          avatarColor: 'merah',
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
    if (user?.userId) {
      localStorage.setItem('kernel-clash-user', JSON.stringify(user));
    }
  }, [user]);

  useEffect(() => {
    if (!toast) return undefined;

    const timer = setTimeout(() => setToast(''), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!jellyfishRequestResult) return undefined;
    const timer = setTimeout(() => setJellyfishRequestResult(null), 2200);
    return () => clearTimeout(timer);
  }, [jellyfishRequestResult]);

  // Join once per room. Re-emitting on every view change can race the first
  // round start and deliver a stale idle snapshot over the live state.
  // Reconnects are handled in the main socket handler after re-authentication.
  useEffect(() => {
    if (!roomCode || !user?.userId) return;
    if (jellyfishJoinedRef.current === roomCode) return;

    jellyfishJoinedRef.current = roomCode;
    if (socket.connected) {
      socket.emit('jellyfish:join', { code: roomCode });
    }
  }, [roomCode, user?.userId]);

  // Permainan hanya dimulai ketika host menekan tombol MULAI.
  // Tombol SIAP tamu tidak boleh memicu transisi otomatis.
  useEffect(() => {
    if (!roomCode || !user?.userId) return undefined;

    const clearJellyfishState = () => {
      jellyfishSnapshotRef.current = null;
      setJellyfishSnapshot(null);
      setJellyfishRequestResult(null);
      setJellyfishGameEnd(null);
      setFinalScore(null);
    };

    // A late idle/briefing snapshot must never overwrite a live round.
    const statusRank = {
      idle: 0,
      briefing: 1,
      playing: 2,
      deadlock_recovery: 2,
      round_end: 3,
      game_end: 4,
    };
    const isStaleJellyfishSnapshot = (current, incoming) => {
      if (!current) return false;
      const currentRound = Number(current.round) || 0;
      const incomingRound = Number(incoming?.round) || 0;
      if (incomingRound < currentRound) return true;
      if (incomingRound > currentRound) return false;
      return (
        (statusRank[incoming?.status] ?? 0) < (statusRank[current.status] ?? 0)
      );
    };

    const handleConnect = ({ reconnect = false } = {}) => {
      socket.emit('auth', user.userId);
      socket.emit('room:join', { code: roomCode });
      // The initial join is emitted by the room-scoped effect above. Only a
      // real reconnect needs to re-join after re-authentication.
      if (reconnect && jellyfishJoinedRef.current === roomCode) {
        socket.emit('jellyfish:join', { code: roomCode });
      }
    };

    const handleSocketConnect = () => handleConnect({ reconnect: true });

    const handleRoomState = (state) => {
      setRoomState(state);
      const me = state?.players?.find(
        (player) => player.userId === user?.userId,
      );
      if (!me) return;

      setUser((current) => {
        if (!current) return current;
        if (
          current.name === me.name &&
          current.avatarColor === me.avatarColor
        ) {
          return current;
        }
        return {
          ...current,
          name: me.name,
          avatarColor: me.avatarColor,
        };
      });
    };

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
      clearJellyfishState();
      jellyfishJoinedRef.current = '';
      setRoomState(null);
      setRoomCode('');
      setView('join');
    };

    const handleDisbanded = () => {
      setToast('Room telah dibubarkan.');
      clearJellyfishState();
      jellyfishJoinedRef.current = '';
      setRoomState(null);
      setRoomCode('');
      setView('join');
    };

    let startTimer;
    let gameLoadTimer;
    const openGameWithLoading = () => {
      clearTimeout(gameLoadTimer);
      clearJellyfishState();
      setView('game-loading');
      gameLoadTimer = setTimeout(() => setView('game'), 1800);
    };

    const handleTournamentStarting = (payload) => {
      const countdown = Number(payload?.countdown ?? 3);
      setToast({
        type: 'info',
        message: `Game dimulai dalam ${countdown}...`,
      });
      clearTimeout(startTimer);
      startTimer = setTimeout(openGameWithLoading, Math.max(0, countdown) * 1000);
    };

    const handleTournamentStarted = () => {
      clearTimeout(startTimer);
      openGameWithLoading();
    };

    const shouldIgnoreBriefing = (round) => {
      const snap = jellyfishSnapshotRef.current;
      if (!snap) return false;
      if (snap.round > round) return true;
      if (snap.round === round && ['playing', 'deadlock_recovery', 'round_end', 'game_end'].includes(snap.status)) return true;
      return false;
    };

    const handleJellyfishBriefingR1 = () => {
      if (shouldIgnoreBriefing(1)) return;
      setView('jellyfish-briefing-r1');
    };

    const handleJellyfishRound1Start = () => {
      setView('jellyfish-round1');
    };

    const handleJellyfishBriefingR2 = () => {
      if (shouldIgnoreBriefing(2)) return;
      setView('jellyfish-briefing-r2');
    };

    const handleJellyfishRound2Start = () => {
      setView('jellyfish-round2');
    };

    const handleJellyfishBriefingR3 = () => {
      if (shouldIgnoreBriefing(3)) return;
      setView('jellyfish-briefing-r3');
    };

    const handleJellyfishRound3Start = () => {
      setView('jellyfish-round3');
    };

    const handleJellyfishHasil = () => {
      setView('jellyfish-hasil-akhir');
    };

    const sameRoom = (payload) => {
      const code = String(payload?.code || '').toUpperCase();
      return code && code === String(roomCode || '').toUpperCase();
    };

    const handleJellyfishRoundStart = (payload) => {
      if (!sameRoom(payload)) return;
      const round = Number(payload?.round);
      if (![1, 2, 3].includes(round)) return;
      setJellyfishRequestResult(null);
      // The server emits the live snapshot before this transition event, so
      // the round view now starts with real player/jelly data.
      setView(`jellyfish-round${round}`);
    };

    const handleJellyfishState = (payload) => {
      if (!sameRoom(payload)) return;
      if (isStaleJellyfishSnapshot(jellyfishSnapshotRef.current, payload)) {
        return;
      }
      jellyfishSnapshotRef.current = payload;
      setJellyfishSnapshot(payload);
    };

    const handleJellyfishRequestResult = (payload) => {
      if (!sameRoom(payload)) return;
      setJellyfishRequestResult({ ...payload, at: Date.now() });
    };

    const handleJellyfishGameEnd = (payload) => {
      if (!payload) return;
      const hasFinal = Array.isArray(payload.finalStandings) || Array.isArray(payload.standings);
      if (!sameRoom(payload) && !hasFinal) {
        console.warn('[jellyfish] ignored game_end payload', payload?.code, roomCode);
        return;
      }
      console.log('[jellyfish] game_end received', payload);
      setJellyfishGameEnd(payload);
      setView('jellyfish-hasil-akhir');
    };

    const handleFinalScoreShow = (payload) => {
      if (!sameRoom(payload)) return;
      setFinalScore(payload);
      setView('overall-score');
    };

    const handleFinalLobby = () => {
      clearJellyfishState();
      setView('lobby');
    };

    const handleConnectError = () => {
      setToast('Koneksi ke server room gagal.');
    };

    socket.on('connect', handleSocketConnect);
    socket.on('connect_error', handleConnectError);
    socket.on('room:state', handleRoomState);
    socket.on('room:player_joined', handlePlayerJoined);
    socket.on('room:player_left', handlePlayerLeft);
    socket.on('room:player_ready', handlePlayerReady);
    socket.on('room:kicked', handleKicked);
    socket.on('room:disbanded', handleDisbanded);
    socket.on('tournament:starting', handleTournamentStarting);
    socket.on('tournament:started', handleTournamentStarted);
    socket.on('jellyfish:briefing_r1:show', handleJellyfishBriefingR1);
    socket.on('jellyfish:round1:start', handleJellyfishRound1Start);
    socket.on('jellyfish:briefing_r2:show', handleJellyfishBriefingR2);
    socket.on('jellyfish:round2:start', handleJellyfishRound2Start);
    socket.on('jellyfish:briefing_r3:show', handleJellyfishBriefingR3);
    socket.on('jellyfish:round3:start', handleJellyfishRound3Start);
    socket.on('jellyfish:round_start', handleJellyfishRoundStart);
    socket.on('jellyfish:hasil:show', handleJellyfishHasil);
    socket.on('jellyfish:state', handleJellyfishState);
    socket.on('jellyfish:request_result', handleJellyfishRequestResult);
    socket.on('jellyfish:game_end', handleJellyfishGameEnd);
    socket.on('final:score_show', handleFinalScoreShow);
    socket.on('final:lobby', handleFinalLobby);
    socket.on('toast', handleToast);

    if (socket.connected) handleConnect();
    socket.connect();

    return () => {
      clearTimeout(startTimer);
      clearTimeout(gameLoadTimer);
      socket.off('connect', handleSocketConnect);
      socket.off('connect_error', handleConnectError);
      socket.off('room:state', handleRoomState);
      socket.off('room:player_joined', handlePlayerJoined);
      socket.off('room:player_left', handlePlayerLeft);
      socket.off('room:player_ready', handlePlayerReady);
      socket.off('room:kicked', handleKicked);
      socket.off('room:disbanded', handleDisbanded);
      socket.off('tournament:starting', handleTournamentStarting);
      socket.off('tournament:started', handleTournamentStarted);
      socket.off('jellyfish:briefing_r1:show', handleJellyfishBriefingR1);
      socket.off('jellyfish:round1:start', handleJellyfishRound1Start);
      socket.off('jellyfish:briefing_r2:show', handleJellyfishBriefingR2);
      socket.off('jellyfish:round2:start', handleJellyfishRound2Start);
      socket.off('jellyfish:briefing_r3:show', handleJellyfishBriefingR3);
      socket.off('jellyfish:round3:start', handleJellyfishRound3Start);
      socket.off('jellyfish:round_start', handleJellyfishRoundStart);
      socket.off('jellyfish:hasil:show', handleJellyfishHasil);
      socket.off('jellyfish:state', handleJellyfishState);
      socket.off('jellyfish:request_result', handleJellyfishRequestResult);
      socket.off('jellyfish:game_end', handleJellyfishGameEnd);
      socket.off('final:score_show', handleFinalScoreShow);
      socket.off('final:lobby', handleFinalLobby);
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
      jellyfishSnapshotRef.current = null;
      jellyfishJoinedRef.current = '';
      setRoomState(null);
      setRoomCode('');
      setJellyfishSnapshot(null);
      setJellyfishRequestResult(null);
      setJellyfishGameEnd(null);
      setFinalScore(null);
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
    if (socket.connected && roomCode && jellyfishJoinedRef.current !== roomCode) {
      jellyfishJoinedRef.current = roomCode;
      socket.emit('jellyfish:join', { code: roomCode });
    }
    setView('jellyfish-home');
  }

  // Jellyfish view transitions are server-driven. The host only sends the
  // command; the server relays the transition after the live state is ready.
  function startJellyfishGame() {
    if (socket.connected && roomCode) {
      socket.emit('jellyfish:briefing_r1:show', { code: roomCode });
    }
  }

  function startJellyfishRound1() {
    if (socket.connected && roomCode) {
      socket.emit('jellyfish:round1:start', { code: roomCode });
    }
  }

  function showJellyfishRound2Briefing() {
    if (socket.connected && roomCode) {
      socket.emit('jellyfish:briefing_r2:show', { code: roomCode });
    }
  }

  function startJellyfishRound2() {
    if (socket.connected && roomCode) {
      socket.emit('jellyfish:round2:start', { code: roomCode });
    }
  }

  function showJellyfishRound3Briefing() {
    if (socket.connected && roomCode) {
      socket.emit('jellyfish:briefing_r3:show', { code: roomCode });
    }
  }

  function startJellyfishRound3() {
    if (socket.connected && roomCode) {
      socket.emit('jellyfish:round3:start', { code: roomCode });
    }
  }

  function showJellyfishHasilAkhir() {
    if (socket.connected && roomCode) {
      socket.emit('jellyfish:hasil:show', { code: roomCode });
    }
  }

  function showFinalScore() {
    setView('overall-score');
    if (socket.connected && roomCode) {
      socket.emit('final:score_show', { code: roomCode });
    }
  }

  function returnToLobby() {
    if (socket.connected && roomCode) {
      socket.emit('final:lobby', { code: roomCode });
    }
  }

  function playAgain() {
    if (socket.connected && roomCode) {
      socket.emit('final:play_again', { code: roomCode });
    }
  }

  if (!user) {
    return (
      <main className="flex h-dvh w-full items-center justify-center overflow-hidden bg-blue-900 p-4 text-white">
        <ResponsiveStage>
          {authError ? (
            <div className="grid h-full w-full place-items-center bg-[rgba(10,20,71,0.9)] text-center text-white">
              <p className="px-6 font-['Baloo_2'] text-[18px] font-bold">{authError}</p>
            </div>
          ) : (
            <GameLoading />
          )}
        </ResponsiveStage>
      </main>
    );
  }

  return (
    <main className="flex h-dvh w-full items-center justify-center overflow-hidden bg-blue-900 p-4 text-white">
      <ResponsiveStage>
        <section className="relative flex h-full w-full flex-col overflow-hidden rounded-3xl border border-blue-800 bg-[url('/background.png')] bg-cover bg-center text-white shadow-2xl">
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

        {view === 'game-loading' && (
          <GameLoading />
        )}

        {view === 'game' && (
          <PurpleGame
            roomCode={roomCode}
            roomState={roomState}
            userId={user.userId}
            onExit={exitGame}
          />
        )}

        {view === 'jellyfish-home' && (
          <JellyfishHome
            isHost={Boolean(
              roomState?.me?.isHost ??
                roomState?.players?.find((p) => p.userId === user?.userId)
                  ?.isHost,
            )}
            onStart={startJellyfishGame}
            playerCount={roomState?.players?.length || 0}
          />
        )}

        {view === 'jellyfish-briefing-r1' && (
          <JellyfishRound1Briefing
            isHost={Boolean(
              roomState?.me?.isHost ??
                roomState?.players?.find((p) => p.userId === user?.userId)
                  ?.isHost,
            )}
            onStart={startJellyfishRound1}
          />
        )}

        {view === 'jellyfish-round1' && (
          <JellyfishRound1
            isHost={Boolean(
              roomState?.me?.isHost ??
                roomState?.players?.find((p) => p.userId === user?.userId)
                  ?.isHost,
            )}
            roomCode={roomCode}
            userId={user?.userId}
            snapshot={jellyfishSnapshot}
            requestResult={jellyfishRequestResult}
            onExit={showJellyfishRound2Briefing}
          />
        )}

        {view === 'jellyfish-briefing-r2' && (
          <JellyfishRound2Briefing
            isHost={Boolean(
              roomState?.me?.isHost ??
                roomState?.players?.find((p) => p.userId === user?.userId)
                  ?.isHost,
            )}
            onStart={startJellyfishRound2}
          />
        )}

        {view === 'jellyfish-round2' && (
          <JellyfishRound2
            isHost={Boolean(
              roomState?.me?.isHost ??
                roomState?.players?.find((p) => p.userId === user?.userId)
                  ?.isHost,
            )}
            roomCode={roomCode}
            userId={user?.userId}
            snapshot={jellyfishSnapshot}
            requestResult={jellyfishRequestResult}
            onExit={showJellyfishRound3Briefing}
          />
        )}

        {view === 'jellyfish-briefing-r3' && (
          <JellyfishRound3Briefing
            isHost={Boolean(
              roomState?.me?.isHost ??
                roomState?.players?.find((p) => p.userId === user?.userId)
                  ?.isHost,
            )}
            onStart={startJellyfishRound3}
          />
        )}

        {view === 'jellyfish-round3' && (
          <JellyfishRound3
            isHost={Boolean(
              roomState?.me?.isHost ??
                roomState?.players?.find((p) => p.userId === user?.userId)
                  ?.isHost,
            )}
            roomCode={roomCode}
            userId={user?.userId}
            snapshot={jellyfishSnapshot}
            requestResult={jellyfishRequestResult}
            onExit={showJellyfishHasilAkhir}
          />
        )}

        {view === 'jellyfish-hasil-akhir' && (
          <JellyfishHasilAkhir
            isHost={Boolean(
              roomState?.me?.isHost ??
                roomState?.players?.find((p) => p.userId === user?.userId)
                  ?.isHost,
            )}
            gameEnd={jellyfishGameEnd}
            onShowFinalScore={showFinalScore}
          />
        )}

        {view === 'overall-score' && (
          <OverallScore
            payload={finalScore}
            isHost={Boolean(
              roomState?.me?.isHost ??
                roomState?.players?.find((p) => p.userId === user?.userId)
                  ?.isHost,
            )}
            userId={user?.userId}
            onBackToLobby={returnToLobby}
            onPlayAgain={playAgain}
          />
        )}

        <Toast toast={toast} />
        </section>
      </ResponsiveStage>
    </main>
  );
}
