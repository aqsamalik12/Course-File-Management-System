import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Mail, Lock, Eye, EyeOff, ArrowRight, X, Sparkles
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    const result = await login(email, password);
    setIsLoading(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Login failed. Please verify your credentials and try again.');
    }
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col items-center justify-between p-4 sm:p-6 lg:p-8 overflow-y-auto font-sans select-none bg-[#051c12]">

      {/* ── Background ── */}
      <div className="fixed inset-0 z-0 overflow-hidden bg-[#051c12]">
        <video autoPlay loop muted playsInline
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ objectFit: 'cover', objectPosition: 'center' }}>
          <source src="/bg_video2.mp4" type="video/mp4" />
          <source src="/bg_video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[#051c12]/40 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#051c12]/70 via-transparent to-[#051c12]/80" />
        <div className="absolute inset-0 shadow-[inset_0_0_160px_rgba(0,0,0,0.75)] pointer-events-none" />
      </div>

      {/* ── Top Branding ── */}
      <div className="relative z-10 w-full max-w-[440px] mx-auto animate-fade-in pt-4 sm:pt-6 pb-2 flex flex-col items-center text-center space-y-1.5">
        <div className="w-14 sm:w-16 h-14 sm:h-16 flex items-center justify-center filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] transition-transform duration-300 hover:scale-105">
          <img
            src="/ue_logo_transparent.png"
            alt="University of Education Logo Crest"
            className="w-full h-full object-contain"
            onError={(e) => { (e.target as HTMLImageElement).src = '/ue_logo.png'; }}
          />
        </div>
        <h1 className="text-lg sm:text-xl font-extrabold font-heading text-white tracking-[0.06em] leading-snug drop-shadow-md">
          UNIVERSITY OF EDUCATION
        </h1>
        <div className="flex flex-col items-center gap-1">
          <p className="text-3xs sm:text-2xs font-bold text-emerald-200 uppercase tracking-[0.18em] opacity-95">
            Course File Management System
          </p>
          <div className="w-8 h-0.5 bg-[#F5C542] rounded-full mx-auto shadow-xs" />
        </div>
      </div>

      {/* ── Login Card ── */}
      <div className="relative z-10 w-full max-w-[440px] mx-auto my-auto py-2 animate-fade-in">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 sm:p-7 space-y-4 border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">

          {/* Card Title */}
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-extrabold text-white tracking-tight font-heading drop-shadow-md">
              Portal Sign In
            </h2>
            <p className="text-xs text-white/75 font-medium">
              Enter your email address and password to sign in.
            </p>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="p-3 bg-rose-500/20 border border-rose-300/40 rounded-xl text-xs text-rose-100 font-semibold flex items-center gap-2 backdrop-blur-sm">
              <X className="w-4 h-4 shrink-0 text-rose-300" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Sign In Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-white/90 block">Email Address</label>
              <div className="flex items-center gap-3 bg-white/10 focus-within:bg-white/15 border border-white/25 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-400/20 rounded-xl px-3.5 py-2.5 transition-all">
                <Mail className="w-4 h-4 text-white/60 shrink-0" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. yourname@gmail.com or admin@ue.edu.pk"
                  required
                  className="w-full bg-transparent border-none outline-none text-xs font-medium text-white placeholder-white/40"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-white/90 block">Password</label>
              <div className="flex items-center gap-3 bg-white/10 focus-within:bg-white/15 border border-white/25 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-400/20 rounded-xl px-3.5 py-2.5 transition-all relative">
                <Lock className="w-4 h-4 text-white/60 shrink-0" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-transparent border-none outline-none text-xs font-medium text-white placeholder-white/40 pr-8"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-white/50 hover:text-white cursor-pointer transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Teacher instructions */}
            <div className="p-3 bg-emerald-500/15 border border-emerald-400/30 rounded-xl text-[11px] text-emerald-100 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-emerald-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Visiting & Regular Teachers</span>
              </div>
              <p className="text-emerald-100/90 leading-relaxed text-[11px]">
                Enter any valid email and password to log in. Your profile and course onboarding form will open immediately after signing in.
              </p>
            </div>

            {/* Sign In Button */}
            <button
              id="btn-login-submit"
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-950/40 hover:shadow-emerald-700/40 transition-all cursor-pointer flex items-center justify-center gap-2 border border-emerald-400/30"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </>
              )}
            </button>
          </form>

        </div>
      </div>

      {/* ── Footer ── */}
      <div className="relative z-10 w-full max-w-[440px] mx-auto text-center py-2">
        <p className="text-[11px] text-white/60 font-medium">
          University of Education, Attock Campus • Quality Enhancement Cell (QEC)
        </p>
      </div>

    </div>
  );
};
