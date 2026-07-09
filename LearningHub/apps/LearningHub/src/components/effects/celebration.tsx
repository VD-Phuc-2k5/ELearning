'use client';

import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '../../lib/gsap';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ec4899', '#06b6d4'];
const PARTICLE_COUNT = 60;

let fire: (() => void) | null = null;

export function useCelebrate() {
  return () => fire?.();
}

export function CelebrationLayer() {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fire = () => {
      const layer = layerRef.current;
      if (!layer || prefersReducedMotion()) return;

      const originX = window.innerWidth / 2;
      const originY = window.innerHeight / 3;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const particle = document.createElement('span');
        particle.style.position = 'fixed';
        particle.style.left = `${originX}px`;
        particle.style.top = `${originY}px`;
        particle.style.width = '8px';
        particle.style.height = '8px';
        particle.style.borderRadius = i % 3 === 0 ? '50%' : '2px';
        particle.style.background = COLORS[i % COLORS.length];
        particle.style.willChange = 'transform, opacity';
        layer.appendChild(particle);

        const angle = Math.random() * Math.PI * 2;
        const distance = 120 + Math.random() * 220;

        gsap.to(particle, {
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance * 0.4 + 200 + Math.random() * 200,
          rotation: Math.random() * 720 - 360,
          opacity: 0,
          duration: 1.1 + Math.random() * 0.6,
          ease: 'power2.out',
          onComplete: () => particle.remove(),
        });
      }
    };

    return () => {
      fire = null;
    };
  }, []);

  return (
    <div
      ref={layerRef}
      className="pointer-events-none fixed inset-0 z-[100] overflow-hidden"
      aria-hidden="true"
    />
  );
}
