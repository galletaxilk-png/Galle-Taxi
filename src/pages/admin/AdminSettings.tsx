import React, { useState } from 'react';
import {
  Settings,
  Database,
  ShieldCheck,
  RefreshCw,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  History,
  Key,
  Globe,
  Radio,
  ExternalLink,
  Copy,
  Trash2,
  Loader2,
  Mail,
  Send,
} from 'lucide-react';
import { useApp } from '../../lib/store';
import { getStoredFirebaseConfig, FirebaseWebConfig } from '../../lib/firebase';

export const AdminSettings: React.FC = () => {
  const {
    isFirebaseActive,
    firebaseProjectId,
    auditLogs,
    resetToSampleData,
    testConnection,
    saveWebConfig,
    disconnectFirebase,
    firestoreError,
  } = useApp();

  const storedConfig = getStoredFirebaseConfig();

  const [apiKey, setApiKey] = useState(storedConfig?.apiKey || '');
  const [projectId, setProjectId] = useState(storedConfig?.projectId || 'galle-taxi');
  const [appId, setAppId] = useState(storedConfig?.appId || '');
  const [authDomain, setAuthDomain] = useState(storedConfig?.authDomain || `${firebaseProjectId}.firebaseapp.com`);
  const [storageBucket, setStorageBucket] = useState(storedConfig?.storageBucket || `${firebaseProjectId}.appspot.com`);

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    latencyMs?: number;
    error?: string;
  } | null>(null);

  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedRules, setCopiedRules] = useState(false);

  // Resend Email API state
  const [resendApiKey, setResendApiKey] = useState(() => localStorage.getItem('galle_taxi_resend_key') || '');
  const [resendTestEmail, setResendTestEmail] = useState('galletaxi.lk@gmail.com');
  const [isTestingResend, setIsTestingResend] = useState(false);
  const [resendTestResult, setResendTestResult] = useState<{
    success: boolean;
    message?: string;
    error?: string;
  } | null>(null);

  const handleTestResend = async () => {
    setIsTestingResend(true);
    setResendTestResult(null);
    try {
      const res = await fetch('/api/test-resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: resendApiKey.trim() || undefined,
          testEmail: resendTestEmail.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResendTestResult({
          success: true,
          message: data.message || `Test email dispatched to ${resendTestEmail}`,
        });
        if (resendApiKey.trim()) {
          localStorage.setItem('galle_taxi_resend_key', resendApiKey.trim());
        }
      } else {
        setResendTestResult({
          success: false,
          error: data.error || 'Failed to send test email. Please check your Resend API Key.',
        });
      }
    } catch (err: any) {
      setResendTestResult({
        success: false,
        error: err.message || 'Error connecting to /api/test-resend endpoint',
      });
    } finally {
      setIsTestingResend(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testConnection();
      setTestResult(res);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.message || 'Connection test encountered an error',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      alert('Please enter a valid Firebase API Key.');
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const config: FirebaseWebConfig = {
        apiKey: apiKey.trim(),
        projectId: (projectId || 'galle-taxi').trim(),
        appId: appId.trim() || undefined,
        authDomain: authDomain.trim() || `${projectId || 'galle-taxi'}.firebaseapp.com`,
        storageBucket: storageBucket.trim() || `${projectId || 'galle-taxi'}.appspot.com`,
      };

      await saveWebConfig(config);
      setSaveMessage('Firebase configuration successfully saved and loaded!');
    } catch (err: any) {
      alert('Failed to apply configuration: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisconnect = async () => {
    if (window.confirm('Disconnect Firebase credentials and return to local storage mode?')) {
      await disconnectFirebase();
    }
  };

  const handleCopyRules = () => {
    navigator.clipboard.writeText(`// Refer to /firestore.rules in the workspace root for the production security rules`);
    setCopiedRules(true);
    setTimeout(() => setCopiedRules(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white font-['Outfit']">System Settings & Firebase Connector</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Live Cloud Firestore database link for project <span className="text-[#F5B91B] font-mono font-bold">galle-taxi</span>, authentication setup, and audit logs.
        </p>
      </div>

      {/* Integration Status Card */}
      <div className="bg-[#141416] border border-[#27272A] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#27272A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F5B91B]/10 border border-[#F5B91B]/30 flex items-center justify-center">
              <Database className="w-5 h-5 text-[#F5B91B]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-['Outfit']">Cloud Firestore Status</h2>
              <p className="text-xs text-slate-400 font-mono">Target Project: {firebaseProjectId}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
                isFirebaseActive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              }`}
            >
              {isFirebaseActive ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Connected & Active</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>Credentials Required</span>
                </>
              )}
            </span>

            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="px-3 py-1.5 rounded-xl bg-[#202024] hover:bg-[#2A2A30] border border-[#33333A] text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {isTesting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#F5B91B]" />
                  <span>Probing...</span>
                </>
              ) : (
                <>
                  <Radio className="w-3.5 h-3.5 text-[#F5B91B]" />
                  <span>Run Connection Diagnostic</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Diagnostic result banner if run */}
        {testResult && (
          <div
            className={`p-4 rounded-xl border text-xs flex items-start gap-3 ${
              testResult.success
                ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
                : 'bg-amber-950/40 border-amber-800/80 text-amber-200'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <div className="font-bold">{testResult.success ? 'Diagnostic Passed' : 'Configuration Notice'}</div>
              <p className="text-slate-300 leading-relaxed">{testResult.message}</p>
              {testResult.latencyMs && (
                <div className="text-[10px] text-slate-400 font-mono">Response latency: {testResult.latencyMs}ms</div>
              )}
            </div>
          </div>
        )}

        {firestoreError && (
          <div className="p-3.5 bg-red-950/40 border border-red-800 rounded-xl text-red-200 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>Firestore notice: {firestoreError}</span>
          </div>
        )}

        {/* Configuration Form */}
        <form onSubmit={handleSaveConfig} className="space-y-4 pt-2">
          <div className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2">
            <Key className="w-4 h-4 text-[#F5B91B]" />
            <span>Firebase Web App Credentials (galle-taxi)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">Firebase Project ID</label>
              <input
                type="text"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                placeholder="galle-taxi"
                required
                className="w-full px-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-white font-mono focus:outline-none focus:border-[#F5B91B]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">API Key (apiKey)</label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                required
                className="w-full px-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-white font-mono focus:outline-none focus:border-[#F5B91B]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">App ID (appId)</label>
              <input
                type="text"
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                placeholder="1:1234567890:web:abcdef123456"
                className="w-full px-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-white font-mono focus:outline-none focus:border-[#F5B91B]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">Auth Domain</label>
              <input
                type="text"
                value={authDomain}
                onChange={(e) => setAuthDomain(e.target.value)}
                placeholder="galle-taxi.firebaseapp.com"
                className="w-full px-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-white font-mono focus:outline-none focus:border-[#F5B91B]"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 bg-[#F5B91B] hover:bg-[#D4980B] text-black text-xs font-bold rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                <span>Save & Connect Firebase</span>
              </button>

              {isFirebaseActive && (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="px-3 py-2 bg-red-950/40 hover:bg-red-900/60 border border-red-800 text-red-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Disconnect</span>
                </button>
              )}
            </div>

            {saveMessage && <div className="text-xs text-emerald-400 font-semibold">{saveMessage}</div>}
          </div>
        </form>

        {/* Firebase Console Step-by-Step Instructions */}
        <div className="bg-[#0B0B0D] p-5 rounded-xl border border-[#27272A] space-y-3 text-xs text-slate-300">
          <div className="font-bold text-white flex items-center justify-between">
            <span>How to connect your existing Firebase project "galle-taxi":</span>
            <a
              href="https://console.firebase.google.com/project/galle-taxi"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#F5B91B] hover:underline flex items-center gap-1 font-normal text-[11px]"
            >
              <span>Open Firebase Console</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <ol className="list-decimal list-inside space-y-1.5 text-slate-400 text-[11px] leading-relaxed">
            <li>
              In your Firebase Console, open project <strong className="text-white">galle-taxi</strong>.
            </li>
            <li>
              Click the gear icon <strong className="text-white">Project Settings</strong> &gt; <strong className="text-white">General</strong>, scroll down to <strong className="text-white">Your apps</strong>, and click the Web icon (<code className="font-mono text-[#F5B91B]">&lt;/&gt;</code>) to register a Web App.
            </li>
            <li>
              Copy the <code className="font-mono text-[#F5B91B]">apiKey</code> and <code className="font-mono text-[#F5B91B]">appId</code> and paste them into the fields above or in <code className="font-mono text-[#F5B91B]">.env</code>.
            </li>
            <li>
              Under <strong className="text-white">Authentication</strong> &gt; <strong className="text-white">Sign-in method</strong>, enable <strong className="text-white">Email/Password</strong>.
            </li>
            <li>
              Under <strong className="text-white">Firestore Database</strong>, create your database in production mode with rules from <strong className="text-white">/firestore.rules</strong>.
            </li>
            <li>
              To grant admin access, create a document in collection <code className="font-mono text-[#F5B91B]">admins/{'{uid}'}</code> with <code className="font-mono text-[#F5B91B]">{`{ "role": "admin", "isAdmin": true }`}</code> or set custom claims.
            </li>
          </ol>
        </div>

        {/* Firestore Daily Write Quota & Database Plan Management */}
        <div className="bg-[#0B0B0D] p-5 rounded-xl border border-[#27272A] space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#1F1F23]">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-[#F5B91B]" />
              <span className="font-bold text-white text-sm">Firestore Database Plan (galle-taxi)</span>
            </div>
            <a
              href="https://console.firebase.google.com/project/galle-taxi/usage"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-[#F5B91B]/10 hover:bg-[#F5B91B]/20 text-[#F5B91B] border border-[#F5B91B]/30 flex items-center gap-1.5 font-bold transition-all w-fit"
            >
              <span>Firebase Usage Console</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-[#141416] border border-emerald-500/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Blaze Plan (Active)</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 font-mono border border-emerald-800/60">Active With Credits</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Your Firebase project <code className="text-[#F5B91B] font-mono px-1 py-0.5 rounded bg-black/40">galle-taxi</code> is active on the Blaze (pay as you go) plan. Daily quota caps are lifted with unlimited document writes and reads supported.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#141416] border border-[#27272A] space-y-2 opacity-75">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Spark Plan (Previous Tier)</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">Replaced</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                The Spark free tier limit of 50,000 daily read units is no longer restricting traffic. First 20,000 writes and 50,000 reads remain completely free daily under Google Cloud terms.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#141416]/80 border border-[#27272A] space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-400 text-[11px] font-bold">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>Offline &amp; Quota-Resilient Persistence Active</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Our system is built with automatic quota-exhaustion resilience. If Firestore daily write units are reached, data is safely saved to persistent browser storage, synchronized across open tabs, and live on the website without interruption.
            </p>
          </div>
        </div>
      </div>

      {/* Resend Email API Integration & Test Section */}
      <div className="bg-[#141416] border border-[#27272A] rounded-2xl p-6 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#27272A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EA4335]/15 border border-[#EA4335]/30 text-[#EA4335] flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white font-['Outfit']">
                  Resend Email API Service
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/40">
                  Automated
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Automated transactional booking confirmation emails to customers and dispatcher.
              </p>
            </div>
          </div>

          <a
            href="https://resend.com/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#F5B91B] hover:underline flex items-center gap-1 font-semibold self-start sm:self-auto"
          >
            <span>Get Free Resend API Key</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Resend Testing & Configuration Form */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold block">
                Resend API Key <span className="text-slate-500 font-normal">(starts with re_...)</span>
              </label>
              <input
                type="password"
                value={resendApiKey}
                onChange={(e) => setResendApiKey(e.target.value)}
                placeholder="re_123456789_abcdef..."
                className="w-full px-3 py-2.5 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-white font-mono focus:outline-none focus:border-[#F5B91B]"
              />
              <p className="text-[11px] text-slate-400">
                You can also configure <code className="text-[#F5B91B]">RESEND_API_KEY</code> inside your <code className="text-[#F5B91B]">.env</code> file.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold block">
                Test Recipient Email
              </label>
              <input
                type="email"
                value={resendTestEmail}
                onChange={(e) => setResendTestEmail(e.target.value)}
                placeholder="galletaxi.lk@gmail.com"
                className="w-full px-3 py-2.5 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-white focus:outline-none focus:border-[#F5B91B]"
              />
              <p className="text-[11px] text-slate-400">
                Receives a live test booking confirmation email from the server.
              </p>
            </div>
          </div>

          {resendTestResult && (
            <div
              className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs ${
                resendTestResult.success
                  ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                  : 'bg-red-950/60 border-red-800 text-red-300'
              }`}
            >
              {resendTestResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span>{resendTestResult.message || resendTestResult.error}</span>
            </div>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleTestResend}
              disabled={isTestingResend}
              className="px-4 py-2.5 bg-[#EA4335] hover:bg-[#D93025] text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isTestingResend ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Dispatching Test Email...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Test Email via Resend</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Resend Setup Steps */}
        <div className="bg-[#0B0B0D] p-5 rounded-xl border border-[#27272A] space-y-3 text-xs text-slate-300">
          <div className="font-bold text-white flex items-center justify-between">
            <span>How to setup Resend for Galle Taxi in 3 minutes (Free):</span>
          </div>

          <ol className="list-decimal list-inside space-y-1.5 text-slate-400 text-[11px] leading-relaxed">
            <li>
              Go to <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-[#F5B91B] underline">resend.com</a> and create a free account (includes 3,000 emails / month free).
            </li>
            <li>
              Navigate to <strong className="text-white">API Keys</strong> &gt; click <strong className="text-white">Create API Key</strong>. Set permissions to "Full access".
            </li>
            <li>
              Copy the API Key (<code className="font-mono text-[#F5B91B]">re_...</code>) and paste it into the field above or add <code className="font-mono text-[#F5B91B]">RESEND_API_KEY=re_...</code> to your <code className="font-mono text-[#F5B91B]">.env</code> file.
            </li>
            <li>
              Live booking emails are sent strictly from <code className="font-mono text-[#F5B91B]">support@galletaxi.lk</code> directly to the customer's email address.
            </li>
            <li>
              To send from your custom domain (e.g. <code className="font-mono text-[#F5B91B]">bookings@galletaxi.lk</code>), go to <strong className="text-white">Domains</strong> in Resend, add <strong className="text-white">galletaxi.lk</strong>, and copy the 3 DNS records into your domain provider.
            </li>
          </ol>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-[#141416] border border-[#27272A] rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-[#F5B91B]" />
            <h2 className="text-base font-bold text-white font-['Outfit']">System & Audit Logs</h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">{auditLogs.length} Events Logged</span>
        </div>

        <div className="overflow-x-auto max-h-80 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1A1A1E] text-slate-400 uppercase font-semibold border-b border-[#27272A] sticky top-0">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Actor</th>
                <th className="py-2.5 px-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F23]">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#1A1A1E]">
                  <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#27272A] text-[#F5B91B]">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-300 font-medium">{log.performedBy}</td>
                  <td className="py-2.5 px-3 text-slate-400">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
