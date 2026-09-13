import React, { useState } from 'react';
import { AutomationRule, JobApplicationRecord } from '../types';
import { useToast } from '../context/ToastContext';
import {
  ShieldAlert,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Send,
  Users,
  Building,
  Lock,
} from 'lucide-react';

interface AutomationViewProps {
  rule: AutomationRule;
  applications: JobApplicationRecord[];
  onUpdateRule: (rule: AutomationRule) => Promise<void>;
  onBulkSendConfirmed: (applications: JobApplicationRecord[]) => Promise<void>;
}

export const AutomationView: React.FC<AutomationViewProps> = ({
  rule,
  applications,
  onUpdateRule,
  onBulkSendConfirmed,
}) => {
  const [localRule, setLocalRule] = useState<AutomationRule>(rule);
  const [showBulkConfirmModal, setShowBulkConfirmModal] = useState(false);
  const [isSendingBulk, setIsSendingBulk] = useState(false);
  const { toast } = useToast();

  const readyToSend = applications.filter((a) => a.status === 'Ready' || a.status === 'Draft');

  const handleSaveRules = async () => {
    await onUpdateRule(localRule);
    toast({
      type: 'success',
      title: 'Automation Rules Updated',
      description: 'Safety thresholds, daily dispatch ceilings, and approval gates saved.',
    });
  };

  const handleExecuteBulk = async () => {
    setIsSendingBulk(true);
    try {
      await onBulkSendConfirmed(readyToSend);
      setShowBulkConfirmModal(false);
      toast({
        type: 'success',
        title: 'Bulk Dispatch Completed',
        description: `Dispatched ${readyToSend.length} verified applications.`,
      });
    } catch (e: any) {
      toast({
        type: 'error',
        title: 'Bulk Dispatch Error',
        description: e.message || 'Error occurred during bulk dispatch.',
      });
    } finally {
      setIsSendingBulk(false);
    }
  };

  return (
    <div id="automation-view" className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Automation Safeguards & Outreach Rules</h2>
        <p className="text-xs text-slate-500 mt-1">
          Configure anti-spam guardrails, daily dispatch quotas, and explicit user approval requirements.
        </p>
      </div>

      {/* Strict Anti-Spam Safeguard Notice */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 text-xs text-indigo-950 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-indigo-950 text-sm">Anti-Spam & Deliverability Guarantee</h4>
          <p className="leading-relaxed">
            ResumePilot strictly prohibits automated mass unsolicited emailing. Applications are protected with mandatory recipient verification, duplicate application detection, and individual or staged batch confirmations.
          </p>
        </div>
      </div>

      {/* Rules Config Panel */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
        <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">Outreach Guardrails</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Daily Application Limit (Per 24 Hours)
            </label>
            <input
              type="number"
              min={1}
              max={30}
              value={localRule.dailyApplicationLimit}
              onChange={(e) =>
                setLocalRule({ ...localRule, dailyApplicationLimit: parseInt(e.target.value) || 10 })
              }
              className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-medium"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Hard ceiling to preserve your email domain reputation and ensure personalized attention.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Automated Follow-Up Interval (Days)
            </label>
            <input
              type="number"
              min={3}
              max={21}
              value={localRule.autoScheduleFollowupDays}
              onChange={(e) =>
                setLocalRule({
                  ...localRule,
                  autoScheduleFollowupDays: parseInt(e.target.value) || 7,
                })
              }
              className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-medium"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Days after initial dispatch to suggest an AI-crafted follow-up status check.
            </p>
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
          <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
            <div>
              <div className="font-bold text-slate-800">Duplicate Application Detection</div>
              <div className="text-slate-500 text-[11px]">
                Prevents accidental re-applications to the same company or hiring contact.
              </div>
            </div>
            <input
              type="checkbox"
              checked={localRule.duplicateApplicationDetection}
              onChange={(e) =>
                setLocalRule({ ...localRule, duplicateApplicationDetection: e.target.checked })
              }
              className="w-4 h-4 text-indigo-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
            <div>
              <div className="font-bold text-slate-800">Require User Approval Before Dispatch</div>
              <div className="text-slate-500 text-[11px]">
                Always display full email preview and resume version before transmitting.
              </div>
            </div>
            <input
              type="checkbox"
              checked={localRule.requireUserApprovalForSend}
              onChange={(e) =>
                setLocalRule({ ...localRule, requireUserApprovalForSend: e.target.checked })
              }
              className="w-4 h-4 text-indigo-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
            <div>
              <div className="font-bold text-slate-800">Require User Approval For Follow-Ups</div>
              <div className="text-slate-500 text-[11px]">
                Never send automated follow-up emails without explicit user review.
              </div>
            </div>
            <input
              type="checkbox"
              checked={localRule.requireUserApprovalForFollowup}
              onChange={(e) =>
                setLocalRule({ ...localRule, requireUserApprovalForFollowup: e.target.checked })
              }
              className="w-4 h-4 text-indigo-600 rounded"
            />
          </label>
        </div>

        <div className="flex justify-end pt-2">
          <button
            id="save-automation-rules-btn"
            onClick={handleSaveRules}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
          >
            Save Automation Settings
          </button>
        </div>
      </div>

      {/* Staged Batch Sending Safeguard Panel */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Batch Application Dispatch</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Review and send staged applications. Bulk send strictly requires an explicit confirmation modal listing every recipient.
            </p>
          </div>

          <button
            onClick={() => setShowBulkConfirmModal(true)}
            disabled={readyToSend.length === 0}
            className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 disabled:opacity-40"
          >
            <Send className="w-3.5 h-3.5" />
            Review Staged Batch ({readyToSend.length})
          </button>
        </div>
      </div>

      {/* Bulk Send Explicit Confirmation Dialog */}
      {showBulkConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-base">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>Explicit Bulk Send Confirmation</span>
            </div>

            <p className="text-xs text-slate-700">
              You are about to send <span className="font-bold">{readyToSend.length} applications</span>. Review the target companies and recipient addresses below:
            </p>

            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
              {readyToSend.map((app) => (
                <div key={app.id} className="p-3 text-xs flex justify-between items-center bg-slate-50/50">
                  <div>
                    <span className="font-bold text-slate-900">{app.company}</span>
                    <span className="text-slate-500 ml-2 font-normal">({app.jobTitle})</span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-600">{app.recipientEmail}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowBulkConfirmModal(false)}
                className="px-4 py-2 text-xs text-slate-600 border border-slate-300 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteBulk}
                disabled={isSendingBulk}
                className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition"
              >
                {isSendingBulk ? 'Dispatching Batch...' : 'Confirm & Dispatch Applications'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
