import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';

export default function NotificationBell() {
  const bookings = useStore((state) => state.bookings || []);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const notifications = React.useMemo(() => {
    const notifs = [];
    const pendingCount = bookings.filter(b => b.status === 'pending').length;
    const todayStr = new Date().toISOString().split('T')[0];
    const todayCount = bookings.filter(b => b.date === todayStr && b.status !== 'cancelled').length;
    if (pendingCount > 0) notifs.push({ id: 'pending', message: `${pendingCount} booking${pendingCount>1?'s':''} pending approval`, type: 'action required', dot: '#86626E' });
    if (todayCount > 0) notifs.push({ id: 'today', message: `${todayCount} appointment${todayCount>1?'s':''} today`, type: 'schedule', dot: '#10b981' });
    return notifs;
  }, [bookings]);

  return (
    <div className="relative inline-block z-50" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className="relative p-2 rounded-xl transition-colors"
        style={{ color: '#DBAFC1' }}
        title="Notifications"
      >
        <span className="material-symbols-outlined text-2xl">notifications</span>
        {notifications.length > 0 && (
          <span className="absolute top-0.5 right-0.5 bg-rose-500 text-white rounded-full text-[9px] w-4 h-4 flex items-center justify-center font-black">
            {notifications.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white shadow-2xl border rounded-2xl overflow-hidden z-50 animate-modal-entrance"
          style={{ borderColor: '#d4a0b5' }}>
          <div className="px-4 py-3 flex items-center justify-between border-b" style={{ backgroundColor: '#E7C8DD', borderColor: '#c89aad' }}>
            <span className="text-xs font-bold" style={{ color: '#86626E' }}>Notifications</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ backgroundColor: '#86626E', color: '#fff' }}>
                {notifications.length}
              </span>
              <button onClick={() => setOpen(false)} style={{ color: '#86626E' }}>
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>
          </div>
          <ul>
            {notifications.length === 0 ? (
              <li className="px-4 py-6 text-xs text-center" style={{ color: '#7a5a62' }}>No new notifications</li>
            ) : notifications.map(n => (
              <li key={n.id} className="px-4 py-3 flex items-start gap-3 border-b last:border-0 hover:bg-[#E7C8DD]/30 transition-colors" style={{ borderColor: '#f0d4e3' }}>
                <span className="w-2 h-2 mt-1.5 rounded-full shrink-0" style={{ backgroundColor: n.dot }} />
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#2d1f24' }}>{n.message}</p>
                  <p className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: '#9e7a86' }}>{n.type}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
