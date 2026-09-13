import React from 'react';
import {
  TrendingUp,
  Send,
  FileCheck2,
  Sparkles,
  Target,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  CalendarCheck,
  Award,
} from 'lucide-react';
import { JobApplicationRecord, ResumeVersion, ActivityLog } from '../types';
import { ResumeScoreCard } from './ResumeScoreCard';

interface DashboardViewProps {
  primaryResume?: ResumeVersion;
  applications: JobApplicationRecord[];
  activityLogs: ActivityLog[];
  onNavigate: (tab: any) => void;
  onRunAudit: () => void;
  isAuditing: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  primaryResume,
  applications,
  activityLogs,
  onNavigate,
  onRunAudit,
  isAuditing,
}) => {
  const totalApps = applications.length;
  const sentApps = applications.filter((a) => a.status === 'Sent').length;
  const interviewApps = applications.filter((a) => a.status === 'Interview').length;
  const offerApps = applications.filter((a) => a.status === 'Offer').length;
  const rejectedApps = applications.filter((a) => a.status === 'Rejected').length;

  return (
    <div id="dashboard-view" className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Executive Career Cockpit</h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time telemetry on resume score, ATS readiness, and outreach funnel.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="dash-upload-resume-btn"
            onClick={() => onNavigate('my-resume')}
            className="px-3.5 py-2 text-xs font-semibold bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-slate-700 shadow-2xs transition flex items-center gap-1.5"
          >
            <FileCheck2 className="w-3.5 h-3.5 text-slate-500" />
            Manage Resumes
          </button>
          <button
            id="dash-match-job-btn"
            onClick={() => onNavigate('job-matcher')}
            className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Match New Job
          </button>
        </div>
      </div>

      {/* Metric Counters Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Overall Score</div>
          <div className="text-2xl font-bold text-slate-900 mt-1.5 flex items-baseline gap-1">
            {primaryResume?.score?.overall ?? '--'}
            <span className="text-xs font-normal text-slate-400">/100</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {primaryResume?.score ? 'Calculated via ATS audit' : 'Upload resume to audit'}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">ATS Readiness</div>
          <div className="text-2xl font-bold text-slate-900 mt-1.5 flex items-baseline gap-1">
            {primaryResume?.score?.atsCompatibility ?? '--'}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Format & parse standard</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Applications Sent</div>
          <div className="text-2xl font-bold text-indigo-600 mt-1.5">{sentApps}</div>
          <div className="text-[11px] text-slate-500 mt-1">{totalApps} total records</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Interviews</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1.5">{interviewApps}</div>
          <div className="text-[11px] text-slate-500 mt-1">Active candidate calls</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Offers Received</div>
          <div className="text-2xl font-bold text-amber-600 mt-1.5">{offerApps}</div>
          <div className="text-[11px] text-slate-500 mt-1">Accepted / evaluating</div>
        </div>
      </div>

      {/* Resume Score Card */}
      <ResumeScoreCard
        score={primaryResume?.score}
        onAnalyze={primaryResume ? onRunAudit : undefined}
        isAnalyzing={isAuditing}
      />

      {/* Two Column Layout: Applications Funnel & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Applications Recent */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Recent Applications</h3>
              <p className="text-xs text-slate-500">Track application statuses and upcoming follow-ups</p>
            </div>
            <button
              onClick={() => onNavigate('applications')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              View All ({totalApps}) <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-3 divide-y divide-slate-100">
            {applications.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No job applications created yet. Match a job description to tailor your resume and dispatch your first application.
              </div>
            ) : (
              applications.slice(0, 5).map((app) => (
                <div key={app.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-800 text-xs truncate">{app.jobTitle}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                      <span className="font-medium text-slate-700">{app.company}</span>
                      <span>•</span>
                      <span>{app.dateApplied || 'Drafted recently'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        app.status === 'Sent'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : app.status === 'Interview'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : app.status === 'Offer'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">System Audit Log</h3>
            <span className="text-[10px] uppercase font-bold text-slate-400">Live Activity</span>
          </div>

          <div className="mt-3 space-y-3">
            {activityLogs.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                Audit logs will populate as resumes are parsed, enhanced, and matched.
              </div>
            ) : (
              activityLogs.slice(0, 6).map((log) => (
                <div key={log.id} className="flex items-start gap-2.5 text-xs">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="font-medium text-slate-800">{log.title}</div>
                    <div className="text-[11px] text-slate-500 truncate">{log.description}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
