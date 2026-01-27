'use client';

import { useEffect, useState } from 'react';
import { BookInsight } from '@/lib/types';
import { getInsights, saveInsight, getData, saveData } from '@/lib/storage';
import { generateId } from '@/lib/seed-data';

export default function InsightsPage() {
  const [insights, setInsights] = useState<BookInsight[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [book, setBook] = useState('');
  const [insight, setInsight] = useState('');
  const [category, setCategory] = useState<'principle' | 'practice' | 'quote'>('principle');
  const [filterBook, setFilterBook] = useState<string>('all');

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = () => {
    setInsights(getInsights());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (book.trim() && insight.trim()) {
      const newInsight: BookInsight = {
        id: generateId(),
        book: book.trim(),
        insight: insight.trim(),
        category,
        createdAt: new Date().toISOString()
      };

      saveInsight(newInsight);
      loadInsights();

      // Reset form
      setBook('');
      setInsight('');
      setCategory('principle');
      setShowForm(false);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this insight?')) {
      const data = getData();
      data.insights = data.insights.filter(i => i.id !== id);
      saveData(data);
      loadInsights();
    }
  };

  const uniqueBooks = Array.from(new Set(insights.map(i => i.book))).sort();

  const filteredInsights = filterBook === 'all'
    ? insights
    : insights.filter(i => i.book === filterBook);

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'principle':
        return 'bg-blue-100 text-blue-800';
      case 'practice':
        return 'bg-green-100 text-green-800';
      case 'quote':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-neutral-900">Book Insights</h2>
          <p className="text-neutral-600 mt-2">
            Capture and internalize key insights from your reading
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 text-sm font-medium text-white bg-neutral-900 rounded-md hover:bg-neutral-800"
        >
          {showForm ? 'Cancel' : '+ Add Insight'}
        </button>
      </div>

      {/* Add Insight Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200 space-y-4"
        >
          <h3 className="text-lg font-semibold text-neutral-900">Add New Insight</h3>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Book Title
            </label>
            <input
              type="text"
              value={book}
              onChange={(e) => setBook(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-neutral-900 focus:border-neutral-900"
              placeholder="e.g., Think and Grow Rich, The 5 AM Club"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-neutral-900 focus:border-neutral-900"
            >
              <option value="principle">Principle</option>
              <option value="practice">Practice</option>
              <option value="quote">Quote</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Insight
            </label>
            <textarea
              value={insight}
              onChange={(e) => setInsight(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-neutral-900 focus:border-neutral-900"
              placeholder="Write the key insight, principle, practice, or quote..."
              required
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-neutral-900 rounded-md hover:bg-neutral-800"
          >
            Save Insight
          </button>
        </form>
      )}

      {/* Filter */}
      {uniqueBooks.length > 0 && (
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-neutral-700">Filter by book:</label>
          <select
            value={filterBook}
            onChange={(e) => setFilterBook(e.target.value)}
            className="px-3 py-2 border border-neutral-300 rounded-md focus:ring-neutral-900 focus:border-neutral-900"
          >
            <option value="all">All Books ({insights.length})</option>
            {uniqueBooks.map(bookName => (
              <option key={bookName} value={bookName}>
                {bookName} ({insights.filter(i => i.book === bookName).length})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Insights List */}
      {filteredInsights.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow-sm border border-neutral-200 text-center">
          <p className="text-neutral-600">
            No insights yet. Click &quot;Add Insight&quot; to capture key learnings from your reading.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInsights
            .slice()
            .reverse()
            .map((item) => (
              <div
                key={item.id}
                className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="font-semibold text-neutral-900">{item.book}</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getCategoryColor(item.category)}`}>
                      {item.category}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
                <p className="text-neutral-900 whitespace-pre-wrap leading-relaxed">
                  {item.insight}
                </p>
                <p className="text-xs text-neutral-400 mt-3">
                  Added {new Date(item.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
