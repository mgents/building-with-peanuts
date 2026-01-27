'use client';

import { useEffect, useState } from 'react';
import { Statement, DailyPractice, DailyCompletion } from '@/lib/types';
import {
  getStatementByType,
  getPracticesByTime,
  getPractices,
  getCompletionsForDate,
  getCompletionsForWeek,
  togglePracticeCompletion,
  formatDate,
  getData,
  saveData,
  getWeekStart,
  getWeekEnd,
  getRatingForDate,
  saveRating
} from '@/lib/storage';
import { seedDefaultPractices, generateId } from '@/lib/seed-data';
import PracticeCheckbox from '@/components/PracticeCheckbox';

export default function UnifiedPage() {
  const [faithStatement, setFaithStatement] = useState<Statement | null>(null);
  const [chiefAim, setChiefAim] = useState<Statement | null>(null);
  const [morningPractices, setMorningPractices] = useState<DailyPractice[]>([]);
  const [eveningPractices, setEveningPractices] = useState<DailyPractice[]>([]);
  const [completions, setCompletions] = useState<DailyCompletion[]>([]);
  const [today] = useState(() => formatDate(new Date()));
  const [currentTime, setCurrentTime] = useState('');
  const [dailyRating, setDailyRating] = useState<number>(0);
  const [weekStart, setWeekStart] = useState('');
  const [weekEnd, setWeekEnd] = useState('');
  const [practices, setPractices] = useState<DailyPractice[]>([]);
  const [weekCompletions, setWeekCompletions] = useState<DailyCompletion[]>([]);

  // Section visibility state
  const [morningExpanded, setMorningExpanded] = useState(true);
  const [eveningExpanded, setEveningExpanded] = useState(false);
  const [dashboardExpanded, setDashboardExpanded] = useState(false);

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

    // Load practices
    setMorningPractices(getPracticesByTime('morning'));
    setEveningPractices(getPracticesByTime('evening'));
    setPractices(getPractices());

    // Load completions
    setCompletions(getCompletionsForDate(today));

    // Load daily rating
    const existingRating = getRatingForDate(today);
    if (existingRating) {
      setDailyRating(existingRating.rating);
    }

    // Load week data for dashboard
    const todayDate = new Date();
    const start = getWeekStart(todayDate);
    const end = getWeekEnd(start);
    setWeekStart(start);
    setWeekEnd(end);
    setWeekCompletions(getCompletionsForWeek(start, end));

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
    setWeekCompletions(getCompletionsForWeek(weekStart, weekEnd));
  };

  const isPracticeCompleted = (practiceId: string): boolean => {
    return completions.some(c => c.practiceId === practiceId && c.completed);
  };

  const handleRatingChange = (rating: number) => {
    setDailyRating(rating);
    saveRating(today, rating);
  };

  // Dashboard calculations
  const getDaysInWeek = () => {
    if (!weekStart) return [];
    const days: Date[] = [];
    const start = new Date(weekStart);

    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }

    return days;
  };

  const getDailyCompletionRate = (date: Date): number => {
    const dateStr = formatDate(date);
    const dailyPractices = practices.filter(p => p.frequency === 'daily');
    const completed = weekCompletions.filter(
      c => c.date === dateStr && c.completed && dailyPractices.some(p => p.id === c.practiceId)
    );

    return dailyPractices.length > 0
      ? Math.round((completed.length / dailyPractices.length) * 100)
      : 0;
  };

  const getWeeklyCompletionRate = (): number => {
    const days = getDaysInWeek();
    if (days.length === 0) return 0;
    const rates = days.map(getDailyCompletionRate);
    const average = rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
    return Math.round(average);
  };

  const days = getDaysInWeek();
  const weeklyRate = getWeeklyCompletionRate();

  const isFriday = new Date().getDay() === 5;

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Header */}
      <div className="text-center bg-gradient-to-br from-zinc-700 via-zinc-700 to-zinc-800 p-6 sm:p-10 rounded-2xl shadow-2xl border border-amber-500/40 relative overflow-hidden">
        {/* Edge glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 via-transparent to-blue-500/20 rounded-2xl"></div>
        <div className="relative z-10">
          <h2 className="text-3xl sm:text-5xl font-serif font-bold tracking-wide bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 bg-clip-text text-transparent mb-1">
            The Sovereign Protocol
          </h2>
          <p className="text-3xl sm:text-5xl mt-4 font-serif font-bold text-white">{currentTime}</p>
          <p className="text-xs sm:text-sm mt-3 text-zinc-300 tracking-wide uppercase">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      </div>

      {/* Morning Section */}
      <section className="bg-zinc-700/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-amber-500/30 overflow-hidden">
        <button
          onClick={() => setMorningExpanded(!morningExpanded)}
          className="w-full px-4 sm:px-6 py-4 sm:py-5 bg-gradient-to-r from-zinc-700 via-zinc-600 to-zinc-700 text-white flex items-center justify-between hover:from-zinc-600 hover:via-zinc-500 hover:to-zinc-600 transition-all duration-500 border-b border-amber-500/20 group"
        >
          <div className="flex items-center space-x-3 sm:space-x-4">
            <span className="text-2xl sm:text-3xl">⚡</span>
            <h3 className="text-base sm:text-xl font-bold tracking-widest uppercase text-amber-300 group-hover:text-amber-200">
              Morning Protocol
            </h3>
          </div>
          <span className="text-xl sm:text-2xl text-amber-300">{morningExpanded ? '▼' : '▶'}</span>
        </button>

        {morningExpanded && (
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 bg-zinc-800/50">
            {/* Faith Statement */}
            {faithStatement && (
              <div className="bg-gradient-to-br from-zinc-700/90 to-zinc-800/90 backdrop-blur-xl p-5 sm:p-7 rounded-xl border border-amber-500/30 shadow-xl relative overflow-hidden group">
                {/* Edge glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-transparent to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <h4 className="text-xs sm:text-sm font-bold text-amber-300 uppercase tracking-widest mb-3 sm:mb-4 relative z-10">
                  ◆ Faith Protocol
                </h4>
                <p className="text-base sm:text-lg leading-relaxed text-zinc-100 whitespace-pre-wrap font-serif relative z-10">
                  {faithStatement.content}
                </p>
                <p className="text-xs text-zinc-400 mt-3 sm:mt-4 uppercase tracking-wide relative z-10">Execute with conviction</p>
              </div>
            )}

            {/* Chief Aim */}
            {chiefAim && (
              <div className="bg-gradient-to-br from-zinc-700/90 to-zinc-800/90 backdrop-blur-xl p-5 sm:p-7 rounded-xl border border-blue-500/30 shadow-xl relative overflow-hidden group">
                {/* Edge glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <h4 className="text-xs sm:text-sm font-bold text-blue-300 uppercase tracking-widest mb-3 sm:mb-4 relative z-10">
                  ◆ Primary Objective
                </h4>
                <p className="text-base sm:text-lg leading-relaxed text-zinc-100 whitespace-pre-wrap font-serif relative z-10">
                  {chiefAim.content}
                </p>
                <p className="text-xs text-zinc-400 mt-3 sm:mt-4 uppercase tracking-wide relative z-10">Mission critical</p>
              </div>
            )}

            {/* Friday Planning Banner */}
            {isFriday && (
              <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 border border-amber-500/40 p-5 rounded-xl shadow-xl backdrop-blur-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">🏆</span>
                  <div>
                    <p className="font-bold text-amber-400 uppercase tracking-wide">Strategic Planning Session</p>
                    <p className="text-sm text-zinc-400 tracking-wide">Friday protocol: Weekly review and optimization</p>
                  </div>
                </div>
              </div>
            )}

            {/* Morning Practices */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-zinc-300 uppercase tracking-wide">
                Today's Morning Practices
              </h4>
              {morningPractices.map((practice) => (
                <PracticeCheckbox
                  key={practice.id}
                  practice={practice}
                  completed={isPracticeCompleted(practice.id)}
                  onToggle={() => handleToggle(practice.id)}
                />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Evening Section */}
      <section className="bg-zinc-700/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-blue-500/30 overflow-hidden">
        <button
          onClick={() => setEveningExpanded(!eveningExpanded)}
          className="w-full px-4 sm:px-6 py-4 sm:py-5 bg-gradient-to-r from-zinc-700 via-zinc-600 to-zinc-700 text-white flex items-center justify-between hover:from-zinc-600 hover:via-zinc-500 hover:to-zinc-600 transition-all duration-500 border-b border-blue-500/20 group"
        >
          <div className="flex items-center space-x-3 sm:space-x-4">
            <span className="text-2xl sm:text-3xl">◆</span>
            <h3 className="text-base sm:text-xl font-bold tracking-widest uppercase text-blue-300 group-hover:text-blue-200">
              Evening Protocol
            </h3>
          </div>
          <span className="text-xl sm:text-2xl text-blue-300">{eveningExpanded ? '▼' : '▶'}</span>
        </button>

        {eveningExpanded && (
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 bg-zinc-800/50">
            {/* Faith Statement (2nd reading) */}
            {faithStatement && (
              <div className="bg-gradient-to-br from-zinc-700/90 to-zinc-800/90 backdrop-blur-xl p-5 sm:p-7 rounded-xl border border-amber-500/30 shadow-xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-transparent to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <h4 className="text-xs sm:text-sm font-bold text-amber-300 uppercase tracking-widest mb-3 sm:mb-4 relative z-10">
                  ◆ Faith Protocol (Second Execution)
                </h4>
                <p className="text-base sm:text-lg leading-relaxed text-zinc-100 whitespace-pre-wrap font-serif relative z-10">
                  {faithStatement.content}
                </p>
                <p className="text-xs text-zinc-400 mt-3 sm:mt-4 uppercase tracking-wide relative z-10">Reinforce with conviction</p>
              </div>
            )}

            {/* Evening Practices */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-zinc-300 uppercase tracking-wide">
                Evening Practices
              </h4>
              {eveningPractices.map((practice) => (
                <PracticeCheckbox
                  key={practice.id}
                  practice={practice}
                  completed={isPracticeCompleted(practice.id)}
                  onToggle={() => handleToggle(practice.id)}
                />
              ))}
            </div>

            {/* Daily Rating */}
            <div className="bg-gradient-to-br from-zinc-700/90 to-zinc-800/90 backdrop-blur-xl p-5 sm:p-7 rounded-xl border border-amber-500/40 shadow-xl">
              <h4 className="text-xs sm:text-sm font-bold text-amber-300 uppercase tracking-widest mb-4 sm:mb-6 text-center">
                ◆ Daily Performance Index
              </h4>
              <div className="flex items-center justify-center gap-3 sm:gap-4 mt-4">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleRatingChange(rating)}
                    className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full font-bold text-base sm:text-xl transition-all duration-300 font-serif relative ${
                      dailyRating === rating
                        ? 'bg-gradient-to-br from-amber-500 to-yellow-600 text-zinc-950 scale-110 shadow-2xl shadow-amber-500/50 border-2 border-amber-400'
                        : 'bg-gradient-to-br from-zinc-700 to-zinc-800 text-zinc-300 hover:text-amber-300 hover:scale-105 border border-zinc-600 hover:border-amber-500/50'
                    }`}
                  >
                    {rating}
                    {dailyRating === rating && (
                      <div className="absolute inset-0 rounded-full bg-amber-400/20 animate-pulse"></div>
                    )}
                  </button>
                ))}
              </div>
              {dailyRating > 0 && (
                <p className="text-center text-xs sm:text-sm text-zinc-300 mt-4 sm:mt-5 uppercase tracking-wide">
                  Performance Rating: <span className="text-amber-300 font-bold">{dailyRating}/5</span>
                </p>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Dashboard Section */}
      <section className="bg-zinc-700/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-zinc-600/50 overflow-hidden">
        <button
          onClick={() => setDashboardExpanded(!dashboardExpanded)}
          className="w-full px-4 sm:px-6 py-4 sm:py-5 bg-gradient-to-r from-zinc-700 via-zinc-600 to-zinc-700 text-white flex items-center justify-between hover:from-zinc-600 hover:via-zinc-500 hover:to-zinc-600 transition-all duration-500 border-b border-zinc-600/50 group"
        >
          <div className="flex items-center space-x-3 sm:space-x-4">
            <span className="text-2xl sm:text-3xl">◇</span>
            <h3 className="text-base sm:text-xl font-bold tracking-widest uppercase text-zinc-200 group-hover:text-zinc-100">
              Analytics Dashboard
            </h3>
            <span className="bg-gradient-to-r from-amber-500 to-yellow-600 text-zinc-950 px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-bold shadow-lg shadow-amber-500/30">
              {weeklyRate}%
            </span>
          </div>
          <span className="text-xl sm:text-2xl text-zinc-300">{dashboardExpanded ? '▼' : '▶'}</span>
        </button>

        {dashboardExpanded && weekStart && weekEnd && (
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 bg-zinc-800/50">
            <p className="text-center text-zinc-300 font-light uppercase tracking-wider text-xs sm:text-sm">
              {new Date(weekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -{' '}
              {new Date(weekEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>

            {/* Daily Breakdown */}
            <div className="space-y-3 bg-zinc-700/60 p-4 sm:p-5 rounded-xl border border-zinc-600/50">
              <h4 className="text-xs sm:text-sm font-bold text-zinc-200 uppercase tracking-widest mb-4">
                ◆ Weekly Metrics
              </h4>
              {days.map((day) => {
                const rate = getDailyCompletionRate(day);
                const isToday = formatDate(day) === formatDate(new Date());

                return (
                  <div key={formatDate(day)} className={`flex items-center gap-3 ${isToday ? 'font-semibold' : ''}`}>
                    <div className="w-20 sm:w-24 text-xs text-zinc-300 uppercase tracking-wide">
                      {day.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' })}
                      {isToday && <span className="text-amber-400 ml-1 text-[10px]">●</span>}
                    </div>
                    <div className="flex-1">
                      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden border border-zinc-600/50 shadow-inner">
                        <div
                          className={`h-full transition-all duration-700 ${
                            rate >= 80 ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 shadow-lg shadow-amber-500/50' :
                            rate >= 50 ? 'bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500 shadow-lg shadow-blue-500/30' :
                            'bg-zinc-700'
                          }`}
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-10 sm:w-12 text-right text-xs font-serif font-bold text-zinc-200">
                      {rate}<span className="text-[9px] text-zinc-400">%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
