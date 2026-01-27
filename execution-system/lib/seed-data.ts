// Default practices from Think and Grow Rich and The 5 AM Club

import { DailyPractice } from './types';

export const defaultPractices: Omit<DailyPractice, 'id'>[] = [
  // The 5 AM Club practices
  {
    name: '5 AM Wake-up',
    description: 'Wake at 5:00 AM to own your morning and elevate your life',
    frequency: 'daily',
    timeOfDay: 'morning',
    source: 'The 5 AM Club'
  },
  {
    name: '20/20/20 Formula - Move',
    description: 'First 20 minutes: Intense exercise to release BDNF, dopamine, and serotonin',
    frequency: 'daily',
    timeOfDay: 'morning',
    source: 'The 5 AM Club'
  },
  {
    name: '20/20/20 Formula - Reflect',
    description: 'Second 20 minutes: Deep reflection through journaling, meditation, or prayer',
    frequency: 'daily',
    timeOfDay: 'morning',
    source: 'The 5 AM Club'
  },
  {
    name: '20/20/20 Formula - Grow',
    description: 'Third 20 minutes: Learning through reading, audiobooks, or courses',
    frequency: 'daily',
    timeOfDay: 'morning',
    source: 'The 5 AM Club'
  },
  {
    name: 'Gratitude Practice',
    description: 'Express gratitude for what you have and what you accomplished today',
    frequency: 'daily',
    timeOfDay: 'evening',
    source: 'The 5 AM Club'
  },

  // Think and Grow Rich practices
  {
    name: 'Read Chief Aim Aloud',
    description: 'Read your definite chief aim aloud with faith and emotion',
    frequency: 'daily',
    timeOfDay: 'both',
    source: 'Think and Grow Rich'
  },
  {
    name: 'Autosuggestion Practice',
    description: 'Repeat affirmations to influence your subconscious mind',
    frequency: 'daily',
    timeOfDay: 'evening',
    source: 'Think and Grow Rich'
  },
  {
    name: 'Specialized Knowledge Study',
    description: 'Study specialized knowledge related to your definite purpose',
    frequency: 'daily',
    timeOfDay: 'morning',
    source: 'Think and Grow Rich'
  },
  {
    name: 'Evening Reflection',
    description: 'Review the day, assess progress, and plan tomorrow with purpose',
    frequency: 'daily',
    timeOfDay: 'evening',
    source: 'Think and Grow Rich'
  },
  {
    name: 'Weekly Planning Session',
    description: 'Review weekly progress, refine plans, and set intentions for the coming week',
    frequency: 'weekly',
    timeOfDay: 'morning',
    source: 'Both'
  }
];

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const seedDefaultPractices = (): DailyPractice[] => {
  return defaultPractices.map(practice => ({
    ...practice,
    id: generateId()
  }));
};
