// localStorage utilities for Personal Execution System

import { UserData, Statement, DailyCompletion, WeeklyReflection, BookInsight, DailyPractice, DailyRating } from './types';

const STORAGE_KEY = 'personal-execution-system';

// Initialize with default data if needed
const getDefaultData = (): UserData => ({
  statements: [],
  insights: [],
  practices: [],
  completions: [],
  reflections: [],
  dailyRatings: []
});

// Get all data from localStorage
export const getData = (): UserData => {
  if (typeof window === 'undefined') return getDefaultData();

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return getDefaultData();

  try {
    const data = JSON.parse(stored);
    // Ensure dailyRatings exists for backward compatibility
    if (!data.dailyRatings) {
      data.dailyRatings = [];
    }
    return data;
  } catch {
    return getDefaultData();
  }
};

// Save all data to localStorage
export const saveData = (data: UserData): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

// Statement operations
export const getStatements = (): Statement[] => {
  return getData().statements;
};

export const getStatementByType = (type: Statement['type']): Statement | undefined => {
  return getData().statements.find(s => s.type === type);
};

export const saveStatement = (statement: Statement): void => {
  const data = getData();
  const index = data.statements.findIndex(s => s.id === statement.id);

  if (index >= 0) {
    data.statements[index] = statement;
  } else {
    data.statements.push(statement);
  }

  saveData(data);
};

export const updateStatementContent = (id: string, newContent: string, note?: string): void => {
  const data = getData();
  const statement = data.statements.find(s => s.id === id);

  if (statement) {
    // Add current version to history
    statement.history.push({
      content: statement.content,
      timestamp: new Date().toISOString(),
      note
    });

    // Update content
    statement.content = newContent;
    statement.updatedAt = new Date().toISOString();

    saveData(data);
  }
};

// Daily completion operations
export const getCompletionsForDate = (date: string): DailyCompletion[] => {
  return getData().completions.filter(c => c.date === date);
};

export const getCompletionsForWeek = (weekStart: string, weekEnd: string): DailyCompletion[] => {
  return getData().completions.filter(c => c.date >= weekStart && c.date <= weekEnd);
};

export const togglePracticeCompletion = (date: string, practiceId: string): void => {
  const data = getData();
  const existing = data.completions.find(c => c.date === date && c.practiceId === practiceId);

  if (existing) {
    existing.completed = !existing.completed;
    existing.completedAt = existing.completed ? new Date().toISOString() : undefined;
  } else {
    data.completions.push({
      date,
      practiceId,
      completed: true,
      completedAt: new Date().toISOString()
    });
  }

  saveData(data);
};

// Weekly reflection operations
export const getReflectionsForWeek = (weekStart: string): WeeklyReflection | undefined => {
  return getData().reflections.find(r => r.weekStart === weekStart);
};

export const saveReflection = (reflection: WeeklyReflection): void => {
  const data = getData();
  const index = data.reflections.findIndex(r => r.id === reflection.id);

  if (index >= 0) {
    data.reflections[index] = reflection;
  } else {
    data.reflections.push(reflection);
  }

  saveData(data);
};

// Book insights
export const getInsights = (): BookInsight[] => {
  return getData().insights;
};

export const saveInsight = (insight: BookInsight): void => {
  const data = getData();
  data.insights.push(insight);
  saveData(data);
};

// Daily practices
export const getPractices = (): DailyPractice[] => {
  return getData().practices;
};

export const getPracticesByTime = (timeOfDay: 'morning' | 'evening'): DailyPractice[] => {
  return getData().practices.filter(p => p.timeOfDay === timeOfDay || p.timeOfDay === 'both');
};

export const savePractice = (practice: DailyPractice): void => {
  const data = getData();
  data.practices.push(practice);
  saveData(data);
};

// Utility functions
export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const getWeekStart = (date: Date): string => {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
  const monday = new Date(date.setDate(diff));
  return formatDate(monday);
};

export const getWeekEnd = (weekStart: string): string => {
  const start = new Date(weekStart);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return formatDate(end);
};

// Daily ratings
export const getRatingForDate = (date: string): DailyRating | undefined => {
  return getData().dailyRatings.find(r => r.date === date);
};

export const saveRating = (date: string, rating: number): void => {
  const data = getData();
  const existing = data.dailyRatings.findIndex(r => r.date === date);

  const ratingData: DailyRating = {
    date,
    rating,
    timestamp: new Date().toISOString()
  };

  if (existing >= 0) {
    data.dailyRatings[existing] = ratingData;
  } else {
    data.dailyRatings.push(ratingData);
  }

  saveData(data);
};

export const getRatingsForWeek = (weekStart: string, weekEnd: string): DailyRating[] => {
  return getData().dailyRatings.filter(r => r.date >= weekStart && r.date <= weekEnd);
};
