

const ROW_COUNT = 4;

export default function LogKejadian({ events = [], step = 0 }) {
  const total = Math.max(8, step);
  const latestIndex = events.length - 1;
  const rows = Array.from({ length: ROW_COUNT }, (_, index) => events[index]);

  return (
    <div
      className="absolute z-10 flex flex-col items-start gap-[4px] overflow-clip rounded-[12px] border border-black bg-[rgba(35,0,99,0.92)] px-[12px] pb-[10px] pt-[8px] font-['Lilita_One'] leading-[normal] [word-break:break-word] whitespace-nowrap"
      style={{ left: 16, top: 92, width: 358, height: 125 }}
    >
      <div className="flex w-full shrink-0 items-center justify-between overflow-clip">
        <p className="shrink-0 text-[15px] text-[#ffc83d]">LOG KEJADIAN</p>
        <p className="shrink-0 text-[12px] text-[#c5cee1]">
          Langkah {step} / {total}
        </p>
      </div>

      {rows.map((event, index) => {
        const isLatest = index === latestIndex && Boolean(event);
        return (
          <div
            key={index}
            className={`flex w-full shrink-0 items-center gap-[8px] overflow-clip rounded-[6px] px-[6px] py-[2px] text-[12px] ${
              isLatest
                ? 'bg-[rgba(255,200,61,0.2)] text-[#ffc83d]'
                : 'text-white'
            }`}
          >
            <p
              className={`shrink-0 ${isLatest ? '' : 'text-[#c5cee1]'}`}
            >
              {event?.time ?? '\u200b'}
            </p>
            <p className="shrink-0 font-normal">{event?.message ?? '\u200b'}</p>
          </div>
        );
      })}
    </div>
  );
}
