import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Compass, Sparkles, ArrowRight, KeyRound, Mail, User, AlertCircle } from 'lucide-react';

export const AuthModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { login, register, resetPassword } = useAuth();
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      if (isForgotPassword) {
        if (!email) throw new Error('Please enter your email address');
        await resetPassword(email);
        toast({
          type: 'info',
          title: 'Password Reset Sent',
          description: 'Check your email inbox for instructions to reset your password.',
        });
        setIsForgotPassword(false);
      } else if (isRegister) {
        if (!name.trim()) throw new Error('Please enter your full name');
        await register(email.trim(), password, name.trim());
        toast({
          type: 'success',
          title: 'Account Created',
          description: `Welcome to ResumePilot, ${name}!`,
        });
        onClose();
      } else {
        await login(email.trim(), password);
        toast({
          type: 'success',
          title: 'Signed In',
          description: 'Welcome back to ResumePilot.',
        });
        onClose();
      }
    } catch (err: any) {
      console.error('Firebase Auth Error:', err);
      let humanReadable = err.message || 'Failed to authenticate.';

      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        humanReadable = 'No account found with this email/password. If you have not created an account yet, click "Create Free Account" below.';
      } else if (err.code === 'auth/wrong-password') {
        humanReadable = 'Incorrect password. Please try again or use "Forgot password?".';
      } else if (err.code === 'auth/email-already-in-use') {
        humanReadable = 'An account with this email already exists. Please switch to "Sign In" instead.';
      } else if (err.code === 'auth/weak-password') {
        humanReadable = 'Password is too weak. Please use at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        humanReadable = 'Please enter a valid email address format.';
      } else if (err.code === 'auth/operation-not-allowed') {
        humanReadable = 'Email/Password sign-in is not enabled in Firebase Console. Please enable Email/Password provider under Authentication > Sign-in method.';
      }

      setErrorMessage(humanReadable);
      toast({
        type: 'error',
        title: 'Authentication Failed',
        description: humanReadable,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div id="auth-modal-card" className="bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-2xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">ResumePilot</h2>
            <p className="text-xs text-slate-500 font-medium tracking-tight">AI Career & Application Infrastructure</p>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-slate-800 mb-1">
          {isForgotPassword ? 'Reset Password' : isRegister ? 'Create Your Professional Account' : 'Sign in to ResumePilot'}
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          {isForgotPassword
            ? 'Enter your registered email to receive recovery instructions.'
            : isRegister
            ? 'Manage versions, optimize ATS match scores, and automate job outreach.'
            : 'Access your tailored resumes, applications, and email automation.'}
        </p>

        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{errorMessage}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && !isForgotPassword && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="auth-name-input"
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Work / Primary Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                id="auth-email-input"
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {!isForgotPassword && (
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-medium text-slate-700">Password</label>
                {!isRegister && (
                  <button
                    id="auth-forgot-password-btn"
                    type="button"
                    onClick={() => {
                      setErrorMessage(null);
                      setIsForgotPassword(true);
                    }}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="auth-password-input"
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <button
            id="auth-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow transition disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <>
                <span>
                  {isForgotPassword
                    ? 'Send Reset Link'
                    : isRegister
                    ? 'Complete Registration'
                    : 'Sign In to Workspace'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-2 text-center text-xs text-slate-600">
          {isForgotPassword ? (
            <button
              id="back-to-signin-btn"
              type="button"
              onClick={() => {
                setErrorMessage(null);
                setIsForgotPassword(false);
              }}
              className="text-indigo-600 hover:underline font-medium"
            >
              Back to Sign In
            </button>
          ) : (
            <div>
              {isRegister ? 'Already have an account?' : "Don't have an account yet?"}{' '}
              <button
                id="toggle-register-btn"
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  setIsRegister(!isRegister);
                }}
                className="text-indigo-600 font-semibold hover:underline"
              >
                {isRegister ? 'Sign In' : 'Create Free Account'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
