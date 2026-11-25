import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { socket } from '../../lib/socket';
import { REQUIRED_PLAYERS } from '../../config/gameRules';
import { PURPLE_ROUNDS, PLAYERS, initialScores, initialRoundMetrics } from './gameConfig';
import ArenaScreen from './ArenaScreen';
import RuleIntroScreen from './RuleIntroScreen';
import ResultScreen from './ResultScreen';
import CalculatingScreen from './CalculatingScreen';
import SummaryScreen from './SummaryScreen';
import IntroScreen from './IntroScreen';
import SettingsScreen from './SettingsScreen';

const MINIGAME_NUMBER = 1;
const SEMAPHORE_SLOTS = 2;
const EMPTY_PLAYERS = [];

// Socket.IO serialises snapshots to JSON, so every object/array arrives with a
// brand-new reference even when its content did not change. Compare by value
// before calling setState to avoid re-rendering the arena ~20x/sec for nothing.
function deepEqual(a, b) {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
    return false;
  }
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every(
    (key) =>
      Object.prototype.hasOwnProperty.call(b, key) && deepEqual(a[key], b[key]),
  );
}

function initialSnapshotState() {
  return {
    phase: 'intro',
    roundIndex: 0,
    timeLeft: PURPLE_ROUNDS[0].duration,
    scores: initialScores(),
    roundScores: initialRoundMetrics(),
    boomCount: 0,
    boomByRound: PURPLE_ROUNDS.map(() => 0),
    boomByPlayer: initialScores(),
    toast: '',
    inRing: [],
    boom: false,
    heldSlots: [],
    waiting: [],
    stunned: [],
    fighters: PLAYERS.reduce(
      (acc, player) => ({ ...acc, [player.key]: { step: 0, walking: true } }),
      {},
    ),
    walkFrame: 1,
    timeUpActive: false,
    eventLog: [],
    logStep: 0,
  };
}

export default function PurpleGame({ roomCode, roomState, userId, onExit }) {
  const [snap, setSnap] = useState(initialSnapshotState);
  const [showSettings, setShowSettings] = useState(false);
  const [walkFrame, setWalkFrame] = useState(1);
  const [punchPending, setPunchPending] = useState(false);
  const [punchSequence, setPunchSequence] = useState(0);

  const snapRef = useRef(initialSnapshotState());
  const pendingPunchRef = useRef(false);
  const punchPendingTimerRef = useRef(null);

  const roomPlayers = roomState?.players || EMPTY_PLAYERS;
  const meInfo = roomState?.me || {};
  const myId = meInfo.userId || userId;
  const me = roomPlayers.find((player) => player.userId === myId);
  const isHost = meInfo.isHost ?? Boolean(me?.isHost);

  // Warna kursi berasal dari server (avatarColor), bukan index lokal.
  const roster = useMemo(() => {
    if (!roomPlayers.length) return PLAYERS;
    return roomPlayers.map((player) => {
      const seat =
        PLAYERS.find((item) => item.key === player.avatarColor) || PLAYERS[0];
      return {
        ...seat,
        userId: player.userId,
        name: player.name,
        avatarColor: player.avatarColor,
      };
    });
  }, [roomPlayers]);
  const myKey = me?.avatarColor || PLAYERS[0].key;
  const hasFullRoom = roomPlayers.length >= REQUIRED_PLAYERS;

  const displayRound = useMemo(
    () => ({
      ...PURPLE_ROUNDS[snap.roundIndex],
      locks: snap.roundIndex === 2 ? SEMAPHORE_SLOTS : PURPLE_ROUNDS[snap.roundIndex].locks,
    }),
    [snap.roundIndex],
  );

  const clearPunchPending = useCallback(() => {
    if (punchPendingTimerRef.current) clearTimeout(punchPendingTimerRef.current);
    punchPendingTimerRef.current = null;
    pendingPunchRef.current = false;
    setPunchPending(false);
  }, []);

  const command = useCallback(
    (type, extra = {}) => {
      if (!socket.connected || !roomCode) return;
      socket.emit('minigame:command', {
        code: roomCode,
        minigame: MINIGAME_NUMBER,
        type,
        ...extra,
      });
    },
    [roomCode],
  );

  // Single source of truth: the backend runs the whole simulation and sends
  // identical snapshots to every seat. No browser runs game logic locally.
  useEffect(() => {
    const applyState = (payload) => {
      if (
        payload?.code &&
        String(payload.code).toUpperCase() !== String(roomCode || '').toUpperCase()
      ) {
        return;
      }
      if (payload?.minigame && payload.minigame !== MINIGAME_NUMBER) return;
      const next = payload?.state;
      if (!next || typeof next.phase !== 'string') return;
      if (deepEqual(snapRef.current, next)) return;

      snapRef.current = next;
      setSnap(next);

      const authoritativeMine = myKey ? next.fighters?.[myKey] : null;
      if (
        pendingPunchRef.current &&
        authoritativeMine &&
        (authoritativeMine.step > 0 || !authoritativeMine.walking)
      ) {
        clearPunchPending();
      }
      if (next.phase !== 'arena') clearPunchPending();
    };

    const sync = () => {
      if (socket.connected && roomCode) {
        socket.emit('minigame:command', {
          code: roomCode,
          minigame: MINIGAME_NUMBER,
          type: 'sync',
        });
      }
    };

    socket.on('minigame:state', applyState);
    socket.on('connect', sync);
    sync();
    return () => {
      socket.off('minigame:state', applyState);
      socket.off('connect', sync);
    };
  }, [clearPunchPending, myKey, roomCode]);

  // Walk poses are cosmetic and run locally; positions always come from the
  // authoritative `fighters` field.
  useEffect(() => {
    if (snap.phase !== 'arena' && snap.phase !== 'rule') return undefined;
    const id = setInterval(() => setWalkFrame((frame) => (frame % 4) + 1), 320);
    return () => clearInterval(id);
  }, [snap.phase]);

  useEffect(
    () => () => {
      if (punchPendingTimerRef.current) clearTimeout(punchPendingTimerRef.current);
    },
    [],
  );

  const handlePunch = useCallback(() => {
    if (!hasFullRoom || snap.phase !== 'arena' || snap.timeUpActive) return;
    const mine = snap.fighters?.[myKey];
    if (!mine || mine.step !== 0 || !mine.walking) return;
    if (snap.stunned.includes(myKey)) return;

    // Instant button feedback only. The backend decides whether this punch
    // reaches the ring, gets blocked at the gate, or triggers a BOOM.
    pendingPunchRef.current = true;
    setPunchPending(true);
    setPunchSequence((value) => value + 1);
    if (punchPendingTimerRef.current) clearTimeout(punchPendingTimerRef.current);
    punchPendingTimerRef.current = setTimeout(() => {
      punchPendingTimerRef.current = null;
      pendingPunchRef.current = false;
      setPunchPending(false);
    }, 600);

    socket.emit('minigame:input', {
      code: roomCode,
      minigame: MINIGAME_NUMBER,
      type: 'punch',
      key: myKey,
      userId: myId,
    });
  }, [hasFullRoom, myId, myKey, roomCode, snap.fighters, snap.phase, snap.stunned, snap.timeUpActive]);

  const finalRanking = useMemo(() => {
    const trophy = (key) => snap.roundScores[key].filter((value) => value > 0).length;
    return [...roster]
      .map((player) => ({
        ...player,
        score: snap.scores[player.key] ?? 0,
        rounds: snap.roundScores[player.key] ?? [0, 0, 0],
        trophies: trophy(player.key),
      }))
      .sort((a, b) => b.score - a.score || b.trophies - a.trophies);
  }, [roster, snap.roundScores, snap.scores]);

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden font-['Lilita_One']">
      {snap.phase === 'intro' && !showSettings && (
        <IntroScreen
          onStart={() => {
            if (isHost) setShowSettings(true);
          }}
          isHost={isHost}
        />
      )}
      {snap.phase === 'intro' && showSettings && isHost && (
        <SettingsScreen
          onBack={() => setShowSettings(false)}
          onStart={({ duration }) => {
            setShowSettings(false);
            command('start', { duration });
          }}
        />
      )}
      {snap.phase === 'rule' && (
        <RuleIntroScreen
          round={displayRound}
          timeLeft={snap.timeLeft}
          scores={snap.scores}
          myKey={myKey}
          players={roster}
          onStart={() => command('begin_round')}
          isHost={isHost}
        />
      )}
      {snap.phase === 'arena' && (
        <ArenaScreen
          round={displayRound}
          timeLeft={snap.timeLeft}
          scores={snap.scores}
          myKey={myKey}
          players={roster}
          onPunch={handlePunch}
          toast={snap.toast}
          boom={snap.boom}
          heldSlots={snap.heldSlots}
          waiting={snap.waiting}
          stunned={snap.stunned}
          eventLog={snap.eventLog}
          logStep={snap.logStep}
          fighters={snap.fighters}
          walkFrame={walkFrame}
          speed={1}
          timeUp={snap.timeUpActive}
          punchPending={punchPending}
          punchSequence={punchSequence}
          predictLocal
          hasFullRoom={hasFullRoom}
        />
      )}
      {snap.phase === 'calculating' && (
        <CalculatingScreen onDone={() => command('calculated')} />
      )}
      {snap.phase === 'result' && (
        <ResultScreen
          ranking={finalRanking}
          boomCount={snap.boomCount}
          boomByPlayer={snap.boomByPlayer}
          onOpenSummary={() => command('summary')}
          onExit={onExit}
        />
      )}
      {snap.phase === 'summary' && (
        <SummaryScreen
          rounds={PURPLE_ROUNDS}
          boomByRound={snap.boomByRound}
          roundScores={snap.roundScores}
          onBack={() => command('result')}
        />
      )}
    </div>
  );
}
