
import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { User, Language, DICTIONARY } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
  lang: Language;
}

// Icons
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
  </svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0V10.5m-1.5 0h12a2.25 2.25 0 0 1 2.25 2.25v7.5a2.25 2.25 0 0 1-2.25 2.25h-12a2.25 2.25 0 0 1-2.25-2.25v-7.5a2.25 2.25 0 0 1 2.25-2.25Z" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
  </svg>
);

const Login: React.FC<LoginProps> = ({ onLogin, lang }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-fill and Auto-login from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const u = params.get('u');
    const p = params.get('p');
    const e = params.get('e'); // Expiry Date
    
    const tryAutoLogin = async () => {
        if (u && p) {
            setLoading(true);
            try {
                const user = await authService.loginViaShareLink(u, p, e || undefined);
                if (user) {
                    window.history.replaceState({}, document.title, window.location.pathname);
                    onLogin(user);
                } else {
                    setError('Auto-login failed: Invalid credentials');
                    setLoading(false);
                }
            } catch (err: any) {
                setError(err.message);
                setLoading(false);
            }
            setUsername(u);
            setPassword(p);
        } else if (u) {
            setUsername(u);
        }
    };
    tryAutoLogin();
  }, [onLogin]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await authService.login(username, password);
      if (user) {
        window.history.replaceState({}, document.title, window.location.pathname);
        onLogin(user);
      } else {
        setError('Invalid credentials');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  const t = DICTIONARY[lang];

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0B0F19] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a2333] via-[#0B0F19] to-[#05070a]">
      <div className="w-full max-w-md p-8 flex flex-col items-center">
        
        {/* Shield Logo */}
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.4)] mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-white">
                <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 0 0-1.032 0 11.209 11.209 0 0 1-7.877 3.08.75.75 0 0 0-.722.515A12.74 12.74 0 0 0 2.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 0 0 .374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 0 0-.722-.516l-.143.001c-2.996 0-5.717-1.07-7.734-3.08Zm3.094 8.016a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
            </svg>
        </div>

        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight text-center">
          Welcome to
        </h1>
        <p className="text-gray-400 mb-10 text-sm font-medium tracking-wide text-center">
          Sign in to access {t.appTitle} system
        </p>

        <form onSubmit={handleLogin} className="w-full space-y-5">
          <div>
            <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-2 ml-1">
              {t.username}
            </label>
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <UserIcon />
                </div>
                <input
                    type="text"
                    placeholder="Enter your ID"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-[#13161c] border border-gray-800 text-white text-sm rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all placeholder-gray-600 shadow-inner"
                />
            </div>
          </div>

          <div>
            <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-2 ml-1">
              {t.password}
            </label>
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <LockIcon />
                </div>
                <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#13161c] border border-gray-800 text-white text-sm rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all placeholder-gray-600 shadow-inner"
                />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20 animate-pulse">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold py-3.5 rounded-xl shadow-[0_4px_20px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] mt-4 disabled:opacity-50"
          >
            {loading ? 'Signing In...' : 'Sign In'} <ArrowRightIcon />
          </button>
        </form>

        <div className="mt-16 text-center opacity-40">
            <p className="text-gray-400 text-xs tracking-wide">Authorized Personnel Only.</p>
            <p className="text-gray-400 text-xs tracking-wide">Contact Admin for access issues.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
