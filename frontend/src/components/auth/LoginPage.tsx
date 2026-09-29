import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Mail, Lock, Eye, EyeOff, ArrowRight, User,
  Building2, X, KeyRound, Sparkles
} from 'lucide-react';



export const LoginPage: React.FC = () => {
  const { login, registerTeacher } = useAuth();

  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [officialEmailAlert, setOfficialEmailAlert] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address (e.g. yourname@gmail.com).');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);
    const res = await registerTeacher(fullName.trim(), email.trim(), password);
    setIsLoading(false);

    if (!res.success) {
      setErrorMessage(res.error || 'Registration failed. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      setOfficialEmailAlert(false);
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Please enter your password.');
      setOfficialEmailAlert(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setOfficialEmailAlert(false);

    const result = await login(email, password);
    setIsLoading(false);

    if (!result.success) {
      if ((result as any).code === 'official_email') {
        setOfficialEmailAlert(true);
        setErrorMessage('');
      } else {
        setOfficialEmailAlert(false);
        setErrorMessage(result.error || 'Login failed. Please try again.');
      }
    }
  };

  const isAnyLoading = isLoading;

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
      <div className="relative z-10 w-full max-w-[540px] mx-auto animate-fade-in pt-6 sm:pt-8 pb-2 flex flex-col items-center text-center space-y-2">
        <div className="w-18 sm:w-20 h-18 sm:h-20 flex items-center justify-center filter drop-shadow-[0_6px_16px_rgba(0,0,0,0.5)] transition-transform duration-300 hover:scale-105">
          <img
            src="/ue_logo_transparent.png"
            alt="University of Education Logo Crest"
            className="w-full h-full object-contain"
            onError={(e) => { (e.target as HTMLImageElement).src = '/ue_logo.png'; }}
          />
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold font-heading text-white tracking-[0.08em] leading-snug drop-shadow-md">
          UNIVERSITY OF EDUCATION
        </h1>
        <div className="flex flex-col items-center gap-1.5 pt-0.5">
          <p className="text-2xs sm:text-xs font-bold text-emerald-200 uppercase tracking-[0.2em] opacity-95">
            Course File Management System
          </p>
          <div className="w-10 h-0.5 bg-[#F5C542] rounded-full mx-auto shadow-xs" />
        </div>
      </div>

      {/* ── Login Card ── */}
      <div className="relative z-10 w-full max-w-[540px] mx-auto my-auto py-3 animate-fade-in">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 sm:p-8 space-y-5 border border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.5)]">

          {/* Tab Switcher: Sign In vs Teacher Registration */}
          <div className="grid grid-cols-2 p-1 bg-black/30 rounded-xl border border-white/15">
            <button
              type="button"
              onClick={() => {
                setActiveTab('signin');
                setErrorMessage('');
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'signin'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setErrorMessage('');
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Teacher Registration
            </button>
          </div>

          {/* Card Title */}
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-extrabold text-white tracking-tight font-heading drop-shadow-md">
              {activeTab === 'signin' ? 'Portal Sign In' : 'New Teacher Onboarding'}
            </h2>
            <p className="text-xs text-white/75 font-medium">
              {activeTab === 'signin'
                ? 'Enter your university credentials to access the portal.'
                : 'Register with any valid Gmail or official email to begin your enrollment.'}
            </p>
          </div>

          {/* Official Email Alert - special banner */}
          {officialEmailAlert && (
            <div className="p-4 bg-amber-500/20 border border-amber-300/50 rounded-xl text-xs text-amber-100 font-semibold backdrop-blur-sm space-y-2 animate-fade-in">
              <div className="flex items-start gap-2">
                <Building2 className="w-4 h-4 shrink-0 text-amber-300 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-amber-200 font-bold text-[11px] uppercase tracking-wide">Account Not Found</p>
                  <p className="text-amber-100/90 leading-relaxed">
                    This email is not registered yet. Switch to the <button onClick={() => setActiveTab('register')} className="text-amber-300 font-bold underline cursor-pointer">Teacher Registration</button> tab to create your profile!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Alert */}
          {errorMessage && (
            <div className="p-3 bg-rose-500/20 border border-rose-300/40 rounded-xl text-xs text-rose-100 font-semibold flex items-center gap-2 backdrop-blur-sm">
              <X className="w-4 h-4 shrink-0 text-rose-300" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form Switcher */}
          {activeTab === 'register' ? (
            /* Teacher Registration Form */
            <form onSubmit={handleRegister} className="space-y-3.5">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-white/90 block">Full Name</label>
                <div className="flex items-center gap-3 bg-white/10 focus-within:bg-white/15 border border-white/25 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-400/20 rounded-xl px-3.5 py-2.5 transition-all">
                  <User className="w-4 h-4 text-white/60 shrink-0" />
                  <input
                    id="register-fullname"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Dr. Ayesha Siddiqa"
                    required
                    className="w-full bg-transparent border-none outline-none text-xs font-medium text-white placeholder-white/40"
                  />
                </div>
              </div>

              {/* Email Address (Any valid Gmail / email) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white/90 block">Email Address (Gmail / Work)</label>
                  <span className="text-[10px] text-emerald-300 font-medium">Any valid Gmail accepted</span>
                </div>
                <div className="flex items-center gap-3 bg-white/10 focus-within:bg-white/15 border border-white/25 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-400/20 rounded-xl px-3.5 py-2.5 transition-all">
                  <Mail className="w-4 h-4 text-white/60 shrink-0" />
                  <input
                    id="register-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. ayesha.teacher@gmail.com"
                    required
                    className="w-full bg-transparent border-none outline-none text-xs font-medium text-white placeholder-white/40"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-white/90 block">Password (min. 6 characters)</label>
                <div className="flex items-center gap-3 bg-white/10 focus-within:bg-white/15 border border-white/25 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-400/20 rounded-xl px-3.5 py-2.5 transition-all relative">
                  <Lock className="w-4 h-4 text-white/60 shrink-0" />
                  <input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    minLength={6}
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

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-white/90 block">Confirm Password</label>
                <div className="flex items-center gap-3 bg-white/10 focus-within:bg-white/15 border border-white/25 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-400/20 rounded-xl px-3.5 py-2.5 transition-all">
                  <KeyRound className="w-4 h-4 text-white/60 shrink-0" />
                  <input
                    id="register-confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    required
                    className="w-full bg-transparent border-none outline-none text-xs font-medium text-white placeholder-white/40"
                  />
                </div>
              </div>

              {/* Information Notice */}
              <div className="p-3 bg-emerald-500/15 border border-emerald-400/30 rounded-xl text-[11px] text-emerald-100 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-200">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  Next Step: Department & Course Selection
                </div>
                <p className="text-emerald-100/90 leading-relaxed">
                  After registering, you will select your Teacher Type (Regular / Visiting), your Department, and your Courses (subject to credit limits). Your request will automatically route to your HOD for approval.
                </p>
              </div>

              {/* Register Button */}
              <button
                id="btn-register-submit"
                type="submit"
                disabled={isAnyLoading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-950/40 hover:shadow-emerald-700/40 transition-all cursor-pointer flex items-center justify-center gap-2 border border-emerald-400/30"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating Profile...</span>
                  </>
                ) : (
                  <>
                    <span>Register & Continue to Application</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </>
                )}
              </button>

              <div className="text-center pt-1">
                <p className="text-xs text-white/75">
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => setActiveTab('signin')}
                    className="font-bold text-emerald-300 hover:underline cursor-pointer"
                  >
                    Sign In to Portal
                  </button>
                </p>
              </div>
            </form>
          ) : (
            /* Sign In Form */
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
                    onChange={(e) => {
                      setEmail(e.target.value);
                    }}
                    placeholder="e.g. admin@ue.edu.pk or teacher@gmail.com"
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
                    onChange={(e) => {
                      setPassword(e.target.value);
                    }}
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

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-white/30 bg-white/10 focus:ring-white/30 accent-emerald-400 cursor-pointer"
                  />
                  <span className="text-white/80 font-semibold text-[11px]">Remember Me</span>
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Password reset instructions have been dispatched to your department IT administrator.');
                  }}
                  className="font-bold text-emerald-300 hover:text-white transition-colors text-[11px]"
                >
                  Forgot Password?
                </a>
              </div>

              {/* Sign In Button */}
              <button
                id="btn-login-submit"
                type="submit"
                disabled={isAnyLoading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-950/40 hover:shadow-emerald-700/40 transition-all cursor-pointer flex items-center justify-center gap-2 border border-emerald-400/30"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </>
                )}
              </button>

              <div className="text-center pt-1">
                <p className="text-xs text-white/75">
                  New Faculty Member?{' '}
                  <button
                    type="button"
                    onClick={() => setActiveTab('register')}
                    className="font-bold text-emerald-300 hover:underline cursor-pointer"
                  >
                    Register with Gmail / Work Email
                  </button>
                </p>
              </div>
            </form>
          )}



        </div>
      </div>

      {/* ── Footer ── */}
      <div className="relative z-10 w-full max-w-[540px] mx-auto text-center py-2">
        <p className="text-[11px] text-white/60 font-medium">
          University of Education, Attock Campus • Quality Enhancement Cell (QEC)
        </p>
      </div>

    </div>
  );
};

