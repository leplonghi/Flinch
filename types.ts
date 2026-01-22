
// Pose definitions including the missing WAVE gesture
export type Pose = "OPEN" | "FIST" | "PINCH" | "POINT" | "WAVE" | "UNKNOWN";
export type Target = "C" | "L" | "R" | "U" | "D" | "NONE";
// Updated Difficulty to include tiers used in official challenges
export type Difficulty = "EASY" | "NORMAL" | "HARD" | "EXTREME" | "MID" | "PRO" | "ELITE";
export type StepType = "HIT" | "HOLD" | "SNAP" | "WAIT" | "MEMORY";
export type HitResultType = "PERFECT" | "GOOD" | "MISS" | "EARLY" | "DRIFT" | "IGNORE";
export type AchievementTier = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";

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

export interface PoseTarget {
  target: Target;
  position: Point;
}

// --- Step Definitions ---

export interface BaseStep {
  id: string;
  type: StepType;
  startTimeMs: number;
  durationMs: number;
  pose: Pose;
  target: Target;
  lethal?: boolean; // Se errar, é game over imediato
}

export interface HitStep extends BaseStep {
  type: "HIT";
  windowMs: number;
}

export interface HoldStep extends BaseStep {
  type: "HOLD";
  minimumHoldMs: number;
  tolerancePx: number;
}

export interface SnapStep extends BaseStep {
  type: "SNAP";
  maxActionTimeMs: number;
}

export interface WaitStep extends BaseStep {
  type: "WAIT";
  forbiddenPoses?: Pose[];
}

export interface MemoryStep extends BaseStep {
  type: "MEMORY";
  sequence: Array<{ pose: Pose; target: Target }>;
  playbackSpeed: number;
}

export type Step = HitStep | HoldStep | SnapStep | WaitStep | MemoryStep;

// --- Challenge & Game Logic ---

export interface DifficultyModifier {
  healthMultiplier: number;
  scoreMultiplier: number;
  windowShrinkFactor: number;
  speedMultiplier: number;
}

// Added missing types used in challenges.ts and PlayPage.tsx
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
  difficulty: Difficulty;
  category: "VELOCITY" | "STABILITY" | "PRECISION" | "RHYTHM";
  bpm: number;
  durationMs: number;
  accentColor: string;
  description: string;
  detailedDescription: string;
  posesRequired: Pose[];
  xpReward: number;
  choreography: ChoreographyStep[];
  bestTime: string;
  activePlayers: number;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  icon: string;
  accentColor: string;
  steps: Step[];
  totalDurationMs: number;
  startingHealth: number;
  bpm: number;
  category: "VELOCITY" | "STABILITY" | "PRECISION" | "RHYTHM";
}

export interface GameState {
  currentStepIndex: number;
  health: number;
  score: number;
  combo: number;
  maxCombo: number;
  stats: {
    perfects: number;
    goods: number;
    misses: number;
    earlies: number;
  };
  timestamps: {
    start: number;
    lastAction: number;
  };
  isPaused: boolean;
  isGameOver: boolean;
}

// --- Persistence & Social ---

export interface Achievement {
  id: string;
  title: string;
  description: string;
  tier: AchievementTier;
  unlockedAt?: number;
  progress?: number;
  goal: number;
}

export interface PlayerProgress {
  version: string;
  totalXP: number;
  level: number;
  runsCompleted: number;
  dailyStreak: number;
  lastPlayedDate: string;
  mastery: Record<string, number>; // challengeId -> xp
  achievements: Achievement[];
  stats: {
    totalPlaytimeMs: number;
    averageConfidence: number;
    bestReactionMs: number;
  };
}

export interface ReplayKeyframe {
  t: number;
  userPos: Point;
  userPose: Pose;
  targetPos: Point;
  targetPose: Pose;
  isHit: boolean;
  health: number;
}

export interface RunRecord {
  id: string;
  challengeId: string;
  score: number;
  maxCombo: number;
  rank: "S" | "A" | "B" | "C" | "F";
  timestamp: number;
  replay: ReplayKeyframe[];
}

export interface FeedbackEvent {
  type: HitResultType;
  position: Point;
  label: string;
  timestamp: number;
}