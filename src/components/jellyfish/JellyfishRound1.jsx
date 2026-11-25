import latarLaut from '../../assets/game/jellyfish/latar-laut.svg';
import dasarLaut from '../../assets/game/jellyfish/dasar-laut.svg';
import jaring from '../../assets/game/jellyfish/jaring.svg';
import uburL from '../../assets/game/jellyfish/ubur-ubur-l-a.svg';
import uburS from '../../assets/game/jellyfish/ubur-ubur-s.svg';
import exitHalo from '../../assets/game/jellyfish/exit-halo.svg';
import joystickCincin from '../../assets/game/jellyfish/joystick-cincin.svg';
import joystickKnob from '../../assets/game/jellyfish/joystick-knob.svg';
import { COLOR_HEX } from '../../config/playerColors';
import { EXIT_POS, JELLY_COLORS, PLAYER_DEFS } from './jellyfishScenario';
import { useJellyfishRound } from './useJellyfishRound';

export default function JellyfishRound1({
  isHost = false,
  onExit,
  roomCode = '',
  userId = '',
  snapshot = null,
  requestResult = null,
}) {
  const {
    joystickRef,
    joystickActive,
    knobPos,
    handleJoystickPointerDown,
    handleJoystickPointerMove,
    resetJoystick,
    handleLepas,
    me,
    targets,
    otherPlayers,
    jellies,
    timeLeft,
    statusText,
    roundOver,
    deadlock,
    finishOrder,
    myScore,
    myRoundDeadlocks,
    totalRoundRejected,
    scoreFor,
  } = useJellyfishRound({ roomCode, userId, snapshot, requestResult, roundNumber: 1 });

  const roundActive = snapshot?.round === 1;

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0d6bd1] font-['Roboto',sans-serif]">
      <img src={latarLaut} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="relative z-10 flex h-full flex-col px-[8px] pb-[8px] pt-[6px]">
        <div className="flex gap-[7px]">
          {otherPlayers.map((p) => {
            const def = PLAYER_DEFS.find((d) => d.id === p.playerKey) || {};
            return (
              <div key={p.userId} className="flex h-[56px] flex-1 flex-col justify-center rounded-[12px] border-2 bg-[rgba(10,79,166,0.78)] px-[8px] py-[6px]" style={{ borderColor: COLOR_HEX[p.avatarColor] || def.color || '#4f8cff' }}>
                <div className="flex items-center gap-[4px] text-[11px] font-black leading-normal">
                  <span className="text-white">{p.name || def.name} · skor</span>
                  <span className="text-[#ffd447]">{scoreFor(p)}</span>
                </div>
                <div className="flex items-center gap-[4px] text-[10px] leading-normal">
                  <span className="text-[#d8ecff]">tangkap</span>
                  <span className="text-[11px] font-bold text-white">{p.held?.length || 0}/6</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-[6px] flex items-center justify-center gap-1 text-[12px] font-bold leading-normal text-white">
          <span>Ronde 1 · Bebas rebut · </span>
          <span className="font-black text-[#ffd447]">{roundActive ? timeLeft : ROUND_SECONDS_FALLBACK}</span>
          <span> dtk</span>
        </div>

        <div className="relative mx-auto mt-[6px] w-full max-w-[374px] flex-1 overflow-hidden rounded-[18px] border-[1.5px] border-white bg-white/[0.06]" style={{ minHeight: 320 }}>
          <img src={dasarLaut} alt="" className="absolute bottom-0 left-0 h-[130px] w-full object-cover" />
          <img src={exitHalo} alt="" className="absolute" style={{ left: EXIT_POS.x - 42, top: EXIT_POS.y - 42, width: 84, height: 84 }} />
          <div className="absolute flex flex-col items-center justify-center rounded-full border-[3px] border-[#ffd447] bg-[#fff6c0] text-[#6b4e10]" style={{ left: EXIT_POS.x - 29, top: EXIT_POS.y - 29, width: 58, height: 58 }}>
            <span className="text-[12px] font-black leading-none">EXIT</span>
            <span className="text-[11px] leading-none">gate</span>
          </div>

          {jellies.map((j) => !j.owner && (
            <div
              key={j.id}
              className="jelly-swim absolute"
              style={{
                left: j.x - 36, top: j.y - 40, width: 72, height: 80,
                animationDuration: `${2.4 + (j.id % 5) * 0.35}s`,
                animationDelay: `${-(j.id * 0.23)}s`,
                transition: 'left 140ms linear, top 140ms linear',
              }}
            >
              <img src={uburL} alt="" className="absolute left-[7.48px] top-[9.28px] h-[65.72px] w-[59.52px]" />
              <div className="absolute left-[25px] top-[21px] flex h-[22px] w-[22px] items-center justify-center rounded-[11px] border-[3px] bg-white" style={{ borderColor: JELLY_COLORS[j.id] || '#4f8cff' }}>
                <span className="text-[11px] font-bold text-[#06203a]">{j.id}</span>
              </div>
            </div>
          ))}

          {(snapshot?.players || []).map((p) => {
            const def = PLAYER_DEFS.find((d) => d.id === p.playerKey) || {};
            const isMe = p.userId === userId;
            const x = isMe && me ? me.x : p.x;
            const y = isMe && me ? me.y : p.y;
            return (
              <div key={p.userId} className="absolute transition-[left,top] duration-100" style={{ left: x - 31, top: y - 46, width: 62, height: 92, opacity: p.exited ? 0.45 : 1 }}>
                <img src={jaring} alt="" className="absolute left-[14px] top-px h-[86px] w-[43px]" />
                <div className="absolute left-px top-[55px] flex h-[34px] w-[34px] items-center justify-center rounded-full border-[3px] border-white text-[9px] font-bold" style={{ background: COLOR_HEX[p.avatarColor] || def.color || '#4f8cff', color: def.text || '#fff' }}>
                  {p.name || def.name}
                </div>
              </div>
            );
          })}

          {statusText && !deadlock && (
            <div className="absolute left-1/2 top-[8px] -translate-x-1/2 rounded-full bg-[rgba(6,32,58,0.7)] px-3 py-1 text-center text-[11px] font-bold text-white">
              {statusText}
            </div>
          )}
          {deadlock && (
            <div className="absolute left-1/2 top-[38px] w-[calc(100%-24px)] -translate-x-1/2 rounded-[12px] border-2 border-[#ff6b6b] bg-[#b91c1c]/92 px-3 py-2 text-center text-white shadow-lg">
              <p className="text-[12px] font-black">DEADLOCK: siklus terdeteksi</p>
              <p className="mt-0.5 text-[10px] font-bold text-[#ffe3e3]">
                Tekan LEPAS untuk recovery manual · Otomatis pulih 2 detik
              </p>
              <p className="mt-0.5 text-[10px] text-[#ffd6d6]">Terlibat: {deadlock.cycleIds.map((id) => (snapshot?.players || []).find((p) => p.userId === id)?.name || id).join(' → ')}</p>
            </div>
          )}
          {roundOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.35)]">
              <div className="rounded-[16px] border-2 border-white bg-[rgba(10,79,166,0.9)] px-5 py-4 text-center text-white">
                <p className="text-[20px] font-black">Ronde 1 selesai</p>
                <p className="mt-1 text-[12px]">Skor {me?.name || 'Merah'}: {myScore} · Deadlock: {myRoundDeadlocks}</p>
                <p className="text-[11px] text-[#d8ecff]">Selesai: {finishOrder.length}/4 · Ditolak: {totalRoundRejected}</p>
                {isHost && onExit ? (
                  <button type="button" onClick={onExit} className="mt-3 rounded-[12px] border-2 border-white bg-[#3ddc84] px-4 py-2 text-[13px] font-black text-[#06241a]">
                    Lanjut
                  </button>
                ) : (
                  <p className="mt-3 text-[12px] font-bold text-[#d8ecff]">Menunggu host melanjutkan...</p>
                )}
              </div>
            </div>
          )}
          {!roundActive && !roundOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.2)]">
              <div className="rounded-[14px] bg-[rgba(10,79,166,0.88)] px-4 py-3 text-center text-white">
                <p className="text-[14px] font-bold">Menunggu ronde dimulai...</p>
              </div>
            </div>
          )}
        </div>

        <div className="mx-auto mt-[6px] w-full max-w-[374px] rounded-[14px] border-2 border-[#4f8cff] bg-[rgba(10,79,166,0.78)] px-[8px] py-[6px]">
          <div className="flex items-center justify-center gap-1 text-[12px] font-black text-white">
            <span>Kamu ({me?.name || 'Merah'}) · skor</span>
            <span className="text-[#ffd447]">{myScore}</span>
          </div>
          <div className="mt-1 flex items-start justify-center gap-[12px]">
            {targets.map((n) => {
              const got = (me?.held || []).includes(n);
              return (
                <div key={n} className={`flex flex-col items-center ${got ? 'opacity-35' : ''}`}>
                  <img src={uburS} alt="" className="h-[23.32px] w-[21.12px]" />
                  <span className="text-[10px] font-bold text-white">{n}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div
              ref={joystickRef}
              className="relative h-[72px] w-[72px] select-none touch-none"
              onPointerDown={handleJoystickPointerDown}
              onPointerMove={handleJoystickPointerMove}
              onPointerUp={resetJoystick}
              onPointerCancel={resetJoystick}
            >
              <img src={joystickCincin} alt="" className="absolute inset-0 h-full w-full" />
              <img src={joystickKnob} alt="" className="absolute h-[30px] w-[30px]" style={{ left: 21 + knobPos.x, top: 21 + knobPos.y }} />
              {!joystickActive && (
                <>
                  <span className="pointer-events-none absolute left-1/2 top-[8px] -translate-x-1/2 text-[12px] font-bold leading-none text-white/80">↑</span>
                  <span className="pointer-events-none absolute bottom-[8px] left-1/2 -translate-x-1/2 text-[12px] font-bold leading-none text-white/80">↓</span>
                  <span className="pointer-events-none absolute left-[8px] top-1/2 -translate-y-1/2 text-[12px] font-bold leading-none text-white/80">←</span>
                  <span className="pointer-events-none absolute right-[8px] top-1/2 -translate-y-1/2 text-[12px] font-bold leading-none text-white/80">→</span>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={handleLepas}
              className={`flex h-[56px] w-[56px] items-center justify-center rounded-full border-2 text-[12px] font-bold text-white active:bg-white/10 ${deadlock ? 'border-[#ff6b6b] bg-[#e23b3b]/80 animate-pulse' : 'border-[#4f8cff] bg-transparent'}`}
            >
              Lepas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const ROUND_SECONDS_FALLBACK = 30;

