
export type Pose = "OPEN" | "FIST" | "PINCH" | "POINT";
export type Target = "C" | "L" | "R" | "U" | "D"; // Center, Left, Right, Up, Down

// Export ChallengeType to fix error in PlayPage.tsx
export type ChallengeType = 'BLINK' | 'HOLD' | 'SNAP' | 'DANCE';

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
  difficulty: 'EASY' | 'MID' | 'PRO';
  bpm: number;
  durationMs: number;
  accentColor: string;
  choreography: ChoreographyStep[];
  // Added properties to fix errors in PlayPage.tsx
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
