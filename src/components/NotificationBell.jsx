import React, { useState } from 'react';
import { useStore } from '../store/useStore';


/**
 * NotificationBell – displays a bell icon with a badge showing the number of recent
 * notifications (max 5). Clicking the bell toggles a small dropdown list.
 * Assumes the Zustand store has a `notifications` array where each notification
 * contains `id`, `message`, `type` and optionally `isRead`.
 */
export default function NotificationBell() {
  const bookings = useStore((state) => state.bookings || []);
  const [open, setOpen] = useState(false);

  // Derive notifications dynamically from bookings
  const notifications = React.useMemo(() => {
    const notifs = [];
    
    const pendingCount = bookings.filter(b => b.status === 'pending').length;
    
    const todayStr = new Date().toISOString().split('T')[0];
    const todayCount = bookings.filter(b => b.date === todayStr && b.status !== 'cancelled').length;

    if (pendingCount > 0) {
      notifs.push({ id: 'pending', message: `${pendingCount} bookings pending approval`, type: 'action required' });
    }
    if (todayCount > 0) {
      notifs.push({ id: 'today', message: `${todayCount} appointments scheduled for today`, type: 'schedule' });
    }

    return notifs;
  }, [bookings]);

  const unreadCount = notifications.length;

  return (
    <div className="relative inline-block z-50">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1 text-slate-600 hover:text-slate-800 relative"
        title="Notifications"
      >
        <span className="material-symbols-outlined text-2xl">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full text-[10px] w-4 h-4 flex items-center justify-center font-bold">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white shadow-xl border border-slate-100 rounded-xl overflow-hidden z-50">
          <div className="p-3 bg-slate-50 text-xs font-bold text-slate-700 border-b border-slate-100 flex items-center justify-between">
            <span>Notifications</span>
            <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{unreadCount}</span>
          </div>
          <ul className="max-h-60 overflow-y-auto">
            {notifications.length === 0 ? (
              <li className="px-4 py-4 text-xs text-slate-500 text-center">No new notifications</li>
            ) : (
              notifications.map((n) => (
                <li key={n.id} className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 flex items-start gap-3 transition-colors">
                  <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${n.type === 'new' ? 'bg-blue-500' : n.type === 'cancelled' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                  <div>
                    <span className="block text-sm font-semibold text-slate-800">{n.message}</span>
                    <span className="block text-[10px] uppercase tracking-wider text-slate-400 mt-1">{n.type}</span>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
