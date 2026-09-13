import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Sparkles,
  Target,
  Briefcase,
  Send,
  Mail,
  Sliders,
  Settings,
  LogOut,
  Compass,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type NavigationTab =
  | 'dashboard'
  | 'my-resume'
  | 'resume-enhancer'
  | 'job-matcher'
  | 'find-jobs'
  | 'applications'
  | 'email-accounts'
  | 'automation'
  | 'settings';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenAuth: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, onOpenAuth }) => {
  const { user, profile, logout } = useAuth();

  const navItems: { id: NavigationTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'my-resume', label: 'My Resume', icon: FileText },
    { id: 'resume-enhancer', label: 'Resume Enhancer', icon: Sparkles },
    { id: 'job-matcher', label: 'Job Matcher', icon: Target },
    { id: 'find-jobs', label: 'Find Jobs', icon: Briefcase },
    { id: 'applications', label: 'Applications', icon: Send },
    { id: 'email-accounts', label: 'Gmail Account', icon: Mail },
    { id: 'automation', label: 'Automation', icon: Sliders },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      id="app-sidebar"
      className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen select-none shrink-0"
    >
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
          <Compass className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-base text-slate-900 tracking-tight flex items-center gap-1.5">
            ResumePilot
            <span className="text-[10px] px-1.5 py-0.5 font-semibold bg-indigo-50 text-indigo-700 rounded border border-indigo-200">
              AI 2.5
            </span>
          </h1>
          <p className="text-xs text-slate-500">Autonomous Job Outreach</p>
        </div>
      </div>

      {/* Navigation List */}
      <nav id="sidebar-navigation" className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-50/80 text-indigo-700 font-semibold border border-indigo-100'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User / Auth Footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        {user ? (
          <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                {profile?.name?.charAt(0) || user.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-800 truncate">{profile?.name || 'Candidate'}</div>
                <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
              </div>
            </div>
            <button
              id="sidebar-logout-btn"
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="p-2 text-center">
            <button
              id="sidebar-signin-btn"
              onClick={onOpenAuth}
              className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow transition"
            >
              Sign In / Register
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
