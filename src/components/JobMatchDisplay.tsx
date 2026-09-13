import React, { useState } from 'react';
import { JobMatchResult, ParsedJobDescription } from '../types';
import { Check, X, AlertTriangle, Sparkles, Building, MapPin, Briefcase, ChevronRight } from 'lucide-react';

interface JobMatchDisplayProps {
  job: ParsedJobDescription;
  matchResult: JobMatchResult;
  onGenerateTailoredApplication: () => void;
  isGenerating?: boolean;
}

export const JobMatchDisplay: React.FC<JobMatchDisplayProps> = ({
  job,
  matchResult,
  onGenerateTailoredApplication,
  isGenerating,
}) => {
  const getScoreColor = (pct: number) => {
    if (pct >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (pct >= 60) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  return (
    <div id="job-match-display-card" className="space-y-6">
      {/* Overview Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div
              className={`w-18 h-18 rounded-2xl flex flex-col items-center justify-center border font-bold ${getScoreColor(
                matchResult.matchPercentage
              )}`}
            >
              <span className="text-3xl leading-none">{matchResult.matchPercentage}%</span>
              <span className="text-[10px] uppercase font-semibold text-slate-500 mt-1">Match Score</span>
            </div>

            <div>
              <h3 className="font-bold text-lg text-slate-900">{job.jobTitle}</h3>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                <span className="flex items-center gap-1 font-medium text-slate-700">
                  <Building className="w-3.5 h-3.5 text-slate-400" /> {job.company}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.location || 'Remote'}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" /> {job.jobType}
                </span>
              </div>
            </div>
          </div>

          <button
            id="tailor-and-generate-btn"
            onClick={onGenerateTailoredApplication}
            disabled={isGenerating}
            className="w-full md:w-auto px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            {isGenerating ? 'Tailoring Resume & Email...' : 'Generate Tailored Application Package'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Fit Summary */}
        <div className="pt-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Candidate Fit Summary</h4>
          <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
            {matchResult.fitSummary}
          </p>
        </div>
      </div>

      {/* Skills Comparison Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Matching Skills */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Check className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-slate-800">
              Matching Skills ({matchResult.matchingSkills.length})
            </h4>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {matchResult.matchingSkills.map((sk) => (
              <span
                key={sk}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
              >
                {sk}
              </span>
            ))}
            {matchResult.matchingSkills.length === 0 && (
              <span className="text-xs text-slate-400 italic">No exact skill matches identified.</span>
            )}
          </div>
        </div>

        {/* Missing Skills */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <X className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-slate-800">
              Missing Skills ({matchResult.missingSkills.length})
            </h4>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {matchResult.missingSkills.map((sk) => (
              <span
                key={sk}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200"
              >
                {sk}
              </span>
            ))}
            {matchResult.missingSkills.length === 0 && (
              <span className="text-xs text-slate-400 italic">No critical skills missing.</span>
            )}
          </div>
        </div>

        {/* Keyword Gaps */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-slate-800">
              Keyword Gaps ({matchResult.keywordGaps.length})
            </h4>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {matchResult.keywordGaps.map((kw) => (
              <span
                key={kw}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200"
              >
                {kw}
              </span>
            ))}
            {matchResult.keywordGaps.length === 0 && (
              <span className="text-xs text-slate-400 italic">No semantic keyword gaps found.</span>
            )}
          </div>
        </div>
      </div>

      {/* Tailoring Suggestions */}
      {matchResult.tailoringSuggestions.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <h4 className="font-bold text-sm text-slate-800 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            Tailoring Recommendations (Truthful Framing)
          </h4>
          <ul className="space-y-2 text-xs text-slate-600">
            {matchResult.tailoringSuggestions.map((sug, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-indigo-500 font-bold">•</span>
                <span>{sug}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
