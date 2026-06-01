import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import Dashboard from './pages/Dashboard';
import ScheduleManager from './pages/ScheduleManager';
import BookingManager from './pages/BookingManager';
import CustomerManager from './pages/CustomerManager';
import ServicesManager from './pages/ServicesManager';
import DealsManager from './pages/DealsManager';
import VoucherManager from './pages/VoucherManager';
import SettingsManager from './pages/SettingsManager';
import Login from './pages/Login';

const Sidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { logout, settings } = useStore();

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: 'dashboard' },
    { path: '/schedule', label: 'Schedule', icon: 'calendar_month' },
    { path: '/bookings', label: 'Bookings', icon: 'event_note' },
    { path: '/customers', label: 'Customers', icon: 'group' },
    { path: '/services', label: 'Services', icon: 'medical_services' },
    { path: '/deals', label: 'Deals', icon: 'loyalty' },
    { path: '/vouchers', label: 'Vouchers', icon: 'confirmation_number' },
    { path: '/settings', label: 'Settings', icon: 'settings' },
  ];

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-[60] bg-white p-2 rounded-lg shadow-lg text-slate-600 border border-slate-200"
      >
        <span className="material-symbols-outlined">{isOpen ? 'close' : 'menu'}</span>
      </button>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/80 backdrop-blur-xl border-r border-slate-200 transform transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-8">
            <Link to="/" className="flex items-center gap-3 group">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform"
                style={{ backgroundColor: settings.primaryAccent || '#2563eb' }}
              >
                <span className="material-symbols-outlined text-2xl">health_metrics</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">{settings.brandName || 'VLAS Admin'}</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1 overflow-y-auto scrollbar-hide">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive 
                      ? 'text-white shadow-sm' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                  }`}
                  style={isActive ? { backgroundColor: settings.primaryAccent || '#2563eb' } : {}}
                >
                  <span className={`material-symbols-outlined text-xl ${isActive ? 'text-white' : 'text-slate-400'}`}>
                    {item.icon}
                  </span>
                  {item.label}
                  {isActive && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />}
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-slate-100">
            <div className="bg-slate-50/50 p-4 rounded-2xl flex items-center gap-3 border border-slate-100">
              <div 
                className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: settings.primaryAccent || '#2563eb' }}
              >
                A
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">Admin User</p>
                <p className="text-[10px] text-slate-500 font-medium">Administrator</p>
              </div>
              <button onClick={() => logout()} className="ml-auto text-slate-400 hover:text-rose-500 transition-colors">
                <span className="material-symbols-outlined text-xl">logout</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-md z-40 lg:hidden"
        />
      )}
    </>
  );
};

const Layout = ({ children }) => {
  const { settings } = useStore();
  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <Sidebar />
      <main className="flex-1 lg:pl-64 min-w-0">
        <header className="sticky top-0 z-30 bg-white/60 backdrop-blur-xl border-b border-slate-200">
          <div className="max-w-[1600px] mx-auto px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="hidden lg:flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span>Live Data Stream Active</span>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <button className="relative text-slate-400 hover:text-slate-600 transition-colors">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
              </button>
              <div className="h-8 w-px bg-slate-200" />
              <div className="flex items-center gap-3 text-slate-700">
                <span className="text-sm font-bold">{settings.brandName || 'VLAS Clinic'}</span>
                <span className="material-symbols-outlined text-base" style={{ color: settings.primaryAccent || '#2563eb' }}>verified</span>
              </div>
            </div>
          </div>
        </header>
        <div className="p-8 lg:p-12">
          <div className="max-w-[1400px] mx-auto animate-page-entrance">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

function App() {
  const { isAuthenticated, initializeStore } = useStore();

  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  return (
    <Routes>
      {!isAuthenticated ? (
        <>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      ) : (
        <>
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/" element={<Layout><Dashboard /></Layout>} />
          <Route path="/schedule" element={<Layout><ScheduleManager /></Layout>} />
          <Route path="/bookings" element={<Layout><BookingManager /></Layout>} />
          <Route path="/customers" element={<Layout><CustomerManager /></Layout>} />
          <Route path="/services" element={<Layout><ServicesManager /></Layout>} />
          <Route path="/deals" element={<Layout><DealsManager /></Layout>} />
          <Route path="/vouchers" element={<Layout><VoucherManager /></Layout>} />
          <Route path="/settings" element={<Layout><SettingsManager /></Layout>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      )}
    </Routes>
  );
}

export default App;
