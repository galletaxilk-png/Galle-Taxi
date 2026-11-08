import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Car,
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
  X,
  AlertTriangle,
  Settings,
  Key,
  Radio,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../lib/store';
import { getStoredFirebaseConfig, isValidFirebaseApiKey, FirebaseWebConfig } from '../../lib/firebase';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const {
    loginAdmin,
    loginWithGoogle,
    resetAdminPassword,
    isAdminLoggedIn,
    isFirebaseActive,
    firebaseProjectId,
    saveWebConfig,
    testConnection,
  } = useApp();

  const [email, setEmail] = useState('galletaxi.lk@gmail.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Forgot Password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('galletaxi.lk@gmail.com');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Firebase Setup Modal State (for easy configuration directly from login)
  const storedConfig = getStoredFirebaseConfig();
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [cfgApiKey, setCfgApiKey] = useState(storedConfig?.apiKey || '');
  const [cfgProjectId, setCfgProjectId] = useState(storedConfig?.projectId || 'galle-taxi');
  const [cfgAppId, setCfgAppId] = useState(storedConfig?.appId || '');
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [configSuccessMessage, setConfigSuccessMessage] = useState<string | null>(null);
  const [configErrorMessage, setConfigErrorMessage] = useState<string | null>(null);

  const [isTestingProbe, setIsTestingProbe] = useState(false);
  const [probeResult, setProbeResult] = useState<{ success: boolean; message: string } | null>(null);

  // If already logged in, redirect to admin console
  React.useEffect(() => {
    if (isAdminLoggedIn) {
      navigate('/admin');
    }
  }, [isAdminLoggedIn, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email.trim() || !password) {
      setError('Please provide both your administrator email and password.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await loginAdmin(email.trim(), password);
      if (result.success) {
        setSuccess('Authentication successful! Opening Galle Taxi Dispatch Console...');
        setTimeout(() => {
          navigate('/admin');
        }, 500);
      } else {
        setError(result.error || 'Invalid administrator credentials.');
      }
    } catch (err: any) {
      setError(err?.message || 'An error occurred during administrator authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccess(null);
    setIsGoogleLoading(true);
    try {
      const res = await loginWithGoogle();
      if (res.success) {
        setSuccess('Google Authentication successful! Opening Galle Taxi Dispatch Console...');
        setTimeout(() => {
          navigate('/admin');
        }, 500);
      } else {
        setError(res.error || 'Google sign-in was not authorized.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to authenticate with Google.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetMessage(null);

    if (!resetEmail.trim()) {
      setResetMessage({ type: 'error', text: 'Please enter your registered administrator email address.' });
      return;
    }

    setResetLoading(true);

    try {
      const result = await resetAdminPassword(resetEmail.trim());
      if (result.success) {
        setResetMessage({
          type: 'success',
          text: `Password reset instructions have been dispatched to ${resetEmail.trim()}. Please check your inbox.`,
        });
      } else {
        setResetMessage({
          type: 'error',
          text: result.error || 'Failed to dispatch password reset email.',
        });
      }
    } catch (err: any) {
      setResetMessage({
        type: 'error',
        text: err?.message || 'An error occurred while sending password reset email.',
      });
    } finally {
      setResetLoading(false);
    }
  };

  const handleSaveFirebaseConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfigSuccessMessage(null);
    setConfigErrorMessage(null);

    if (!isValidFirebaseApiKey(cfgApiKey)) {
      setConfigErrorMessage(
        'Please enter a valid Firebase Web API key starting with "AIzaSy" (found in Firebase Console > Project Settings > General > Your apps).'
      );
      return;
    }

    setIsSavingConfig(true);

    try {
      const config: FirebaseWebConfig = {
        apiKey: cfgApiKey.trim(),
        projectId: (cfgProjectId || 'galle-taxi').trim(),
        appId: cfgAppId.trim() || undefined,
      };

      await saveWebConfig(config);
      setConfigSuccessMessage('Firebase configuration saved successfully! Reloading...');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      setConfigErrorMessage(err?.message || 'Failed to save Firebase configuration.');
      setIsSavingConfig(false);
    }
  };

  const handleRunDiagnostic = async () => {
    setIsTestingProbe(true);
    setProbeResult(null);
    try {
      const res = await testConnection();
      setProbeResult({ success: res.success, message: res.message });
    } catch (err: any) {
      setProbeResult({ success: false, message: err?.message || 'Diagnostic probe failed' });
    } finally {
      setIsTestingProbe(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 text-slate-100">
      <div className="w-full max-w-md space-y-5">
        {/* Top Navigation Back Button */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-[#F5B91B] bg-[#141416] hover:bg-[#1f1f23] border border-[#27272A] hover:border-[#F5B91B]/40 px-3.5 py-2 rounded-xl transition-all shadow-sm group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to Website</span>
          </Link>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Admin Gateway</span>
          </div>
        </div>

        {/* Brand Lockup */}
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F5B91B] to-[#D4980B] flex items-center justify-center text-black font-black text-2xl mx-auto shadow-lg shadow-[#F5B91B]/20">
            <Car className="w-6 h-6 text-[#0B0B0D]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
            Galle Taxi Admin Portal
          </h1>
          <p className="text-xs text-slate-400">
            Secure Administrator & Dispatch Authentication (Firebase: <span className="text-[#F5B91B] font-mono font-semibold">{firebaseProjectId}</span>)
          </p>
        </div>

        {/* Firebase Status Badge */}
        <div className="p-3 bg-[#141416] border border-[#27272A] rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isFirebaseActive ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
            <span className="text-slate-300 text-[11px]">
              {isFirebaseActive ? 'Firebase Project Connected' : 'Dispatch Dispatch Console (Local/Cloud)'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowConfigModal(true)}
            className="text-[11px] text-[#F5B91B] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Key className="w-3 h-3" />
            <span>{isFirebaseActive ? 'Configured' : 'Firebase API Key'}</span>
          </button>
        </div>

        {/* Login Card */}
        <div className="bg-[#141416] border border-[#27272A] rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
          {error && (
            <div className="p-3.5 bg-red-950/70 border border-red-800 rounded-xl flex items-start gap-2.5 text-red-200 text-xs">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="leading-relaxed block">{error}</span>
                {!isFirebaseActive && (
                  <button
                    type="button"
                    onClick={() => setShowConfigModal(true)}
                    className="text-[#F5B91B] underline font-semibold text-[11px] block"
                  >
                    Click here to enter your Firebase Web API Key &rarr;
                  </button>
                )}
              </div>
            </div>
          )}

          {success && (
            <div className="p-3.5 bg-emerald-950/70 border border-emerald-800 rounded-xl flex items-center gap-2.5 text-emerald-200 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Google One-Click Login */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading || isGoogleLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2.5 border border-slate-300 disabled:opacity-60 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isGoogleLoading ? 'Signing in with Google...' : 'Sign in with Google'}</span>
          </button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-[#27272A]"></div>
            <span className="flex-shrink mx-3 text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
              Or with Email
            </span>
            <div className="flex-grow border-t border-[#27272A]"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Administrator Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="galletaxi.lk@gmail.com"
                  autoComplete="email"
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-sm text-white focus:outline-none focus:border-[#F5B91B] transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email);
                    setResetMessage(null);
                    setShowForgotModal(true);
                  }}
                  className="text-[11px] text-[#F5B91B] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-sm text-white focus:outline-none focus:border-[#F5B91B] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-[#F5B91B] hover:bg-[#E5A812] text-black font-extrabold text-sm transition-all shadow-md shadow-[#F5B91B]/20 flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Signing In via Firebase Auth...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="flex items-center justify-between pt-2 border-t border-[#1F1F23] text-xs text-slate-400">
            <Link to="/" className="hover:text-white transition-colors">
              &larr; Customer Website
            </Link>
            <button
              type="button"
              onClick={() => setShowConfigModal(true)}
              className="hover:text-[#F5B91B] transition-colors flex items-center gap-1"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Firebase Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Firebase Setup Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#141416] border border-[#27272A] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-[#F5B91B]" />
                <h2 className="text-lg font-bold text-white font-['Outfit']">Firebase Project Connector</h2>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#27272A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Connect your existing Firebase project <strong className="text-white">galle-taxi</strong> by entering your Firebase Web API Key. You can find this in your Firebase Console under <strong className="text-white">Project Settings &gt; General &gt; Your apps</strong>.
            </p>

            {configErrorMessage && (
              <div className="p-3 bg-red-950/70 border border-red-800 rounded-xl text-red-200 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{configErrorMessage}</span>
              </div>
            )}

            {configSuccessMessage && (
              <div className="p-3 bg-emerald-950/70 border border-emerald-800 rounded-xl text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{configSuccessMessage}</span>
              </div>
            )}

            {probeResult && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                  probeResult.success
                    ? 'bg-emerald-950/60 border-emerald-800 text-emerald-200'
                    : 'bg-amber-950/60 border-amber-800 text-amber-200'
                }`}
              >
                {probeResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                )}
                <span>{probeResult.message}</span>
              </div>
            )}

            <form onSubmit={handleSaveFirebaseConfig} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Firebase Project ID</label>
                <input
                  type="text"
                  value={cfgProjectId}
                  onChange={(e) => setCfgProjectId(e.target.value)}
                  placeholder="galle-taxi"
                  required
                  className="w-full px-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-xs text-white font-mono focus:outline-none focus:border-[#F5B91B]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Firebase Web API Key (<span className="text-[#F5B91B] font-mono">apiKey</span>)
                </label>
                <input
                  type="text"
                  value={cfgApiKey}
                  onChange={(e) => setCfgApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  required
                  className="w-full px-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-xs text-white font-mono focus:outline-none focus:border-[#F5B91B]"
                />
                <div className="text-[10px] text-slate-400">
                  Starts with <code className="text-[#F5B91B]">AIzaSy</code> (typically 39 characters)
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  App ID (<span className="text-slate-400 font-mono">appId</span>, optional)
                </label>
                <input
                  type="text"
                  value={cfgAppId}
                  onChange={(e) => setCfgAppId(e.target.value)}
                  placeholder="1:1234567890:web:abcdef123456"
                  className="w-full px-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-xs text-white font-mono focus:outline-none focus:border-[#F5B91B]"
                />
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleRunDiagnostic}
                  disabled={isTestingProbe}
                  className="px-3 py-2 bg-[#27272A] hover:bg-[#33333A] text-slate-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  {isTestingProbe ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Radio className="w-3.5 h-3.5" />}
                  <span>Test Connection</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowConfigModal(false)}
                    className="px-3 py-2 bg-transparent text-slate-400 hover:text-white text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingConfig}
                    className="px-4 py-2 bg-[#F5B91B] hover:bg-[#E5A812] text-black font-extrabold text-xs rounded-lg shadow-md flex items-center gap-1.5"
                  >
                    {isSavingConfig ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                    <span>Save & Connect</span>
                  </button>
                </div>
              </div>
            </form>

            <div className="pt-3 border-t border-[#27272A] text-[11px] text-slate-400 flex items-center justify-between">
              <span>Firebase project: <strong className="text-white">galle-taxi</strong></span>
              <a
                href="https://console.firebase.google.com/project/galle-taxi"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#F5B91B] hover:underline flex items-center gap-1"
              >
                <span>Firebase Console</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#141416] border border-[#27272A] rounded-2xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#F5B91B]" />
                <h2 className="text-lg font-bold text-white font-['Outfit']">Reset Admin Password</h2>
              </div>
              <button
                onClick={() => setShowForgotModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#27272A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Enter your registered administrator email address. Firebase Authentication will send a secure password reset link to your inbox.
            </p>

            {resetMessage && (
              <div
                className={`p-3 rounded-xl text-xs flex items-start gap-2.5 ${
                  resetMessage.type === 'success'
                    ? 'bg-emerald-950/70 border border-emerald-800 text-emerald-200'
                    : 'bg-red-950/70 border border-red-800 text-red-200'
                }`}
              >
                {resetMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                )}
                <span>{resetMessage.text}</span>
              </div>
            )}

            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Administrator Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="galletaxi.lk@gmail.com"
                    required
                    className="w-full pl-9 pr-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-sm text-white focus:outline-none focus:border-[#F5B91B]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#27272A] text-slate-300 text-xs font-semibold hover:text-white"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="px-5 py-2 rounded-lg bg-[#F5B91B] hover:bg-[#E5A812] text-black font-extrabold text-xs shadow-md disabled:opacity-60 flex items-center gap-2"
                >
                  {resetLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <span>Send Reset Email</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
