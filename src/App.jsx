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
import Signup from './pages/Signup';
import NotificationBell from './components/NotificationBell';

const SMOKY_ROSE = '#86626E';
const PINK_ORCHID = '#DBAFC1';
const THISTLE = '#E7C8DD';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const { logout, settings, currentUser } = useStore();

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
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ backgroundColor: SMOKY_ROSE }}>
        <div className="h-full flex flex-col" style={{ backgroundColor: '#86626E' }}>
          {/* Logo */}
          <div className="p-6 border-b border-white/15">
            <Link to="/" className="flex items-center gap-3 group" onClick={() => setIsOpen(false)}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform"
                style={{ backgroundColor: '#E7C8DD' }}>
                <span className="material-symbols-outlined text-2xl" style={{ color: '#86626E' }}>health_metrics</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-white truncate">{settings.brandName || 'VLAS Admin'}</span>
            </Link>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-hide">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={isActive
                    ? { backgroundColor: PINK_ORCHID, color: SMOKY_ROSE }
                    : { color: 'rgba(255,255,255,0.85)' }
                  }
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor='rgba(255,255,255,0.12)'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor=''; }}
                >
                  <span className="material-symbols-outlined text-xl" style={isActive ? { color: '#86626E' } : { color: 'rgba(255,255,255,0.7)' }}>
                    {item.icon}
                  </span>
                  {item.label}
                  {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#86626E' }} />}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/15">
            <div className="p-3 rounded-xl flex items-center gap-3" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                style={{ backgroundColor: '#E7C8DD', color: '#86626E' }}>
                {currentUser?.name?.charAt(0) || 'A'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{currentUser?.name || 'Admin'}</p>
                <p className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>{currentUser?.role || 'Administrator'}</p>
              </div>
              <button onClick={() => logout()} className="text-white/50 hover:text-white transition-colors">
                <span className="material-symbols-outlined text-lg">logout</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {isOpen && (
        <div onClick={() => setIsOpen(false)} className="fixed inset-0 z-40 lg:hidden"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} />
      )}
    </>
  );
};

const Layout = ({ children }) => {
  const { settings } = useStore();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: THISTLE, '--theme-primary': SMOKY_ROSE }}>
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <main className="flex-1 lg:pl-64 min-w-0 flex flex-col">
        {/* Top Header */}
        <header className="sticky top-0 z-30 border-b" style={{ backgroundColor: '#86626E', borderBottomColor: '#6e4f5a' }}>
          <div className="max-w-[1600px] mx-auto px-4 sm:px-8 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden p-1.5 rounded-lg transition-colors" style={{ color: '#fff' }}>
                <span className="material-symbols-outlined">{isOpen ? 'close' : 'menu'}</span>
              </button>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-[#E7C8DD]" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-white">Live Sync</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <NotificationBell />
              <div className="h-6 w-px bg-primary/25" />
              <div className="flex items-center gap-2 text-white">
                <span className="text-sm font-bold">{settings.brandName || 'VLAS Clinic'}</span>
                <span className="material-symbols-outlined text-base text-white/70">verified</span>
              </div>
            </div>
          </div>
        </header>
        <div className="p-4 sm:p-8 lg:p-10 flex-1">
          <div className="max-w-[1400px] mx-auto animate-page-entrance">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

function App() {
  const { isAuthenticated, initializeStore, fetchBookings, fetchCustomers } = useStore();

  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
      fetchBookings();
      fetchCustomers();
    }, 5000);
    return () => clearInterval(interval);
  }, [isAuthenticated, fetchBookings, fetchCustomers]);

  return (
    <Routes>
      {!isAuthenticated ? (
        <>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      ) : (
        <>
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/signup" element={<Navigate to="/" replace />} />
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
