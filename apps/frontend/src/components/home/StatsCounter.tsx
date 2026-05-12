"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  totalStores: number;
  openStores: number;
  segments: number;
}

function useCountUp(target: number, duration = 1800, active: boolean) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active || target === 0) return;
    let start = 0;
    const steps = 60;
    const increment = target / steps;
    const interval = setInterval(() => {
      start += increment;
      if (start >= target) {
        setValue(target);
        clearInterval(interval);
      } else {
        setValue(Math.round(start));
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [target, duration, active]);

  return value;
}

export default function StatsCounter({
  totalStores,
  openStores,
  segments,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const stores = useCountUp(totalStores, 1800, active);
  const open = useCountUp(openStores, 1800, active);
  const segs = useCountUp(segments, 1800, active);

  return (
    <section
      ref={ref}
      className="bg-shopping-dark text-white py-8 px-4 border-b border-white/5"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto text-center">
          <div>
            <p className="font-display text-3xl md:text-4xl font-black text-orange-400">
              {active ? stores : 0}
            </p>
            <p className="text-white/50 text-xs md:text-sm mt-1">Lojas</p>
          </div>
          <div className="border-x border-white/10">
            <p className="font-display text-3xl md:text-4xl font-black text-orange-400">
              {active ? open : 0}
            </p>
            <p className="text-white/50 text-xs md:text-sm mt-1">
              Abertas agora
            </p>
          </div>
          <div>
            <p className="font-display text-3xl md:text-4xl font-black text-orange-400">
              {active ? segs : 0}
            </p>
            <p className="text-white/50 text-xs md:text-sm mt-1">Categorias</p>
          </div>
        </div>
      </div>
    </section>
  );
}
