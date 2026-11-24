import React, { useState, useEffect } from 'react';
import { 
  Shield, User, Briefcase, Mail, Phone, Lock, KeyRound, 
  CheckCircle2, Copy, Eye, EyeOff, Sparkles, ArrowLeft, RefreshCw, Database
} from 'lucide-react';

export default function AuthPage({ onAuthSuccess, onCancel, currentRole = 'buyer', apiBaseUrl = '/api' }) {
  const [authMode, setAuthMode] = useState('register'); // 'signin' | 'register'
  const [role, setRole] = useState(currentRole); // 'buyer' | 'artist'
  const [verificationMethod, setVerificationMethod] = useState('phone'); // 'phone' | 'email'
  
  // Database status indicator & MSG91 OTP Widget configuration
  const [dbInfo, setDbInfo] = useState({ connected: false, mode: 'connecting', database: 'artisanhub', checked: false });
  const [otpConfig, setOtpConfig] = useState({ loaded: false, configured: false, widgetId: '', tokenAuth: '' });
  const [widgetReady, setWidgetReady] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('Indiranagar, Bengaluru');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpReqId, setOtpReqId] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [pendingAccessToken, setPendingAccessToken] = useState('');
  const [otpVerificationToken, setOtpVerificationToken] = useState('');
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [resetAccountMissing, setResetAccountMissing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const reinitMsg91Widget = (widgetId, tokenAuth) => {
    if (typeof window.initSendOTP !== 'function' || !widgetId || !tokenAuth) return false;
    window.initSendOTP({
      widgetId,
      tokenAuth,
      exposeMethods: true,
      success: () => {},
      failure: () => {}
    });
    setWidgetReady(true);
    return true;
  };

  useEffect(() => {
    let isMounted = true;
    let timerId;

    const checkStatus = () => {
      fetch(`${apiBaseUrl}/db-status`)
        .then(res => res.json())
        .then(data => {
          if (!isMounted) return;
          const isConnected = !!data.connected;
          const isInMemory = data.mode === 'in-memory';
          setDbInfo({
            connected: isConnected,
            mode: data.mode || (isConnected ? 'mongodb' : 'in-memory'),
            database: data.database || 'artisanhub',
            checked: true
          });
          if (!isConnected && !isInMemory) {
            timerId = setTimeout(checkStatus, 3000);
          }
        })
        .catch(() => {
          if (!isMounted) return;
          setDbInfo({ connected: false, mode: 'offline', database: 'offline', checked: true });
          timerId = setTimeout(checkStatus, 3000);
        });
    };

    checkStatus();
    return () => {
      isMounted = false;
      if (timerId) clearTimeout(timerId);
    };
  }, [apiBaseUrl]);

  // Fetch MSG91 widget credentials from backend and initialize otp-provider.js
  useEffect(() => {
    let isMounted = true;

    const initMsg91Widget = (widgetId, tokenAuth) => {
      const configure = () => {
        if (!isMounted || typeof window.initSendOTP !== 'function') return;
        window.initSendOTP({
          widgetId,
          tokenAuth,
          exposeMethods: true,
          success: () => {},
          failure: () => {}
        });
        setWidgetReady(true);
      };

      if (typeof window.initSendOTP === 'function') {
        configure();
        return;
      }

      const existingScript = document.querySelector('script[data-msg91-otp="true"]');
      if (existingScript) {
        existingScript.addEventListener('load', configure, { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://verify.msg91.com/otp-provider.js';
      script.async = true;
      script.dataset.msg91Otp = 'true';
      script.onload = configure;
      script.onerror = () => {
        if (isMounted) {
          setErrorMessage('Could not load MSG91 OTP widget script. Please check network/CSP access.');
        }
      };
      document.body.appendChild(script);
    };

    fetch(`${apiBaseUrl}/otp/config`)
      .then(res => res.json())
      .then(data => {
        if (!isMounted) return;
        const configured = Boolean(data?.configured && data?.widgetId && data?.tokenAuth);
        setOtpConfig({
          loaded: true,
          configured,
          widgetId: data?.widgetId || '',
          tokenAuth: data?.tokenAuth || ''
        });
        if (configured) {
          initMsg91Widget(data.widgetId, data.tokenAuth);
        }
      })
      .catch(() => {
        if (isMounted) {
          setOtpConfig({ loaded: true, configured: false, widgetId: '', tokenAuth: '' });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [apiBaseUrl]);

  // Format phone (country code without '+', defaulting 10-digit Indian numbers to 91) or email for MSG91
  const formatMsg91Identifier = () => {
    if (verificationMethod === 'email') {
      return email.trim().toLowerCase();
    }
    const digits = phone.replace(/\D/g, '');
    if (!digits) return '';
    return digits.length === 10 ? `91${digits}` : digits;
  };

  const resetOtpState = () => {
    setOtpSent(false);
    setOtpReqId('');
    setOtpCode('');
    setIsVerified(false);
    setPendingAccessToken('');
    setOtpVerificationToken('');
    setResetAccountMissing(false);
  };

  // Extract readable error message from MSG91 widget error objects
  const extractMsg91Error = (err, fallback) => {
    if (!err) return fallback;
    if (typeof err === 'string') return err;
    const firstArrayErr = Array.isArray(err.errors)
      ? typeof err.errors[0] === 'string'
        ? err.errors[0]
        : err.errors[0]?.message
      : '';
    return (
      err.message ||
      err.error?.message ||
      (typeof err.error === 'string' ? err.error : '') ||
      err.data?.message ||
      firstArrayErr ||
      fallback
    );
  };

  // Extract JWT access token from MSG91 widget callback payload
  const extractMsg91AccessToken = (payload) => {
    if (!payload) return '';
    if (typeof payload === 'string') return payload.trim();
    const isJwt = (v) =>
      typeof v === 'string' && /^[A-Za-z0-9_+/=-]+\.[A-Za-z0-9_+/=-]+\.[A-Za-z0-9_+/=-]+$/.test(v.trim());
    const candidates = [
      payload['access-token'],
      payload.accessToken,
      payload.token,
      payload.data?.['access-token'],
      payload.data?.accessToken,
      payload.data?.token,
      payload.message,
      payload.data?.message,
      ...Object.entries(payload)
        .filter(([k]) => k !== 'type' && k !== 'code')
        .map(([, v]) => v),
      ...(payload.data && typeof payload.data === 'object'
        ? Object.entries(payload.data)
            .filter(([k]) => k !== 'type' && k !== 'code')
            .map(([, v]) => v)
        : [])
    ];
    const jwtMatch = candidates.find(isJwt);
    if (jwtMatch) return jwtMatch.trim();
    const nonStatusText = candidates.find(
      (v) =>
        typeof v === 'string' &&
        v.trim() &&
        !/^(otp|access token)?\s*verified(\s+successfully)?$/i.test(v.trim())
    );
    return (nonStatusText || '').trim();
  };

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
    if (authMode === 'reset') setConfirmPassword(shuffled);
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

  // Validate MSG91 JWT access-token on our backend before unlocking account creation
  const verifyAccessTokenWithBackend = async (accessToken) => {
    setIsVerifyingOtp(true);
    setPendingAccessToken(accessToken);
    try {
      const res = await fetch(`${apiBaseUrl}/auth/verify-otp-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken,
          identifier: formatMsg91Identifier()
        })
      });

      const backendData = await res.json().catch(() => ({}));
      if (!res.ok || !backendData?.verified || !backendData?.otpVerificationToken) {
        setIsVerifyingOtp(false);
        setErrorMessage(backendData?.message || 'Backend OTP token verification failed.');
        return;
      }

      setIsVerifyingOtp(false);
      setIsVerified(true);
      setPendingAccessToken('');
      setOtpVerificationToken(backendData.otpVerificationToken);
      setSuccessMessage('Phone/Email verified securely via MSG91!');
    } catch (err) {
      setIsVerifyingOtp(false);
      setErrorMessage(err?.message || 'Error verifying OTP token with server.');
    }
  };

  // Send Real OTP via MSG91 Widget
  const handleSendVerification = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const formattedId = formatMsg91Identifier();
    if (!formattedId) {
      setErrorMessage(`Please enter a valid ${verificationMethod === 'phone' ? 'mobile number' : 'email address'} first.`);
      return;
    }

    if (!otpConfig.configured) {
      setErrorMessage('MSG91 OTP widget credentials (MSG91_WIDGET_ID & MSG91_TOKEN_AUTH) are not configured on the server.');
      return;
    }

    if (!widgetReady || typeof window.sendOtp !== 'function') {
      setErrorMessage('MSG91 OTP widget is still initializing. Please wait a moment and try again.');
      return;
    }

    setIsSendingOtp(true);
    setIsVerified(false);
    setOtpReqId('');
    setPendingAccessToken('');
    setOtpVerificationToken('');

    const onSendSuccess = (sendRes) => {
      setIsSendingOtp(false);
      const invisibleToken = sendRes?.invisibleVerified ? extractMsg91AccessToken(sendRes) : '';
      if (invisibleToken) {
        verifyAccessTokenWithBackend(invisibleToken);
        return;
      }
      const reqId =
        sendRes?.data?.request_id ||
        sendRes?.data?.requestId ||
        sendRes?.data?.reqId ||
        (typeof sendRes?.message === 'string' ? sendRes.message.trim() : '');
      setOtpReqId(String(reqId || '').trim());
      setOtpSent(true);
      setOtpCode('');
      setSuccessMessage(
        `OTP sent via MSG91 to ${verificationMethod === 'phone' ? phone.trim() : email.trim()}. Please check your ${verificationMethod === 'phone' ? 'SMS' : 'inbox'}.`
      );
    };

    const onSendFailure = (err) => {
      const errMsg = extractMsg91Error(err, 'Failed to send OTP via MSG91.');
      if (/already verified/i.test(errMsg) && otpConfig.widgetId && otpConfig.tokenAuth) {
        reinitMsg91Widget(otpConfig.widgetId, otpConfig.tokenAuth);
        setTimeout(() => {
          window.sendOtp(formattedId, onSendSuccess, (retryErr) => {
            setIsSendingOtp(false);
            setErrorMessage(extractMsg91Error(retryErr, 'Failed to send OTP via MSG91.'));
          });
        }, 250);
        return;
      }
      setIsSendingOtp(false);
      setErrorMessage(errMsg);
    };

    window.sendOtp(formattedId, onSendSuccess, onSendFailure);
  };

  // Verify Code directly on backend via MSG91 Widget API (or fallback to widget verifyOtp + verifyAccessToken)
  const handleVerifyCode = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    // If we already received an access token from MSG91, retry backend validation directly
    if (pendingAccessToken) {
      verifyAccessTokenWithBackend(pendingAccessToken);
      return;
    }

    const trimmedOtp = otpCode.trim();
    if (trimmedOtp.length < 4) {
      setErrorMessage('Please enter the OTP received on your device.');
      return;
    }

    if (otpReqId) {
      setIsVerifyingOtp(true);
      try {
        const res = await fetch(`${apiBaseUrl}/auth/verify-otp-code`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            otp: trimmedOtp,
            reqId: otpReqId,
            identifier: formatMsg91Identifier()
          })
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data?.verified && data?.otpVerificationToken) {
          setIsVerifyingOtp(false);
          setIsVerified(true);
          setOtpVerificationToken(data.otpVerificationToken);
          setSuccessMessage('Phone/Email verified securely via MSG91!');
          return;
        }
        setIsVerifyingOtp(false);
        const errMsg = data?.message || 'Invalid or expired OTP. Please check the code and try again.';
        if (/already verified/i.test(errMsg)) {
          reinitMsg91Widget(otpConfig.widgetId, otpConfig.tokenAuth);
          setOtpSent(false);
          setOtpReqId('');
          setOtpCode('');
          setErrorMessage('That OTP session was already verified on MSG91. Click "Send OTP" to request a fresh code.');
          return;
        }
        setErrorMessage(errMsg);
      } catch (err) {
        setIsVerifyingOtp(false);
        setErrorMessage(err?.message || 'Error verifying OTP with server.');
      }
      return;
    }

    if (typeof window.verifyOtp !== 'function') {
      setErrorMessage('MSG91 verification widget is not ready. Please try again.');
      return;
    }

    setIsVerifyingOtp(true);

    window.verifyOtp(
      trimmedOtp,
      async (widgetData) => {
        const accessToken = extractMsg91AccessToken(widgetData);
        if (!accessToken) {
          setIsVerifyingOtp(false);
          setErrorMessage('MSG91 verified OTP but did not return an access token.');
          return;
        }
        await verifyAccessTokenWithBackend(accessToken);
      },
      (err) => {
        setIsVerifyingOtp(false);
        const errMsg = extractMsg91Error(err, 'Invalid or expired OTP. Please check the code and try again.');
        if (/already verified/i.test(errMsg)) {
          reinitMsg91Widget(otpConfig.widgetId, otpConfig.tokenAuth);
          setOtpSent(false);
          setOtpReqId('');
          setOtpCode('');
          setErrorMessage('That OTP session was already verified on MSG91. Click "Send OTP" to request a fresh code.');
          return;
        }
        setErrorMessage(errMsg);
      }
    );
  };

  // Submit Sign In, Register, or Reset Password with strict credential & OTP verification
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    setResetAccountMissing(false);

    const identifier = verificationMethod === 'phone' ? phone.trim() : email.trim();

    if (!identifier) {
      setErrorMessage(`Please enter your ${verificationMethod === 'phone' ? 'phone number' : 'email address'}.`);
      setIsLoading(false);
      return;
    }

    if ((authMode === 'register' || authMode === 'reset') && (!isVerified || !otpVerificationToken)) {
      setErrorMessage(
        `Please send and verify the OTP sent to your ${verificationMethod === 'phone' ? 'mobile number' : 'email'} before ${
          authMode === 'register' ? 'creating an account' : 'resetting your password'
        }.`
      );
      setIsLoading(false);
      return;
    }

    if (!password) {
      setErrorMessage(authMode === 'reset' ? 'Please enter or generate a new password.' : 'Please enter or generate a password.');
      setIsLoading(false);
      return;
    }

    if (authMode === 'reset') {
      if (password.length < 6) {
        setErrorMessage('New password must be at least 6 characters long.');
        setIsLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('New password and confirmation do not match.');
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`${apiBaseUrl}/auth/reset-password`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'ArtisanHub' },
          body: JSON.stringify({
            phone: verificationMethod === 'phone' ? identifier : undefined,
            email: verificationMethod === 'email' ? identifier : undefined,
            role,
            newPassword: password,
            otpVerificationToken
          })
        });
        const data = await res.json().catch(() => ({}));
        setIsLoading(false);

        if (res.ok && data?.ok) {
          setPassword('');
          setConfirmPassword('');
          resetOtpState();
          setAuthMode('signin');
          setSuccessMessage(data.message || 'Password reset successfully! Please sign in with your new password.');
          return;
        }

        if (res.status === 404) {
          setResetAccountMissing(true);
        }
        setErrorMessage(data?.message || `Password reset failed (HTTP ${res.status}).`);
        return;
      } catch (netErr) {
        setIsLoading(false);
        setErrorMessage(`Cannot reach server (${netErr.message || 'Network error'}). Please try again.`);
        return;
      }
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
        : 'Passionate collector of fine local and heritage art.',
      otpVerificationToken: authMode === 'register' ? otpVerificationToken : undefined
    };

    // Mode 1: REGISTRATION (Only after backend-verified MSG91 OTP token)
    if (authMode === 'register') {
      try {
        const res = await fetch(`${apiBaseUrl}/auth/register`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'ArtisanHub' },
          body: JSON.stringify(payload)
        });

        const rawText = await res.text();
        let data = {};
        try {
          data = rawText ? JSON.parse(rawText) : {};
        } catch {
          data = {};
        }

        if (res.ok && data.user) {
          saveLocalAccount({ ...payload, id: data.user.id });
          setIsLoading(false);
          setSuccessMessage('Account created and verified! Signing you in...');
          setTimeout(() => {
            onAuthSuccess(data.user, data.token || '');
          }, 600);
          return;
        } else {
          setErrorMessage(
            data.message ||
            data.error ||
            `Registration failed (HTTP ${res.status}). Could not create account.`
          );
          setIsLoading(false);
          return;
        }
      } catch (netErr) {
        setIsLoading(false);
        setErrorMessage(`Cannot reach server (${netErr.message || 'Network error'}). Please try again.`);
        return;
      }
    }

    // Mode 2: SIGN IN (Strict credential checking)
    if (authMode === 'signin') {
      try {
        const res = await fetch(`${apiBaseUrl}/auth/login`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'ArtisanHub' },
          body: JSON.stringify({
            phone: payload.phone,
            email: payload.email,
            password: payload.password,
            role: payload.role
          })
        });

        const rawText = await res.text();
        let data = {};
        try {
          data = rawText ? JSON.parse(rawText) : {};
        } catch {
          data = {};
        }

        if (res.ok && data.user) {
          setIsLoading(false);
          setSuccessMessage('Credentials verified! Welcome back.');
          setTimeout(() => {
            onAuthSuccess(data.user, data.token || '');
          }, 400);
          return;
        } else {
          setErrorMessage(
            data.message ||
            data.error ||
            `Sign in failed (HTTP ${res.status}). Password or user details incorrect.`
          );
          setIsLoading(false);
          return;
        }
      } catch (err) {
        const isDemoMatch = 
          ((payload.phone === '+91 98765 43210' || payload.email === 'ananya.buyer@artisanhub.in') && role === 'buyer' && (password === 'buyer123' || password === 'demo123')) ||
          ((payload.phone === '+91 98450 11223' || payload.email === 'rohan.artist@artisanhub.in') && role === 'artist' && (password === 'artist123' || password === 'demo123'));

        if (isDemoMatch) {
          setIsLoading(false);
          handleQuickDemoLogin(role);
          return;
        }

        setIsLoading(false);
        setErrorMessage(`Cannot connect to backend: ${err.message || 'Connection failed'}.`);
        return;
      }
    }
  };

  // Quick Demo Logins (issues real backend session token + cookie)
  const handleQuickDemoLogin = async (demoRole) => {
    setIsLoading(true);
    setErrorMessage('');
    const fallbackDemoUser = {
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

    try {
      const res = await fetch(`${apiBaseUrl}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'ArtisanHub' },
        body: JSON.stringify({
          email: fallbackDemoUser.email,
          password: demoRole === 'artist' ? 'artist123' : 'buyer123',
          role: demoRole
        })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.user) {
        saveLocalAccount(data.user);
        onAuthSuccess(data.user, data.token || '');
        setIsLoading(false);
        return;
      }
    } catch {
      // fallback to local demo profile only if server unreachable
    }

    saveLocalAccount(fallbackDemoUser);
    setTimeout(() => {
      onAuthSuccess(fallbackDemoUser, '');
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
            {authMode === 'register'
              ? 'Join ArtisanHub'
              : authMode === 'reset'
                ? 'Reset Password'
                : 'Sign In to ArtisanHub'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            {authMode === 'register'
              ? 'Verify your phone or email via OTP first, then complete your ArtisanHub account.'
              : authMode === 'reset'
                ? 'Verify your registered mobile number (or email) with OTP to set a new password.'
                : 'Sign in to access the hyper-local art marketplace, commissions, and limited auctions.'}
          </p>

          {/* Mode Switcher */}
          <div className="flex justify-center pt-3">
            <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 inline-flex">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setPassword('');
                  setConfirmPassword('');
                  resetOtpState();
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                  authMode === 'signin' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setPassword('');
                  setConfirmPassword('');
                  resetOtpState();
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                  authMode === 'register' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Create Account
              </button>
              {authMode === 'reset' && (
                <button
                  type="button"
                  className="px-4 py-1.5 rounded-lg text-xs font-bold transition bg-emerald-500 text-slate-950 shadow-sm"
                >
                  Reset Password
                </button>
              )}
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
          <div className="bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs px-4 py-3 rounded-xl mb-6 space-y-2">
            <p>{errorMessage}</p>
            {resetAccountMissing && authMode === 'reset' && (
              <button
                type="button"
                onClick={() => {
                  setResetAccountMissing(false);
                  setErrorMessage('');
                  setConfirmPassword('');
                  setAuthMode('register');
                  setSuccessMessage('Mobile/Email already verified! Complete your profile and password below to register.');
                }}
                className="inline-flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-[11px] transition"
              >
                Register Account With This Verified {verificationMethod === 'phone' ? 'Mobile Number' : 'Email'}
              </button>
            )}
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
                2.{' '}
                {authMode === 'register'
                  ? 'OTP Verification Method *'
                  : authMode === 'reset'
                    ? 'Verify Registered Mobile / Email *'
                    : 'Sign In Method *'}
              </label>
              <div className="flex gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setVerificationMethod('phone');
                    resetOtpState();
                  }}
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
                  onClick={() => {
                    setVerificationMethod('email');
                    resetOtpState();
                  }}
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
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (otpSent || isVerified) resetOtpState();
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                  {(authMode === 'register' || authMode === 'reset') && (
                    <button
                      type="button"
                      disabled={isSendingOtp || isVerified}
                      onClick={handleSendVerification}
                      className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-amber-400 px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-700 transition shrink-0 flex items-center gap-1.5"
                    >
                      {isSendingOtp ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Sending...
                        </>
                      ) : isVerified ? (
                        'Verified'
                      ) : otpSent ? (
                        'Resend OTP'
                      ) : (
                        'Send OTP'
                      )}
                    </button>
                  )}
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
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (otpSent || isVerified) resetOtpState();
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  {(authMode === 'register' || authMode === 'reset') && (
                    <button
                      type="button"
                      disabled={isSendingOtp || isVerified}
                      onClick={handleSendVerification}
                      className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-amber-400 px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-700 transition shrink-0 flex items-center gap-1.5"
                    >
                      {isSendingOtp ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Sending...
                        </>
                      ) : isVerified ? (
                        'Verified'
                      ) : otpSent ? (
                        'Resend Code'
                      ) : (
                        'Send Code'
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* OTP Verification Field (Registration & Password Reset) */}
            {(authMode === 'register' || authMode === 'reset') && otpSent && (
              <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">
                    Enter OTP sent to {verificationMethod === 'phone' ? phone : email}:
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
                    inputMode="numeric"
                    maxLength={6}
                    disabled={isVerified}
                    value={otpCode}
                    onChange={(e) => {
                      setOtpCode(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="Enter OTP code"
                    className="w-full bg-slate-900 border border-slate-800 disabled:opacity-60 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 tracking-widest text-center font-mono focus:outline-none focus:border-amber-400"
                  />
                  {!isVerified && (
                    <button
                      type="button"
                      disabled={isVerifyingOtp}
                      onClick={handleVerifyCode}
                      className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl transition shrink-0 flex items-center gap-1.5"
                    >
                      {isVerifyingOtp ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Verifying...
                        </>
                      ) : (
                        'Confirm'
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}

            {(authMode === 'register' || authMode === 'reset') && otpConfig.loaded && !otpConfig.configured && (
              <p className="text-[11px] text-amber-300/90 bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2">
                MSG91 OTP widget credentials are not yet active on the server (`MSG91_WIDGET_ID` and `MSG91_TOKEN_AUTH`).
              </p>
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

          {/* STEP 3: PASSWORD WITH GENERATOR & FORGOT PASSWORD */}
          <div className="space-y-2.5 pt-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                {authMode === 'reset' ? '3. Set New Password *' : '3. Password & Security *'}
              </label>
              <div className="flex items-center gap-3">
                {authMode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('reset');
                      setVerificationMethod('phone');
                      setPassword('');
                      setConfirmPassword('');
                      resetOtpState();
                      setErrorMessage('');
                      setSuccessMessage('Enter your registered mobile number, verify via OTP, and set a new password.');
                    }}
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 underline underline-offset-2 transition"
                  >
                    Forgot Password?
                  </button>
                )}
                {authMode === 'reset' && (
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signin');
                      setPassword('');
                      setConfirmPassword('');
                      resetOtpState();
                      setErrorMessage('');
                      setSuccessMessage('');
                    }}
                    className="text-xs font-semibold text-slate-400 hover:text-slate-200 underline underline-offset-2 transition"
                  >
                    Back to Sign In
                  </button>
                )}
                {(authMode === 'register' || authMode === 'reset') && (
                  <button
                    type="button"
                    onClick={generateStrongPassword}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 transition"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    Generate Strong Password
                  </button>
                )}
              </div>
            </div>

            {/* Password Input Box */}
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder={authMode === 'reset' ? 'Enter or generate new password' : 'Enter or generate secure password'}
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

            {authMode === 'reset' && (
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-200 font-mono focus:outline-none focus:border-amber-400"
                />
              </div>
            )}

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

          {/* OTP Gate Banner */}
          {(authMode === 'register' || authMode === 'reset') && (!isVerified || !otpVerificationToken) && (
            <div className="bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                {authMode === 'register'
                  ? 'Verify your phone or email via OTP in Step 2 to unlock account creation.'
                  : 'Verify your registered mobile number or email via OTP in Step 2 to reset your password.'}
              </span>
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || ((authMode === 'register' || authMode === 'reset') && (!isVerified || !otpVerificationToken))}
              className="w-full bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 py-3.5 rounded-2xl text-xs sm:text-sm font-extrabold transition shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  {authMode === 'reset' ? 'Updating Password...' : 'Verifying Credentials...'}
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 text-slate-950" />
                  {authMode === 'register'
                    ? isVerified && otpVerificationToken
                      ? `Create ${role === 'artist' ? 'Artist' : 'Buyer'} Account`
                      : 'Verify OTP to Create Account'
                    : authMode === 'reset'
                      ? isVerified && otpVerificationToken
                        ? 'Reset Password'
                        : 'Verify OTP to Reset Password'
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
              <span className={`inline-block w-2 h-2 rounded-full ${dbInfo.connected ? 'bg-emerald-400 animate-pulse' : dbInfo.mode === 'in-memory' ? 'bg-amber-400' : dbInfo.checked ? 'bg-rose-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className={dbInfo.connected ? 'text-emerald-300 font-semibold' : dbInfo.mode === 'in-memory' ? 'text-amber-300 font-semibold' : dbInfo.checked ? 'text-rose-300 font-medium' : 'text-amber-300 font-medium'}>
                {dbInfo.connected
                  ? `MongoDB Atlas Connected (${dbInfo.database})`
                  : dbInfo.mode === 'in-memory'
                    ? `In-Memory Store Active (${dbInfo.database})`
                    : dbInfo.checked
                      ? 'Atlas Reconnecting...'
                      : 'Connecting to Atlas...'}
              </span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
