
import { 
  Challenge, Difficulty, GameState, Step, HitStep, HoldStep, SnapStep, WaitStep,
  Pose, Target, HitResultType, RunRecord, StepType
} from '../types';
import GameClock from './GameClock';

interface HoldProgress {
  startTime: number;
  lastValidTime: number;
  driftCount: number;
  gracePeriods: number;
  isStarted: boolean;
}

export class GameEngine {
  private challenge: Challenge;
  private difficulty: Difficulty;
  private state: GameState;
  private lastHitStepId: string | null = null;
  private lastHitTimestamp: number = 0;
  private holdStates: Map<string, HoldProgress> = new Map();
  private readonly COOLDOWN_MS = 100;
  private readonly GRACE_PERIOD_MS = 150;
  private isActive: boolean = false;
  private lethalMode: boolean = false;

  constructor(challenge: Challenge, difficulty: Difficulty) {
    this.difficulty = difficulty;
    this.challenge = this.applyDifficultyModifier(challenge, difficulty);
    this.state = this.initializeState();
  }

  private initializeState(): GameState {
    return {
      currentStepIndex: 0,
      health: this.challenge.startingHealth,
      score: 0,
      combo: 0,
      maxCombo: 0,
      stats: {
        perfects: 0,
        goods: 0,
        misses: 0,
        earlies: 0
      },
      timestamps: {
        start: 0,
        lastAction: 0
      },
      isPaused: false,
      isGameOver: false
    };
  }

  private applyDifficultyModifier(challenge: Challenge, difficulty: Difficulty): Challenge {
    const cloned = JSON.parse(JSON.stringify(challenge)) as Challenge;
    let windowMult = 1.0;
    let damageMult = 1.0;
    let xpMult = 1.0;

    switch (difficulty) {
      case "EASY":
        windowMult = 1.5; damageMult = 0.5; xpMult = 0.7;
        break;
      case "NORMAL":
        windowMult = 1.0; damageMult = 1.0; xpMult = 1.0;
        break;
      case "HARD":
        windowMult = 0.7; damageMult = 1.5; xpMult = 1.5;
        break;
      case "EXTREME":
        windowMult = 0.5; damageMult = 2.0; xpMult = 2.5;
        this.lethalMode = true;
        break;
    }

    // Aplicar aos steps
    cloned.steps = cloned.steps.map(step => {
      if (step.type === "HIT") {
        (step as HitStep).windowMs *= windowMult;
      }
      if (this.lethalMode) step.lethal = true;
      return step;
    });

    return cloned;
  }

  public start(): void {
    GameClock.start();
    this.isActive = true;
    this.state.timestamps.start = performance.now();
  }

  public update(currentPose: Pose, currentTarget: Target): any | null {
    if (!this.isActive || this.state.isPaused || this.state.isGameOver) return null;

    const elapsed = GameClock.elapsed();

    // Verificar fim do desafio
    if (elapsed >= this.challenge.totalDurationMs) {
      this.isActive = false;
      return { type: 'CHALLENGE_COMPLETE' };
    }

    const currentStep = this.getCurrentStep();
    if (!currentStep) return null;

    // Avaliação baseada no tipo de step
    switch (currentStep.type) {
      case "HIT":
        return this.evaluateHit(currentStep as HitStep, currentPose, currentTarget, elapsed);
      case "HOLD":
        return this.evaluateHold(currentStep as HoldStep, currentPose, currentTarget, elapsed);
      case "SNAP":
        return this.evaluateSnap(currentStep as SnapStep, currentPose, elapsed);
      case "WAIT":
        return this.evaluateWait(currentStep as WaitStep, currentPose, currentTarget, elapsed);
      default:
        return null;
    }
  }

  private evaluateHit(step: HitStep, pose: Pose, target: Target, elapsed: number): any | null {
    const timeToHit = elapsed - step.startTimeMs;
    const window = step.windowMs;

    // Se já passou da janela (MISS)
    if (timeToHit > window) {
      return this.processMiss(step);
    }

    // Cooldown check
    if (this.lastHitStepId === step.id && (performance.now() - this.lastHitTimestamp) < this.COOLDOWN_MS) {
      return null;
    }

    // Validação de Input
    if (pose === step.pose && target === step.target) {
      // Cálculo de precisão (perfection)
      const absDiff = Math.abs(timeToHit);
      const perfection = 1 - (absDiff / window);

      this.lastHitStepId = step.id;
      this.lastHitTimestamp = performance.now();

      if (perfection > 0.9) return this.processPerfect(step);
      if (perfection > 0) return this.processGood(step);
    }

    return null;
  }

  private evaluateHold(step: HoldStep, pose: Pose, target: Target, elapsed: number): any | null {
    let progress = this.holdStates.get(step.id);
    
    if (!progress) {
      progress = { 
        startTime: elapsed, 
        lastValidTime: elapsed, 
        driftCount: 0, 
        gracePeriods: 3,
        isStarted: true 
      };
      this.holdStates.set(step.id, progress);
    }

    const isValid = pose === step.pose && target === step.target;

    if (!isValid) {
      const timeSinceValid = elapsed - progress.lastValidTime;
      
      // Grace period buffer (tolerância a flickers)
      if (timeSinceValid < this.GRACE_PERIOD_MS && progress.gracePeriods > 0) {
        return { type: 'IGNORE' };
      }

      progress.driftCount++;
      progress.gracePeriods--;
      
      const damage = Math.min(5 * progress.driftCount, 20);
      this.applyDamage(damage);
      this.state.combo = 0;

      if (this.lethalMode || this.state.health <= 0) {
        this.state.isGameOver = true;
      }

      return { type: 'DRIFT', damage };
    } else {
      // Recuperação em caso de acerto
      progress.lastValidTime = elapsed;
      if (progress.driftCount > 0) progress.driftCount--;
      
      // Verificar conclusão
      if (elapsed >= step.startTimeMs + step.durationMs) {
        this.holdStates.delete(step.id);
        this.advanceStep();
        return { type: 'PERFECT', message: 'HOLD_COMPLETE' };
      }
    }

    return null;
  }

  private evaluateSnap(step: SnapStep, pose: Pose, elapsed: number): any | null {
    const timeLimit = step.startTimeMs + step.maxActionTimeMs;
    
    if (pose === "PINCH" && elapsed < timeLimit) {
      return this.processPerfect(step);
    }

    if (elapsed >= timeLimit) {
      return this.processMiss(step);
    }

    return null;
  }

  private evaluateWait(step: WaitStep, pose: Pose, target: Target, elapsed: number): any | null {
    // Modo "Guarda": Qualquer movimento fora de repouso é penalizado
    if (pose !== "OPEN" || target !== "C") {
      this.applyDamage(10);
      this.state.combo = 0;
      this.state.stats.earlies++;
      
      if (this.lethalMode || this.state.health <= 0) {
        this.state.isGameOver = true;
      }
      return { type: 'EARLY', message: 'GUARD_BROKEN' };
    }

    if (elapsed >= step.startTimeMs + step.durationMs) {
      this.advanceStep();
    }

    return null;
  }

  // --- Helpers ---

  private processPerfect(step: Step): any {
    this.state.stats.perfects++;
    this.state.combo++;
    if (this.state.combo > this.state.maxCombo) this.state.maxCombo = this.state.combo;
    
    const xp = 100 + (this.state.combo * 10);
    this.state.score += xp;
    
    this.advanceStep();
    return { type: 'PERFECT', xp, label: 'PERFECT' };
  }

  private processGood(step: Step): any {
    this.state.stats.goods++;
    this.state.combo++;
    if (this.state.combo > this.state.maxCombo) this.state.maxCombo = this.state.combo;
    
    const xp = 50;
    this.state.score += xp;
    
    this.advanceStep();
    return { type: 'GOOD', xp, label: 'GOOD' };
  }

  private processMiss(step: Step): any {
    this.state.stats.misses++;
    this.state.combo = 0;
    this.applyDamage(20);

    if (this.lethalMode || this.state.health <= 0) {
      this.state.isGameOver = true;
    }

    this.advanceStep();
    return { type: 'MISS', label: 'MISS' };
  }

  private applyDamage(amount: number): void {
    this.state.health = Math.max(0, this.state.health - amount);
  }

  private advanceStep(): void {
    this.state.currentStepIndex++;
    this.lastHitStepId = null;
  }

  private getCurrentStep(): Step | null {
    if (this.state.currentStepIndex >= this.challenge.steps.length) return null;
    return this.challenge.steps[this.state.currentStepIndex];
  }

  public getState(): GameState {
    return { ...this.state };
  }

  public isComplete(): boolean {
    return this.state.currentStepIndex >= this.challenge.steps.length || this.state.isGameOver;
  }

  public generateRunRecord(): RunRecord {
    const rank = this.calculateRank();
    return {
      id: Math.random().toString(36).substr(2, 9),
      challengeId: this.challenge.id,
      score: this.state.score,
      maxCombo: this.state.maxCombo,
      rank: rank,
      timestamp: Date.now(),
      replay: [] // A ser preenchido pela camada externa se necessário
    };
  }

  private calculateRank(): "S" | "A" | "B" | "C" | "F" {
    if (this.state.isGameOver) return "F";
    const total = this.state.stats.perfects + this.state.stats.goods + this.state.stats.misses;
    if (total === 0) return "F";
    const ratio = this.state.stats.perfects / total;
    if (ratio > 0.95) return "S";
    if (ratio > 0.8) return "A";
    if (ratio > 0.6) return "B";
    return "C";
  }

  public dispose(): void {
    GameClock.reset();
    this.holdStates.clear();
    this.isActive = false;
  }
}
