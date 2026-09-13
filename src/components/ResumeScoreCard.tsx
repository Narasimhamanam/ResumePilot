import React from 'react';
import { ResumeAnalysisScore } from '../types';
import { CheckCircle2, AlertCircle, Sparkles, TrendingUp, ShieldCheck } from 'lucide-react';

export const ResumeScoreCard: React.FC<{ score?: ResumeAnalysisScore; onAnalyze?: () => void; isAnalyzing?: boolean }> = ({
  score,
  onAnalyze,
  isAnalyzing,
}) => {
  if (!score) {
    return (
      <div id="resume-score-empty-card" className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-800 text-sm">Resume ATS & Quality Audit</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive 8-pillar audit: ATS readiness, keyword density, impact metrics.
            </p>
          </div>
          {onAnalyze && (
            <button
              id="run-initial-audit-btn"
              onClick={onAnalyze}
              disabled={isAnalyzing}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow transition disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isAnalyzing ? 'Auditing Resume...' : 'Analyze Resume'}
            </button>
          )}
        </div>
      </div>
    );
  }

  const getScoreColor = (val: number) => {
    if (val >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (val >= 65) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  const getProgressColor = (val: number) => {
    if (val >= 80) return 'bg-emerald-500';
    if (val >= 65) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const breakdown = [
    { label: 'ATS Compatibility', val: score.atsCompatibility },
    { label: 'Content Quality', val: score.contentQuality },
    { label: 'Skills Depth', val: score.skillsScore },
    { label: 'Experience Impact', val: score.experienceScore },
    { label: 'Projects Showcase', val: score.projectsScore },
    { label: 'Education Match', val: score.educationScore },
    { label: 'Keyword Density', val: score.keywordOptimization },
    { label: 'Formatting Standard', val: score.formatting },
  ];

  return (
    <div id="resume-score-card" className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <div
            className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center border font-bold ${getScoreColor(
              score.overall
            )}`}
          >
            <span className="text-2xl leading-none">{score.overall}</span>
            <span className="text-[10px] uppercase font-semibold text-slate-500 mt-0.5">/ 100</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-base">Overall Resume Score</h3>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {score.overall >= 80 ? 'ATS Ready' : score.overall >= 65 ? 'Needs Optimization' : 'At Risk'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Calculated using strict ATS parser standards, keyword semantics, and accomplishment framing.
            </p>
          </div>
        </div>

        {onAnalyze && (
          <button
            id="re-audit-resume-btn"
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className="px-3.5 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-200 transition flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isAnalyzing ? 'Auditing...' : 'Re-Run AI Audit'}
          </button>
        )}
      </div>

      {/* Breakdown Grid */}
      <div>
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Pillar Performance</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {breakdown.map((item) => (
            <div key={item.label} className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-slate-600 font-medium">{item.label}</span>
                <span className="font-bold text-slate-800">{item.val}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getProgressColor(item.val)}`}
                  style={{ width: `${item.val}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {score.recommendations && score.recommendations.length > 0 && (
        <div className="pt-2">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Actionable AI Fixes</h4>
          <div className="space-y-2.5">
            {score.recommendations.slice(0, 4).map((rec, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-start gap-3 text-xs"
              >
                {rec.severity === 'critical' ? (
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                ) : (
                  <Sparkles className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-semibold text-slate-800 flex items-center gap-2">
                    <span>{rec.category}</span>
                    <span className="text-[10px] text-slate-400">• {rec.issue}</span>
                  </div>
                  <div className="text-slate-600 mt-1 leading-relaxed">{rec.suggestion}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
