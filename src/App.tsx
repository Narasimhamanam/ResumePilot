import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useToast } from './context/ToastContext';
import { Sidebar, NavigationTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { MyResumeView } from './components/MyResumeView';
import { BeforeAfterEditor } from './components/BeforeAfterEditor';
import { JobMatcherView } from './components/JobMatcherView';
import { FindJobsView } from './components/FindJobsView';
import { ApplicationsTrackerView } from './components/ApplicationsTrackerView';
import { EmailAccountsView } from './components/EmailAccountsView';
import { AutomationView } from './components/AutomationView';
import { SettingsView } from './components/SettingsView';
import { AuthModal } from './components/AuthModal';
import { ApplicationReviewModal } from './components/ApplicationReviewModal';
import { storageService } from './services/storageService';
import { getAIService } from './services/aiService';
import { GmailEmailService } from './services/emailService';
import {
  ResumeVersion,
  StructuredResume,
  ResumeDiffChange,
  JobApplicationRecord,
  ConnectedEmailAccount,
  AutomationRule,
  ActivityLog,
  ParsedJobDescription,
  GeneratedApplicationPackage,
  ApplicationStatus,
  JobListing,
} from './types';
import { Sparkles, Loader2 } from 'lucide-react';

export default function App() {
  const { user, profile, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Core App State
  const [resumes, setResumes] = useState<ResumeVersion[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [applications, setApplications] = useState<JobApplicationRecord[]>([]);
  const [emailAccounts, setEmailAccounts] = useState<ConnectedEmailAccount[]>([]);
  const [automationRule, setAutomationRule] = useState<AutomationRule | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // Workflow Interactive State
  const [isAuditing, setIsAuditing] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedDiffChanges, setEnhancedDiffChanges] = useState<ResumeDiffChange[]>([]);
  const [tempEnhancedResume, setTempEnhancedResume] = useState<StructuredResume | null>(null);

  // Application Generation & Review Modal State
  const [isGeneratingApp, setIsGeneratingApp] = useState(false);
  const [pendingAppPackage, setPendingAppPackage] = useState<GeneratedApplicationPackage | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const activeUserId = user ? user.uid : 'guest_user';

  // Load initial data
  useEffect(() => {
    async function loadData() {
      const loadedResumes = await storageService.getResumes(activeUserId);
      if (loadedResumes.length > 0) {
        setResumes(loadedResumes);
        setSelectedResumeId(loadedResumes[0].id);
      } else {
        // Provide starter verified template resume
        const defaultResume: ResumeVersion = {
          id: `res_${Date.now()}`,
          userId: activeUserId,
          title: 'Software Engineer Master Resume',
          isPrimary: true,
          structuredData: {
            name: profile?.name || 'Alex Morgan',
            email: user?.email || 'alex.morgan@example.com',
            phone: '+1 (555) 234-5678',
            location: 'San Francisco, CA (Open to Remote)',
            linkedIn: 'linkedin.com/in/alexmorgan',
            gitHub: 'github.com/alexmorgan',
            professionalSummary:
              'Full-Stack Software Engineer with 4+ years of production experience building high-throughput React applications, Node.js microservices, and distributed databases.',
            skills: [
              'TypeScript',
              'React',
              'Node.js',
              'Express',
              'PostgreSQL',
              'Docker',
              'REST APIs',
              'Tailwind CSS',
              'Git',
            ],
            education: [
              {
                institution: 'University of California, Berkeley',
                degree: 'B.S. in Computer Science',
                year: '2021',
              },
            ],
            experience: [
              {
                company: 'Vanguard Systems',
                role: 'Full Stack Software Engineer',
                startDate: '2022',
                endDate: 'Present',
                bullets: [
                  'Architected client-facing analytics portal handling 50,000 daily queries with React and Node.js.',
                  'Reduced database latency by 35% through PostgreSQL query refactoring and index optimization.',
                  'Built automated CI/CD deployment pipelines using Docker containers.',
                ],
              },
              {
                company: 'Apex Cloud Solutions',
                role: 'Junior Frontend Developer',
                startDate: '2021',
                endDate: '2022',
                bullets: [
                  'Engineered responsive web components in TypeScript and Tailwind CSS.',
                  'Integrated REST endpoints with client state caches to eliminate redundant network traffic.',
                ],
              },
            ],
            projects: [
              {
                title: 'Distributed Task Queue Engine',
                description: 'Open-source asynchronous task broker built with Node.js and Redis.',
                technologies: ['TypeScript', 'Node.js', 'Redis'],
                bullets: [
                  'Engineered worker pool supporting 5,000 concurrent event jobs.',
                  'Implemented exponential backoff retry algorithms.',
                ],
              },
            ],
            certifications: ['AWS Certified Developer - Associate'],
            achievements: ['Dean’s Honors List (2019, 2020)'],
            languages: ['English (Native)'],
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await storageService.saveResume(defaultResume);
        setResumes([defaultResume]);
        setSelectedResumeId(defaultResume.id);
      }

      // Load applications, emails, rules, logs
      const [apps, accs, rule, logs] = await Promise.all([
        storageService.getApplications(activeUserId),
        storageService.getEmailAccounts(activeUserId),
        storageService.getAutomationRule(activeUserId),
        storageService.getActivityLogs(activeUserId),
      ]);
      setApplications(apps);
      setEmailAccounts(accs);
      setAutomationRule(rule);
      setActivityLogs(logs);
    }

    if (!authLoading) {
      loadData();
    }
  }, [activeUserId, authLoading]);

  const currentResume = resumes.find((r) => r.id === selectedResumeId) || resumes[0];

  // Action: Run Resume Audit
  const handleRunAudit = async () => {
    if (!currentResume) return;
    setIsAuditing(true);
    try {
      const ai = getAIService();
      const score = await ai.analyzeResume(currentResume.structuredData);
      const updatedResume: ResumeVersion = {
        ...currentResume,
        score,
        updatedAt: new Date().toISOString(),
      };
      await storageService.saveResume(updatedResume);
      setResumes((prev) => prev.map((r) => (r.id === updatedResume.id ? updatedResume : r)));

      await storageService.logActivity({
        id: `act_${Date.now()}`,
        userId: activeUserId,
        type: 'resume_analyzed',
        title: 'Resume Audit Completed',
        description: `ATS score evaluated at ${score.atsCompatibility}%, overall score ${score.overall}/100.`,
        timestamp: new Date().toISOString(),
      });
      const updatedLogs = await storageService.getActivityLogs(activeUserId);
      setActivityLogs(updatedLogs);

      toast({
        type: 'success',
        title: 'Resume Audit Complete',
        description: `Overall score: ${score.overall}/100 (ATS Readiness: ${score.atsCompatibility}%).`,
      });
    } catch (e: any) {
      toast({
        type: 'error',
        title: 'Audit Failed',
        description: e.message || 'Unable to analyze resume.',
      });
    } finally {
      setIsAuditing(false);
    }
  };

  // Action: Enhance Resume
  const handleEnhanceResume = async () => {
    if (!currentResume) return;
    setIsEnhancing(true);
    try {
      const ai = getAIService();
      const { enhancedResume, changes } = await ai.enhanceResume(currentResume.structuredData);

      // Verify facts against original
      const verifyResult = await ai.verifyClaims(currentResume.structuredData, enhancedResume);
      const markedChanges = changes.map((c) => {
        const hasWarning = verifyResult.unsupportedFlags.some((f) =>
          c.enhancedText.toLowerCase().includes(f.toLowerCase())
        );
        return {
          ...c,
          hasUnsupportedClaimWarning: hasWarning,
          unsupportedClaimDetails: hasWarning ? 'Contains phrasing not explicitly stated in original resume' : undefined,
        };
      });

      setTempEnhancedResume(enhancedResume);
      setEnhancedDiffChanges(markedChanges);
      setCurrentTab('resume-enhancer');

      toast({
        type: 'success',
        title: 'Resume Enhancements Generated',
        description: `Generated ${changes.length} actionable phrasing and ATS improvements. Review diff below.`,
      });
    } catch (e: any) {
      toast({
        type: 'error',
        title: 'Enhancement Error',
        description: e.message || 'Failed to enhance resume.',
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  // Action: Launch Tailored Application Generation
  const handleLaunchTailoredApplication = async (
    job: ParsedJobDescription,
    resume: ResumeVersion
  ) => {
    setIsGeneratingApp(true);
    try {
      const ai = getAIService();
      const appPkg = await ai.tailorResumeAndGenerateApplication(
        resume.structuredData,
        job,
        profile?.preferredRoles.join(', ')
      );
      setPendingAppPackage(appPkg);
      setIsReviewModalOpen(true);
    } catch (e: any) {
      toast({
        type: 'error',
        title: 'Tailoring Failed',
        description: e.message || 'Unable to tailor application package.',
      });
    } finally {
      setIsGeneratingApp(false);
    }
  };

  // Action: Approve & Send Application
  const handleApproveAndSend = async (
    finalPackage: GeneratedApplicationPackage,
    accountId: string
  ) => {
    setIsSendingEmail(true);
    try {
      const targetAccount = emailAccounts.find((a) => a.id === accountId);
      if (!targetAccount) {
        throw new Error('Please select a connected email account to dispatch through.');
      }

      // Dispatch via real Gmail service
      const emailService = new GmailEmailService();

      const sendResult = await emailService.sendEmail({
        to: finalPackage.recipientEmail,
        subject: finalPackage.emailSubject,
        body: finalPackage.emailBody,
        fromAccount: targetAccount,
      });

      if (!sendResult.success) {
        throw new Error(sendResult.error || 'Failed dispatching email through provider.');
      }

      // Save application record
      const newAppRecord: JobApplicationRecord = {
        id: `app_${Date.now()}`,
        userId: activeUserId,
        company: finalPackage.company,
        jobTitle: finalPackage.jobTitle,
        recipientEmail: finalPackage.recipientEmail,
        resumeVersionId: currentResume.id,
        resumeTitle: currentResume.title,
        emailSubject: finalPackage.emailSubject,
        emailBody: finalPackage.emailBody,
        coverLetter: finalPackage.coverLetter,
        status: 'Sent',
        dateApplied: new Date().toISOString(),
        emailAccountId: accountId,
        deliveryLog: {
          service: targetAccount.provider,
          sentAt: new Date().toISOString(),
          messageId: sendResult.messageId,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await storageService.saveApplication(newAppRecord);
      setApplications((prev) => [newAppRecord, ...prev]);

      await storageService.logActivity({
        id: `act_${Date.now()}`,
        userId: activeUserId,
        type: 'application_sent',
        title: `Application Dispatched to ${finalPackage.company}`,
        description: `Sent for position "${finalPackage.jobTitle}" via ${targetAccount.email}.`,
        timestamp: new Date().toISOString(),
      });
      const updatedLogs = await storageService.getActivityLogs(activeUserId);
      setActivityLogs(updatedLogs);

      setIsReviewModalOpen(false);
      setPendingAppPackage(null);

      toast({
        type: 'success',
        title: 'Application Sent Successfully',
        description: `Transmitted via ${targetAccount.provider.toUpperCase()} to ${finalPackage.recipientEmail}.`,
      });
      setCurrentTab('applications');
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Application was not sent.',
        description: err.message || 'Delivery failed.',
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div id="resumepilot-app" className="flex h-screen w-screen bg-slate-100 overflow-hidden font-sans antialiased text-slate-900">
      {/* Navigation Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Main Workspace Area */}
      <main id="main-content-scroll" className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-slate-200 bg-white px-8 flex items-center justify-between shrink-0 sticky top-0 z-10 shadow-2xs">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Workspace • {currentTab.replace('-', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleEnhanceResume}
              disabled={isEnhancing}
              className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isEnhancing ? 'Enhancing...' : 'AI Enhance Resume'}
            </button>
          </div>
        </header>

        {/* Tab View Container */}
        <div className="p-8 max-w-7xl w-full mx-auto flex-1">
          {currentTab === 'dashboard' && (
            <DashboardView
              primaryResume={currentResume}
              applications={applications}
              activityLogs={activityLogs}
              onNavigate={setCurrentTab}
              onRunAudit={handleRunAudit}
              isAuditing={isAuditing}
            />
          )}

          {currentTab === 'my-resume' && (
            <MyResumeView
              resumes={resumes}
              selectedResumeId={selectedResumeId}
              onSelectResume={setSelectedResumeId}
              onSaveNewResume={async (structured, rawText, title) => {
                const newRes: ResumeVersion = {
                  id: `res_${Date.now()}`,
                  userId: activeUserId,
                  title,
                  isPrimary: resumes.length === 0,
                  structuredData: structured,
                  rawText,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                };
                await storageService.saveResume(newRes);
                setResumes((prev) => [newRes, ...prev]);
                setSelectedResumeId(newRes.id);
                toast({
                  type: 'success',
                  title: 'Resume Added',
                  description: `New version "${title}" stored.`,
                });
              }}
              onDuplicateResume={async (r) => {
                const dup: ResumeVersion = {
                  ...r,
                  id: `res_${Date.now()}`,
                  title: `${r.title} (Copy)`,
                  isPrimary: false,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                };
                await storageService.saveResume(dup);
                setResumes((prev) => [dup, ...prev]);
                setSelectedResumeId(dup.id);
                toast({
                  type: 'success',
                  title: 'Resume Duplicated',
                  description: `Created copy: ${dup.title}`,
                });
              }}
              onDeleteResume={async (id) => {
                await storageService.deleteResume(id);
                const nextList = resumes.filter((r) => r.id !== id);
                setResumes(nextList);
                if (selectedResumeId === id && nextList.length > 0) {
                  setSelectedResumeId(nextList[0].id);
                }
                toast({
                  type: 'info',
                  title: 'Resume Deleted',
                  description: 'Resume version removed from database.',
                });
              }}
              onUpdateResume={async (updated) => {
                await storageService.saveResume(updated);
                setResumes((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
              }}
            />
          )}

          {currentTab === 'resume-enhancer' && (
            <div className="space-y-6">
              {enhancedDiffChanges.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-base">No Active AI Diff</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-6">
                    The AI Enhancer audits your bullet points for XYZ action-verbs and metric framing without fabricating companies, dates, or degrees.
                  </p>
                  <button
                    onClick={handleEnhanceResume}
                    disabled={isEnhancing}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition"
                  >
                    {isEnhancing ? 'Analyzing & Enhancing...' : 'Enhance Current Resume'}
                  </button>
                </div>
              ) : (
                <BeforeAfterEditor
                  originalResume={currentResume.structuredData}
                  enhancedResume={tempEnhancedResume || currentResume.structuredData}
                  changes={enhancedDiffChanges}
                  onChangeStatusUpdate={(id, status) => {
                    setEnhancedDiffChanges((prev) =>
                      prev.map((c) => (c.id === id ? { ...c, status } : c))
                    );
                  }}
                  onAcceptAll={() => {
                    setEnhancedDiffChanges((prev) =>
                      prev.map((c) => ({ ...c, status: 'accepted' }))
                    );
                    toast({
                      type: 'success',
                      title: 'All Changes Accepted',
                      description: 'Accepted all proposed bullet phrasing improvements.',
                    });
                  }}
                  onRejectAll={() => {
                    setEnhancedDiffChanges((prev) =>
                      prev.map((c) => ({ ...c, status: 'rejected' }))
                    );
                    toast({
                      type: 'info',
                      title: 'Changes Rejected',
                      description: 'Reverted all AI proposed modifications.',
                    });
                  }}
                  onSaveVersion={async (finalStructured) => {
                    const newVersion: ResumeVersion = {
                      id: `res_${Date.now()}`,
                      userId: activeUserId,
                      title: `${currentResume.title} (AI Enhanced)`,
                      isPrimary: false,
                      structuredData: finalStructured,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    };
                    await storageService.saveResume(newVersion);
                    setResumes((prev) => [newVersion, ...prev]);
                    setSelectedResumeId(newVersion.id);
                    toast({
                      type: 'success',
                      title: 'Enhanced Version Saved',
                      description: `Saved as "${newVersion.title}".`,
                    });
                    setCurrentTab('my-resume');
                  }}
                />
              )}
            </div>
          )}

          {currentTab === 'job-matcher' && (
            <JobMatcherView
              resumes={resumes}
              selectedResumeId={selectedResumeId}
              onSelectResume={setSelectedResumeId}
              onLaunchTailoredApplication={handleLaunchTailoredApplication}
              isGeneratingApplication={isGeneratingApp}
            />
          )}

          {currentTab === 'find-jobs' && (
            <FindJobsView
              onMatchJobListing={(listing) => {
                setCurrentTab('job-matcher');
                toast({
                  type: 'info',
                  title: 'Job Selected',
                  description: `Loaded ${listing.title} at ${listing.company} into Job Matcher.`,
                });
              }}
            />
          )}

          {currentTab === 'applications' && (
            <ApplicationsTrackerView
              applications={applications}
              resumes={resumes}
              onUpdateStatus={async (id, status) => {
                const target = applications.find((a) => a.id === id);
                if (!target) return;
                const updated = { ...target, status, updatedAt: new Date().toISOString() };
                await storageService.saveApplication(updated);
                setApplications((prev) => prev.map((a) => (a.id === id ? updated : a)));
                toast({
                  type: 'success',
                  title: 'Status Updated',
                  description: `Application marked as ${status}.`,
                });
              }}
              onDeleteApplication={async (id) => {
                await storageService.deleteApplication(id);
                setApplications((prev) => prev.filter((a) => a.id !== id));
                toast({
                  type: 'info',
                  title: 'Record Removed',
                  description: 'Application tracking record deleted.',
                });
              }}
              onScheduleFollowup={async (app, date, content) => {
                const updated = {
                  ...app,
                  followupDate: date,
                  followupEmailContent: content,
                  updatedAt: new Date().toISOString(),
                };
                await storageService.saveApplication(updated);
                setApplications((prev) => prev.map((a) => (a.id === app.id ? updated : a)));
              }}
            />
          )}

          {currentTab === 'email-accounts' && (
            <EmailAccountsView
              accounts={emailAccounts}
              onConnectGmail={async (email, token) => {
                const acc: ConnectedEmailAccount = {
                  id: `gmail_${Date.now()}`,
                  userId: activeUserId,
                  provider: 'gmail',
                  email,
                  status: 'connected',
                  connectedAt: new Date().toISOString(),
                  scopes: ['https://www.googleapis.com/auth/gmail.send'],
                  ...(token ? { accessToken: token } as any : {}),
                };
                await storageService.saveEmailAccount(acc);
                setEmailAccounts((prev) => [...prev, acc]);
              }}
              onDisconnectAccount={async (id) => {
                await storageService.deleteEmailAccount(id);
                setEmailAccounts((prev) => prev.filter((a) => a.id !== id));
                toast({
                  type: 'info',
                  title: 'Account Disconnected',
                  description: 'OAuth token revoked from platform.',
                });
              }}
            />
          )}

          {currentTab === 'automation' && automationRule && (
            <AutomationView
              rule={automationRule}
              applications={applications}
              onUpdateRule={async (newRule) => {
                await storageService.saveAutomationRule(newRule);
                setAutomationRule(newRule);
              }}
              onBulkSendConfirmed={async (appsToSend) => {
                for (const app of appsToSend) {
                  const updated: JobApplicationRecord = {
                    ...app,
                    status: 'Sent',
                    dateApplied: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  };
                  await storageService.saveApplication(updated);
                }
                const refreshed = await storageService.getApplications(activeUserId);
                setApplications(refreshed);
              }}
            />
          )}

          {currentTab === 'settings' && <SettingsView />}
        </div>
      </main>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* Application Approval Modal */}
      {pendingAppPackage && (
        <ApplicationReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => {
            setIsReviewModalOpen(false);
            setPendingAppPackage(null);
          }}
          appPackage={pendingAppPackage}
          connectedAccounts={emailAccounts}
          selectedResumeTitle={currentResume.title}
          onApproveAndSend={handleApproveAndSend}
          isSending={isSendingEmail}
        />
      )}
    </div>
  );
}
