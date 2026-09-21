import React, { useState } from 'react';
import { Logo } from '../common/Logo';
import { X, Lock, Mail, User as UserIcon, Building, ArrowRight, Sparkles } from 'lucide-react';
import { mockCurrentUser } from '../../services/mockData';
import { User } from '../../types';

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

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const loggedUser: User = {
      ...mockCurrentUser,
      name: fullName || mockCurrentUser.name,
      email: email || mockCurrentUser.email,
    };
    onSuccess(loggedUser);
    onClose();
  };

  const handleDemoLogin = () => {
    onSuccess(mockCurrentUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#123047]/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-[#DDEBEF] relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-[#82919A] hover:text-[#123047] hover:bg-[#F5FAFC] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="flex justify-center">
            <Logo size="md" />
          </div>
          <h3 className="text-2xl font-extrabold text-[#123047] pt-2">
            {mode === 'login' && 'Welcome back'}
            {mode === 'signup' && 'Create your account'}
            {mode === 'forgot' && 'Reset your password'}
          </h3>
          <p className="text-xs text-[#52636D]">
            {mode === 'login' && 'Enter your credentials to access your AI voice workspace.'}
            {mode === 'signup' && 'Start your 14-day trial. No credit card required.'}
            {mode === 'forgot' && "We'll send you an encrypted password reset link."}
          </p>
        </div>

        {/* 1-Click Demo Shortcut */}
        <button
          type="button"
          onClick={handleDemoLogin}
          className="w-full mb-5 py-2.5 px-4 rounded-xl bg-[#EEF8FC] hover:bg-[#DDEBEF] border border-[#55B9E8]/40 text-[#2189C8] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs"
        >
          <Sparkles className="w-4 h-4" />
          Instant Demo Login (Shailesh — Apollo Clinics)
        </button>

        <div className="relative flex py-2 items-center mb-4">
          <div className="flex-grow border-t border-[#DDEBEF]" />
          <span className="flex-shrink mx-3 text-[11px] font-semibold text-[#82919A] uppercase tracking-wider">
            or continue with email
          </span>
          <div className="flex-grow border-t border-[#DDEBEF]" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-bold text-[#123047] mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-[#82919A] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Shailesh Kumar"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#DDEBEF] text-sm focus:outline-none focus:border-[#2189C8] bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#123047] mb-1">Business Name</label>
                <div className="relative">
                  <Building className="w-4 h-4 text-[#82919A] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Apollo Care Clinics"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#DDEBEF] text-sm focus:outline-none focus:border-[#2189C8] bg-white"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-[#123047] mb-1">Work Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#82919A] absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="shailesh@apolloclinics.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#DDEBEF] text-sm focus:outline-none focus:border-[#2189C8] bg-white"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-[#123047]">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[11px] text-[#2189C8] hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#82919A] absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#DDEBEF] text-sm focus:outline-none focus:border-[#2189C8] bg-white"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#38A85B] hover:bg-[#2f8f4d] text-white font-bold text-sm shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {mode === 'login' && 'Sign in to Dashboard'}
            {mode === 'signup' && 'Create Workspace'}
            {mode === 'forgot' && 'Send Reset Link'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer switch */}
        <div className="mt-6 text-center text-xs text-[#52636D]">
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="font-bold text-[#2189C8] hover:underline"
              >
                Sign up free
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="font-bold text-[#2189C8] hover:underline"
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
