

import ArenaScene from './ArenaScene';

export default function ArenaScreen({
  round,
  timeLeft,
  scores,
  myKey,
  players,
  onPunch,
  toast,
  boom,
  heldSlots,
  waiting,
  stunned,
  eventLog = [],
  logStep = 0,
  fighters,
  walkFrame,
  speed,
  timeUp = false,
  fadeDuration = 650,
  punchPending = false,
  punchSequence = 0,
  predictLocal = false,
  hasFullRoom = true,
}) {
  return (
    <ArenaScene
      round={round}
      timeLeft={timeLeft}
      scores={scores}
      myKey={myKey}
      players={players}
      fighters={fighters}
      walkFrame={walkFrame}
      speed={speed}
      timeUp={timeUp}
      fadeDuration={fadeDuration}
      punchPending={punchPending}
      punchSequence={punchSequence}
      predictLocal={predictLocal}
      hasFullRoom={hasFullRoom}
      onPunch={onPunch}
      toast={toast}
      boom={boom}
      heldSlots={heldSlots}
      waiting={waiting}
      stunned={stunned}
      eventLog={eventLog}
      logStep={logStep}
    />
  );
}
