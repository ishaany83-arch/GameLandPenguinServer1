import React, { useState, useEffect } from 'react';
import { 
  Gamepad2, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  KeyRound,
  Zap,
  Snowflake,
  UserCheck,
  Mail,
  FlaskConical,
  Ticket,
  Check,
  XCircle
} from 'lucide-react';
import { 
  getMySavedAccounts, 
  loginAccount, 
  loginAccountAsync,
  registerAccount, 
  UserAccount,
  hasDeviceUsedTestAccount,
  getTestAccountsList,
  claimOneTimeTestAccount,
  syncUsersWithServer
} from '../utils/auth';
import { PenguinMascot } from './PenguinMascot';
import { SnowfallEffect } from './SnowfallEffect';

interface AuthEntryProps {
  onLoginSuccess: (user: UserAccount) => void;
}

export const AuthEntry: React.FC<AuthEntryProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  
  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // UI feedback
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // User's Local Saved Accounts for Preset Login
  const [existingAccounts, setExistingAccounts] = useState<ReturnType<typeof getMySavedAccounts>>([]);
  const [testAccounts, setTestAccounts] = useState<ReturnType<typeof getTestAccountsList>>([]);
  const [hasUsedTestPass, setHasUsedTestPass] = useState(false);

  useEffect(() => {
    refreshAccountsList();
    refreshTestAccounts();
    syncUsersWithServer().then(() => {
      refreshAccountsList();
      refreshTestAccounts();
    }).catch(() => {});
  }, []);

  const refreshAccountsList = () => {
    try {
      const records = getMySavedAccounts();
      setExistingAccounts(records);
    } catch {
      setExistingAccounts([]);
    }
  };

  const refreshTestAccounts = () => {
    try {
      setTestAccounts(getTestAccountsList());
      setHasUsedTestPass(hasDeviceUsedTestAccount());
    } catch {
      setTestAccounts([]);
    }
  };

  const handleClaimOneTimeTestPass = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const result = claimOneTimeTestAccount();
      if (result.success && result.user) {
        setSuccessMessage(`🧪 Single-use test pass claimed! Welcome to GameLand, ${result.user.username}.`);
        refreshTestAccounts();
        refreshAccountsList();
        setTimeout(() => {
          onLoginSuccess(result.user!);
        }, 700);
      } else {
        setErrorMessage(result.error || 'Failed to claim test pass.');
      }
      setIsLoading(false);
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    if (mode === 'signin') {
      const result = await loginAccountAsync(username, password);
      if (result.success && result.user) {
        setSuccessMessage(`Welcome back, ${result.user.username}! Launching GameLand...`);
        setTimeout(() => {
          onLoginSuccess(result.user!);
        }, 600);
      } else {
        setErrorMessage(result.error || 'Login failed.');
      }
    } else {
      // Sign Up Mode
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match. Please verify your password.');
        setIsLoading(false);
        return;
      }

      const result = registerAccount(username, password, fullName, email);
      if (result.success && result.user) {
        const welcomeName = result.user.name || result.user.username;
        setSuccessMessage(`Account created successfully! Saved permanently in backend database, welcome ${welcomeName}.`);
        refreshAccountsList();
        setTimeout(() => {
          onLoginSuccess(result.user!);
        }, 800);
      } else {
        setErrorMessage(result.error || 'Registration failed.');
      }
    }
    setIsLoading(false);
  };

  const handlePresetSelect = (accountUser: string, accountPass: string, autoSubmit = false) => {
    setMode('signin');
    setUsername(accountUser);
    setPassword(accountPass);
    setErrorMessage(null);

    if (autoSubmit) {
      setIsLoading(true);
      loginAccountAsync(accountUser, accountPass).then((result) => {
        if (result.success && result.user) {
          setSuccessMessage(`Logging in as ${result.user.username}...`);
          setTimeout(() => {
            onLoginSuccess(result.user!);
          }, 500);
        } else {
          setErrorMessage(result.error || 'Preset login failed.');
        }
        setIsLoading(false);
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans text-slate-100">
      
      {/* Snowfall Effect */}
      <SnowfallEffect density={28} />

      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
        
        {/* Left Side: Branding & Feature Spotlight */}
        <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold tracking-wide">
            <Snowflake className="w-3.5 h-3.5 text-cyan-400" />
            <span>PEBBLES' PENGUIN ARCADE</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <PenguinMascot pose="gaming" size="xl" interactive showSpeechBubble />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center justify-center lg:justify-start gap-2">
                <span>GameLand</span>
                <span className="text-cyan-400">🐧</span>
              </h1>
              <p className="text-xs font-semibold text-cyan-400">By Pebbles The Penguin</p>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto lg:mx-0">
              Sign in to unlock 100+ unblocked HTML5 games, save your highscores, track game history, and enable stealth panic keys.
            </p>
          </div>

          {/* Feature Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-left">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Unblocked Library</h4>
                <p className="text-[11px] text-slate-400">Proxies & HTML5 classics</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Stealth Disguises</h4>
                <p className="text-[11px] text-slate-400">Panic key to Google Docs</p>
              </div>
            </div>
          </div>

          {/* Single-Use Test Accounts Section */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 text-left shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <FlaskConical className="w-4 h-4 text-emerald-400" />
                <span>Single-Use Test Accounts</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold">
                1 Use Per User
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Explore GameLand with a single-use test pass. Each user/device is allowed <strong>1 test pass</strong>.
            </p>

            {/* Instant Claim Button */}
            <button
              type="button"
              onClick={handleClaimOneTimeTestPass}
              disabled={isLoading || hasUsedTestPass}
              className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                hasUsedTestPass
                  ? 'bg-slate-950/80 text-slate-500 cursor-not-allowed border border-slate-800/80'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 active:scale-98'
              }`}
              id="claim-one-time-test-pass-btn"
            >
              <Ticket className="w-4 h-4" />
              <span>
                {hasUsedTestPass
                  ? '❌ 1-Time Test Pass Used (1/1 Used)'
                  : '⚡ Claim 1-Time Test Pass'}
              </span>
            </button>

            {/* List of Test Account Passes */}
            {testAccounts.length > 0 && (
              <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>Available Test Passes:</span>
                  <span className={hasUsedTestPass ? 'text-rose-400' : 'text-emerald-400'}>
                    {hasUsedTestPass ? 'Pass Limit Reached' : '1 Available For You'}
                  </span>
                </div>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                  {testAccounts.map((acc) => (
                    <div
                      key={acc.username}
                      className={`p-2 rounded-xl border flex items-center justify-between text-xs transition-all ${
                        acc.used
                          ? 'bg-slate-950/40 border-slate-800/50 text-slate-500'
                          : 'bg-slate-950/80 hover:bg-slate-950 border-slate-800 hover:border-emerald-500/40 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden mr-2">
                        <div
                          className={`p-1 rounded-lg shrink-0 ${
                            acc.used ? 'bg-slate-800 text-slate-600' : 'bg-emerald-500/15 text-emerald-400'
                          }`}
                        >
                          {acc.used ? <XCircle className="w-3.5 h-3.5" /> : <Ticket className="w-3.5 h-3.5" />}
                        </div>
                        <div className="truncate">
                          <span className="font-bold text-xs block truncate text-slate-200">
                            {acc.name || acc.username}
                          </span>
                          <span className="text-[9px] font-mono text-slate-500 block truncate">
                            {acc.username} • Pass: ••••••••
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {acc.used ? (
                          <span className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[9px] font-bold">
                            USED
                          </span>
                        ) : (
                          <button
                            type="button"
                            disabled={hasUsedTestPass}
                            onClick={() => handlePresetSelect(acc.username, acc.passwordHash, true)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                              hasUsedTestPass
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                            }`}
                          >
                            Use Pass
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Preset Login for User's Saved Accounts */}
          {existingAccounts.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 text-left shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                  <KeyRound className="w-4 h-4 text-cyan-400" />
                  <span>Your Saved Accounts:</span>
                </div>
                <span className="text-[10px] text-slate-500 font-semibold">1-Click Quick Login</span>
              </div>

              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
                {existingAccounts.map((acc) => (
                  <div
                    key={acc.username}
                    className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-950 border border-slate-800/80 hover:border-cyan-500/40 flex items-center justify-between transition-all"
                  >
                    <div className="flex items-center gap-2 overflow-hidden mr-2">
                      <div className={`p-1.5 rounded-lg shrink-0 ${acc.isAdmin ? 'bg-amber-500/15 text-amber-400' : 'bg-cyan-500/15 text-cyan-400'}`}>
                        {acc.isAdmin ? <ShieldCheck className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-200 truncate">
                            {acc.name ? `${acc.name} (${acc.username})` : acc.username}
                          </span>
                          {acc.isAdmin && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-black">
                              ADMIN
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono block truncate">
                          Pass: ••••••••
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handlePresetSelect(acc.username, acc.passwordHash, false)}
                        className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold transition-colors"
                        title="Fill login form"
                        id={`fill-preset-${acc.username}`}
                      >
                        Fill
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePresetSelect(acc.username, acc.passwordHash, true)}
                        className="px-2.5 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-[10px] font-extrabold transition-colors flex items-center gap-1 shadow-xs"
                        id={`login-preset-${acc.username}`}
                      >
                        <span>Login</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Side: Authentication Form Card */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          
          {/* Header Mode Selector */}
          <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800/80 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'signin'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              id="auth-mode-signin-btn"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'signup'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              id="auth-mode-signup-btn"
            >
              Create Account
            </button>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-extrabold text-white">
              {mode === 'signin' ? 'Welcome Back' : 'Create Your GameLand Account'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {mode === 'signin'
                ? 'Enter your username and password to log in.'
                : 'Choose a unique username and password to get started.'}
            </p>
          </div>

          {/* Feedback Banners */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium flex items-center gap-2.5 animate-pulse">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name Input for Sign Up */}
            {mode === 'signup' && (
              <>
                <div className="animate-in fade-in duration-200">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Your Name / Display Name
                  </label>
                  <div className="relative">
                    <UserCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Pebble"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs font-semibold rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-600"
                      id="auth-fullname-input"
                    />
                  </div>
                </div>

                <div className="animate-in fade-in duration-200">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. alex@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs font-semibold rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-600"
                      id="auth-email-input"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Username Input */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. gamer123"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs font-semibold rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-600"
                  id="auth-username-input"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs font-semibold rounded-xl pl-10 pr-10 py-3 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-600"
                  id="auth-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  id="auth-toggle-password-btn"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Input for Sign Up */}
            {mode === 'signup' && (
              <div className="animate-in fade-in duration-200">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs font-semibold rounded-xl pl-10 pr-10 py-3 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-600"
                    id="auth-confirm-password-input"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20 active:scale-98 disabled:opacity-50 mt-2"
              id="auth-submit-btn"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === 'signin' ? 'Sign In to GameLand' : 'Create Account & Continue'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

          {/* Footer note */}
          <p className="text-center text-[11px] text-slate-500 mt-6">
            GameLand Portal • Powered by Pebbles The Penguin
          </p>

        </div>

      </div>

    </div>
  );
};
