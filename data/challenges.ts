
import { ChallengeDefinition, ChoreographyStep, Pose } from '../types';

/**
 * Helper para calcular tempos baseados em BPM para coreografias manuais
 */
const b = (beat: number, bpm: number) => Math.round((beat * 60) / bpm * 1000);

export const OFFICIAL_CHALLENGES: ChallengeDefinition[] = [
  {
    id: 'blink',
    name: 'FLINCH · NEURAL LINK',
    type: 'BLINK',
    difficulty: 'EASY',
    category: 'PRECISION',
    bpm: 75,
    durationMs: 15000,
    accentColor: '#ccff00',
    description: 'Sincronização básica de reflexos oculares e manuais.',
    detailedDescription: 'O primeiro passo para se tornar um operador. Mantenha a mão aberta e foque nos alvos centrais.',
    posesRequired: ['OPEN'],
    xpReward: 150,
    visualAssets: {
      contextImage: '/assets/challenges/blink/context.webp',
      targetOverlayImage: '/assets/challenges/blink/targets.webp',
      ghostGuideImage: '/assets/challenges/blink/ghost.webp'
    },
    choreography: [
      { timeMs: b(1, 75), pose: 'OPEN', target: 'C', windowMs: 1200, type: 'HIT' },
      { timeMs: b(2, 75), pose: 'OPEN', target: 'C', windowMs: 1200, type: 'HIT' },
      { timeMs: b(3, 75), pose: 'OPEN', target: 'L', windowMs: 1200, type: 'HIT' },
      { timeMs: b(4, 75), pose: 'OPEN', target: 'R', windowMs: 1200, type: 'HIT' },
      { timeMs: b(5, 75), pose: 'OPEN', target: 'C', windowMs: 1200, type: 'HIT' },
      { timeMs: b(7, 75), pose: 'OPEN', target: 'U', windowMs: 1200, type: 'HIT' },
      { timeMs: b(9, 75), pose: 'OPEN', target: 'D', windowMs: 1200, type: 'HIT' }
    ],
    bestTime: '---',
    activePlayers: 1243
  },
  {
    id: 'combat-init',
    name: 'FLINCH · PROTOCOL: STRIKE',
    type: 'COMBAT',
    difficulty: 'MID',
    category: 'VELOCITY',
    bpm: 110,
    durationMs: 25000,
    accentColor: '#ff3333',
    description: 'Simulação de combate tático com troca de poses.',
    detailedDescription: 'Alterne entre defesa (OPEN) e ataque (FIST) em resposta aos vetores de ameaça.',
    posesRequired: ['OPEN', 'FIST'],
    xpReward: 400,
    visualAssets: {
      contextImage: '/assets/challenges/combat-init/context.webp',
      targetOverlayImage: '/assets/challenges/combat-init/targets.webp',
      ghostGuideImage: '/assets/challenges/combat-init/ghost.webp'
    },
    choreography: [
      { timeMs: b(1, 110), pose: 'OPEN', target: 'C', windowMs: 800, type: 'HIT' },
      { timeMs: b(2, 110), pose: 'FIST', target: 'C', windowMs: 800, type: 'HIT' },
      { timeMs: b(3, 110), pose: 'OPEN', target: 'L', windowMs: 800, type: 'HIT' },
      { timeMs: b(3.5, 110), pose: 'FIST', target: 'L', windowMs: 700, type: 'HIT' },
      { timeMs: b(5, 110), pose: 'OPEN', target: 'R', windowMs: 800, type: 'HIT' },
      { timeMs: b(5.5, 110), pose: 'FIST', target: 'R', windowMs: 700, type: 'HIT' },
      { timeMs: b(7, 110), pose: 'FIST', target: 'U', windowMs: 600, type: 'SNAP' },
      { timeMs: b(8, 110), pose: 'FIST', target: 'D', windowMs: 600, type: 'SNAP' }
    ],
    bestTime: '---',
    activePlayers: 567
  },
  {
    id: 'ghost-signal',
    name: 'FLINCH · GHOST SIGNAL',
    type: 'SNAP',
    difficulty: 'PRO',
    category: 'PRECISION',
    bpm: 130,
    durationMs: 30000,
    accentColor: '#00d4ff',
    description: 'Rastreamento de sinais instáveis no espectro.',
    detailedDescription: 'Exige o uso preciso do gesto POINT para travar em sinais que desaparecem rapidamente.',
    posesRequired: ['POINT', 'PINCH'],
    xpReward: 750,
    visualAssets: {
      contextImage: '/assets/challenges/ghost-signal/context.webp',
      targetOverlayImage: '/assets/challenges/ghost-signal/targets.webp',
      ghostGuideImage: '/assets/challenges/ghost-signal/ghost.webp'
    },
    choreography: [
      { timeMs: b(1, 130), pose: 'POINT', target: 'L', windowMs: 450, type: 'HIT' },
      { timeMs: b(2, 130), pose: 'POINT', target: 'R', windowMs: 450, type: 'HIT' },
      { timeMs: b(3, 130), pose: 'PINCH', target: 'C', windowMs: 400, type: 'HIT' },
      { timeMs: b(4, 130), pose: 'POINT', target: 'U', windowMs: 450, type: 'HIT' },
      { timeMs: b(5, 130), pose: 'POINT', target: 'D', windowMs: 450, type: 'HIT' },
      { timeMs: b(6, 130), pose: 'PINCH', target: 'C', windowMs: 400, type: 'HIT' },
      { timeMs: b(7, 130), pose: 'POINT', target: 'L', windowMs: 400, type: 'SNAP' },
      { timeMs: b(7.5, 130), pose: 'POINT', target: 'R', windowMs: 400, type: 'SNAP' }
    ],
    bestTime: '---',
    activePlayers: 214
  }
];
