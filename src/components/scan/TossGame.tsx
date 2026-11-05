"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { playHitSound, playTossSound } from "@/lib/audio";
import { IconPackage, IconTarget, IconCan } from "@/components/icons/AppIcons";

type Props = {
  attemptsLeft: number;
  busy: boolean;
  onAttempt: () => Promise<void>;
  onSuccess: () => void;
  onGiveUp: () => void;
};

type Vec = { x: number; y: number };

export default function TossGame({ attemptsLeft, busy, onAttempt, onSuccess, onGiveUp }: Props) {
  const areaRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{
    active: boolean;
    rect: DOMRect | null;
    samples: { p: Vec; t: number }[];
  }>({ active: false, rect: null, samples: [] });
  const rafRef = useRef<number | null>(null);
  const [pos, setPos] = useState<Vec>({ x: 0.5, y: 0.86 });
  const [flying, setFlying] = useState(false);
  const [scale, setScale] = useState(1);
  const [zoneX, setZoneX] = useState(0.5);
  const [message, setMessage] = useState("Drag the can and flick it into the green zone.");
  const dirRef = useRef(1);

  // gently drifting target zone with smooth delta-time interpolation
  useEffect(() => {
    let lastDrift = performance.now();
    const id = setInterval(() => {
      const now = performance.now();
      const elapsed = Math.min(100, Math.max(16, now - lastDrift));
      lastDrift = now;
      const speed = 0.0002 * elapsed; // ~0.012 per 60ms, smooth on any device
      setZoneX((x) => {
        let next = x + dirRef.current * speed;
        if (next > 0.72) {
          next = 0.72;
          dirRef.current = -1;
        }
        if (next < 0.28) {
          next = 0.28;
          dirRef.current = 1;
        }
        return next;
      });
    }, 50);
    return () => clearInterval(id);
  }, []);

  const reset = useCallback(() => {
    setPos({ x: 0.5, y: 0.86 });
    setScale(1);
    setFlying(false);
  }, []);

  const throwCan = useCallback(
    async (v: Vec) => {
      setFlying(true);
      playTossSound();
      await onAttempt();
      let p = { ...pos };
      let vel = { x: v.x, y: v.y };
      const gravity = 0.0016;
      const start = performance.now();
      let lastTime = start;

      const step = (now: number) => {
        // Normalize delta time to 60fps (16.67ms base)
        // Works seamlessly on 30Hz, 60Hz, 90Hz, 120Hz without speeding up or slowing down
        const dtMs = Math.min(48, Math.max(8, now - lastTime));
        lastTime = now;
        const dtScale = dtMs / 16.667;

        p = { x: p.x + vel.x * dtScale, y: p.y + vel.y * dtScale };
        vel = { x: vel.x * Math.pow(0.995, dtScale), y: vel.y + gravity * dtScale };
        const t = now - start;
        setPos({ ...p });
        setScale(Math.max(0.45, 1 - Math.max(0, (0.86 - p.y)) * 1.1));

        const reachedBox = p.y <= 0.42 && vel.y > -0.0005;
        if (reachedBox || p.y > 1.05 || t > 2600 || p.x < -0.15 || p.x > 1.15) {
          const hit = reachedBox && Math.abs(p.x - zoneX) < 0.11 && p.y > 0.26 && p.y < 0.5;
          if (hit) {
            playHitSound();
            setMessage("Clean landing! Verifying the sighting…");
            onSuccess();
          } else {
            setMessage(
              attemptsLeft - 1 > 0
                ? `Missed. ${attemptsLeft - 1} toss${attemptsLeft - 1 === 1 ? "" : "es"} left — same can.`
                : "Out of tosses for this can.",
            );
            setTimeout(reset, 450);
          }
          return;
        }
        rafRef.current = requestAnimationFrame(step);
      };
      rafRef.current = requestAnimationFrame(step);
    },
    [attemptsLeft, onAttempt, onSuccess, pos, reset, zoneX],
  );

  useEffect(() => () => void (rafRef.current && cancelAnimationFrame(rafRef.current)), []);

  function toLocalWithRect(clientX: number, clientY: number, rect: DOMRect): Vec {
    return {
      x: Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (clientY - rect.top) / rect.height)),
    };
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (flying || busy || attemptsLeft <= 0) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore if pointer capture fails
    }
    const rect = areaRef.current?.getBoundingClientRect() ?? null;
    if (!rect) return;
    const p = toLocalWithRect(e.clientX, e.clientY, rect);
    dragRef.current = {
      active: true,
      rect,
      samples: [{ p, t: performance.now() }],
    };
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragRef.current.active || !dragRef.current.rect) return;
    const p = toLocalWithRect(e.clientX, e.clientY, dragRef.current.rect);
    dragRef.current.samples.push({ p, t: performance.now() });
    if (dragRef.current.samples.length > 6) dragRef.current.samples.shift();
    setPos(p);
  }

  function onPointerUp(e: React.PointerEvent) {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    try {
      if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // ignore
    }
    const s = dragRef.current.samples;
    if (s.length < 2) {
      reset();
      return;
    }
    const first = s[0];
    const last = s[s.length - 1];
    const dt = Math.max(16, last.t - first.t);
    const v = { x: ((last.p.x - first.p.x) / dt) * 16, y: ((last.p.y - first.p.y) / dt) * 16 };
    if (v.y > -0.004) {
      setMessage("Flick upward, towards the box!");
      setTimeout(reset, 250);
      return;
    }
    void throwCan(v);
  }

  return (
    <div className="space-y-2">
      <div
        ref={areaRef}
        className="doodle relative touch-none overflow-hidden bg-[#f3e7cd]"
        style={{ aspectRatio: "3/4" }}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* cardboard box */}
        <div
          className="absolute left-1/2 top-[24%] h-[26%] w-[66%] -translate-x-1/2 rounded-xl border-2 border-ink shadow-sm"
          style={{ background: "linear-gradient(180deg,#dfb57d,#c39250)" }}
        >
          <div className="absolute inset-x-3 top-1.5 h-2 rounded bg-black/15" />
          <div className="absolute bottom-1.5 left-3 text-[10px] font-black uppercase tracking-wider text-[#503413] flex items-center gap-1">
            <IconPackage size={12} />
            <span>Fragile · Critters</span>
          </div>
        </div>
        {/* green landing zone */}
        <div
          className="absolute top-[28%] h-[11%] w-[24%] -translate-x-1/2 rounded-full border-2 border-[#2f5525] flex items-center justify-center text-xs font-black shadow-inner text-[#2f5525]"
          style={{ left: `${zoneX * 100}%`, background: "rgba(127,156,106,.65)" }}
        >
          <IconTarget size={16} />
        </div>
        {/* the can */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 select-none cursor-grab active:cursor-grabbing flex items-center justify-center drop-shadow-md touch-none text-leaf"
          style={{ left: `${pos.x * 100}%`, top: `${pos.y * 100}%`, transform: `translate(-50%,-50%) scale(${scale})` }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <IconCan size={44} />
        </div>

        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/10 px-3 py-2 text-[11px] font-black backdrop-blur-xs">
          <div className="flex items-center gap-1.5">
            <span>Tosses:</span>
            <div className="flex gap-1 items-center">
              {Array.from({ length: 3 }).map((_, i) => (
                <span
                  key={i}
                  className={`inline-block h-2.5 w-2.5 rounded-full border border-ink transition-all ${
                    i < attemptsLeft ? "bg-accent scale-105" : "bg-black/20 scale-90"
                  }`}
                />
              ))}
            </div>
          </div>
          <span>1 can · 3 tosses</span>
        </div>
      </div>
      <p className="text-center text-xs font-bold text-inksoft">{message}</p>
      <button className="btn w-full" onClick={onGiveUp} disabled={busy}>
        Cancel round
      </button>
    </div>
  );
}
