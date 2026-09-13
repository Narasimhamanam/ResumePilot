import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  UserProfile,
  ResumeVersion,
  JobApplicationRecord,
  ConnectedEmailAccount,
  AutomationRule,
  ActivityLog,
  ParsedJobDescription,
} from '../types';

export const storageService = {
  // Profiles
  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const snap = await getDoc(doc(db, 'users', userId));
      return snap.exists() ? (snap.data() as UserProfile) : null;
    } catch (e) {
      console.error('getProfile error:', e);
      return null;
    }
  },

  async saveProfile(profile: UserProfile): Promise<void> {
    await setDoc(doc(db, 'users', profile.id), profile, { merge: true });
  },

  // Resumes
  async getResumes(userId: string): Promise<ResumeVersion[]> {
    try {
      const q = query(collection(db, 'resumes'), where('userId', '==', userId));
      const snap = await getDocs(q);
      const list: ResumeVersion[] = [];
      snap.forEach((d) => list.push(d.data() as ResumeVersion));
      return list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } catch (e) {
      console.error('getResumes error:', e);
      return [];
    }
  },

  async getResume(id: string): Promise<ResumeVersion | null> {
    try {
      const snap = await getDoc(doc(db, 'resumes', id));
      return snap.exists() ? (snap.data() as ResumeVersion) : null;
    } catch (e) {
      console.error('getResume error:', e);
      return null;
    }
  },

  async saveResume(resume: ResumeVersion): Promise<void> {
    await setDoc(doc(db, 'resumes', resume.id), resume);
  },

  async deleteResume(id: string): Promise<void> {
    await deleteDoc(doc(db, 'resumes', id));
  },

  // Applications
  async getApplications(userId: string): Promise<JobApplicationRecord[]> {
    try {
      const q = query(collection(db, 'applications'), where('userId', '==', userId));
      const snap = await getDocs(q);
      const list: JobApplicationRecord[] = [];
      snap.forEach((d) => list.push(d.data() as JobApplicationRecord));
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (e) {
      console.error('getApplications error:', e);
      return [];
    }
  },

  async saveApplication(app: JobApplicationRecord): Promise<void> {
    await setDoc(doc(db, 'applications', app.id), app, { merge: true });
  },

  async deleteApplication(id: string): Promise<void> {
    await deleteDoc(doc(db, 'applications', id));
  },

  // Email Accounts
  async getEmailAccounts(userId: string): Promise<ConnectedEmailAccount[]> {
    try {
      const q = query(collection(db, 'email_accounts'), where('userId', '==', userId));
      const snap = await getDocs(q);
      const list: ConnectedEmailAccount[] = [];
      snap.forEach((d) => list.push(d.data() as ConnectedEmailAccount));
      return list;
    } catch (e) {
      console.error('getEmailAccounts error:', e);
      return [];
    }
  },

  async saveEmailAccount(acc: ConnectedEmailAccount): Promise<void> {
    await setDoc(doc(db, 'email_accounts', acc.id), acc, { merge: true });
  },

  async deleteEmailAccount(id: string): Promise<void> {
    await deleteDoc(doc(db, 'email_accounts', id));
  },

  // Automation Rules
  async getAutomationRule(userId: string): Promise<AutomationRule> {
    try {
      const snap = await getDoc(doc(db, 'automation_rules', userId));
      if (snap.exists()) return snap.data() as AutomationRule;
    } catch (e) {
      console.error('getAutomationRule error:', e);
    }
    // Default safe configuration
    return {
      id: userId,
      userId,
      enabled: false,
      dailyApplicationLimit: 10,
      autoScheduleFollowupDays: 7,
      requireUserApprovalForFollowup: true,
      requireUserApprovalForSend: true,
      duplicateApplicationDetection: true,
    };
  },

  async saveAutomationRule(rule: AutomationRule): Promise<void> {
    await setDoc(doc(db, 'automation_rules', rule.userId), rule, { merge: true });
  },

  // Activity Logs
  async logActivity(activity: ActivityLog): Promise<void> {
    try {
      await setDoc(doc(db, 'activity_logs', activity.id), activity);
    } catch (e) {
      console.error('logActivity error:', e);
    }
  },

  async getActivityLogs(userId: string): Promise<ActivityLog[]> {
    try {
      const q = query(collection(db, 'activity_logs'), where('userId', '==', userId));
      const snap = await getDocs(q);
      const list: ActivityLog[] = [];
      snap.forEach((d) => list.push(d.data() as ActivityLog));
      return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 30);
    } catch (e) {
      console.error('getActivityLogs error:', e);
      return [];
    }
  },
};
