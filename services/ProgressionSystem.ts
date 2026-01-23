
import type { PlayerProgress, GameState, Challenge } from '../types';
import { AchievementSystem } from './AchievementSystem';

const STORAGE_KEY = 'flinch_progression_v1';

export class ProgressionSystem {
  static getInitialProgress(): PlayerProgress {
    return {
      level: 1,
      experience: 0,
      runsCompleted: 0,
      dailyStreak: 0,
      achievements: [],
      stats: {
        maxCombo: 0,
        maxPerfectsInRun: 0,
        totalHits: 0,
        perfectHits: 0,
        totalGoods: 0,
        totalMisses: 0,
        totalPlayTimeMs: 0
      },
      mastery: {}
    };
  }

  static load(): PlayerProgress {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return this.getInitialProgress();
    try {
      const parsed = JSON.parse(saved);
      return {
        ...this.getInitialProgress(),
        ...parsed,
        stats: { ...this.getInitialProgress().stats, ...(parsed.stats || {}) },
        mastery: parsed.mastery || {}
      };
    } catch (e) {
      return this.getInitialProgress();
    }
  }

  static save(progress: PlayerProgress) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }

  static updateProgressFromRun(challenge: Challenge, gameState: GameState): PlayerProgress {
    const progress = this.load();
    
    // Update Stats
    progress.runsCompleted += 1;
    progress.experience += Math.round(gameState.score / 5);
    progress.stats.maxCombo = Math.max(progress.stats.maxCombo, gameState.maxCombo);
    progress.stats.maxPerfectsInRun = Math.max(progress.stats.maxPerfectsInRun, gameState.perfects);
    progress.stats.perfectHits += gameState.perfects;
    progress.stats.totalGoods += gameState.goods;
    progress.stats.totalMisses += gameState.misses;
    progress.stats.totalHits += (gameState.perfects + gameState.goods + gameState.misses);
    progress.stats.totalPlayTimeMs += gameState.currentTimeMs;
    
    // Update Mastery & Best Time
    if (!progress.mastery[challenge.id]) {
      progress.mastery[challenge.id] = { perfectRuns: 0, bestTime: 0, runs: 0 };
    }
    const m = progress.mastery[challenge.id];
    m.runs += 1;
    if (gameState.health >= 100) m.perfectRuns += 1;
    
    const runTime = gameState.currentTimeMs;
    if (m.bestTime === 0 || runTime < m.bestTime) {
      m.bestTime = runTime;
    }

    // Leveling (Linear scaling)
    progress.level = Math.floor(progress.experience / 1500) + 1;

    // Achievement Delta
    const newUnlocked = AchievementSystem.checkNewAchievements(progress);
    if (newUnlocked.length > 0) {
      progress.achievements = [...(progress.achievements || []), ...newUnlocked];
    }

    this.save(progress);
    return progress;
  }
}
