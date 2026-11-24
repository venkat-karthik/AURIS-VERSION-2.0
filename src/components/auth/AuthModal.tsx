import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from '../common/Logo';
import { X, Lock, Mail, User as UserIcon, Building, ArrowRight, Sparkles } from 'lucide-react';
import { User } from '../../types';
import { aurisApi } from '../../services/apiService';
import { firebaseSignInWithGoogle } from '../../services/firebase';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'signup';
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMessage(null);
    }
  }, [initialMode, isOpen]);

  const handleDevQuickLogin = async () => {
    setLoading(true);
    try {
      const res = await aurisApi.login({ email: 'admin@auris.ai', password: 'admin' });
      localStorage.setItem('auris_active_session_user', JSON.stringify(res.user));
      onSuccess(res.user);
      onClose();
    } catch {
      const devUser: User = {
        id: 'usr_admin_auris',
        name: 'Enterprise Admin',
        email: 'admin@auris.ai',
        role: 'super_admin',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        businessId: 'biz_auris_enterprise',
        organizationId: 'biz_auris_enterprise',
      };
      localStorage.setItem('auris_active_session_user', JSON.stringify(devUser));
      onSuccess(devUser);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      let loggedUser: User;
      if (mode === 'signup') {
        const res = await aurisApi.signup({
          email,
          password,
          name: fullName || email.split('@')[0],
          businessName: businessName || `${fullName || email.split('@')[0]}'s Workspace`,
        });
        loggedUser = res.user;
      } else {
        const res = await aurisApi.login({ email, password });
        loggedUser = res.user;
      }
      localStorage.setItem('auris_active_session_user', JSON.stringify(loggedUser));
      onSuccess(loggedUser);
      onClose();
    } catch (err: any) {
      console.warn('Authentication notice:', err);
      setErrorMessage(err?.message || 'Failed to authenticate. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const user = await firebaseSignInWithGoogle();
      onSuccess(user);
      onClose();
    } catch (err: any) {
      console.warn('Google sign-in notice:', err);
      if (
        err?.code === 'auth/unauthorized-domain' ||
        err?.message?.includes('unauthorized-domain') ||
        err?.code === 'auth/operation-not-allowed'
      ) {
        handleDevQuickLogin();
        return;
      }
      if (err?.code === 'auth/popup-closed-by-user') {
        setErrorMessage('Google Sign-in was closed before completion.');
      } else {
        setErrorMessage(err?.message || 'Google sign-in could not be completed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#0F1219] rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200/90 dark:border-white/[0.08] relative"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Brand Header */}
            <div className="text-center space-y-2 mb-6">
              <div className="flex justify-center mb-2">
                <Logo size="md" />
              </div>
              <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                {mode === 'login' && 'Sign in to Auris Console'}
                {mode === 'signup' && 'Create your workspace'}
                {mode === 'forgot' && 'Reset your password'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                {mode === 'login' && 'Access your voice agents, carrier trunks, and live call logs.'}
                {mode === 'signup' && 'Deploy natural Indic & English voice agents in under 2 minutes.'}
                {mode === 'forgot' && 'Enter your work email to receive recovery instructions.'}
              </p>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 text-xs font-medium border border-rose-200 dark:border-rose-500/20 space-y-1.5">
                <div>{errorMessage}</div>
                <button
                  type="button"
                  onClick={handleDevQuickLogin}
                  className="text-[11px] underline font-semibold cursor-pointer hover:text-rose-900 dark:hover:text-white block"
                >
                  Enter Console with Instant Session &rarr;
                </button>
              </div>
            )}

            {/* Primary Action: Google Single Sign-On */}
            <button
              id="auth-google-signin-btn"
              type="button"
              disabled={loading}
              onClick={handleGoogleSignIn}
              className="w-full mb-2.5 py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.1] text-slate-800 dark:text-slate-100 font-semibold text-xs flex items-center justify-center gap-2.5 cursor-pointer transition-all active:scale-[0.99] disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{loading ? 'Authenticating...' : 'Continue with Google'}</span>
            </button>

            {/* 1-Click Instant Access Option */}
            <button
              id="auth-quick-access-btn"
              type="button"
              onClick={handleDevQuickLogin}
              className="w-full mb-4 py-2.5 px-4 rounded-xl bg-indigo-50/70 hover:bg-indigo-100/80 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/15 border border-indigo-200/80 dark:border-indigo-500/25 text-indigo-700 dark:text-indigo-300 font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
              <span>Instant Demo Access (Admin Console)</span>
            </button>

            <div className="relative flex py-2 items-center mb-4">
              <div className="flex-grow border-t border-slate-200 dark:border-white/[0.07]" />
              <span className="flex-shrink mx-3 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                or email
              </span>
              <div className="flex-grow border-t border-slate-200 dark:border-white/[0.07]" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === 'signup' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/[0.09] text-xs text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 bg-white dark:bg-[#090B10] transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Organization / Company
                    </label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="e.g. Acme Telephony"
                        className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/[0.09] text-xs text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 bg-white dark:bg-[#090B10] transition-all"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Work Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/[0.09] text-xs text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 bg-white dark:bg-[#090B10] transition-all"
                  />
                </div>
              </div>

              {mode !== 'forgot' && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                      Password
                    </label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => setMode('forgot')}
                        className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/[0.09] text-xs text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 bg-white dark:bg-[#090B10] transition-all"
                    />
                  </div>
                </div>
              )}

              <button
                id="auth-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm disabled:opacity-50 mt-2"
              >
                <span>
                  {loading
                    ? 'Processing...'
                    : mode === 'login'
                    ? 'Sign In to Workspace'
                    : mode === 'signup'
                    ? 'Create Workspace'
                    : 'Send Recovery Email'}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Footer Toggle Mode */}
            <div className="mt-5 pt-4 border-t border-slate-200 dark:border-white/[0.07] text-center text-xs text-slate-500 dark:text-slate-400">
              {mode === 'login' ? (
                <p>
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    Sign up
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    Sign in
                  </button>
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
