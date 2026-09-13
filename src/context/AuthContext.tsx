import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { storageService } from '../services/storageService';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (e: string, p: string) => Promise<void>;
  register: (e: string, p: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (e: string) => Promise<void>;
  updateProfile: (p: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        let prof = await storageService.getProfile(currentUser.uid);
        if (!prof) {
          prof = {
            id: currentUser.uid,
            name: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
            email: currentUser.email || '',
            skills: ['React', 'TypeScript', 'Node.js'],
            preferredRoles: ['Full Stack Engineer', 'Frontend Engineer'],
            preferredLocations: ['Remote', 'San Francisco, CA'],
            experienceLevel: 'Mid',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          await storageService.saveProfile(prof);
        }
        setProfile(prof);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const login = async (e: string, p: string) => {
    await signInWithEmailAndPassword(auth, e, p);
  };

  const register = async (e: string, p: string, name: string) => {
    const cred = await createUserWithEmailAndPassword(auth, e, p);
    const newProf: UserProfile = {
      id: cred.user.uid,
      name,
      email: e,
      skills: [],
      preferredRoles: ['Software Engineer'],
      preferredLocations: ['Remote'],
      experienceLevel: 'Entry',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await storageService.saveProfile(newProf);
    setProfile(newProf);
  };

  const logout = async () => {
    await fbSignOut(auth);
  };

  const resetPassword = async (e: string) => {
    await sendPasswordResetEmail(auth, e);
  };

  const updateProfile = async (partial: Partial<UserProfile>) => {
    if (!user || !profile) return;
    const updated: UserProfile = {
      ...profile,
      ...partial,
      updatedAt: new Date().toISOString(),
    };
    await storageService.saveProfile(updated);
    setProfile(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        login,
        register,
        logout,
        resetPassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
