
export interface RunData {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  challengeId: string;
  score: number;
  createdAt: number;
  replayLog?: {
    ms: number;
    stability: number[];
  };
}

const STORAGE_KEY = 'flinch_db_sim';

const getDB = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : { runs: [], users: {} };
};

const saveDB = (db: any) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
};

export const firestoreService = {
  saveRun: async (run: Omit<RunData, 'id' | 'createdAt'>): Promise<string> => {
    await new Promise(r => setTimeout(r, 800)); 
    const db = getDB();
    const newRun: RunData = {
      ...run,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now()
    };
    db.runs.push(newRun);
    saveDB(db);
    return newRun.id;
  },

  getRun: async (runId: string): Promise<RunData | null> => {
    const db = getDB();
    return db.runs.find((r: RunData) => r.id === runId) || null;
  },

  getLeaderboard: async (challengeId: string, limit: number = 10): Promise<RunData[]> => {
    await new Promise(r => setTimeout(r, 600));
    const db = getDB();
    return db.runs
      .filter((r: RunData) => r.challengeId === challengeId)
      .sort((a: RunData, b: RunData) => b.score - a.score)
      .slice(0, limit);
  },

  getPercentile: async (challengeId: string, score: number): Promise<number> => {
    const db = getDB();
    const relevantRuns = db.runs.filter((r: RunData) => r.challengeId === challengeId);
    if (relevantRuns.length === 0) return 100;

    const worseScores = relevantRuns.filter((r: RunData) => r.score < score).length;
    const percentile = (worseScores / relevantRuns.length) * 100;
    return Math.round(percentile);
  }
};
