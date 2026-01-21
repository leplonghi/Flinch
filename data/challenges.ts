
import { ChallengeDefinition, ChoreographyStep } from '../types';

const generateSimpleChoreo = (bpm: number, bars: number, complexity: number): ChoreographyStep[] => {
  const steps: ChoreographyStep[] = [];
  const beatMs = (60 / bpm) * 1000;
  const poses: any[] = ["OPEN", "FIST", "PINCH", "POINT"];
  const targets: any[] = ["C", "L", "R", "U", "D"];

  for (let i = 1; i <= bars * 4; i++) {
    if (Math.random() > 0.3 + (complexity * 0.1)) continue;
    steps.push({
      timeMs: i * beatMs,
      pose: poses[Math.floor(Math.random() * Math.min(poses.length, complexity + 1))],
      target: targets[Math.floor(Math.random() * targets.length)],
      windowMs: Math.max(120, 300 - (bpm * 0.5)),
      type: "HIT"
    });
  }
  return steps;
};

export const OFFICIAL_CHALLENGES: ChallengeDefinition[] = [
  {
    id: 'blink',
    name: 'FLINCH · BLINK',
    type: 'DANCE',
    difficulty: 'EASY',
    bpm: 100,
    durationMs: 8000,
    accentColor: '#ccff00',
    choreography: generateSimpleChoreo(100, 4, 1),
    bestTime: '182ms',
    activePlayers: 1243
  },
  {
    id: 'hold',
    name: 'FLINCH · HOLD',
    type: 'DANCE',
    difficulty: 'MID',
    bpm: 120,
    durationMs: 10000,
    accentColor: '#00f0ff',
    choreography: generateSimpleChoreo(120, 5, 2),
    bestTime: '210ms',
    activePlayers: 842
  },
  {
    id: 'snap',
    name: 'FLINCH · SNAP',
    type: 'DANCE',
    difficulty: 'PRO',
    bpm: 140,
    durationMs: 12000,
    accentColor: '#ff0055',
    choreography: generateSimpleChoreo(140, 6, 3),
    bestTime: '154ms',
    activePlayers: 531
  },
  {
    id: 'laser',
    name: 'FLINCH · LASER',
    type: 'DANCE',
    difficulty: 'PRO',
    bpm: 160,
    durationMs: 10000,
    accentColor: '#ffaa00',
    choreography: generateSimpleChoreo(160, 5, 4),
    bestTime: '142ms',
    activePlayers: 321
  },
  {
    id: 'simon',
    name: 'FLINCH · SIMON',
    type: 'DANCE',
    difficulty: 'EASY',
    bpm: 90,
    durationMs: 15000,
    accentColor: '#00ff88',
    choreography: generateSimpleChoreo(90, 8, 1),
    bestTime: '195ms',
    activePlayers: 912
  },
  {
    id: 'lock',
    name: 'FLINCH · LOCK',
    type: 'DANCE',
    difficulty: 'MID',
    bpm: 110,
    durationMs: 12000,
    accentColor: '#8800ff',
    choreography: generateSimpleChoreo(110, 6, 2),
    bestTime: '223ms',
    activePlayers: 456
  },
  {
    id: 'mirror',
    name: 'FLINCH · MIRROR',
    type: 'DANCE',
    difficulty: 'MID',
    bpm: 115,
    durationMs: 10000,
    accentColor: '#ffffff',
    choreography: generateSimpleChoreo(115, 5, 2),
    bestTime: '168ms',
    activePlayers: 678
  },
  {
    id: 'drift',
    name: 'FLINCH · DRIFT',
    type: 'DANCE',
    difficulty: 'PRO',
    bpm: 130,
    durationMs: 12000,
    accentColor: '#ff3333',
    choreography: generateSimpleChoreo(130, 6, 3),
    bestTime: '201ms',
    activePlayers: 234
  },
  {
    id: 'switch',
    name: 'FLINCH · SWITCH',
    type: 'DANCE',
    difficulty: 'PRO',
    bpm: 150,
    durationMs: 10000,
    accentColor: '#ffff00',
    choreography: generateSimpleChoreo(150, 5, 4),
    bestTime: '188ms',
    activePlayers: 189
  },
  {
    id: 'chaos',
    name: 'FLINCH · CHAOS',
    type: 'DANCE',
    difficulty: 'PRO',
    bpm: 180,
    durationMs: 15000,
    accentColor: '#ff00ff',
    choreography: generateSimpleChoreo(180, 8, 4),
    bestTime: '234ms',
    activePlayers: 92
  }
];
