import { useEffect } from 'react';

// Figma "Hitung 1" - "Hitung 23": 23 frame identik dengan teks kuning di
// tengah layar. Frame-frame itu dirangkai sebagai animasi berkedip singkat.
const HITUNG_FRAMES = 23;
const FRAME_MS = 100;

export default function CalculatingScreen({ onDone }) {
  useEffect(() => {
    const id = setTimeout(onDone, HITUNG_FRAMES * FRAME_MS);
    return () => clearTimeout(id);
  }, [onDone]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-b from-[rgba(24,4,61,0.96)] to-[rgba(46,9,113,0.96)] font-['Lilita_One']">
      <div className="h-full w-full animate-[hitung-in_300ms_ease-out]">
        <p className="absolute left-[195px] top-[400px] h-[30px] w-[390px] -translate-x-1/2 animate-[hitung-blink_100ms_steps(2,end)_infinite_alternate] text-center text-[26px] leading-[30px] text-[#ffc83d]">
          MENGHITUNG HASIL...
        </p>
      </div>
    </div>
  );
}
