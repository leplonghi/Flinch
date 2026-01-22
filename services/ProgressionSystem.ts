
import { PlayerProgress, RunRecord, Achievement, AchievementTier } from '../types';

export class ProgressionSystem {
  private static readonly STORAGE_KEY = 'flinch_progress_v1';
  private static readonly XP_BASE = 100;

  // Level = floor(sqrt(XP / 100)) + 1
  static calculateLevelFromXP(xp: number): number {
    if (xp <= 0) return 1;
    return Math.floor(Math.sqrt(xp / this.XP_BASE)) + 1;
  }

  static getXPForLevel(level: number): number {
    return Math.pow(level - 1, 2) * this.XP_BASE;
  }

  static getXPProgress(xp: number) {
    const level = this.calculateLevelFromXP(xp);
    const xpAtCurrentLevel = this.getXPForLevel(level);
    const xpForNextLevel = this.getXPForLevel(level + 1);
    
    const progressXP = xp - xpAtCurrentLevel;
    const requiredXP = xpForNextLevel - xpAtCurrentLevel;
    const percentage = (progressXP / requiredXP) * 100;

    return {
      level,
      current: progressXP,
      required: requiredXP,
      percentage: Math.min(100, Math.max(0, percentage))
    };
  }

  static initializeProgress(): PlayerProgress {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load progress:", e);
    }

    return {
      version: "1.0.0",
      totalXP: 0,
      level: 1,
      runsCompleted: 0,
      dailyStreak: 0,
      lastPlayedDate: new Date().toISOString(),
      mastery: {},
      achievements: [],
      stats: {
        totalPlaytimeMs: 0,
        averageConfidence: 0,
        bestReactionMs: 9999
      }
    };
  }

  static saveProgress(progress: PlayerProgress): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
      console.error("Failed to save progress:", e);
    }
  }

  static updateProgressFromRun(
    progress: PlayerProgress,
    runRecord: RunRecord,
    runStats: { perfects: number; goods: number; misses: number }
  ): PlayerProgress {
    // Deep Clone para evitar mutação direta
    const updated: PlayerProgress = JSON.parse(JSON.stringify(progress));
    
    // 1. Atualizar XP e Level
    updated.totalXP += runRecord.score;
    updated.level = this.calculateLevelFromXP(updated.totalXP);
    updated.runsCompleted += 1;

    // 2. Atualizar Mastery por Desafio
    const m = updated.mastery[runRecord.challengeId] || 0;
    updated.mastery[runRecord.challengeId] = m + runRecord.score;

    // 3. Daily Streak
    const today = new Date().toDateString();
    const last = new Date(updated.lastPlayedDate).toDateString();
    
    if (today !== last) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (last === yesterday.toDateString()) {
        updated.dailyStreak += 1;
      } else {
        updated.dailyStreak = 1;
      }
      updated.lastPlayedDate = new Date().toISOString();
    }

    // 4. Verificar Conquistas
    updated.achievements = this.checkAchievements(updated, runStats);

    this.saveProgress(updated);
    return updated;
  }

  private static checkAchievements(progress: PlayerProgress, lastRun: { perfects: number; misses: number }): Achievement[] {
    const registry: Array<{ id: string; title: string; desc: string; goal: number; tier: AchievementTier }> = [
      { id: 'first_blood', title: 'First Blood', desc: 'Complete seu primeiro desafio', goal: 1, tier: 'BRONZE' },
      { id: 'perfectionist', title: 'Perfectionist', desc: 'Consiga 10 PERFECTs em uma run', goal: 10, tier: 'GOLD' },
      { id: 'week_warrior', title: 'Week Warrior', desc: 'Mantenha streak de 7 dias', goal: 7, tier: 'SILVER' },
      { id: 'century', title: 'Century', desc: 'Complete 100 runs', goal: 100, tier: 'GOLD' },
      { id: 'flawless', title: 'Flawless', desc: 'Complete uma run sem erros', goal: 1, tier: 'SILVER' },
      { id: 'master', title: 'Master', desc: 'Alcance nível 10', goal: 10, tier: 'PLATINUM' }
    ];

    const currentAchievements = progress.achievements;

    registry.forEach(a => {
      const exists = currentAchievements.find(ca => ca.id === a.id);
      if (exists?.unlockedAt) return;

      let unlocked = false;
      switch (a.id) {
        case 'first_blood': unlocked = progress.runsCompleted >= 1; break;
        case 'perfectionist': unlocked = lastRun.perfects >= 10; break;
        case 'week_warrior': unlocked = progress.dailyStreak >= 7; break;
        case 'century': unlocked = progress.runsCompleted >= 100; break;
        case 'flawless': unlocked = lastRun.misses === 0; break;
        case 'master': unlocked = progress.level >= 10; break;
      }

      if (unlocked) {
        if (exists) {
          exists.unlockedAt = Date.now();
        } else {
          currentAchievements.push({
            id: a.id,
            title: a.title,
            description: a.desc,
            tier: a.tier,
            goal: a.goal,
            unlockedAt: Date.now()
          });
        }
      }
    });

    return currentAchievements;
  }

  static generateInsights(progress: PlayerProgress) {
    const challenges = Object.keys(progress.mastery);
    if (challenges.length === 0) return null;

    let strongest = challenges[0];
    let weakest = challenges[0];

    challenges.forEach(id => {
      if (progress.mastery[id] > progress.mastery[strongest]) strongest = id;
      if (progress.mastery[id] < progress.mastery[weakest]) weakest = id;
    });

    const hours = Math.floor(progress.stats.totalPlaytimeMs / 3600000);
    const mins = Math.floor((progress.stats.totalPlaytimeMs % 3600000) / 60000);

    return {
      strongestChallenge: strongest,
      weakestChallenge: weakest,
      improvement: Math.min(progress.runsCompleted * 2.5, 100), // Simulação de melhoria
      totalPlayTime: `${hours}h ${mins}m`
    };
  }
}
