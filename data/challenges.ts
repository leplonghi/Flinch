
import { ChallengeDefinition, ChoreographyStep, Pose } from '../types';

const generateChoreo = (bpm: number, bars: number, complexity: number, restrictedPoses?: Pose[]): ChoreographyStep[] => {
  const steps: ChoreographyStep[] = [];
  const beatMs = (60 / bpm) * 1000;
  const poses = restrictedPoses || ["OPEN", "FIST", "POINT"];
  const targets: any[] = ["C", "L", "R", "U", "D"];

  for (let i = 1; i <= bars * 4; i++) {
    const density = 0.15 + (complexity * 0.1);
    if (Math.random() > density) continue;
    
    steps.push({
      timeMs: i * beatMs,
      pose: poses[Math.floor(Math.random() * Math.min(poses.length, complexity + 1))] as any,
      target: targets[Math.floor(Math.random() * targets.length)],
      windowMs: complexity === 1 ? 500 : 350,
      type: "HIT"
    });
  }
  return steps;
};

export const OFFICIAL_CHALLENGES: ChallengeDefinition[] = [
  {
    id: 'blink',
    name: 'FLINCH · NEURAL LINK',
    type: 'BLINK',
    difficulty: 'EASY',
    category: 'PRECISION',
    bpm: 80,
    durationMs: 8000,
    accentColor: '#ccff00',
    description: 'Sincronização básica de reflexos oculares e manuais.',
    detailedDescription: 'O primeiro passo para se tornar um operador. Mantenha a mão aberta e foque nos alvos centrais que surgem no compasso da rede.',
    posesRequired: ['OPEN'],
    xpReward: 150,
    choreography: generateChoreo(80, 4, 1, ["OPEN"]),
    bestTime: '---',
    activePlayers: 1243
  },
  {
    id: 'hold',
    name: 'FLINCH · KINETIC LOCK',
    type: 'HOLD',
    difficulty: 'MID',
    category: 'STABILITY',
    bpm: 105,
    durationMs: 15000,
    accentColor: '#00f0ff',
    description: 'Teste de firmeza e transição de força bruta.',
    detailedDescription: 'Alternância rápida entre punho cerrado e mão aberta. Requer estabilidade absoluta nos eixos laterais para não perder o link neural.',
    posesRequired: ['OPEN', 'FIST'],
    xpReward: 350,
    choreography: generateChoreo(105, 8, 2, ["OPEN", "FIST"]),
    bestTime: '---',
    activePlayers: 842
  },
  {
    id: 'snap',
    name: 'FLINCH · LASER STRIKE',
    type: 'SNAP',
    difficulty: 'PRO',
    category: 'VELOCITY',
    bpm: 132,
    durationMs: 20000,
    accentColor: '#ff0055',
    description: 'Ataques direcionais em alta frequência.',
    detailedDescription: 'Utilize o gesto de apontar para neutralizar vetores de dados. O ritmo é implacável e exige movimentação ampla do braço.',
    posesRequired: ['OPEN', 'POINT', 'FIST'],
    xpReward: 600,
    choreography: generateChoreo(132, 10, 3),
    bestTime: '---',
    activePlayers: 531
  },
  {
    id: 'chaos',
    name: 'FLINCH · VOID DANCE',
    type: 'DANCE',
    difficulty: 'ELITE',
    category: 'RHYTHM',
    bpm: 172,
    durationMs: 30000,
    accentColor: '#ff00ff',
    description: 'Sobrecarga sensorial completa.',
    detailedDescription: 'A prova definitiva. Poses complexas, trocas instantâneas e alvos em todos os quadrantes. Apenas para operadores nível 40+.',
    posesRequired: ['OPEN', 'FIST', 'POINT', 'WAVE'],
    xpReward: 1200,
    choreography: generateChoreo(172, 16, 5),
    bestTime: '---',
    activePlayers: 92
  }
];
