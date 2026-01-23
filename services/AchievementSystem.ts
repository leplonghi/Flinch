
import type { PlayerProgress, Achievement } from '../types';

export class AchievementSystem {
  private static readonly ACHIEVEMENTS: Omit<Achievement, 'unlockedAt'>[] = [
    {
      id: 'first_blood',
      name: 'First Blood',
      description: 'Complete your first tactical operation.',
      icon: '🎯',
      tier: 'BRONZE'
    },
    {
      id: 'perfectionist',
      name: 'Perfectionist',
      description: 'Achieve 10 PERFECT hits in a single run.',
      icon: '⭐',
      tier: 'GOLD'
    },
    {
      id: 'century',
      name: 'Century',
      description: 'Complete 100 tactical runs.',
      icon: '💯',
      tier: 'GOLD'
    },
    {
      id: 'flawless',
      name: 'Flawless',
      description: 'Complete a run with 100% health stability.',
      icon: '💎',
      tier: 'SILVER'
    },
    {
      id: 'master',
      name: 'Neural Master',
      description: 'Reach Operator Level 10.',
      icon: '👑',
      tier: 'PLATINUM'
    },
    {
      id: 'combo_king',
      name: 'Combo King',
      description: 'Maintain a 20+ hit streak.',
      icon: '🔥',
      tier: 'GOLD'
    },
    {
      id: 'speed_demon',
      name: 'Speed Demon',
      description: 'Clear a sector in record speed (< 10s).',
      icon: '⚡',
      tier: 'GOLD'
    }
  ];

  static checkNewAchievements(progress: PlayerProgress): Achievement[] {
    const unlockedIds = new Set(progress.achievements?.map(a => a.id) || []);
    const newlyUnlocked: Achievement[] = [];

    for (const def of this.ACHIEVEMENTS) {
      if (unlockedIds.has(def.id)) continue;

      let earned = false;
      switch (def.id) {
        case 'first_blood':
          earned = progress.runsCompleted >= 1;
          break;
        case 'perfectionist':
          earned = (progress.stats?.maxPerfectsInRun || 0) >= 10;
          break;
        case 'century':
          earned = progress.runsCompleted >= 100;
          break;
        case 'flawless':
          earned = Object.values(progress.mastery || {}).some(m => m.perfectRuns > 0);
          break;
        case 'master':
          earned = progress.level >= 10;
          break;
        case 'combo_king':
          earned = (progress.stats?.maxCombo || 0) >= 20;
          break;
        case 'speed_demon':
          earned = Object.values(progress.mastery || {}).some(m => m.bestTime > 0 && m.bestTime < 10000);
          break;
      }

      if (earned) {
        newlyUnlocked.push({ ...def, unlockedAt: new Date() });
      }
    }

    return newlyUnlocked;
  }
}
