
import { Point, Target } from '../types';

/**
 * TargetMapper divide a área de captura em 5 zonas principais: C, L, R, U, D.
 */
export class TargetMapper {
  private readonly centerThreshold: number = 0.15;

  /** Mapeia a posição do pulso (wrist) para um alvo semântico */
  mapTarget(wristPosition: Point): Target {
    const dx = wristPosition.x - 0.5;
    const dy = wristPosition.y - 0.5;

    if (Math.abs(dx) < this.centerThreshold && Math.abs(dy) < this.centerThreshold) {
      return 'C';
    }

    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? 'R' : 'L';
    } else {
      return dy > 0 ? 'D' : 'U';
    }
  }
}

export default new TargetMapper();
