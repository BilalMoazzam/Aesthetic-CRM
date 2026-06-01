import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const login = useStore(state => state.login);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = login(username, password);
    if (success) {
      navigate('/');
    } else {
      setError('Invalid credentials. Please use admin / vlas2024');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-3xl -mr-64 -mt-64" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-100/50 rounded-full blur-3xl -ml-64 -mb-64" />

      <div className="w-full max-w-md px-6 relative z-10">
        <div className="bg-white p-10 rounded-3xl shadow-2xl border border-slate-200 animate-page-entrance">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100 mx-auto mb-6">
              <span className="material-symbols-outlined text-3xl">health_metrics</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">VLAS Admin</h1>
            <p className="text-slate-500 text-sm mt-1">Enterprise Management Protocol</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-bold text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Username</label>
              <input 
                required 
                type="text" 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                className="input-pro" 
                placeholder="admin"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Password</label>
              <input 
                required 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="input-pro" 
                placeholder="••••••••"
              />
            </div>
            <button 
              type="submit" 
              className="w-full py-4 bg-blue-600 text-white rounded-xl text-sm font-bold tracking-widest uppercase hover:bg-blue-700 active:scale-[0.98] transition-all shadow-xl shadow-blue-100 mt-4"
            >
              Sign In
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400 font-medium italic">
              VLAS Core v3.2.0 • Secure Access Only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
