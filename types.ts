
export type Pose = "OPEN" | "FIST" | "PINCH" | "POINT" | "WAVE";
export type Target = "C" | "L" | "R" | "U" | "D"; // Center, Left, Right, Up, Down

export type ChallengeType = 'BLINK' | 'HOLD' | 'SNAP' | 'DANCE' | 'COMBAT';

export interface ChoreographyStep {
  timeMs: number;
  pose: Pose;
  target: Target;
  windowMs: number;
  type: "HIT" | "HOLD" | "SNAP";
}

export interface ChallengeDefinition {
  id: string;
  name: string;
  type: ChallengeType;
  difficulty: 'EASY' | 'MID' | 'PRO' | 'ELITE';
  bpm: number;
  durationMs: number;
  accentColor: string;
  description: string;
  detailedDescription: string;
  posesRequired: Pose[];
  xpReward: number;
  category: 'VELOCITY' | 'STABILITY' | 'PRECISION' | 'RHYTHM';
  choreography: ChoreographyStep[];
  bestTime: string;
  activePlayers: number;
}

export interface ReplayFrame {
  t: number;
  userPos: { x: number, y: number };
  userPose: Pose;
  targetPos: { x: number, y: number };
  targetPose: Pose;
  isHit: boolean;
  errorMs: number;
}
