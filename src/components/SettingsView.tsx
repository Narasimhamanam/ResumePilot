import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { UserProfile } from '../types';
import { User, Mail, MapPin, Phone, Briefcase, Award, Save } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { profile, updateProfile, user } = useAuth();
  const { toast } = useToast();

  const [name, setName] = useState(profile?.name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [location, setLocation] = useState(profile?.location || '');
  const [skillsStr, setSkillsStr] = useState(profile?.skills?.join(', ') || '');
  const [rolesStr, setRolesStr] = useState(profile?.preferredRoles?.join(', ') || '');
  const [experienceLevel, setExperienceLevel] = useState(profile?.experienceLevel || 'Mid');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        name,
        phone,
        location,
        skills: skillsStr.split(',').map((s) => s.trim()).filter(Boolean),
        preferredRoles: rolesStr.split(',').map((s) => s.trim()).filter(Boolean),
        experienceLevel: experienceLevel as any,
      });
      toast({
        type: 'success',
        title: 'Profile Updated',
        description: 'Candidate profile and career preferences saved.',
      });
    } catch (e: any) {
      toast({
        type: 'error',
        title: 'Save Failed',
        description: e.message || 'Unable to update profile.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div id="settings-view" className="space-y-6 pb-12 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Candidate Profile & System Settings</h2>
        <p className="text-xs text-slate-500 mt-1">
          Manage your verified background information, preferred career targets, and AI tailoring baseline.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
        <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
          Core Contact & Identity
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email (Authenticated)</label>
            <input
              type="email"
              disabled
              value={user?.email || profile?.email || ''}
              className="w-full p-2.5 border border-slate-200 bg-slate-50 text-slate-500 rounded-xl cursor-not-allowed font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
            <input
              type="text"
              placeholder="+1 (555) 019-2834"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Location</label>
            <input
              type="text"
              placeholder="San Francisco, CA or Remote"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-xl"
            />
          </div>
        </div>

        <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100 pt-2">
          Career Preferences & Seniority
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Experience Level</label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value as any)}
              className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
            >
              <option value="Entry">Entry Level (0 - 2 years)</option>
              <option value="Mid">Mid Level (3 - 5 years)</option>
              <option value="Senior">Senior (5 - 8 years)</option>
              <option value="Lead">Lead / Staff (8+ years)</option>
              <option value="Executive">Executive / Director</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Preferred Job Roles (Comma Separated)</label>
            <input
              type="text"
              placeholder="Full Stack Engineer, Backend Architect"
              value={rolesStr}
              onChange={(e) => setRolesStr(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-xl"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">Core Verified Skills (Comma Separated)</label>
            <input
              type="text"
              placeholder="React, TypeScript, Node.js, PostgreSQL, Docker, AWS"
              value={skillsStr}
              onChange={(e) => setSkillsStr(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-xl"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Used as a ground-truth baseline during resume enhancement and job description cross-referencing.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2"
          >
            <Save className="w-3.5 h-3.5" />
            {isSaving ? 'Saving Profile...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
