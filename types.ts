
export type Pose = "OPEN" | "FIST" | "PINCH" | "POINT" | "WAVE";
export type Target = "C" | "L" | "R" | "U" | "D"; // Center, Left, Right, Up, Down

export type ChallengeType = 'BLINK' | 'HOLD' | 'SNAP' | 'DANCE' | 'COMBAT';

export type HitType = 'PERFECT' | 'GOOD' | 'MISS' | 'DRIFT' | 'EARLY';

export interface VisualAssets {
  contextImage: string;
  targetOverlayImage: string;
  ghostGuideImage: string;
}

export interface HitResult {
  type: HitType;
  timingErrorMs: number;
  score: number;
  combo: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  unlockedAt?: Date;
}

export interface PlayerStats {
  maxCombo: number;
  maxPerfectsInRun: number;
  totalHits: number;
  perfectHits: number;
  totalGoods: number;
  totalMisses: number;
  totalPlayTimeMs: number;
}

export interface MasteryData {
  perfectRuns: number;
  bestTime: number;
  runs: number;
}

export interface PlayerProgress {
  level: number;
  experience: number;
  runsCompleted: number;
  dailyStreak: number;
  lastRunDate?: string;
  achievements: Achievement[];
  stats: PlayerStats;
  mastery: Record<string, MasteryData>;
}

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
  visualAssets: VisualAssets;
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

export interface Step {
  id: string;
  type: "HIT" | "HOLD" | "SNAP" | "WAIT";
  startTimeMs: number;
  durationMs: number;
  pose: Pose;
  target: Target;
  windowMs: number;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  icon: string;
  accentColor: string;
  startingHealth: number;
  totalDurationMs: number;
  bpm: number;
  category: string;
  steps: Step[];
  visualAssets: VisualAssets;
}

export interface GameState {
  score: number;
  combo: number;
  maxCombo: number;
  health: number;
  currentStepIndex: number;
  isGameOver: boolean;
  currentTimeMs: number;
  perfects: number;
  goods: number;
  misses: number;
}

export interface Point {
  x: number;
  y: number;
  z?: number;
}

export interface HandLandmark extends Point {
  visibility?: number;
}

export interface PoseClassification {
  pose: Pose;
  confidence: number;
  timestamp: number;
}
