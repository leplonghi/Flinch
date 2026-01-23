
import { useRef, useEffect, useState } from 'react';

/**
 * Hook para suavização de coordenadas (Linear Interpolation)
 * Prepara o sistema para movimentos "zero gravity" fluidos.
 */
export function useAntigravity(targetX: number, targetY: number, lerpFactor: number = 0.15) {
  const [current, setCurrent] = useState({ x: targetX, y: targetY });
  const positionRef = useRef({ x: targetX, y: targetY });

  useEffect(() => {
    let frameId: number;
    
    const animate = () => {
      const dx = targetX - positionRef.current.x;
      const dy = targetY - positionRef.current.y;
      
      positionRef.current.x += dx * lerpFactor;
      positionRef.current.y += dy * lerpFactor;
      
      setCurrent({ ...positionRef.current });
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [targetX, targetY, lerpFactor]);

  return current;
}
