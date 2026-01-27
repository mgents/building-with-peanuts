'use client';

import { useEffect, useState } from 'react';
import { Statement, DailyPractice, DailyCompletion } from '@/lib/types';
import {
  getStatementByType,
  getPracticesByTime,
  getCompletionsForDate,
  togglePracticeCompletion,
  formatDate,
  getData,
  saveData
} from '@/lib/storage';
import { seedDefaultPractices, generateId } from '@/lib/seed-data';
import PracticeCheckbox from '@/components/PracticeCheckbox';

export default function MorningPage() {
  const [faithStatement, setFaithStatement] = useState<Statement | null>(null);
  const [chiefAim, setChiefAim] = useState<Statement | null>(null);
  const [morningPractices, setMorningPractices] = useState<DailyPractice[]>([]);
  const [completions, setCompletions] = useState<DailyCompletion[]>([]);
  const [today] = useState(() => formatDate(new Date()));
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    // Initialize data if needed
    const data = getData();

    // Seed practices if none exist
    if (data.practices.length === 0) {
      data.practices = seedDefaultPractices();

      // Create default statements
      if (data.statements.length === 0) {
        data.statements = [
          {
            id: generateId(),
            type: 'faith',
            content: 'Click Settings to set your faith statement - to be read twice daily with conviction.',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            history: []
          },
          {
            id: generateId(),
            type: 'chief-aim',
            content: 'Click Settings to define your definite chief aim - your burning desire and purpose.',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            history: []
          },
          {
            id: generateId(),
            type: 'morning-commitment',
            content: 'Click Settings to set your morning commitments.',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            history: []
          }
        ];
      }

      saveData(data);
    }

    // Load statements
    setFaithStatement(getStatementByType('faith') || null);
    setChiefAim(getStatementByType('chief-aim') || null);

    // Load morning practices
    setMorningPractices(getPracticesByTime('morning'));

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-neutral-900">Good Morning</h2>
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

      {/* Faith Statement */}
      {faithStatement && (
        <section className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
          <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-4">
            Faith Statement
          </h3>
          <p className="text-lg leading-relaxed text-neutral-900 whitespace-pre-wrap">
            {faithStatement.content}
          </p>
          <p className="text-xs text-neutral-400 mt-4">Read this twice daily with conviction</p>
        </section>
      )}

      {/* Chief Aim */}
      {chiefAim && (
        <section className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
          <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-4">
            Definite Chief Aim
          </h3>
          <p className="text-lg leading-relaxed text-neutral-900 whitespace-pre-wrap">
            {chiefAim.content}
          </p>
          <p className="text-xs text-neutral-400 mt-4">Your burning desire and purpose</p>
        </section>
      )}

      {/* Morning Practices */}
      <section className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
        <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-4">
          Morning Practices
        </h3>
        <div className="space-y-4">
          {morningPractices.map((practice) => (
            <PracticeCheckbox
              key={practice.id}
              practice={practice}
              completed={isPracticeCompleted(practice.id)}
              onToggle={() => handleToggle(practice.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
