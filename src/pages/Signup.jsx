import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';

export default function Signup() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signup, settings } = useStore();
  const navigate = useNavigate();

  // Reset fields on component mount
  useEffect(() => {
    setName('');
    setUsername('');
    setPassword('');
    setSuccess(false);
    setError('');
    setIsLoading(false);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const isOk = await signup({ name, username, password });
      setIsLoading(false);
      if (isOk) {
        setSuccess(true);
      } else {
        setError('Signup failed. Username might be taken.');
      }
    } catch (err) {
      setIsLoading(false);
      setError('An error occurred during registration.');
    }
  };

  const primaryAccent = settings.primaryAccent || '#148f70';

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden font-sans">
      {/* Soft Ambient Background Elements */}
      <div 
        className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 animate-pulse duration-[6000ms]"
        style={{ backgroundColor: primaryAccent }}
      />
      <div 
        className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[150px] opacity-10 animate-pulse duration-[8000ms]"
        style={{ backgroundColor: primaryAccent }}
      />

      <div className="w-full max-w-lg px-6 relative z-10">
        <div className="bg-white p-10 md:p-14 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100 relative overflow-hidden transition-all hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)]">
          {/* Top Line accent */}
          <div 
            className="absolute top-0 left-0 right-0 h-[4px]"
            style={{ backgroundColor: primaryAccent }}
          />

          {/* Header */}
          <div className="text-center mb-10">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg mx-auto mb-6 transition-transform hover:scale-105 duration-300"
              style={{ backgroundColor: primaryAccent }}
            >
              <span className="material-symbols-outlined text-3xl font-light">person_add</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Staff Registration</h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.25em] mt-2">Request Access Privilege</p>
          </div>

          {success ? (
            <div className="text-center space-y-6 py-6 animate-page-entrance">
              <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-3xl">done</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">Registration Submitted</h3>
              <p className="text-slate-500 text-xs leading-relaxed max-w-xs mx-auto">
                Your credentials have been logged in the system. An administrator must approve your account in the database before you can access the platform.
              </p>
              <div className="pt-6">
                <Link 
                  to="/login"
                  className="px-8 py-3 rounded-xl text-xs font-black tracking-widest uppercase transition-all duration-300 transform active:scale-95 text-white inline-block shadow-md hover:opacity-90"
                  style={{ backgroundColor: primaryAccent }}
                >
                  Return to Login
                </Link>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-xs font-semibold text-center leading-relaxed">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
                {/* Full Name Input */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name*</label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 group-focus-within:text-slate-700 transition-colors duration-300 text-xl font-light">badge</span>
                    <input 
                      required 
                      type="text" 
                      value={name} 
                      onChange={e => setName(e.target.value)} 
                      className="w-full bg-slate-50 border border-slate-200 focus:border-slate-300 text-slate-900 rounded-2xl pl-12 pr-4 py-4 text-sm font-medium transition-all focus:outline-none focus:ring-4 focus:ring-slate-100" 
                      autoComplete="off"
                    />
                  </div>
                </div>

                {/* Username Input */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Username*</label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 group-focus-within:text-slate-700 transition-colors duration-300 text-xl font-light">person</span>
                    <input 
                      required 
                      type="text" 
                      value={username} 
                      onChange={e => setUsername(e.target.value)} 
                      className="w-full bg-slate-50 border border-slate-200 focus:border-slate-300 text-slate-900 rounded-2xl pl-12 pr-4 py-4 text-sm font-medium transition-all focus:outline-none focus:ring-4 focus:ring-slate-100" 
                      autoComplete="off"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Password*</label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 group-focus-within:text-slate-700 transition-colors duration-300 text-xl font-light">lock</span>
                    <input 
                      required 
                      type="password" 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      className="w-full bg-slate-50 border border-slate-200 focus:border-slate-300 text-slate-900 rounded-2xl pl-12 pr-4 py-4 text-sm font-medium transition-all focus:outline-none focus:ring-4 focus:ring-slate-100" 
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
                      <span>Register Account</span>
                      <span className="material-symbols-outlined text-base font-light">chevron_right</span>
                    </>
                  )}
                </button>
              </form>

              {/* Login Link */}
              <div className="mt-8 text-center">
                <p className="text-xs text-slate-500 font-medium">
                  Already have an account?{' '}
                  <Link 
                    to="/login" 
                    className="font-bold underline hover:opacity-80 transition-opacity"
                    style={{ color: primaryAccent }}
                  >
                    Log In
                  </Link>
                </p>
              </div>
            </>
          )}

          <div className="mt-12 pt-8 border-t border-slate-100 text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              VLAS Core v3.2.0 • Admin Verification Flow
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
