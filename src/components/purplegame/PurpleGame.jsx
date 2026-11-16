import { useEffect, useMemo, useRef, useState } from 'react';
import { PURPLE_ROUNDS, PLAYERS, initialScores, initialRoundMetrics } from './gameConfig';
import ArenaScreen from './ArenaScreen';
import TimeUpScreen from './TimeUpScreen';
import ResultScreen from './ResultScreen';
import IntroScreen from './IntroScreen';

export default function PurpleGame({ roomState, userId, onExit }) {
  const [phase, setPhase] = useState('intro'); // intro | arena | timeup | result
  const [roundIndex, setRoundIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(PURPLE_ROUNDS[0].duration);
  const [scores, setScores] = useState(initialScores());
  const [roundScores, setRoundScores] = useState(initialRoundMetrics());
  const [boomCount, setBoomCount] = useState(0);
  const [toast, setToast] = useState('');
  const [inRing, setInRing] = useState([]); // player keys currently in critical section/ring
  const [boom, setBoom] = useState(false);
  const [heldSlots, setHeldSlots] = useState([]); // for mutex/semaphore visual
  const [waitIconFor, setWaitIconFor] = useState(null);
  const timerRef = useRef(null);

  const round = PURPLE_ROUNDS[roundIndex];
  const myPlayerIndex = Math.max(0, (roomState?.players || []).findIndex((p) => p.userId === userId));
  const myKey = PLAYERS[myPlayerIndex % 4].key;

  useEffect(() => {
    if (phase !== 'arena') return undefined;
    if (timeLeft <= 0) {
      setPhase('timeup');
      return undefined;
    }
    timerRef.current = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [phase, timeLeft]);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(''), 1500);
    return () => clearTimeout(t);
  }, [toast]);

  function startGame() {
    setPhase('arena');
  }

  function advanceFromTimeUp() {
    if (roundIndex < PURPLE_ROUNDS.length - 1) {
      const next = roundIndex + 1;
      setRoundIndex(next);
      setTimeLeft(PURPLE_ROUNDS[next].duration);
      setInRing([]);
      setHeldSlots([]);
      setBoom(false);
      setPhase('arena');
    } else {
      setPhase('result');
    }
  }

  function recordScore(playerKey, delta) {
    setScores((prev) => ({ ...prev, [playerKey]: prev[playerKey] + delta }));
    setRoundScores((prev) => {
      const copy = { ...prev, [playerKey]: [...prev[playerKey]] };
      copy[playerKey][roundIndex] = Math.max(0, copy[playerKey][roundIndex] + delta);
      return copy;
    });
  }

  function handlePunch(playerKey) {
    if (phase !== 'arena') return;
    const mode = round.mode;
    if (mode === 'tanpa-aturan') {
      setInRing((prev) => {
        const next = [...prev, playerKey];
        if (next.length >= 2) {
          setBoom(true);
          setBoomCount((c) => c + 1);
          setToast('RACE CONDITION! BOOM!');
          // penalty for colliding players in this simplistic model
          next.forEach((k) => recordScore(k, -1));
          setTimeout(() => {
            setBoom(false);
            setInRing([]);
          }, 700);
          return next;
        }
        recordScore(playerKey, 1);
        setTimeout(() => setInRing((cur) => cur.filter((k) => k !== playerKey)), 350);
        return next;
      });
      return;
    }

    if (mode === 'mutex') {
      setHeldSlots((prev) => {
        if (prev.length >= 1) {
          setToast('Kunci sedang dipakai! Tunggu.');
          setWaitIconFor(playerKey);
          setTimeout(() => setWaitIconFor(null), 900);
          return prev;
        }
        const next = [playerKey];
        setInRing([playerKey]);
        recordScore(playerKey, 1);
        setTimeout(() => {
          setHeldSlots([]);
          setInRing([]);
        }, 900);
        return next;
      });
      return;
    }

    if (mode === 'semaphore') {
      setHeldSlots((prev) => {
        if (prev.includes(playerKey)) return prev;
        if (prev.length >= 2) {
          setToast('Gerbang penuh! Tunggu giliran.');
          setWaitIconFor(playerKey);
          setTimeout(() => setWaitIconFor(null), 900);
          return prev;
        }
        const next = [...prev, playerKey];
        setInRing(next);
        recordScore(playerKey, 1);
        setTimeout(() => {
          setHeldSlots((cur) => cur.filter((k) => k !== playerKey));
          setInRing((cur) => cur.filter((k) => k !== playerKey));
        }, 900);
        return next;
      });
    }
  }

  const finalRanking = useMemo(() => {
    const trophy = (i) => roundScores[i[0]].filter((v) => v > 0).length; // simplistic
    return [...PLAYERS]
      .map((p) => ({ ...p, score: scores[p.key], rounds: roundScores[p.key], trophies: trophy([p.key]) }))
      .sort((a, b) => b.score - a.score || b.trophies - a.trophies);
  }, [scores, roundScores]);

  return (
    <div className="flex h-full w-full flex-col font-['Baloo_2']">
      {phase === 'intro' && <IntroScreen onStart={startGame} />}
      {phase === 'arena' && (
        <ArenaScreen
          round={round}
          timeLeft={timeLeft}
          scores={scores}
          myKey={myKey}
          players={roomState?.players || []}
          onPunch={handlePunch}
          toast={toast}
          inRing={inRing}
          boom={boom}
          heldSlots={heldSlots}
          waitIconFor={waitIconFor}
        />
      )}
      {phase === 'timeup' && (
        <TimeUpScreen round={round} onContinue={advanceFromTimeUp} />
      )}
      {phase === 'result' && (
        <ResultScreen ranking={finalRanking} boomCount={boomCount} onExit={onExit} />
      )}
    </div>
  );
}
