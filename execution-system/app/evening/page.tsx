'use client';

import { useEffect, useState } from 'react';
import { Statement, DailyPractice, DailyCompletion } from '@/lib/types';
import {
  getStatementByType,
  getPracticesByTime,
  getCompletionsForDate,
  togglePracticeCompletion,
  formatDate
} from '@/lib/storage';
import PracticeCheckbox from '@/components/PracticeCheckbox';

export default function EveningPage() {
  const [faithStatement, setFaithStatement] = useState<Statement | null>(null);
  const [chiefAim, setChiefAim] = useState<Statement | null>(null);
  const [eveningPractices, setEveningPractices] = useState<DailyPractice[]>([]);
  const [completions, setCompletions] = useState<DailyCompletion[]>([]);
  const [today] = useState(() => formatDate(new Date()));
  const [currentTime, setCurrentTime] = useState('');
  const [reflectionNotes, setReflectionNotes] = useState('');

  useEffect(() => {
    // Load statements
    setFaithStatement(getStatementByType('faith') || null);
    setChiefAim(getStatementByType('chief-aim') || null);

    // Load evening practices
    setEveningPractices(getPracticesByTime('evening'));

    // Load completions
    setCompletions(getCompletionsForDate(today));

    // Update time
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);

    return () => clearInterval(interval);
  }, [today]);

  const handleToggle = (practiceId: string) => {
    togglePracticeCompletion(today, practiceId);
    setCompletions(getCompletionsForDate(today));
  };

  const isPracticeCompleted = (practiceId: string): boolean => {
    return completions.some(c => c.practiceId === practiceId && c.completed);
  };

  const morningPractices = getPracticesByTime('morning');
  const morningCompletions = completions.filter(c =>
    morningPractices.some(p => p.id === c.practiceId && c.completed)
  );
  const completionRate = morningPractices.length > 0
    ? Math.round((morningCompletions.length / morningPractices.length) * 100)
    : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-neutral-900">Good Evening</h2>
        <p className="text-neutral-600 mt-2">{currentTime}</p>
        <p className="text-sm text-neutral-500">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>

      {/* Daily Progress */}
      <section className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
        <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-4">
          Today&apos;s Progress
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-neutral-900">{completionRate}%</p>
            <p className="text-sm text-neutral-600">Morning practices completed</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-neutral-900">
              {morningCompletions.length} / {morningPractices.length}
            </p>
            <p className="text-sm text-neutral-600">practices</p>
          </div>
        </div>
      </section>

      {/* Faith Statement (Evening reading) */}
      {faithStatement && (
        <section className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
          <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-4">
            Faith Statement
          </h3>
          <p className="text-lg leading-relaxed text-neutral-900 whitespace-pre-wrap">
            {faithStatement.content}
          </p>
          <p className="text-xs text-neutral-400 mt-4">Second reading - reinforce your faith</p>
        </section>
      )}

      {/* Evening Practices */}
      <section className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
        <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-4">
          Evening Practices
        </h3>
        <div className="space-y-4">
          {eveningPractices.map((practice) => (
            <PracticeCheckbox
              key={practice.id}
              practice={practice}
              completed={isPracticeCompleted(practice.id)}
              onToggle={() => handleToggle(practice.id)}
            />
          ))}
        </div>
      </section>

      {/* Evening Reflection */}
      <section className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
        <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-4">
          Daily Reflection
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              What did I accomplish today toward my chief aim?
            </label>
            <textarea
              value={reflectionNotes}
              onChange={(e) => setReflectionNotes(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-neutral-900 focus:border-neutral-900"
              placeholder="Reflect on your progress, lessons learned, and tomorrow's focus..."
            />
          </div>
          <p className="text-xs text-neutral-500">
            Review your day with honesty. Celebrate wins and identify improvements for tomorrow.
          </p>
        </div>
      </section>
    </div>
  );
}
