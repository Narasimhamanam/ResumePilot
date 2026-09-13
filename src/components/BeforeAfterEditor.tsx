import React, { useState } from 'react';
import { StructuredResume, ResumeDiffChange } from '../types';
import { Check, X, CheckCheck, Undo2, AlertTriangle, Sparkles, Edit3 } from 'lucide-react';

interface BeforeAfterEditorProps {
  originalResume: StructuredResume;
  enhancedResume: StructuredResume;
  changes: ResumeDiffChange[];
  onChangeStatusUpdate: (changeId: string, status: 'accepted' | 'rejected') => void;
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onSaveVersion: (finalResume: StructuredResume) => void;
}

export const BeforeAfterEditor: React.FC<BeforeAfterEditorProps> = ({
  originalResume,
  enhancedResume,
  changes,
  onChangeStatusUpdate,
  onAcceptAll,
  onRejectAll,
  onSaveVersion,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [manualEditText, setManualEditText] = useState('');
  const [editingChangeId, setEditingChangeId] = useState<string | null>(null);

  const pendingCount = changes.filter((c) => c.status === 'pending').length;
  const acceptedCount = changes.filter((c) => c.status === 'accepted').length;

  const filteredChanges = changes.filter((c) => {
    if (activeFilter === 'all') return true;
    return c.status === activeFilter;
  });

  return (
    <div id="before-after-editor" className="space-y-6">
      {/* Top Banner & Batch Actions */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-base">Resume Enhancer & Diff Inspector</h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {pendingCount} Pending Review
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Compare original resume statements against AI-strengthened bullet points. Approve individual changes or accept in bulk.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="accept-all-changes-btn"
            onClick={onAcceptAll}
            className="px-3.5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Accept All ({changes.length})
          </button>
          <button
            id="reject-all-changes-btn"
            onClick={onRejectAll}
            className="px-3.5 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition flex items-center gap-1.5"
          >
            <Undo2 className="w-3.5 h-3.5" />
            Reject All
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 rounded-lg font-medium transition ${
            activeFilter === 'all'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Changes ({changes.length})
        </button>
        <button
          onClick={() => setActiveFilter('pending')}
          className={`px-3 py-1.5 rounded-lg font-medium transition ${
            activeFilter === 'pending'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Pending ({pendingCount})
        </button>
        <button
          onClick={() => setActiveFilter('accepted')}
          className={`px-3 py-1.5 rounded-lg font-medium transition ${
            activeFilter === 'accepted'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Accepted ({acceptedCount})
        </button>
      </div>

      {/* Changes Feed */}
      <div className="space-y-4">
        {filteredChanges.length === 0 ? (
          <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl text-slate-500 text-sm">
            No changes found in this filter category.
          </div>
        ) : (
          filteredChanges.map((change) => {
            const isAccepted = change.status === 'accepted';
            const isRejected = change.status === 'rejected';

            return (
              <div
                key={change.id}
                id={`diff-item-${change.id}`}
                className={`bg-white border rounded-2xl p-5 shadow-2xs transition-all ${
                  isAccepted
                    ? 'border-emerald-300 bg-emerald-50/20'
                    : isRejected
                    ? 'border-slate-200 opacity-60'
                    : 'border-slate-200 hover:border-indigo-300'
                }`}
              >
                {/* Header row */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {change.section}
                    </span>
                    <span className="text-xs text-slate-500">{change.reason}</span>
                  </div>

                  {change.hasUnsupportedClaimWarning && (
                    <div className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Suggested improvement — requires user confirmation</span>
                    </div>
                  )}
                </div>

                {/* Diff Comparison Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  {/* Original */}
                  <div className="p-3.5 rounded-xl bg-rose-50/40 border border-rose-100">
                    <div className="text-[10px] uppercase font-bold text-rose-600 mb-1.5 font-sans">
                      Original Statement
                    </div>
                    <div className="text-slate-800 leading-relaxed whitespace-pre-wrap">
                      {change.originalText}
                    </div>
                  </div>

                  {/* Enhanced */}
                  <div className="p-3.5 rounded-xl bg-emerald-50/40 border border-emerald-100">
                    <div className="text-[10px] uppercase font-bold text-emerald-600 mb-1.5 font-sans flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        AI Enhanced Phrasing
                      </span>
                    </div>
                    <div className="text-slate-900 font-medium leading-relaxed whitespace-pre-wrap">
                      {change.enhancedText}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs">
                    Status:{' '}
                    <span
                      className={`font-semibold capitalize ${
                        isAccepted
                          ? 'text-emerald-600'
                          : isRejected
                          ? 'text-slate-500'
                          : 'text-amber-600'
                      }`}
                    >
                      {change.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      id={`accept-change-${change.id}`}
                      onClick={() => onChangeStatusUpdate(change.id, 'accepted')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                        isAccepted
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      Accept
                    </button>
                    <button
                      id={`reject-change-${change.id}`}
                      onClick={() => onChangeStatusUpdate(change.id, 'rejected')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                        isRejected
                          ? 'bg-slate-700 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <X className="w-3.5 h-3.5" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <button
          id="save-enhanced-resume-version-btn"
          onClick={() => onSaveVersion(enhancedResume)}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow transition flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Save As Enhanced Version
        </button>
      </div>
    </div>
  );
};
