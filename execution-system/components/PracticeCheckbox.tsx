'use client';

import { DailyPractice } from '@/lib/types';

interface PracticeCheckboxProps {
  practice: DailyPractice;
  completed: boolean;
  onToggle: () => void;
}

export default function PracticeCheckbox({ practice, completed, onToggle }: PracticeCheckboxProps) {
  return (
    <label className="flex items-start space-x-3 cursor-pointer group">
      <input
        type="checkbox"
        checked={completed}
        onChange={onToggle}
        className="mt-1 h-5 w-5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 focus:ring-offset-0 cursor-pointer"
      />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className={`font-medium ${completed ? 'text-neutral-400 line-through' : 'text-neutral-900'}`}>
            {practice.name}
          </span>
          <span className="text-xs text-neutral-400">{practice.source}</span>
        </div>
        <p className={`text-sm mt-1 ${completed ? 'text-neutral-400' : 'text-neutral-600'}`}>
          {practice.description}
        </p>
      </div>
    </label>
  );
}
