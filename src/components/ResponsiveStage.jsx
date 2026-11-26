

import { useLayoutEffect, useRef, useState } from 'react';

const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;
const MAX_SCALE = 1;

export default function ResponsiveStage({ children }) {
  const viewportRef = useRef(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;

    const updateScale = () => {
      const { width, height } = viewport.getBoundingClientRect();
      if (!width || !height) return;
      const next = Math.min(width / BASE_WIDTH, height / BASE_HEIGHT, MAX_SCALE);
      setScale(Number.isFinite(next) && next > 0 ? next : 1);
    };

    updateScale();

    const observer =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(updateScale)
        : null;
    observer?.observe(viewport);
    window.addEventListener('resize', updateScale);

    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, []);

  return (
    <div
      ref={viewportRef}
      className="relative flex h-full w-full items-center justify-center overflow-hidden"
    >
      <div
        className="relative h-[844px] w-[390px] shrink-0 origin-center"
        style={{ transform: `scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  );
}
