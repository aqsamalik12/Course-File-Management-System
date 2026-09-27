import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Mail, Lock, Eye, EyeOff, ArrowRight,
  X, Building2, ShieldCheck, BookOpen, Briefcase,
  Sparkles, Zap, Check, KeyRound, User
} from 'lucide-react';

interface DemoAccount {
  id: string;
  role: 'ADMIN' | 'HOD' | 'REGULAR_TEACHER' | 'VISITING_TEACHER';
  roleTitle: string;
  name: string;
  email: string;
  password: string;
  badge: string;
  badgeStyle: string;
  icon: React.ComponentType<{ className?: string }>;
  tagline: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: 'demo-admin',
    role: 'ADMIN',
    roleTitle: 'Dean & Administrator',
    name: 'Prof. Dr. Muhammad Aslam',
    email: 'admin@ue.edu.pk',
    password: 'admin123',
    badge: 'Administrator / Dean',
    badgeStyle: 'bg-amber-500/25 text-amber-200 border-amber-400/40',
    icon: ShieldCheck,
    tagline: 'System control, user permissions & audit logs'
  },
  {
    id: 'demo-hod-cs',
    role: 'HOD',
    roleTitle: 'Head of Department (CS)',
    name: 'Dr. Muhammad Asif',
    email: 'asif.cs@ue.edu.pk',
    password: 'hod123',
    badge: 'HOD - Computer Science',
    badgeStyle: 'bg-purple-500/25 text-purple-200 border-purple-400/40',
    icon: Building2,
    tagline: 'Attock Campus • CS Dept approvals & scope'
  },
  {
    id: 'demo-hod-math',
    role: 'HOD',
    roleTitle: 'Head of Department (Math)',
    name: 'Dr. Abu Zarr',
    email: 'abuzarr.math@ue.edu.pk',
    password: 'hod123',
    badge: 'HOD - Mathematics',
    badgeStyle: 'bg-blue-500/25 text-blue-200 border-blue-400/40',
    icon: Building2,
    tagline: 'Attock Campus • Math Dept approvals & scope'
  },
  {
    id: 'demo-regular',
    role: 'REGULAR_TEACHER',
    roleTitle: 'Regular Teacher (CS)',
    name: 'Dr. Tariq Mahmood',
    email: 'tariq.mahmood@ue.edu.pk',
    password: 'teacher123',
    badge: 'Regular Teacher (CS)',
    badgeStyle: 'bg-emerald-500/25 text-emerald-200 border-emerald-400/40',
    icon: BookOpen,
    tagline: 'Course syllabus, lecture notes & exam packages'
  },
  {
    id: 'demo-visiting',
    role: 'VISITING_TEACHER',
    roleTitle: 'Visiting Teacher (CS)',
    name: 'Engr. Bilal Khan',
    email: 'bilal.visiting@ue.edu.pk',
    password: 'visiting123',
    badge: 'Visiting Faculty (CS)',
    badgeStyle: 'bg-cyan-500/25 text-cyan-200 border-cyan-400/40',
    icon: Briefcase,
    tagline: 'Contract tracking, course uploads & submissions'
  },
  {
    id: 'demo-math-faculty',
    role: 'REGULAR_TEACHER',
    roleTitle: 'Regular Teacher (Math)',
    name: 'Dr. Noman Ali',
    email: 'noman.math@ue.edu.pk',
    password: 'teacher123',
    badge: 'Regular Teacher (Math)',
    badgeStyle: 'bg-teal-500/25 text-teal-200 border-teal-400/40',
    icon: BookOpen,
    tagline: 'Attock Campus • Mathematics Faculty'
  }
];

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
  const [directLoadingRole, setDirectLoadingRole] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [officialEmailAlert, setOfficialEmailAlert] = useState(false);
  const [selectedDemoId, setSelectedDemoId] = useState<string | null>(null);

  const handleSelectDemo = (acc: DemoAccount) => {
    setActiveTab('signin');
    setEmail(acc.email);
    setPassword(acc.password);
    setSelectedDemoId(acc.id);
    setErrorMessage('');
    setOfficialEmailAlert(false);
  };

  const handleQuickLogin = async (acc: DemoAccount) => {
    setActiveTab('signin');
    setEmail(acc.email);
    setPassword(acc.password);
    setSelectedDemoId(acc.id);
    setErrorMessage('');
    setOfficialEmailAlert(false);
    setDirectLoadingRole(acc.role);

    const result = await login(acc.email, acc.password);
    setDirectLoadingRole(null);

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

  const isAnyLoading = isLoading || directLoadingRole !== null;

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
                ? 'Enter university credentials or choose a quick demo account.'
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
                      setSelectedDemoId(null);
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
                      setSelectedDemoId(null);
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

          {/* ── Demo Accounts Section ── */}
          <div className="pt-2 space-y-3">
            <div className="relative flex items-center justify-center">
              <div className="border-t border-white/20 w-full" />
              <span className="bg-[#072418] px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-200 rounded-full border border-emerald-500/30 shadow-sm flex items-center gap-1.5 whitespace-nowrap">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                Demo Accounts • Quick Access
              </span>
            </div>

            <p className="text-[11px] text-center text-white/70 font-medium">
              Click any role card to autofill, or hit <span className="text-amber-300 font-bold">1-Click Sign In</span> for instant access:
            </p>

            {/* Demo Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {DEMO_ACCOUNTS.map((acc) => {
                const Icon = acc.icon;
                const isSelected = selectedDemoId === acc.id;
                const isDirectLoading = directLoadingRole === acc.role;

                return (
                  <div
                    key={acc.id}
                    onClick={() => handleSelectDemo(acc)}
                    className={`group relative text-left p-3 rounded-xl border transition-all duration-200 cursor-pointer backdrop-blur-md flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-950/70 border-emerald-400 ring-2 ring-emerald-400/40 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                        : 'bg-white/5 hover:bg-white/10 border-white/15 hover:border-white/35'
                    }`}
                  >
                    <div>
                      {/* Badge & Credential Hint */}
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${acc.badgeStyle}`}>
                          <Icon className="w-3 h-3 shrink-0" />
                          {acc.badge}
                        </span>

                        {isSelected ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-400/30">
                            <Check className="w-3 h-3 text-emerald-300" />
                            Active
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-white/50 flex items-center gap-1">
                            <KeyRound className="w-2.5 h-2.5 text-white/40" />
                            {acc.password}
                          </span>
                        )}
                      </div>

                      {/* Name & Email */}
                      <div className="space-y-0.5 mb-2">
                        <p className="text-xs font-bold text-white group-hover:text-emerald-200 transition-colors line-clamp-1">
                          {acc.name}
                        </p>
                        <p className="text-[10.5px] text-white/70 font-mono truncate">
                          {acc.email}
                        </p>
                        <p className="text-[9.5px] text-white/50 line-clamp-1">
                          {acc.tagline}
                        </p>
                      </div>
                    </div>

                    {/* Quick Login Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickLogin(acc);
                      }}
                      disabled={isAnyLoading}
                      className={`w-full py-1.5 px-2 rounded-lg text-[10.5px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1 ${
                        isSelected
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-sm'
                          : 'bg-white/10 hover:bg-emerald-600 text-white/90 hover:text-white border border-white/15 hover:border-emerald-400/40'
                      }`}
                    >
                      {isDirectLoading ? (
                        <>
                          <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Signing in...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-3 h-3 text-amber-300 fill-amber-300" />
                          <span>1-Click Sign In</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

          </div>

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

