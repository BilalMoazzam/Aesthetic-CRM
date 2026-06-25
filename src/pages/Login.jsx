import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, settings } = useStore();
  const navigate = useNavigate();

  // Reset fields when component mounts to avoid stale data
  useEffect(() => {
    setUsername('');
    setPassword('');
    setError('');
    setIsLoading(false);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    const res = await login(username, password);
    setIsLoading(false);
    
    if (res.success) {
      navigate('/');
    } else if (res.reason === 'pending') {
      setError('Your account is pending administrator approval.');
    } else {
      setError('Invalid credentials. Please verify your username and password.');
    }
  };

  const primaryAccent = settings.primaryAccent || '#148f70';

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden font-sans">
      {/* Soft Ambient Background Elements */}
      <div 
        className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 animate-pulse duration-[6000ms]"
        style={{ backgroundColor: primaryAccent }}
      />
      <div 
        className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[150px] opacity-10 animate-pulse duration-[8000ms]"
        style={{ backgroundColor: primaryAccent }}
      />

      <div className="w-full max-w-lg px-6 relative z-10">
        {/* Main Card Wrapper */}
        <div className="bg-white p-10 md:p-14 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100 relative overflow-hidden transition-all hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)]">
          {/* Accent Border Line */}
          <div 
            className="absolute top-0 left-0 right-0 h-[4px]"
            style={{ backgroundColor: primaryAccent }}
          />

          {/* Header */}
          <div className="text-center mb-10">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg mx-auto mb-6 transition-transform hover:rotate-12 duration-300"
              style={{ backgroundColor: primaryAccent }}
            >
              <span className="material-symbols-outlined text-3xl font-light">health_metrics</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{settings.brandName || 'Vlas AESTHETIC'}</h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.25em] mt-2">Enterprise Administration</p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-xs font-semibold text-center leading-relaxed">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
            {/* Username Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Username</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 group-focus-within:text-slate-700 transition-colors duration-300 text-xl font-light">person</span>
                <input 
                  required 
                  type="text" 
                  value={username} 
                  onChange={e => setUsername(e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-200 focus:border-slate-300 text-slate-900 rounded-2xl pl-14 pr-4 py-4 text-sm font-medium transition-all focus:outline-none focus:ring-4 focus:ring-slate-100" 
                  autoComplete="off"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 group-focus-within:text-slate-700 transition-colors duration-300 text-xl font-light">lock</span>
                <input 
                  required 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-200 focus:border-slate-300 text-slate-900 rounded-2xl pl-14 pr-4 py-4 text-sm font-medium transition-all focus:outline-none focus:ring-4 focus:ring-slate-100" 
                  autoComplete="new-password"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-4 text-white rounded-2xl text-xs font-black tracking-[0.2em] uppercase transition-all duration-300 transform active:scale-[0.98] shadow-md disabled:opacity-50 flex items-center justify-center gap-2 mt-8 hover:opacity-90"
              style={{ backgroundColor: primaryAccent }}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <span className="material-symbols-outlined text-base font-light">east</span>
                </>
              )}
            </button>
          </form>

          {/* Signup Link */}
          <div className="mt-8 text-center">
            <p className="text-xs text-slate-500 font-medium">
              Don't have a staff account?{' '}
              <Link 
                to="/signup" 
                className="font-bold underline hover:opacity-80 transition-opacity"
                style={{ color: primaryAccent }}
              >
                Sign Up
              </Link>
            </p>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-100 text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              VLAS Core v3.2.0 • Secure Access
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
