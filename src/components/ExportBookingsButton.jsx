import React, { useState } from 'react';
import { useStore } from '../store/useStore';

export default function ExportBookingsButton() {
  const bookings = useStore(state => state.bookings || []);
  const [showMenu, setShowMenu] = useState(false);

  const downloadCSV = (period) => {
    let filtered = bookings;
    const now = new Date();
    if (period === 'week') {
      const aWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = bookings.filter(b => new Date(b.date) >= aWeekAgo && new Date(b.date) <= now);
    } else if (period === 'month') {
      const aMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      filtered = bookings.filter(b => new Date(b.date) >= aMonthAgo && new Date(b.date) <= now);
    }
    
    // Convert to CSV
    const headers = ['ID', 'Date', 'Time', 'Client Name', 'Client Email', 'Client Phone', 'Service', 'Price', 'Status', 'IsFake'];
    const rows = filtered.map(b => [
      b.id,
      b.date,
      b.time,
      `"${b.clientDetails?.name || ''}"`,
      `"${b.clientDetails?.email || ''}"`,
      `"${b.clientDetails?.phone || ''}"`,
      `"${b.serviceName || ''}"`,
      b.totalPrice,
      b.status,
      b.isFake ? 'Yes' : 'No'
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bookings_${period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
      >
        <span className="material-symbols-outlined text-lg">download</span>
        <span className="hidden sm:inline">Export</span>
      </button>
      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 shadow-xl rounded-xl overflow-hidden z-[100]">
          <button type="button" onClick={() => downloadCSV('week')} className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 border-b border-slate-100 font-medium">Export Last 7 Days</button>
          <button type="button" onClick={() => downloadCSV('month')} className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 border-b border-slate-100 font-medium">Export Last 30 Days</button>
          <button type="button" onClick={() => downloadCSV('all')} className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 font-medium">Export All History</button>
        </div>
      )}
    </div>
  );
}
