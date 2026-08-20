import React, { useState, useCallback, useRef } from 'react';

const HEARTS = ['♥', '💛', '💕', '❤️', '🧡'];

let _id = 0;

/**
 * HeartBurst – lightweight CSS-only heart particle effect.
 * Usage: wrap your trigger button with <HeartBurst>
 *   const { burst, BurstLayer } = useHeartBurst();
 *   <button onClick={burst}>Click</button>
 *   <BurstLayer />
 */
export function useHeartBurst() {
  const [particles, setParticles] = useState([]);
  // throttle: max 1 burst per 80ms to avoid flooding
  const lastFire = useRef(0);

  const burst = useCallback((e) => {
    const now = Date.now();
    if (now - lastFire.current < 80) return;
    lastFire.current = now;

    // Get click position from event (or use center-screen fallback)
    let cx = window.innerWidth / 2;
    let cy = window.innerHeight / 2;
    if (e && e.clientX) { cx = e.clientX; cy = e.clientY; }

    const count = 8;
    const newParticles = Array.from({ length: count }).map((_, i) => {
      const angle = (2 * Math.PI * i) / count + (Math.random() - 0.5) * 0.4;
      const speed = 28 + Math.random() * 28;
      const dx = Math.cos(angle) * speed;
      const dy = Math.sin(angle) * speed;
      return {
        id: ++_id,
        x: cx,
        y: cy,
        dx,
        dy,
        emoji: HEARTS[Math.floor(Math.random() * HEARTS.length)],
        size: 14 + Math.random() * 10,
      };
    });

    setParticles((prev) => [...prev, ...newParticles]);

    // Remove after animation completes
    setTimeout(() => {
      const ids = new Set(newParticles.map((p) => p.id));
      setParticles((prev) => prev.filter((p) => !ids.has(p.id)));
    }, 950);
  }, []);

  const BurstLayer = useCallback(
    () => (
      <div className="heart-burst-container" aria-hidden="true">
        {particles.map((p) => (
          <span
            key={p.id}
            className="heart-burst"
            style={{
              left: p.x,
              top: p.y,
              fontSize: p.size,
              '--dx': `${p.dx}px`,
              '--dy': `${p.dy}px`,
            }}
          >
            {p.emoji}
          </span>
        ))}
      </div>
    ),
    [particles]
  );

  return { burst, BurstLayer };
}
