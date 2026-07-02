import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

  // Shared input style to prevent blurry placeholder fonts
  const inputStyle = {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
    textRendering: 'optimizeLegibility',
  };

  return (
    <div className="min-h-screen min-h-[100dvh] flex items-center justify-center relative overflow-hidden"
      style={{ 
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        background: `linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%)`,
      }}
    >
      {/* Animated Background Orbs */}
      <div 
        className="absolute top-[-30%] left-[-15%] w-[300px] h-[300px] sm:w-[450px] sm:h-[450px] lg:w-[600px] lg:h-[600px] rounded-full opacity-[0.12]"
        style={{ 
          backgroundColor: primaryAccent,
          filter: 'blur(80px)',
          animation: 'float 8s ease-in-out infinite',
        }}
      />
      <div 
        className="absolute bottom-[-25%] right-[-15%] w-[250px] h-[250px] sm:w-[400px] sm:h-[400px] lg:w-[550px] lg:h-[550px] rounded-full opacity-[0.08]"
        style={{ 
          backgroundColor: primaryAccent,
          filter: 'blur(100px)',
          animation: 'float 10s ease-in-out infinite reverse',
        }}
      />
      <div 
        className="absolute top-[40%] right-[20%] w-[150px] h-[150px] sm:w-[200px] sm:h-[200px] rounded-full opacity-[0.06]"
        style={{ 
          background: `linear-gradient(135deg, ${primaryAccent}, #6366f1)`,
          filter: 'blur(60px)',
          animation: 'float 12s ease-in-out infinite',
        }}
      />

      {/* Main Content */}
      <div className="w-full max-w-[460px] px-5 sm:px-6 py-6 sm:py-8 relative z-10">

        {/* Card */}
        <div 
          className="relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl border border-white/60 backdrop-blur-sm"
          style={{ 
            background: 'rgba(255, 255, 255, 0.85)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255,255,255,0.6)',
          }}
        >
          {/* Top Accent Gradient Bar */}
          <div 
            className="h-1 sm:h-1.5 w-full"
            style={{ background: `linear-gradient(90deg, ${primaryAccent}, ${primaryAccent}dd, ${primaryAccent}88)` }}
          />

          <div className="px-6 py-8 sm:px-10 sm:py-10 md:px-12 md:py-12">
            {/* Header */}
            <div className="text-center mb-8 sm:mb-10">
              <div 
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center text-white mx-auto mb-4 sm:mb-5 transition-transform duration-300 hover:scale-105"
                style={{ 
                  background: `linear-gradient(135deg, ${primaryAccent}, ${primaryAccent}cc)`,
                  boxShadow: `0 8px 24px -4px ${primaryAccent}40`,
                }}
              >
                <span className="material-symbols-outlined text-2xl sm:text-3xl" style={{ fontVariationSettings: "'FILL' 1, 'wght' 300, 'GRAD' 0, 'opsz' 24" }}>health_metrics</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight" style={inputStyle}>
                {settings.brandName || 'VLAS AESTHETIC'}
              </h1>
              <p className="text-slate-400 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] sm:tracking-[0.25em] mt-1.5 sm:mt-2" style={inputStyle}>
                enterprise administration
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-3 sm:p-4 bg-rose-50/80 border border-rose-100 text-rose-600 rounded-xl sm:rounded-2xl text-xs font-semibold text-center leading-relaxed backdrop-blur-sm" style={inputStyle}>
                <span className="material-symbols-outlined text-sm align-middle mr-1.5" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6" autoComplete="off">
              {/* Username Input */}
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-0.5 sm:ml-1 block" style={inputStyle}>
                  User Name
                </label>
                <div className="relative group">
                  <span className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 group-focus-within:text-slate-600 transition-colors duration-300 text-lg sm:text-xl" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>person</span>
                  <input 
                    required 
                    type="text" 
                    value={username} 
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="w-full bg-slate-50/80 border border-slate-200/80 focus:border-slate-300 text-slate-900 rounded-xl sm:rounded-2xl pl-11 sm:pl-12 pr-4 py-3 sm:py-3.5 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-[3px] focus:bg-white placeholder:text-slate-400 placeholder:font-normal" 
                    style={{ 
                      ...inputStyle,
                      focusRingColor: `${primaryAccent}15`,
                      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)',
                    }}
                    autoComplete="off"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-0.5 sm:ml-1 block" style={inputStyle}>
                  password
                </label>
                <div className="relative group">
                  <span className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 group-focus-within:text-slate-600 transition-colors duration-300 text-lg sm:text-xl" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>lock</span>
                  <input 
                    required 
                    type={showPassword ? 'text' : 'password'} 
                    value={password} 
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-slate-50/80 border border-slate-200/80 focus:border-slate-300 text-slate-900 rounded-xl sm:rounded-2xl pl-11 sm:pl-12 pr-11 sm:pr-12 py-3 sm:py-3.5 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-[3px] focus:bg-white placeholder:text-slate-400 placeholder:font-normal" 
                    style={{ 
                      ...inputStyle,
                      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)',
                    }}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-0.5"
                  >
                    <span className="material-symbols-outlined text-lg sm:text-xl" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-3 sm:py-3.5 text-white rounded-xl sm:rounded-2xl text-xs font-bold tracking-[0.15em] sm:tracking-[0.2em] uppercase transition-all duration-300 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-2 sm:mt-3 hover:shadow-lg"
                style={{ 
                  background: `linear-gradient(135deg, ${primaryAccent}, ${primaryAccent}dd)`,
                  boxShadow: `0 4px 14px -2px ${primaryAccent}50`,
                  ...inputStyle,
                }}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400" }}>arrow_forward</span>
                  </>
                )}
              </button>
            </form>

            {/* Signup Link */}
            <div className="mt-6 sm:mt-8 text-center">
              <p className="text-xs sm:text-sm text-slate-500 font-medium" style={inputStyle}>
                Don't have a staff account?{' '}
                <Link 
                  to="/signup" 
                  className="font-bold hover:opacity-80 transition-opacity"
                  style={{ color: primaryAccent }}
                >
                  Sign Up
                </Link>
              </p>
            </div>

            {/* Footer */}
            <div className="mt-8 sm:mt-10 pt-5 sm:pt-6 border-t border-slate-100 text-center">
              <p className="text-[9px] sm:text-[10px] text-slate-400 font-semibold uppercase tracking-[0.15em] sm:tracking-widest" style={inputStyle}>
                VLAS Core v3.2.0 • Secure Access
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Inline keyframes for float animation */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }

        /* Fix blurry placeholder text across all browsers */
        input::placeholder {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
          -webkit-font-smoothing: antialiased !important;
          -moz-osx-font-smoothing: grayscale !important;
          text-rendering: optimizeLegibility !important;
          font-weight: 400 !important;
          opacity: 1 !important;
          color: #94a3b8 !important;
        }

        /* Mobile-first focus ring color */
        input:focus {
          --tw-ring-color: ${primaryAccent}15;
        }

        /* Safe area padding for mobile notch/home indicator */
        @supports (padding: env(safe-area-inset-bottom)) {
          .min-h-screen {
            padding-bottom: env(safe-area-inset-bottom);
            padding-top: env(safe-area-inset-top);
          }
        }
      `}</style>
    </div>
  );
}
