
import React, { useEffect, useRef, useState } from 'react';
import type { HitResult } from '../types';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

export function VisualFeedback({ result }: { result: HitResult | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);

  // Spawn particles baseado no resultado
  useEffect(() => {
    if (!result) return;

    const count = result.type === 'PERFECT' ? 35 : 
                  result.type === 'GOOD' ? 18 : 10;
    
    const color = {
      'PERFECT': '#ccff00',
      'GOOD': '#00d4ff',
      'MISS': '#ff3333',
      'DRIFT': '#ff9900',
      'EARLY': '#ffff00'
    }[result.type] || '#ffffff';

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x: centerX,
        y: centerY,
        vx: (Math.random() - 0.5) * 20,
        vy: (Math.random() - 0.5) * 20 - 5,
        life: 1,
        color,
        size: Math.random() * 5 + 2
      });
    }
  }, [result]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);

    let animationId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current = particlesRef.current.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.25; // Gravidade leve
        p.life -= 0.02;

        if (p.life > 0) {
          ctx.globalAlpha = p.life;
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 8;
          ctx.shadowColor = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          return true;
        }
        return false;
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[45]"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}

// Hook para screen shake
export function useScreenShake() {
  const [shake, setShake] = useState(false);

  const trigger = (intensity: number = 10) => {
    setShake(true);
    setTimeout(() => setShake(false), 200);
  };

  const className = shake ? 'shake-active' : '';

  return { trigger, className };
}
