// Core data types for the Personal Execution System

export interface Statement {
  id: string;
  type: 'faith' | 'chief-aim' | 'morning-commitment';
  content: string;
  createdAt: string;
  updatedAt: string;
  history: StatementVersion[];
}

export interface StatementVersion {
  content: string;
  timestamp: string;
  note?: string;
}

export interface BookInsight {
  id: string;
  book: string;
  insight: string;
  category: 'principle' | 'practice' | 'quote';
  createdAt: string;
}

export interface DailyPractice {
  id: string;
  name: string;
  description: string;
  frequency: 'daily' | 'weekly';
  timeOfDay: 'morning' | 'evening' | 'both';
  source: string; // e.g., "The 5 AM Club", "Think and Grow Rich"
}

export interface DailyCompletion {
  date: string; // YYYY-MM-DD
  practiceId: string;
  completed: boolean;
  completedAt?: string;
  notes?: string;
}

export interface WeeklyReflection {
  id: string;
  weekStart: string; // YYYY-MM-DD (Monday)
  weekEnd: string; // YYYY-MM-DD (Sunday)
  energy: number; // 1-10
  effectiveness: number; // 1-10
  progressTowardsGoals: number; // 1-10
  adherenceFeeling: string;
  wins: string;
  improvements: string;
  completedAt: string;
}

export interface UserData {
  statements: Statement[];
  insights: BookInsight[];
  practices: DailyPractice[];
  completions: DailyCompletion[];
  reflections: WeeklyReflection[];
}
