
import { Challenge } from '../types';

export const CHALLENGES: Record<string, Challenge> = {
  BLINK: {
    id: 'BLINK',
    name: 'Neural Link: Blink',
    description: 'Teste de reflexo puro. Espere o sinal GO e reaja com PINCH.',
    icon: '⚡',
    accentColor: '#00ff41',
    startingHealth: 100,
    totalDurationMs: 5000,
    bpm: 60,
    category: 'PRECISION',
    steps: [
      { id: 'blink_wait', type: 'WAIT', startTimeMs: 0, durationMs: 2000, pose: 'OPEN', target: 'C' },
      { id: 'blink_hit', type: 'HIT', startTimeMs: 2000, durationMs: 800, pose: 'PINCH', target: 'C', windowMs: 800, lethal: true }
    ]
  },

  HOLD: {
    id: 'HOLD',
    name: 'Kinetic Lock: Hold',
    description: 'Estabilidade sob pressão. Mantenha poses enquanto elas trocam.',
    icon: '🔒',
    accentColor: '#00d4ff',
    startingHealth: 100,
    totalDurationMs: 8000,
    bpm: 100,
    category: 'STABILITY',
    steps: [
      { id: 'hold_1', type: 'HOLD', startTimeMs: 0, durationMs: 2000, pose: 'FIST', target: 'C', minimumHoldMs: 1800, tolerancePx: 20 },
      { id: 'hold_2', type: 'HOLD', startTimeMs: 2000, durationMs: 2000, pose: 'OPEN', target: 'L', minimumHoldMs: 1800, tolerancePx: 20 },
      { id: 'hold_3', type: 'HOLD', startTimeMs: 4000, durationMs: 2000, pose: 'POINT', target: 'R', minimumHoldMs: 1800, tolerancePx: 20 }
    ]
  },

  SNAP: {
    id: 'SNAP',
    name: 'Burst: Snap',
    description: 'Precisão rítmica. Três golpes rápidos em sequência.',
    icon: '👆',
    accentColor: '#ff00ff',
    startingHealth: 100,
    totalDurationMs: 6000,
    bpm: 120,
    category: 'VELOCITY',
    steps: [
      { id: 'snap_1', type: 'SNAP', startTimeMs: 0, durationMs: 200, maxActionTimeMs: 200, pose: 'PINCH', target: 'C' },
      { id: 'snap_wait_1', type: 'WAIT', startTimeMs: 200, durationMs: 1000, pose: 'OPEN', target: 'C' },
      { id: 'snap_2', type: 'SNAP', startTimeMs: 1200, durationMs: 200, maxActionTimeMs: 200, pose: 'PINCH', target: 'C' },
      { id: 'snap_wait_2', type: 'WAIT', startTimeMs: 1400, durationMs: 1000, pose: 'OPEN', target: 'C' },
      { id: 'snap_3', type: 'SNAP', startTimeMs: 2400, durationMs: 200, maxActionTimeMs: 200, pose: 'PINCH', target: 'C' }
    ]
  },

  LASER: {
    id: 'LASER',
    name: 'Vector: Laser',
    description: 'Movimentação espacial. Atinja alvos em padrão cruzado.',
    icon: '🎯',
    accentColor: '#ff3366',
    startingHealth: 100,
    totalDurationMs: 10000,
    bpm: 110,
    category: 'VELOCITY',
    steps: [
      { id: 'laser_l', type: 'HIT', startTimeMs: 0, durationMs: 1000, pose: 'POINT', target: 'L', windowMs: 1000 },
      { id: 'laser_r', type: 'HIT', startTimeMs: 1500, durationMs: 1000, pose: 'POINT', target: 'R', windowMs: 1000 },
      { id: 'laser_u', type: 'HIT', startTimeMs: 3000, durationMs: 1000, pose: 'POINT', target: 'U', windowMs: 1000 },
      { id: 'laser_d', type: 'HIT', startTimeMs: 4500, durationMs: 1000, pose: 'POINT', target: 'D', windowMs: 1000 },
      { id: 'laser_c', type: 'HIT', startTimeMs: 6000, durationMs: 1000, pose: 'POINT', target: 'C', windowMs: 1000, lethal: true }
    ]
  },

  SWITCH: {
    id: 'SWITCH',
    name: 'Context: Switch',
    description: 'Trocas rápidas de pose e alvo simultaneamente.',
    icon: '🔄',
    accentColor: '#ffaa00',
    startingHealth: 100,
    totalDurationMs: 9000,
    bpm: 130,
    category: 'RHYTHM',
    steps: [
      { id: 'switch_1', type: 'HIT', startTimeMs: 0, durationMs: 800, pose: 'FIST', target: 'L', windowMs: 800 },
      { id: 'switch_2', type: 'HIT', startTimeMs: 1500, durationMs: 800, pose: 'OPEN', target: 'R', windowMs: 800 },
      { id: 'switch_3', type: 'HIT', startTimeMs: 3000, durationMs: 800, pose: 'POINT', target: 'U', windowMs: 800 },
      { id: 'switch_4', type: 'HIT', startTimeMs: 4500, durationMs: 800, pose: 'PINCH', target: 'D', windowMs: 800 },
      { id: 'switch_5', type: 'HIT', startTimeMs: 6000, durationMs: 800, pose: 'FIST', target: 'C', windowMs: 800, lethal: true }
    ]
  },

  DRIFT: {
    id: 'DRIFT',
    name: 'Static: Drift',
    description: 'Resistência centrípeta. Mantenha-se no centro apesar da fadiga.',
    icon: '🌀',
    accentColor: '#cc00ff',
    startingHealth: 100,
    totalDurationMs: 10000,
    bpm: 60,
    category: 'STABILITY',
    steps: [
      { id: 'drift_main', type: 'HOLD', startTimeMs: 0, durationMs: 10000, pose: 'OPEN', target: 'C', minimumHoldMs: 9500, tolerancePx: 30 }
    ]
  }
};

export function getChallengeById(id: string): Challenge | null {
  return CHALLENGES[id] || null;
}

export function getAllChallenges(): Challenge[] {
  return Object.values(CHALLENGES);
}
