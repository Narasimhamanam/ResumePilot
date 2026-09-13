import React, { useState } from 'react';
import { JobApplicationRecord, ApplicationStatus, ResumeVersion } from '../types';
import { getAIService } from '../services/aiService';
import { useToast } from '../context/ToastContext';
import {
  Send,
  Building,
  Calendar,
  Clock,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Edit2,
  Sparkles,
  ChevronDown,
} from 'lucide-react';

interface ApplicationsTrackerViewProps {
  applications: JobApplicationRecord[];
  resumes: ResumeVersion[];
  onUpdateStatus: (id: string, status: ApplicationStatus) => Promise<void>;
  onDeleteApplication: (id: string) => Promise<void>;
  onScheduleFollowup: (app: JobApplicationRecord, date: string, followupBody: string) => Promise<void>;
}

export const ApplicationsTrackerView: React.FC<ApplicationsTrackerViewProps> = ({
  applications,
  resumes,
  onUpdateStatus,
  onDeleteApplication,
  onScheduleFollowup,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [activeFollowupApp, setActiveFollowupApp] = useState<JobApplicationRecord | null>(null);
  const [followupDate, setFollowupDate] = useState('');
  const [followupContent, setFollowupContent] = useState('');
  const [isGeneratingFollowup, setIsGeneratingFollowup] = useState(false);
  const { toast } = useToast();

  const statuses: ApplicationStatus[] = [
    'Draft',
    'Ready',
    'Sent',
    'Interview',
    'Rejected',
    'Offer',
    'Withdrawn',
  ];

  const filtered = applications.filter((app) => {
    if (filterStatus === 'All') return true;
    return app.status === filterStatus;
  });

  const handleOpenFollowup = async (app: JobApplicationRecord) => {
    setActiveFollowupApp(app);
    // Set default date to 7 days from now
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    setFollowupDate(nextWeek.toISOString().slice(0, 10));

    // Generate draft email
    const resume = resumes.find((r) => r.id === app.resumeVersionId) || resumes[0];
    if (resume) {
      setIsGeneratingFollowup(true);
      try {
        const ai = getAIService();
        const generated = await ai.generateFollowupEmail(
          { company: app.company, jobTitle: app.jobTitle, dateApplied: app.dateApplied },
          resume.structuredData
        );
        setFollowupContent(generated.body);
      } catch (e) {
        console.error(e);
      } finally {
        setIsGeneratingFollowup(false);
      }
    }
  };

  const handleSaveFollowup = async () => {
    if (!activeFollowupApp || !followupDate) return;
    await onScheduleFollowup(activeFollowupApp, followupDate, followupContent);
    setActiveFollowupApp(null);
    toast({
      type: 'success',
      title: 'Follow-Up Scheduled',
      description: `Follow-up set for ${followupDate} regarding ${activeFollowupApp.company}.`,
    });
  };

  return (
    <div id="applications-tracker-view" className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Application Tracking System (ATS)</h2>
          <p className="text-xs text-slate-500 mt-1">
            Monitor submissions, manage interview progression, and schedule automated follow-ups.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setFilterStatus('All')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filterStatus === 'All' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600'
            }`}
          >
            All ({applications.length})
          </button>
          {statuses.map((st) => {
            const count = applications.filter((a) => a.status === st).length;
            return (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                  filterStatus === st
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {st} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Company & Role</th>
                <th className="px-5 py-3.5">Recipient</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Date Applied</th>
                <th className="px-5 py-3.5">Follow-Up</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No applications found for this filter state.
                  </td>
                </tr>
              ) : (
                filtered.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900 text-sm">{app.jobTitle}</div>
                      <div className="text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium text-slate-700">{app.company}</span>
                        {app.jobUrl && (
                          <a
                            href={app.jobUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-indigo-600 hover:underline inline-flex items-center gap-0.5"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4 font-mono text-[11px] text-slate-700">
                      {app.recipientEmail}
                    </td>

                    <td className="px-5 py-4">
                      <select
                        value={app.status}
                        onChange={(e) => onUpdateStatus(app.id, e.target.value as ApplicationStatus)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg border focus:ring-1 focus:ring-indigo-500 bg-white ${
                          app.status === 'Sent'
                            ? 'text-emerald-700 border-emerald-200 bg-emerald-50/50'
                            : app.status === 'Interview'
                            ? 'text-indigo-700 border-indigo-200 bg-indigo-50/50'
                            : app.status === 'Offer'
                            ? 'text-amber-700 border-amber-200 bg-amber-50/50'
                            : 'text-slate-700 border-slate-200'
                        }`}
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {app.dateApplied ? new Date(app.dateApplied).toLocaleDateString() : 'Draft'}
                    </td>

                    <td className="px-5 py-4">
                      {app.followupDate ? (
                        <div className="flex items-center gap-1.5 text-indigo-700 font-medium bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100 text-[11px]">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(app.followupDate).toLocaleDateString()}</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleOpenFollowup(app)}
                          className="text-xs text-indigo-600 hover:underline font-medium"
                        >
                          + Schedule
                        </button>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenFollowup(app)}
                          title="Generate / Edit Follow-Up"
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteApplication(app.id)}
                          title="Delete Record"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Followup Modal */}
      {activeFollowupApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-xl p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Schedule Follow-Up</h3>
            <p className="text-xs text-slate-500">
              Set automated reminder date and review the AI-drafted follow-up note for {activeFollowupApp.company}.
            </p>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Follow-Up Date</label>
              <input
                type="date"
                value={followupDate}
                onChange={(e) => setFollowupDate(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-700">Follow-Up Email Draft</label>
                {isGeneratingFollowup && (
                  <span className="text-[10px] text-indigo-600 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 animate-spin" /> Generating polite outreach...
                  </span>
                )}
              </div>
              <textarea
                rows={5}
                value={followupContent}
                onChange={(e) => setFollowupContent(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-sans leading-relaxed"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveFollowupApp(null)}
                className="px-3.5 py-1.5 text-xs text-slate-600 border border-slate-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFollowup}
                className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs"
              >
                Save Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
