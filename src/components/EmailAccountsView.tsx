import React, { useState, useEffect } from 'react';
import { ConnectedEmailAccount } from '../types';
import { useToast } from '../context/ToastContext';
import {
  Mail,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  RefreshCw,
  ExternalLink,
  AlertCircle,
  KeyRound,
  Check,
  Sparkles,
} from 'lucide-react';
import { firebaseConfig } from '../lib/firebaseConfig';

interface EmailAccountsViewProps {
  accounts: ConnectedEmailAccount[];
  onConnectGmail: (email: string, token: string) => Promise<void>;
  onDisconnectAccount: (id: string) => Promise<void>;
}

export const EmailAccountsView: React.FC<EmailAccountsViewProps> = ({
  accounts,
  onConnectGmail,
  onDisconnectAccount,
}) => {
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [manualTokenInput, setManualTokenInput] = useState('');
  const [manualEmailInput, setManualEmailInput] = useState('');
  const [showManualFallback, setShowManualFallback] = useState(false);
  const { toast } = useToast();

  const clientId =
    (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID ||
    firebaseConfig.oAuthClientId ||
    '';

  const handleConnectGmailOAuth = () => {
    if (!clientId) {
      toast({
        type: 'warning',
        title: 'Google Client ID Missing',
        description: 'Please set GOOGLE_CLIENT_ID or configure your Google OAuth Client ID.',
      });
      setShowManualFallback(true);
      return;
    }

    const google = (window as any).google;
    if (!google?.accounts?.oauth2) {
      toast({
        type: 'info',
        title: 'Loading Google Identity Services...',
        description: 'Google OAuth script is loading. You can also enter an access token directly below.',
      });
      setShowManualFallback(true);
      return;
    }

    try {
      setIsAuthorizing(true);
      const client = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/userinfo.email',
        callback: async (response: any) => {
          setIsAuthorizing(false);
          if (response.error) {
            toast({
              type: 'error',
              title: 'Google OAuth Cancelled or Denied',
              description: response.error_description || response.error,
            });
            return;
          }

          const accessToken = response.access_token;
          if (accessToken) {
            try {
              // Fetch the authenticated user's email address from Google
              const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: { Authorization: `Bearer ${accessToken}` },
              });
              const userData = await userInfoRes.json().catch(() => ({}));
              const userEmail = userData.email || 'authenticated-user@gmail.com';

              await onConnectGmail(userEmail, accessToken);
              toast({
                type: 'success',
                title: 'Gmail Connected via OAuth 2.0',
                description: `Successfully linked ${userEmail}. Ready to send tailored applications.`,
              });
            } catch (err: any) {
              await onConnectGmail('user@gmail.com', accessToken);
              toast({
                type: 'success',
                title: 'Gmail Linked',
                description: 'Access token saved successfully.',
              });
            }
          }
        },
      });

      client.requestAccessToken();
    } catch (e: any) {
      setIsAuthorizing(false);
      console.error('Failed to initiate Google OAuth:', e);
      setShowManualFallback(true);
      toast({
        type: 'error',
        title: 'OAuth Pop-up Blocked or Failed',
        description: 'You can authorize using the token input fallback below.',
      });
    }
  };

  const handleManualConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualEmailInput || !manualTokenInput) {
      toast({
        type: 'error',
        title: 'Missing Details',
        description: 'Please provide both your Gmail address and access token.',
      });
      return;
    }

    try {
      await onConnectGmail(manualEmailInput.trim(), manualTokenInput.trim());
      setManualEmailInput('');
      setManualTokenInput('');
      setShowManualFallback(false);
      toast({
        type: 'success',
        title: 'Gmail Connected',
        description: `Successfully stored OAuth access credentials for ${manualEmailInput}.`,
      });
    } catch (e: any) {
      toast({
        type: 'error',
        title: 'Connection Error',
        description: e.message || 'Unable to store credentials.',
      });
    }
  };

  return (
    <div id="email-accounts-view" className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Gmail OAuth 2.0 Integration</h2>
        <p className="text-xs text-slate-500 mt-1">
          Authorize ResumePilot to dispatch tailored application emails directly from your personal Gmail inbox via official Google APIs.
        </p>
      </div>

      {/* Security Architecture Box */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-xs text-emerald-900 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-emerald-950 text-sm">Official Google Workspace OAuth 2.0</h4>
          <p className="leading-relaxed">
            ResumePilot strictly adheres to Google's API security standards. Your Gmail password is never requested, accessed, or stored. Communications are handled directly via <code className="px-1.5 py-0.5 bg-emerald-100/80 rounded font-mono text-[11px]">https://gmail.googleapis.com/gmail/v1/users/me/messages/send</code> using the scoped token.
          </p>
        </div>
      </div>

      {/* Gmail OAuth Connection Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-bold text-xl shrink-0 border border-red-100">
            G
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-base">Google Workspace / Gmail</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200">
                Official API
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-lg leading-relaxed">
              Connect via Google Identity Services. Allows ResumePilot to transmit your approved application packages and scheduled follow-ups with high inbox deliverability.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            id="launch-google-oauth-btn"
            onClick={handleConnectGmailOAuth}
            disabled={isAuthorizing}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-2 disabled:opacity-50"
          >
            <Mail className="w-3.5 h-3.5" />
            {isAuthorizing ? 'Opening Google Auth...' : 'Connect With Google'}
          </button>
        </div>
      </div>

      {/* Active Connected Inboxes */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <h3 className="font-bold text-slate-900 text-sm mb-4">
          Active Connected Inboxes ({accounts.length})
        </h3>

        {accounts.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
            No Gmail accounts connected yet. Click "Connect With Google" above to link your Gmail account.
          </div>
        ) : (
          <div className="space-y-3">
            {accounts.map((acc) => (
              <div
                key={acc.id}
                className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-xs bg-red-600">
                    G
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">{acc.email}</span>
                      <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 font-bold uppercase rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Ready To Send
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Scope: <code className="text-slate-700 font-mono">https://www.googleapis.com/auth/gmail.send</code>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onDisconnectAccount(acc.id)}
                    className="px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fallback Token Input Accordion */}
      <div className="pt-2">
        <button
          onClick={() => setShowManualFallback(!showManualFallback)}
          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
        >
          <KeyRound className="w-3.5 h-3.5" />
          {showManualFallback ? 'Hide Manual OAuth Token Entry' : 'Manual OAuth Access Token Entry (Advanced / Testing)'}
        </button>

        {showManualFallback && (
          <form onSubmit={handleManualConnect} className="mt-3 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <h4 className="font-bold text-slate-800 text-xs">Direct OAuth Access Token Hookup</h4>
            <p className="text-[11px] text-slate-500">
              Useful if testing from an environment where pop-ups are restricted or using Google OAuth Playground tokens.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Gmail Address</label>
                <input
                  type="email"
                  placeholder="your.email@gmail.com"
                  value={manualEmailInput}
                  onChange={(e) => setManualEmailInput(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">OAuth 2.0 Bearer Token</label>
                <input
                  type="text"
                  placeholder="ya29.a0..."
                  value={manualTokenInput}
                  onChange={(e) => setManualTokenInput(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono text-[11px]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-semibold"
              >
                Save Gmail Credentials
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
