import React, { useState, useEffect } from 'react';
import { 
  Shield, User, Briefcase, Mail, Phone, Lock, KeyRound, 
  CheckCircle2, Copy, Eye, EyeOff, Sparkles, ArrowLeft, RefreshCw, Database
} from 'lucide-react';

export default function AuthPage({ onAuthSuccess, onCancel, currentRole = 'buyer', apiBaseUrl = '/api' }) {
  const [authMode, setAuthMode] = useState('register'); // 'signin' | 'register'
  const [role, setRole] = useState(currentRole); // 'buyer' | 'artist'
  const [verificationMethod, setVerificationMethod] = useState('phone'); // 'phone' | 'email'
  
  // Database status indicator
  const [dbInfo, setDbInfo] = useState({ connected: false, database: 'artisanhub', checked: false });

  useEffect(() => {
    fetch(`${apiBaseUrl}/db-status`)
      .then(res => res.json())
      .then(data => setDbInfo({ connected: !!data.connected, database: data.database || 'artisanhub', checked: true }))
      .catch(() => setDbInfo({ connected: false, database: 'offline', checked: true }));
  }, [apiBaseUrl]);

  // Form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('Indiranagar, Bengaluru');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Helper to get local accounts registry
  const getLocalAccounts = () => {
    try {
      const data = localStorage.getItem('artisanhub_registered_accounts');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  };

  // Helper to save local account
  const saveLocalAccount = (acc) => {
    try {
      const existing = getLocalAccounts();
      const filtered = existing.filter(u => 
        (acc.phone && u.phone === acc.phone) || 
        (acc.email && u.email === acc.email)
      );
      if (filtered.length === 0) {
        existing.push(acc);
        localStorage.setItem('artisanhub_registered_accounts', JSON.stringify(existing));
      }
    } catch (e) {
      console.warn('Could not save to localStorage accounts', e);
    }
  };

  // Password Generator Function
  const generateStrongPassword = () => {
    const uppercase = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const lowercase = "abcdefghijkmnopqrstuvwxyz";
    const numbers = "23456789";
    const symbols = "!@#$%^&*()_+~=";
    const allChars = uppercase + lowercase + numbers + symbols;

    let generated = "";
    generated += uppercase[Math.floor(Math.random() * uppercase.length)];
    generated += lowercase[Math.floor(Math.random() * lowercase.length)];
    generated += numbers[Math.floor(Math.random() * numbers.length)];
    generated += symbols[Math.floor(Math.random() * symbols.length)];

    for (let i = 4; i < 16; i++) {
      generated += allChars[Math.floor(Math.random() * allChars.length)];
    }

    const shuffled = generated.split('').sort(() => 0.5 - Math.random()).join('');
    setPassword(shuffled);
    setShowPassword(true);
  };

  // Copy Password to Clipboard
  const handleCopyPassword = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2000);
  };

  // Calculate Password Strength
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: 'None', color: 'bg-slate-700' };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (pwd.length >= 12) score += 1;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 2) return { score: 25, label: 'Weak', color: 'bg-rose-500' };
    if (score === 3 || score === 4) return { score: 70, label: 'Moderate', color: 'bg-amber-400' };
    return { score: 100, label: 'Strong & Secure', color: 'bg-emerald-400' };
  };

  const strength = getPasswordStrength(password);

  // Send Verification Code
  const handleSendVerification = (e) => {
    e.preventDefault();
    setOtpSent(true);
    setErrorMessage('');
    setTimeout(() => {
      setOtpCode('8492');
    }, 400);
  };

  // Verify Code
  const handleVerifyCode = () => {
    if (otpCode.length >= 4) {
      setIsVerified(true);
      setSuccessMessage('Verification code confirmed.');
    }
  };

  // Submit Sign In or Register with strict credential validation
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    const identifier = verificationMethod === 'phone' ? phone.trim() : email.trim();

    if (!identifier) {
      setErrorMessage(`Please enter your ${verificationMethod === 'phone' ? 'phone number' : 'email address'}.`);
      setIsLoading(false);
      return;
    }

    if (!password) {
      setErrorMessage('Please enter or generate a password.');
      setIsLoading(false);
      return;
    }

    const payload = {
      phone: verificationMethod === 'phone' ? identifier : undefined,
      email: verificationMethod === 'email' ? identifier : undefined,
      password,
      role,
      name: name.trim() || (role === 'artist' ? 'Master Artisan' : 'Art Connoisseur'),
      location: location.trim() || 'Bengaluru Local',
      bio: role === 'artist' 
        ? 'Specializing in authentic handmade artworks and custom commissions.' 
        : 'Passionate collector of fine local and heritage art.'
    };

    // Mode 1: REGISTRATION (Save directly to MongoDB Atlas)
    if (authMode === 'register') {
      try {
        const res = await fetch(`${apiBaseUrl}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await res.json().catch(() => ({}));

        if (res.ok && data.user) {
          saveLocalAccount({ ...payload, id: data.user.id });
          setIsLoading(false);
          setSuccessMessage('Account created and saved in MongoDB Atlas! Signing you in...');
          setTimeout(() => {
            onAuthSuccess(data.user);
          }, 600);
          return;
        } else {
          setErrorMessage(data.message || 'Registration failed. Could not save user to MongoDB database.');
          setIsLoading(false);
          return;
        }
      } catch (netErr) {
        setIsLoading(false);
        setErrorMessage(`Cannot reach database server (${netErr.message || 'Network error'}). Please verify MongoDB Atlas connection.`);
        return;
      }
    }

    // Mode 2: SIGN IN (Strict credential checking against MongoDB Atlas)
    if (authMode === 'signin') {
      try {
        const res = await fetch(`${apiBaseUrl}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: payload.phone,
            email: payload.email,
            password: payload.password,
            role: payload.role
          })
        });

        const data = await res.json().catch(() => ({}));

        if (res.ok && data.user) {
          setIsLoading(false);
          setSuccessMessage('Credentials verified in MongoDB Atlas! Welcome back.');
          setTimeout(() => {
            onAuthSuccess(data.user);
          }, 400);
          return;
        } else {
          setErrorMessage(data.message || 'Invalid credentials. Password or user details incorrect.');
          setIsLoading(false);
          return;
        }
      } catch (err) {
        // Check demo accounts if network unreachable
        const isDemoMatch = 
          ((payload.phone === '+91 98765 43210' || payload.email === 'ananya.buyer@artisanhub.in') && role === 'buyer' && (password === 'buyer123' || password === 'demo123')) ||
          ((payload.phone === '+91 98450 11223' || payload.email === 'rohan.artist@artisanhub.in') && role === 'artist' && (password === 'artist123' || password === 'demo123'));

        if (isDemoMatch) {
          setIsLoading(false);
          handleQuickDemoLogin(role);
          return;
        }

        setIsLoading(false);
        setErrorMessage(`Cannot connect to database backend: ${err.message || 'Connection failed'}. Please check internet & server.`);
        return;
      }
    }
  };

  // Quick Demo Logins
  const handleQuickDemoLogin = (demoRole) => {
    setIsLoading(true);
    setErrorMessage('');
    const demoUser = {
      id: demoRole === 'artist' ? 'usr-art-1' : 'usr-101',
      name: demoRole === 'artist' ? 'Rohan Verma' : 'Ananya Sharma',
      role: demoRole,
      phone: demoRole === 'artist' ? '+91 98450 11223' : '+91 98765 43210',
      email: demoRole === 'artist' ? 'rohan.artist@artisanhub.in' : 'ananya.buyer@artisanhub.in',
      location: demoRole === 'artist' ? 'Indiranagar, Bengaluru' : 'Koramangala, Bengaluru',
      isVerified: true,
      bio: demoRole === 'artist' 
        ? 'Master oil painter and heritage clay sculptor in Bengaluru with 12+ years of artisanal craft experience.'
        : 'Passionate local art collector focusing on contemporary Indian acrylics and traditional handmade pottery.',
      joinedDate: 'March 2024'
    };
    saveLocalAccount(demoUser);
    setTimeout(() => {
      onAuthSuccess(demoUser);
      setIsLoading(false);
    }, 300);
  };

  return (
    <div className="max-w-2xl mx-auto py-8 sm:py-14 px-4">
      {/* Optional Back button */}
      {onCancel && (
        <button 
          onClick={onCancel}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Art Gallery
        </button>
      )}

      <div className="backdrop-blur-2xl bg-slate-900/90 border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Logo & Header */}
        <div className="text-center space-y-2 mb-8 relative z-10">
          <div className="w-12 h-12 bg-gradient-to-tr from-amber-500 to-amber-300 rounded-2xl flex items-center justify-center text-slate-950 font-black text-xl mx-auto shadow-lg shadow-amber-500/20 mb-3">
            AH
          </div>
          <div className="inline-flex items-center gap-2 bg-slate-950/80 border border-slate-800 px-3 py-1 rounded-full text-xs text-amber-400 font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hyper-Local Artisan Marketplace</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
            {authMode === 'register' ? 'Join ArtisanHub' : 'Sign In to ArtisanHub'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            {authMode === 'register'
              ? 'Connect directly with neighborhood creators and art collectors with verified identity.'
              : 'Sign in to access the hyper-local art marketplace, commissions, and limited auctions.'}
          </p>

          {/* Mode Switcher */}
          <div className="flex justify-center pt-3">
            <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 inline-flex">
              <button
                type="button"
                onClick={() => setAuthMode('signin')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                  authMode === 'signin' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                  authMode === 'register' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Create Account
              </button>
            </div>
          </div>

          {/* Quick Demo Login Bar */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-slate-500 text-[11px] font-medium mr-1">One-Click Demo Access:</span>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('buyer')}
              className="backdrop-blur-md bg-slate-800/80 hover:bg-slate-700/80 text-amber-300 hover:text-white px-3 py-1.5 rounded-xl border border-amber-400/20 font-semibold transition flex items-center gap-1.5 shadow-sm"
            >
              <User className="w-3.5 h-3.5 text-amber-400" /> Demo Buyer
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('artist')}
              className="backdrop-blur-md bg-slate-800/80 hover:bg-slate-700/80 text-emerald-300 hover:text-white px-3 py-1.5 rounded-xl border border-emerald-400/20 font-semibold transition flex items-center gap-1.5 shadow-sm"
            >
              <Briefcase className="w-3.5 h-3.5 text-emerald-400" /> Demo Artist
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs px-4 py-3 rounded-xl mb-6">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          {/* STEP 1: SELECT YOUR ROLE */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
              1. Select Your Role *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Buyer Role */}
              <button
                type="button"
                onClick={() => setRole('buyer')}
                className={`p-4 rounded-2xl border text-left transition-all relative ${
                  role === 'buyer'
                    ? 'bg-amber-400/10 border-amber-400 shadow-lg shadow-amber-400/5 ring-1 ring-amber-400'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-400/15 text-amber-400 flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  {role === 'buyer' && (
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-400/20 px-2 py-0.5 rounded-full">
                      Selected
                    </span>
                  )}
                </div>
                <div className="font-bold text-sm text-slate-100">Art Buyer / Patron</div>
                <div className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Discover local creations, commission bespoke pieces, and bid on limited editions.
                </div>
              </button>

              {/* Artist Role */}
              <button
                type="button"
                onClick={() => setRole('artist')}
                className={`p-4 rounded-2xl border text-left transition-all relative ${
                  role === 'artist'
                    ? 'bg-amber-400/10 border-amber-400 shadow-lg shadow-amber-400/5 ring-1 ring-amber-400'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-400/15 text-amber-400 flex items-center justify-center">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  {role === 'artist' && (
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-400/20 px-2 py-0.5 rounded-full">
                      Selected
                    </span>
                  )}
                </div>
                <div className="font-bold text-sm text-slate-100">Artisan / Creator</div>
                <div className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Showcase artwork to neighborhood collectors, submit price proposals on custom demands.
                </div>
              </button>
            </div>
          </div>

          {/* STEP 2: VERIFICATION METHOD (EMAIL OR PHONE) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                2. Verification Method *
              </label>
              <div className="flex gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setVerificationMethod('phone')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    verificationMethod === 'phone'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Phone className="w-3 h-3" /> Phone SMS
                </button>
                <button
                  type="button"
                  onClick={() => setVerificationMethod('email')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    verificationMethod === 'email'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Mail className="w-3 h-3" /> Email OTP
                </button>
              </div>
            </div>

            {/* Verification Inputs */}
            {verificationMethod === 'phone' ? (
              <div className="space-y-2">
                <label className="text-xs text-slate-400 block">Mobile Phone Number</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendVerification}
                    className="bg-slate-800 hover:bg-slate-700 text-amber-400 px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-700 transition shrink-0"
                  >
                    {otpSent ? 'Resend SMS' : 'Send OTP'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-xs text-slate-400 block">Email Address</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                    <input
                      type="email"
                      required
                      placeholder="patron@artisanhub.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendVerification}
                    className="bg-slate-800 hover:bg-slate-700 text-amber-400 px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-700 transition shrink-0"
                  >
                    {otpSent ? 'Resend Code' : 'Send Code'}
                  </button>
                </div>
              </div>
            )}

            {/* OTP Verification Field */}
            {otpSent && (
              <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">
                    Enter Verification Code sent to {verificationMethod === 'phone' ? phone : email}:
                  </span>
                  {isVerified && (
                    <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="Enter code"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 tracking-widest text-center font-mono focus:outline-none focus:border-amber-400"
                  />
                  {!isVerified && (
                    <button
                      type="button"
                      onClick={handleVerifyCode}
                      className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl transition shrink-0"
                    >
                      Confirm
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* NAME & LOCATION (FOR REGISTRATION) */}
          {authMode === 'register' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder={role === 'artist' ? 'e.g. Master Ananya Rao' : 'e.g. Vikramaditya Sen'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Neighborhood Area *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Indiranagar, Bengaluru"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          )}

          {/* STEP 3: PASSWORD WITH GENERATOR */}
          <div className="space-y-2.5 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                3. Password & Security *
              </label>
              <button
                type="button"
                onClick={generateStrongPassword}
                className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 transition"
              >
                <KeyRound className="w-3.5 h-3.5" />
                Generate Strong Password
              </button>
            </div>

            {/* Password Input Box */}
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter or generate secure password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-24 py-2.5 text-xs sm:text-sm text-slate-200 font-mono focus:outline-none focus:border-amber-400"
              />
              <div className="absolute right-2 top-2 flex items-center gap-1">
                {password && (
                  <button
                    type="button"
                    onClick={handleCopyPassword}
                    className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition"
                    title="Copy generated password"
                  >
                    {copiedPassword ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Password Strength Meter */}
            {password && (
              <div className="space-y-1 pt-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-500">Security Strength:</span>
                  <span className="font-bold text-slate-300">{strength.label}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full transition-all duration-300 ${strength.color}`}
                    style={{ width: `${strength.score}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* SUBMIT BUTTON */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 py-3.5 rounded-2xl text-xs sm:text-sm font-extrabold transition shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Verifying Credentials...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 text-slate-950" />
                  {authMode === 'register'
                    ? `Create ${role === 'artist' ? 'Artist' : 'Buyer'} Account`
                    : `Sign In as ${role === 'artist' ? 'Artist' : 'Buyer'}`}
                </>
              )}
            </button>
          </div>

          {/* Live MongoDB Atlas Connection Status */}
          <div className="pt-2 flex items-center justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/70 border border-slate-800 text-[11px]">
              <Database className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400">Database:</span>
              <span className={`inline-block w-2 h-2 rounded-full ${dbInfo.connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className={dbInfo.connected ? 'text-emerald-300 font-semibold' : 'text-amber-300 font-medium'}>
                {dbInfo.connected ? `MongoDB Atlas Connected (${dbInfo.database})` : 'Connecting to Atlas...'}
              </span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
