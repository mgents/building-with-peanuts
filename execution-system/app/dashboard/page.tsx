'use client';

import { useEffect, useState } from 'react';
import { DailyPractice, DailyCompletion } from '@/lib/types';
import {
  getPractices,
  getCompletionsForWeek,
  formatDate,
  getWeekStart,
  getWeekEnd
} from '@/lib/storage';

export default function DashboardPage() {
  const [practices, setPractices] = useState<DailyPractice[]>([]);
  const [weekStart, setWeekStart] = useState('');
  const [weekEnd, setWeekEnd] = useState('');
  const [completions, setCompletions] = useState<DailyCompletion[]>([]);

  useEffect(() => {
    const today = new Date();
    const start = getWeekStart(today);
    const end = getWeekEnd(start);

    setWeekStart(start);
    setWeekEnd(end);
    setPractices(getPractices());
    setCompletions(getCompletionsForWeek(start, end));
  }, []);

  const getDaysInWeek = () => {
    const days: Date[] = [];
    const start = new Date(weekStart);

    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }

    return days;
  };

  const isPracticeCompletedOnDay = (practiceId: string, date: Date): boolean => {
    const dateStr = formatDate(date);
    return completions.some(c => c.practiceId === practiceId && c.date === dateStr && c.completed);
  };

  const getDailyCompletionRate = (date: Date): number => {
    const dateStr = formatDate(date);
    const dailyPractices = practices.filter(p => p.frequency === 'daily');
    const completed = completions.filter(
      c => c.date === dateStr && c.completed && dailyPractices.some(p => p.id === c.practiceId)
    );

    return dailyPractices.length > 0
      ? Math.round((completed.length / dailyPractices.length) * 100)
      : 0;
  };

  const getWeeklyCompletionRate = (): number => {
    const days = getDaysInWeek();
    const rates = days.map(getDailyCompletionRate);
    const average = rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
    return Math.round(average);
  };

  const getTotalCompletedPractices = (): number => {
    return completions.filter(c => c.completed).length;
  };

  const getCurrentStreak = (): number => {
    const days = getDaysInWeek();
    let streak = 0;

    for (let i = days.length - 1; i >= 0; i--) {
      const rate = getDailyCompletionRate(days[i]);
      if (rate >= 50) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  // Don't render until dates are initialized
  if (!weekStart || !weekEnd) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-neutral-600">Loading...</p>
      </div>
    );
  }

  const days = getDaysInWeek();
  const weeklyRate = getWeeklyCompletionRate();
  const totalCompleted = getTotalCompletedPractices();
  const currentStreak = getCurrentStreak();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-neutral-900">Dashboard</h2>
        <p className="text-neutral-600 mt-2">
          Week of {new Date(weekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -{' '}
          {new Date(weekEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
          <p className="text-sm font-semibold text-neutral-500 uppercase tracking-wide">
            Weekly Adherence
          </p>
          <p className="text-3xl font-bold text-neutral-900 mt-2">{weeklyRate}%</p>
          <p className="text-xs text-neutral-500 mt-1">Average completion rate</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
          <p className="text-sm font-semibold text-neutral-500 uppercase tracking-wide">
            Total Completed
          </p>
          <p className="text-3xl font-bold text-neutral-900 mt-2">{totalCompleted}</p>
          <p className="text-xs text-neutral-500 mt-1">Practices this week</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
          <p className="text-sm font-semibold text-neutral-500 uppercase tracking-wide">
            Current Streak
          </p>
          <p className="text-3xl font-bold text-neutral-900 mt-2">{currentStreak}</p>
          <p className="text-xs text-neutral-500 mt-1">Days with 50%+ completion</p>
        </div>
      </div>

      {/* Daily Breakdown */}
      <section className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
        <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-6">
          Daily Breakdown
        </h3>
        <div className="space-y-3">
          {days.map((day) => {
            const rate = getDailyCompletionRate(day);
            const isToday = formatDate(day) === formatDate(new Date());

            return (
              <div key={formatDate(day)} className={`flex items-center ${isToday ? 'font-semibold' : ''}`}>
                <div className="w-24 text-sm text-neutral-700">
                  {day.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  {isToday && <span className="text-neutral-400 ml-1">(today)</span>}
                </div>
                <div className="flex-1">
                  <div className="h-6 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        rate >= 80 ? 'bg-green-500' : rate >= 50 ? 'bg-yellow-500' : 'bg-neutral-300'
                      }`}
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                </div>
                <div className="w-12 text-right text-sm font-semibold text-neutral-900">
                  {rate}%
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Practice Heatmap */}
      <section className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
        <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-6">
          Practice Completion
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-2 px-2 font-medium text-neutral-700">Practice</th>
                {days.map((day) => (
                  <th key={formatDate(day)} className="text-center py-2 px-2 font-medium text-neutral-700">
                    {day.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {practices.filter(p => p.frequency === 'daily').map((practice) => (
                <tr key={practice.id} className="border-b border-neutral-100">
                  <td className="py-3 px-2 text-neutral-900">{practice.name}</td>
                  {days.map((day) => {
                    const completed = isPracticeCompletedOnDay(practice.id, day);
                    return (
                      <td key={formatDate(day)} className="text-center py-3 px-2">
                        <div
                          className={`w-6 h-6 mx-auto rounded ${
                            completed ? 'bg-green-500' : 'bg-neutral-200'
                          }`}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
