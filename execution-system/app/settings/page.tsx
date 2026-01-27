'use client';

import { useEffect, useState } from 'react';
import { Statement } from '@/lib/types';
import { getStatements, updateStatementContent } from '@/lib/storage';

export default function SettingsPage() {
  const [statements, setStatements] = useState<Statement[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showHistory, setShowHistory] = useState<string | null>(null);

  useEffect(() => {
    loadStatements();
  }, []);

  const loadStatements = () => {
    setStatements(getStatements());
  };

  const startEditing = (statement: Statement) => {
    setEditingId(statement.id);
    setEditContent(statement.content);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditContent('');
  };

  const saveEdit = (id: string) => {
    if (editContent.trim()) {
      updateStatementContent(id, editContent.trim());
      loadStatements();
      cancelEditing();
    }
  };

  const toggleHistory = (id: string) => {
    setShowHistory(showHistory === id ? null : id);
  };

  const getStatementLabel = (type: Statement['type']): string => {
    switch (type) {
      case 'faith':
        return 'Faith Statement';
      case 'chief-aim':
        return 'Definite Chief Aim';
      case 'morning-commitment':
        return 'Morning Commitments';
      default:
        return type;
    }
  };

  const getStatementDescription = (type: Statement['type']): string => {
    switch (type) {
      case 'faith':
        return 'Read twice daily with conviction to condition your mind for success';
      case 'chief-aim':
        return 'Your burning desire and definite purpose - the goal that drives all your actions';
      case 'morning-commitment':
        return 'The commitments you make to yourself each morning';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-neutral-900">Settings</h2>
        <p className="text-neutral-600 mt-2">
          Edit your core statements and view version history
        </p>
      </div>

      {/* Statements */}
      <div className="space-y-6">
        {statements.map((statement) => (
          <section key={statement.id} className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900">
                  {getStatementLabel(statement.type)}
                </h3>
                <p className="text-sm text-neutral-500 mt-1">
                  {getStatementDescription(statement.type)}
                </p>
              </div>
              {editingId !== statement.id && (
                <button
                  onClick={() => startEditing(statement)}
                  className="px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 rounded-md hover:bg-neutral-200"
                >
                  Edit
                </button>
              )}
            </div>

            {editingId === statement.id ? (
              <div className="space-y-4">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-neutral-900 focus:border-neutral-900"
                  placeholder={`Enter your ${getStatementLabel(statement.type).toLowerCase()}...`}
                />
                <div className="flex space-x-2">
                  <button
                    onClick={() => saveEdit(statement.id)}
                    className="px-4 py-2 text-sm font-medium text-white bg-neutral-900 rounded-md hover:bg-neutral-800"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 rounded-md hover:bg-neutral-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-neutral-900 whitespace-pre-wrap leading-relaxed">
                  {statement.content}
                </p>

                {/* Version History */}
                {statement.history.length > 0 && (
                  <div className="mt-4">
                    <button
                      onClick={() => toggleHistory(statement.id)}
                      className="text-sm text-neutral-600 hover:text-neutral-900 flex items-center"
                    >
                      <span>{showHistory === statement.id ? '▼' : '▶'}</span>
                      <span className="ml-2">
                        Version History ({statement.history.length} previous versions)
                      </span>
                    </button>

                    {showHistory === statement.id && (
                      <div className="mt-4 space-y-3 pl-6 border-l-2 border-neutral-200">
                        {statement.history
                          .slice()
                          .reverse()
                          .map((version, index) => (
                            <div key={index} className="text-sm">
                              <p className="text-neutral-500">
                                {new Date(version.timestamp).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                              {version.note && (
                                <p className="text-neutral-600 italic mt-1">{version.note}</p>
                              )}
                              <p className="text-neutral-700 mt-2 whitespace-pre-wrap">
                                {version.content}
                              </p>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}

                <p className="text-xs text-neutral-400 mt-4">
                  Last updated: {new Date(statement.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </>
            )}
          </section>
        ))}
      </div>

      {/* Weekly Reflection Link */}
      <section className="bg-neutral-100 p-6 rounded-lg border border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
          Weekly Reflection
        </h3>
        <p className="text-sm text-neutral-600 mb-4">
          Complete your weekly reflection to assess energy, effectiveness, and progress
        </p>
        <a
          href="/reflection"
          className="inline-block px-4 py-2 text-sm font-medium text-white bg-neutral-900 rounded-md hover:bg-neutral-800"
        >
          Go to Weekly Reflection
        </a>
      </section>
    </div>
  );
}
