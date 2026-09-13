import React, { useState } from 'react';
import { GeneratedApplicationPackage, ConnectedEmailAccount } from '../types';
import {
  Send,
  Edit2,
  FileCheck,
  Building,
  Mail,
  AlertTriangle,
  CheckCircle2,
  Paperclip,
  X,
  Sparkles,
} from 'lucide-react';

interface ApplicationReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  appPackage: GeneratedApplicationPackage;
  connectedAccounts: ConnectedEmailAccount[];
  selectedResumeTitle: string;
  onApproveAndSend: (finalPackage: GeneratedApplicationPackage, accountId: string) => Promise<void>;
  isSending: boolean;
}

export const ApplicationReviewModal: React.FC<ApplicationReviewModalProps> = ({
  isOpen,
  onClose,
  appPackage,
  connectedAccounts,
  selectedResumeTitle,
  onApproveAndSend,
  isSending,
}) => {
  const [recipient, setRecipient] = useState(appPackage.recipientEmail);
  const [subject, setSubject] = useState(appPackage.emailSubject);
  const [body, setBody] = useState(appPackage.emailBody);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string>(
    connectedAccounts[0]?.id || ''
  );

  if (!isOpen) return null;

  const handleSend = async () => {
    const updatedPackage: GeneratedApplicationPackage = {
      ...appPackage,
      recipientEmail: recipient,
      emailSubject: subject,
      emailBody: body,
    };
    await onApproveAndSend(updatedPackage, selectedAccountId);
  };

  return (
    <div
      id="application-review-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto"
    >
      <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-2xl shadow-2xl p-6 sm:p-8 my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                Stage 9 • Explicit Review
              </span>
              <h3 className="font-bold text-slate-900 text-lg">Application Review</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Review and approve before transmitting. Applications are never automatically dispatched without confirmation.
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scroll Body */}
        <div className="flex-1 overflow-y-auto py-5 space-y-5 text-xs">
          {/* Fact verification status */}
          {appPackage.unsupportedClaimsCheck && !appPackage.unsupportedClaimsCheck.passed && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
              <div className="flex items-center gap-2 font-bold mb-1">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>⚠ Fact Verification Notice</span>
              </div>
              <p className="text-[11px] text-amber-700">
                The AI verifier detected modifications requiring user confirmation. No unsupported claims were injected into qualifications:
              </p>
              <ul className="list-disc pl-4 mt-1 space-y-0.5 text-[11px]">
                {appPackage.unsupportedClaimsCheck.flags.map((flag, idx) => (
                  <li key={idx}>{flag}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Meta Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">Target Company</span>
              <div className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                <Building className="w-3.5 h-3.5 text-slate-500" />
                {appPackage.company}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">Target Position</span>
              <div className="font-semibold text-slate-800 mt-0.5">{appPackage.jobTitle}</div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">Recipient Email</span>
              {isEditing ? (
                <input
                  type="email"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full mt-1 p-1.5 bg-white border border-slate-300 rounded text-xs font-mono"
                />
              ) : (
                <div className="font-mono text-slate-700 mt-0.5">{recipient}</div>
              )}
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">Selected Resume Version</span>
              <div className="font-semibold text-indigo-700 flex items-center gap-1.5 mt-0.5">
                <Paperclip className="w-3.5 h-3.5" />
                {selectedResumeTitle}
              </div>
            </div>
          </div>

          {/* Sending Account Selector */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Send From Connected Email Account
            </label>
            {connectedAccounts.length === 0 ? (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center justify-between">
                <div>
                  <span className="font-bold">No Email Account Connected</span>
                  <p className="text-[11px] mt-0.5">
                    Connect Gmail or Outlook via OAuth 2.0 in the Email Accounts tab to send applications directly.
                  </p>
                </div>
              </div>
            ) : (
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500"
              >
                {connectedAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.provider.toUpperCase()} • {acc.email} ({acc.status})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Email Subject & Content */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Email Subject
                </label>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" /> Edit Email
                  </button>
                )}
              </div>
              {isEditing ? (
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs font-medium"
                />
              ) : (
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 font-medium text-slate-800">
                  {subject}
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Application Email Body
              </label>
              {isEditing ? (
                <textarea
                  rows={8}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-lg text-xs leading-relaxed font-sans"
                />
              ) : (
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 whitespace-pre-wrap leading-relaxed font-sans">
                  {body}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 transition"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            {isEditing && (
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-xl transition"
              >
                Done Editing
              </button>
            )}

            <button
              id="confirm-approve-and-send-btn"
              onClick={handleSend}
              disabled={isSending || connectedAccounts.length === 0}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {isSending ? 'Sending via Email API...' : 'Approve & Send Application'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
