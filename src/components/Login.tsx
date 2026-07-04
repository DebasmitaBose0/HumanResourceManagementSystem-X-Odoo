import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User as UserIcon, Shield, ArrowRight, Eye, EyeOff, Sparkles, Building2, Phone, MapPin, CheckCircle, Sun, Moon } from 'lucide-react';
import { User, UserRole } from '../types';

interface LoginProps {
  employees: User[];
  onLoginSuccess: (user: User) => void;
  onRegisterSuccess: (newUser: User) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export default function Login({ employees, onLoginSuccess, onRegisterSuccess, theme, toggleTheme }: LoginProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register form state
  const [regId, setRegId] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regJobTitle, setRegJobTitle] = useState('');
  const [regDepartment, setRegDepartment] = useState('Engineering');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('EMPLOYEE');
  const [regError, setRegError] = useState('');

  // Forgot Password state
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotError, setForgotError] = useState('');
  
  // Verification dialog state
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [pendingUser, setPendingUser] = useState<User | null>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail || !loginPassword) {
      setLoginError('Please fill in all fields.');
      return;
    }

    // Find user in mock employees
    const matchedUser = employees.find(
      (emp) => emp.email.toLowerCase() === loginEmail.toLowerCase()
    );

    if (!matchedUser) {
      setLoginError('Invalid email address. Try one of our demo accounts below!');
      return;
    }

    // Since this is a high-fidelity frontend mockup, any non-empty password matching our demo criteria
    // or 'Password123' works.
    if (loginPassword !== 'Password123' && loginPassword.length < 6) {
      setLoginError('Incorrect password. (Try "Password123")');
      return;
    }

    onLoginSuccess(matchedUser);
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    if (!forgotEmail) {
      setForgotError('Please enter your email address.');
      return;
    }

    const matchedUser = employees.find(
      (emp) => emp.email.toLowerCase() === forgotEmail.toLowerCase()
    );

    if (!matchedUser) {
      setForgotError('No employee found with this email address.');
      return;
    }

    setForgotSuccess(`Recovery instructions and temporary credentials ("Password123") have been simulated and sent to ${forgotEmail}. You can now sign in using "Password123".`);
  };

  const validatePassword = (pwd: string) => {
    if (pwd.length < 6) return 'Password must be at least 6 characters.';
    if (!/[A-Za-z]/.test(pwd) || !/[0-9]/.test(pwd)) {
      return 'Password must contain both letters and numbers.';
    }
    return '';
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regId || !regName || !regEmail || !regPassword || !regConfirmPassword || !regJobTitle) {
      setRegError('Please fill in all required fields marked with *.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError('Passwords do not match.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(regEmail)) {
      setRegError('Please enter a valid email address.');
      return;
    }

    const pwdErr = validatePassword(regPassword);
    if (pwdErr) {
      setRegError(pwdErr);
      return;
    }

    // Check if ID or email already exists
    const idExists = employees.some(emp => emp.employeeId.toUpperCase() === regId.toUpperCase());
    const emailExists = employees.some(emp => emp.email.toLowerCase() === regEmail.toLowerCase());

    if (idExists) {
      setRegError('This Employee ID is already registered.');
      return;
    }

    if (emailExists) {
      setRegError('This Email Address is already registered.');
      return;
    }

    const newUser: User = {
      id: `emp-${Date.now()}`,
      employeeId: regId.toUpperCase(),
      email: regEmail,
      role: regRole,
      name: regName,
      phone: regPhone || '+1 (555) 000-0000',
      address: regAddress || 'Not specified',
      profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
      jobTitle: regJobTitle,
      department: regDepartment,
      joiningDate: new Date().toISOString().split('T')[0],
      salaryStructure: {
        basic: regRole === 'ADMIN' ? 9500 : 6000,
        allowances: regRole === 'ADMIN' ? 1500 : 800,
        deductions: regRole === 'ADMIN' ? 500 : 300,
        netSalary: regRole === 'ADMIN' ? 10500 : 6500,
      },
      documents: [
        { id: `doc-reg-1`, name: 'Onboarding_Agreement.pdf', uploadDate: new Date().toISOString().split('T')[0], size: '420 KB' }
      ]
    };

    setPendingUser(newUser);
    setShowVerification(true);
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationError('');

    if (verificationCode !== '1234' && verificationCode !== '123456') {
      setVerificationError('Invalid verification code. Enter "1234" to simulate success.');
      return;
    }

    if (pendingUser) {
      onRegisterSuccess(pendingUser);
      onLoginSuccess(pendingUser);
      setShowVerification(false);
    }
  };

  const triggerQuickLogin = (email: string) => {
    const matchedUser = employees.find(emp => emp.email.toLowerCase() === email.toLowerCase());
    if (matchedUser) {
      onLoginSuccess(matchedUser);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between transition-colors duration-300" id="login-container">
      
      {/* Header Bar */}
      <header className="px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between" id="login-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-odoo-primary flex items-center justify-center text-white font-display font-bold text-xl shadow-md">
            O
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
              odoo <span className="text-xs bg-odoo-primary/10 text-odoo-primary px-2 py-0.5 rounded-full font-sans font-medium">HRMS</span>
            </h1>
            <p className="text-xs text-slate-400 dark:text-slate-500">Workday Alignment Engine</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            id="login-theme-toggle"
            onClick={toggleTheme}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer text-slate-500 dark:text-slate-400"
            title={theme === 'light' ? "Switch to Dark Mode" : "Switch to Light Mode"}
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5 text-slate-600" />
            ) : (
              <Sun className="w-5 h-5 text-amber-400 animate-pulse" />
            )}
          </button>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            System Live
          </div>
        </div>
      </header>

      {/* Main Grid Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 lg:py-16">
        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden" id="login-main-card">
          
          {/* Visual Presentation Column */}
          <div className="lg:col-span-5 bg-gradient-to-br from-odoo-primary via-odoo-dark to-slate-900 p-8 lg:p-12 text-white flex flex-col justify-between relative overflow-hidden" id="login-brand-panel">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-odoo-accent/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-4 relative z-10">
              <span className="bg-white/15 text-white/90 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-widest">
                Enterprise Suite
              </span>
              <h2 className="font-display font-bold text-3xl lg:text-4xl leading-tight text-white/95">
                Every workday, perfectly aligned.
              </h2>
              <p className="text-white/70 text-sm leading-relaxed">
                Streamline employee onboarding, attendance tracking, leave workflows, and transparent payroll reporting in a single unified dashboard.
              </p>
            </div>

            <div className="space-y-6 pt-12 lg:pt-0 relative z-10">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <Shield className="w-4 h-4 text-odoo-accent" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Role-Based Access</h4>
                    <p className="text-xs text-white/60">Secure HR control paired with clean employee-facing features.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-odoo-accent" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Real-Time Dashboards</h4>
                    <p className="text-xs text-white/60">Instant check-ins, automated leave approvals, and analytics.</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 flex justify-between items-center text-xs text-white/40 font-mono">
                <span>VER v4.1.2</span>
                <span>© ODOO HRMS</span>
              </div>
            </div>
          </div>

          {/* Form Action Column */}
          <div className="lg:col-span-7 p-8 lg:p-12 flex flex-col justify-center bg-white dark:bg-slate-900" id="login-form-panel">
            
            {/* Toggle tabs */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl mb-8 self-start w-64">
              <button
                id="btn-login-tab"
                onClick={() => { setIsSignUp(false); setIsForgotPassword(false); setLoginError(''); }}
                className={`flex-1 py-2 text-center text-xs font-semibold rounded-lg transition-all ${(!isSignUp && !isForgotPassword) ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}
              >
                Sign In
              </button>
              <button
                id="btn-signup-tab"
                onClick={() => { setIsSignUp(true); setIsForgotPassword(false); setRegError(''); }}
                className={`flex-1 py-2 text-center text-xs font-semibold rounded-lg transition-all ${(isSignUp && !isForgotPassword) ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}
              >
                Sign Up
              </button>
            </div>

            {/* Forms */}
            <AnimatePresence mode="wait">
              {isForgotPassword ? (
                <motion.div
                  key="forgot"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="font-display font-bold text-2xl text-slate-800 dark:text-white">Recover Password</h3>
                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Enter your registered workspace email to recover your credentials</p>
                  </div>

                  {forgotError && (
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 rounded-xl text-xs text-rose-600 dark:text-rose-400 font-medium" id="forgot-error-msg">
                      {forgotError}
                    </div>
                  )}

                  {forgotSuccess && (
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 rounded-xl text-xs text-emerald-800 dark:text-emerald-400 font-medium leading-relaxed" id="forgot-success-msg">
                      {forgotSuccess}
                    </div>
                  )}

                  <form onSubmit={handleForgotPasswordSubmit} className="space-y-4" id="forgot-form">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          id="forgot-email-input"
                          type="email"
                          placeholder="your.email@company.com"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-odoo-primary focus:bg-white dark:focus:bg-slate-800 transition-colors"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      id="forgot-submit-btn"
                      className="w-full bg-odoo-primary hover:bg-odoo-dark text-white font-semibold rounded-xl py-3 text-sm shadow-lg shadow-odoo-primary/20 flex items-center justify-center gap-2 transition-all cursor-pointer group"
                    >
                      Send Reset Instructions
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <div className="text-center pt-2">
                      <button
                        type="button"
                        id="btn-back-to-login"
                        onClick={() => {
                          setIsForgotPassword(false);
                          setForgotError('');
                          setForgotSuccess('');
                        }}
                        className="text-xs text-slate-500 hover:text-odoo-primary dark:text-slate-400 dark:hover:text-white transition-colors underline cursor-pointer"
                      >
                        Back to Sign In
                      </button>
                    </div>
                  </form>
                </motion.div>
              ) : !isSignUp ? (
                <motion.div
                  key="signin"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="font-display font-bold text-2xl text-slate-800 dark:text-white">Welcome back</h3>
                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Please enter your credentials to access your portal</p>
                  </div>

                  {loginError && (
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 rounded-xl text-xs text-rose-600 dark:text-rose-400 font-medium" id="login-error-msg">
                      {loginError}
                    </div>
                  )}

                  <form onSubmit={handleLoginSubmit} className="space-y-4" id="login-form">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          id="login-email-input"
                          type="email"
                          placeholder="your.email@company.com"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-odoo-primary focus:bg-white dark:focus:bg-slate-800 transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Password</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          id="login-password-input"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-10 pr-10 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-odoo-primary focus:bg-white dark:focus:bg-slate-800 transition-colors"
                        />
                        <button
                          type="button"
                          id="login-pwd-toggle"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        id="btn-forgot-password-trigger"
                        onClick={() => {
                          setIsForgotPassword(true);
                          setLoginError('');
                          setForgotError('');
                          setForgotSuccess('');
                        }}
                        className="text-xs text-slate-500 dark:text-slate-400 hover:text-odoo-primary dark:hover:text-white transition-colors cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>

                    <button
                      type="submit"
                      id="login-submit-btn"
                      className="w-full bg-odoo-primary hover:bg-odoo-dark text-white font-semibold rounded-xl py-3 text-sm shadow-lg shadow-odoo-primary/20 flex items-center justify-center gap-2 transition-all cursor-pointer group"
                    >
                      Sign In to Workspace
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="signup"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="font-display font-bold text-2xl text-slate-800 dark:text-white">Register Profile</h3>
                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Submit employee details to establish your workspace log</p>
                  </div>

                  {regError && (
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 rounded-xl text-xs text-rose-600 dark:text-rose-400 font-medium" id="signup-error-msg">
                      {regError}
                    </div>
                  )}

                  <form onSubmit={handleRegisterSubmit} className="space-y-4 max-h-[420px] overflow-y-auto pr-2" id="signup-form">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Employee ID *</label>
                        <input
                          id="signup-emp-id"
                          type="text"
                          placeholder="EMP-1005"
                          value={regId}
                          onChange={(e) => setRegId(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-odoo-primary focus:bg-white dark:focus:bg-slate-800 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Full Name *</label>
                        <input
                          id="signup-name"
                          type="text"
                          placeholder="Jane Doe"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-odoo-primary focus:bg-white dark:focus:bg-slate-800 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Email *</label>
                        <input
                          id="signup-email"
                          type="email"
                          placeholder="jane@company.com"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-odoo-primary focus:bg-white dark:focus:bg-slate-800 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Phone</label>
                        <input
                          id="signup-phone"
                          type="text"
                          placeholder="+1 (555) 123-4567"
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-odoo-primary focus:bg-white dark:focus:bg-slate-800 transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Address</label>
                      <input
                        id="signup-address"
                        type="text"
                        placeholder="789 Pine Rd, Seattle, WA"
                        value={regAddress}
                        onChange={(e) => setRegAddress(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-odoo-primary focus:bg-white dark:focus:bg-slate-800 transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Job Title *</label>
                        <input
                          id="signup-job-title"
                          type="text"
                          placeholder="Backend Engineer"
                          value={regJobTitle}
                          onChange={(e) => setRegJobTitle(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-odoo-primary focus:bg-white dark:focus:bg-slate-800 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Department</label>
                        <select
                          id="signup-department"
                          value={regDepartment}
                          onChange={(e) => setRegDepartment(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-odoo-primary focus:bg-white dark:focus:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <option value="Engineering" className="dark:bg-slate-900">Engineering</option>
                          <option value="Design" className="dark:bg-slate-900">Design</option>
                          <option value="Product" className="dark:bg-slate-900">Product</option>
                          <option value="Human Resources" className="dark:bg-slate-900">Human Resources</option>
                          <option value="Sales" className="dark:bg-slate-900">Sales</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Account Role</label>
                      <select
                        id="signup-role"
                        value={regRole}
                        onChange={(e) => setRegRole(e.target.value as UserRole)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-odoo-primary focus:bg-white dark:focus:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <option value="EMPLOYEE" className="dark:bg-slate-900">Regular Employee</option>
                        <option value="ADMIN" className="dark:bg-slate-900">Admin / HR Officer</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Password *</label>
                        <input
                          id="signup-password"
                          type="password"
                          placeholder="Min 6 chars"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-odoo-primary focus:bg-white dark:focus:bg-slate-800 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Confirm Password *</label>
                        <input
                          id="signup-confirm-password"
                          type="password"
                          placeholder="Repeat password"
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-odoo-primary focus:bg-white dark:focus:bg-slate-800 transition-colors"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      id="signup-submit-btn"
                      className="w-full bg-odoo-primary hover:bg-odoo-dark text-white font-semibold rounded-xl py-3 text-sm shadow-lg shadow-odoo-primary/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      Submit Registration
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick Presets Section */}
            <div className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-6" id="login-presets-section">
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-odoo-accent" />
                Quick Demo Presets
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" id="demo-account-buttons">
                <button
                  type="button"
                  id="preset-admin"
                  onClick={() => triggerQuickLogin('manisha@company.com')}
                  className="bg-slate-50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-left transition-colors cursor-pointer"
                >
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Manisha Debnath (HR)</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">manisha@company.com • HR Director</p>
                </button>
                <button
                  type="button"
                  id="preset-employee1"
                  onClick={() => triggerQuickLogin('debasmita@company.com')}
                  className="bg-slate-50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-left transition-colors cursor-pointer"
                >
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Debasmita Bose (Employee)</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">debasmita@company.com • Engineer</p>
                </button>
                <button
                  type="button"
                  id="preset-employee2"
                  onClick={() => triggerQuickLogin('joiat@company.com')}
                  className="bg-slate-50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-left transition-colors cursor-pointer"
                >
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Joiat Paul (Employee)</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">joiat@company.com • Designer</p>
                </button>
                <button
                  type="button"
                  id="preset-employee3"
                  onClick={() => triggerQuickLogin('jisjnu@company.com')}
                  className="bg-slate-50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-left transition-colors cursor-pointer"
                >
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Jisjnu Paul (Employee)</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">jisjnu@company.com • QA Analyst</p>
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Verification Dialog Box Modal */}
      <AnimatePresence>
        {showVerification && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="modal-otp-verification">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 lg:p-8 max-w-md w-full shadow-2xl border border-slate-100 dark:border-slate-800 text-center space-y-6"
            >
              <div className="w-16 h-16 rounded-full bg-odoo-light dark:bg-slate-800 text-odoo-primary dark:text-white flex items-center justify-center mx-auto text-2xl font-bold">
                ✉️
              </div>
              <div className="space-y-2">
                <h3 className="font-display font-bold text-xl text-slate-800 dark:text-white">Email Verification Required</h3>
                <p className="text-sm text-slate-400 dark:text-slate-500 leading-relaxed">
                  We've simulated sending a verification OTP to <span className="font-semibold text-slate-600 dark:text-slate-300">{regEmail}</span>.
                </p>
                <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-lg inline-block border border-slate-100 dark:border-slate-700 text-xs font-mono text-slate-500 dark:text-slate-400">
                  Simulation code is: <span className="font-bold text-odoo-primary dark:text-white">1234</span>
                </div>
              </div>

              {verificationError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 rounded-xl text-xs text-rose-600 dark:text-rose-400 font-medium text-left">
                  {verificationError}
                </div>
              )}

              <form onSubmit={handleVerifyCode} className="space-y-4">
                <input
                  id="verification-code-input"
                  type="text"
                  placeholder="Enter 4-digit code"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-center font-mono font-bold text-lg tracking-widest text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-odoo-primary focus:bg-white dark:focus:bg-slate-800 transition-colors"
                />

                <div className="flex gap-3">
                  <button
                    type="button"
                    id="btn-cancel-verify"
                    onClick={() => setShowVerification(false)}
                    className="flex-1 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-semibold py-2.5 rounded-xl text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    id="btn-confirm-verify"
                    className="flex-1 bg-odoo-accent hover:bg-odoo-accent-hover text-white font-semibold py-2.5 rounded-xl text-sm shadow-md shadow-odoo-accent/20 transition-colors cursor-pointer"
                  >
                    Verify & Login
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Page Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900" id="login-footer">
        Powered by <strong className="text-slate-500 dark:text-slate-300">odoo</strong> • Perfectly aligned workspace workflows.
      </footer>
    </div>
  );
}
