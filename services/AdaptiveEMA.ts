
import { Point } from '../types';

/**
 * AdaptiveEMA suaviza o movimento dos landmarks de forma inteligente.
 */
export class AdaptiveEMA {
  private alphaFast: number = 0.85; 
  private alphaSlow: number = 0.25; 
  private lastPosition: Point | null = null;
  private lastTimestamp: number = 0;

  smooth(current: Point, timestamp: number): Point {
    if (!this.lastPosition) {
      this.lastPosition = current;
      this.lastTimestamp = timestamp;
      return current;
    }

    const dt = timestamp - this.lastTimestamp;
    if (dt <= 0) return this.lastPosition;

    const dist = Math.sqrt(
      Math.pow(current.x - this.lastPosition.x, 2) + 
      Math.pow(current.y - this.lastPosition.y, 2)
    );
    const velocity = dist / dt;

    const velocityFactor = Math.min(Math.max((velocity - 0.001) / 0.004, 0), 1);
    const alpha = this.alphaSlow + (this.alphaFast - this.alphaSlow) * velocityFactor;

    const smoothed: Point = {
      x: alpha * current.x + (1 - alpha) * this.lastPosition.x,
      y: alpha * current.y + (1 - alpha) * this.lastPosition.y,
      z: current.z !== undefined ? alpha * (current.z || 0) + (1 - alpha) * (this.lastPosition.z || 0) : undefined
    };

    this.lastPosition = smoothed;
    this.lastTimestamp = timestamp;

    return smoothed;
  }

  reset(): void {
    this.lastPosition = null;
    this.lastTimestamp = 0;
  }
}

export default new AdaptiveEMA();
