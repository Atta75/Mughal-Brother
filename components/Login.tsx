
import React, { useState, useEffect } from 'react';
import { UserRole } from '../types';

interface LoginProps {
  onLogin: (user: { id: string; name: string; role: UserRole }) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [systemStatus, setSystemStatus] = useState<'checking' | 'online'>('checking');

  useEffect(() => {
    const timer = setTimeout(() => setSystemStatus('online'), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Authentication logic for the requested credentials
    setTimeout(() => {
      const is_admin = username.toLowerCase() === 'admin' && password === '123';
      const is_cashier = username === 'cashier' && password === 'pos123';
      const is_sales = username === 'sales' && password === 'sales123';

      if (is_admin) {
        setSuccess(true);
        setTimeout(() => onLogin({ id: 'u1', name: 'System Admin', role: UserRole.ADMIN }), 600);
      } else if (is_cashier) {
        onLogin({ id: 'u2', name: 'Front Desk Cashier', role: UserRole.CASHIER });
      } else if (is_sales) {
        onLogin({ id: 'u3', name: 'Floor Salesman', role: UserRole.SALESMAN });
      } else {
        setError('Authentication Failed. Please check your system cipher.');
        setLoading(false);
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/20 blur-[120px] rounded-full"></div>
      </div>

      <div className="w-full max-w-md relative z-10 transition-all duration-500">
        <div className={`text-center mb-10 transition-all duration-700 ${success ? 'opacity-0 -translate-y-4' : 'opacity-100'}`}>
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-700 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/30">
            <i className="fas fa-fingerprint text-white text-3xl"></i>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter mb-1">Mughal POS</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.4em]">Enterprise Security Layer</p>
        </div>

        <div className={`bg-slate-900/60 backdrop-blur-3xl border border-white/5 p-10 rounded-[40px] shadow-2xl transition-all duration-500 ${success ? 'scale-95 opacity-50 bg-green-500/10' : ''}`}>
          {success ? (
            <div className="py-20 text-center animate-in fade-in zoom-in duration-500">
               <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/20">
                  <i className="fas fa-check text-white text-2xl"></i>
               </div>
               <h3 className="text-xl font-black text-white">Identity Verified</h3>
               <p className="text-slate-400 text-sm mt-1">Establishing encrypted session...</p>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Identity</label>
                <div className="relative group">
                  <i className="fas fa-user-shield absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors"></i>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-800/40 border border-slate-700/50 text-white pl-12 pr-4 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all font-semibold placeholder:text-slate-600"
                    placeholder="admin"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Cipher</label>
                <div className="relative group">
                  <i className="fas fa-key absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors"></i>
                  <input
                    type="password"
                    required
                    className="w-full bg-slate-800/40 border border-slate-700/50 text-white pl-12 pr-4 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all font-semibold placeholder:text-slate-600"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[11px] font-bold p-4 rounded-2xl flex items-center gap-3 animate-bounce">
                  <i className="fas fa-triangle-exclamation"></i>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || systemStatus === 'checking'}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 active:scale-[0.97]"
              >
                {loading ? (
                  <i className="fas fa-circle-notch fa-spin"></i>
                ) : (
                  <>
                    <i className="fas fa-lock-open"></i>
                    Unlock Dashboard
                  </>
                )}
              </button>

              <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
                 <button 
                  type="button"
                  onClick={() => { setUsername('admin'); setPassword('123'); }}
                  className="text-[10px] font-black text-blue-500/80 hover:text-blue-400 uppercase tracking-widest transition-colors"
                >
                  <i className="fas fa-magic-wand-sparkles mr-2"></i>
                  Admin Demo
                </button>
                <div className="flex items-center gap-2">
                   <div className={`w-1.5 h-1.5 rounded-full ${systemStatus === 'online' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></div>
                   <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter">
                      {systemStatus === 'online' ? 'Core Secure' : 'Handshaking...'}
                   </span>
                </div>
              </div>
            </form>
          )}
        </div>
        
        <p className="text-center text-slate-700 text-[10px] font-bold mt-10 uppercase tracking-[0.3em]">Authorized Mughal Personnel Only</p>
      </div>
    </div>
  );
};

export default Login;
