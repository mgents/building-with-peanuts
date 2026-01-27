'use client';

import { useEffect, useState } from 'react';
import { WeeklyReflection } from '@/lib/types';
import {
  getReflectionsForWeek,
  saveReflection,
  formatDate,
  getWeekStart,
  getWeekEnd,
  getPractices,
  getCompletionsForWeek
} from '@/lib/storage';
import { generateId } from '@/lib/seed-data';

export default function ReflectionPage() {
  const [weekStart, setWeekStart] = useState('');
  const [weekEnd, setWeekEnd] = useState('');
  const [reflection, setReflection] = useState<WeeklyReflection | null>(null);
  const [energy, setEnergy] = useState(5);
  const [effectiveness, setEffectiveness] = useState(5);
  const [progressTowardsGoals, setProgressTowardsGoals] = useState(5);
  const [adherenceFeeling, setAdherenceFeeling] = useState('');
  const [wins, setWins] = useState('');
  const [improvements, setImprovements] = useState('');
  const [saved, setSaved] = useState(false);
  const [weeklyStats, setWeeklyStats] = useState({ rate: 0, total: 0 });

  useEffect(() => {
    const today = new Date();
    const start = getWeekStart(today);
    const end = getWeekEnd(start);

    setWeekStart(start);
    setWeekEnd(end);

    // Load existing reflection if it exists
    const existing = getReflectionsForWeek(start);
    if (existing) {
      setReflection(existing);
      setEnergy(existing.energy);
      setEffectiveness(existing.effectiveness);
      setProgressTowardsGoals(existing.progressTowardsGoals);
      setAdherenceFeeling(existing.adherenceFeeling);
      setWins(existing.wins);
      setImprovements(existing.improvements);
    }

    // Calculate weekly stats
    const practices = getPractices().filter(p => p.frequency === 'daily');
    const completions = getCompletionsForWeek(start, end).filter(c => c.completed);
    const maxPossible = practices.length * 7;
    const rate = maxPossible > 0 ? Math.round((completions.length / maxPossible) * 100) : 0;

    setWeeklyStats({ rate, total: completions.length });
  }, []);

  const handleSave = () => {
    const reflectionData: WeeklyReflection = {
      id: reflection?.id || generateId(),
      weekStart,
      weekEnd,
      energy,
      effectiveness,
      progressTowardsGoals,
      adherenceFeeling,
      wins,
      improvements,
      completedAt: new Date().toISOString()
    };

    saveReflection(reflectionData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const ScaleInput = ({
    label,
    value,
    onChange,
    description
  }: {
    label: string;
    value: number;
    onChange: (value: number) => void;
    description: string;
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-neutral-700">
        {label}
      </label>
      <p className="text-xs text-neutral-500">{description}</p>
      <div className="flex items-center space-x-4">
        <input
          type="range"
          min="1"
          max="10"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="flex-1 h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
        />
        <span className="text-2xl font-bold text-neutral-900 w-12 text-center">
          {value}
        </span>
      </div>
      <div className="flex justify-between text-xs text-neutral-500">
        <span>Low</span>
        <span>High</span>
      </div>
    </div>
  );

  // Don't render until dates are initialized
  if (!weekStart || !weekEnd) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-neutral-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-neutral-900">Weekly Reflection</h2>
        <p className="text-neutral-600 mt-2">
          Week of {new Date(weekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -{' '}
          {new Date(weekEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* Weekly Stats */}
      <section className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
        <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-4">
          This Week&apos;s Performance
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-3xl font-bold text-neutral-900">{weeklyStats.rate}%</p>
            <p className="text-sm text-neutral-600">Adherence Rate</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-neutral-900">{weeklyStats.total}</p>
            <p className="text-sm text-neutral-600">Practices Completed</p>
          </div>
        </div>
      </section>

      {/* Reflection Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
        className="space-y-6"
      >
        {/* Scale Questions */}
        <section className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200 space-y-6">
          <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide">
            Self-Assessment
          </h3>

          <ScaleInput
            label="Personal Energy"
            value={energy}
            onChange={setEnergy}
            description="How would you rate your overall energy and vitality this week?"
          />

          <ScaleInput
            label="Effectiveness"
            value={effectiveness}
            onChange={setEffectiveness}
            description="How effective were you at executing your most important tasks?"
          />

          <ScaleInput
            label="Progress Towards Goals"
            value={progressTowardsGoals}
            onChange={setProgressTowardsGoals}
            description="How much progress did you make toward your chief aim and goals?"
          />
        </section>

        {/* Text Reflections */}
        <section className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200 space-y-6">
          <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide">
            Reflections
          </h3>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              How do you feel about your adherence this week?
            </label>
            <textarea
              value={adherenceFeeling}
              onChange={(e) => setAdherenceFeeling(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-neutral-900 focus:border-neutral-900"
              placeholder="Be honest about your consistency, what worked, what didn't..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              What were your wins this week?
            </label>
            <textarea
              value={wins}
              onChange={(e) => setWins(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-neutral-900 focus:border-neutral-900"
              placeholder="Celebrate your victories, no matter how small..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              What will you improve next week?
            </label>
            <textarea
              value={improvements}
              onChange={(e) => setImprovements(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-neutral-900 focus:border-neutral-900"
              placeholder="Identify specific areas for improvement and your plan to address them..."
            />
          </div>
        </section>

        {/* Save Button */}
        <div className="flex items-center space-x-4">
          <button
            type="submit"
            className="px-6 py-3 text-sm font-medium text-white bg-neutral-900 rounded-md hover:bg-neutral-800"
          >
            Save Reflection
          </button>
          {saved && (
            <span className="text-green-600 font-medium">Reflection saved successfully!</span>
          )}
        </div>
      </form>

      <div className="text-sm text-neutral-500">
        <p>
          Weekly reflections help you identify patterns, celebrate progress, and continuously improve
          your execution. Be honest with yourself - this is for your growth.
        </p>
      </div>
    </div>
  );
}
