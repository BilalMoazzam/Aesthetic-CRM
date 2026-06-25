import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import Modal from '../components/Modal';
import NotificationBell from '../components/NotificationBell';
import ExportBookingsButton from '../components/ExportBookingsButton';


export default function ScheduleManager() {
  const { 
    bookings, 
    services, 
    deals,
    customers, 
    fetchBookings, 
    fetchServices, 
    fetchDeals,
    fetchCustomers, 
    addBooking, 
    addMessage, 
    updateBooking,
    settings,
    addCustomer 
  } = useStore();

  // Data is fetched globally in App.jsx via initializeStore, 
  // and refetched in background via useEffect below.
  // Removing the blocking loading state ensures the calendar displays instantly.
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [sendNotification, setSendNotification] = useState(true);
  const [dispatchOverlay, setDispatchOverlay] = useState(false);
  const [clientMode, setClientMode] = useState('new');
  const [showToast, setShowToast] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' | 'list'
  const [listFilter, setListFilter] = useState('all'); // 'all' | 'upcoming' | 'past'

  const [formData, setFormData] = useState({ 
    clientName: '', 
    clientEmail: '', 
    clientPhone: '', 
    serviceId: '', 
    dealId: '',
    date: '', 
    time: '' 
  });

  useEffect(() => {
    fetchBookings();
    fetchServices();
    fetchDeals();
    fetchCustomers();
  }, [fetchBookings, fetchServices, fetchDeals, fetchCustomers]);

  // NOTE: Intentionally NOT auto-cancelling past bookings.
  // Admin manually manages booking lifecycle (confirmed → completed / cancelled).
  // Auto-cancelling was destroying historical booking records.


  const getMonday = (d) => {
    d = new Date(d);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const monday = getMonday(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  const sunday = weekDays[6];
  const mondayLabel = monday.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const sundayLabel = sunday.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const monthYearLabel = mondayLabel === sundayLabel 
    ? mondayLabel 
    : `${monday.toLocaleDateString('en-US', { month: 'short' })} – ${sunday.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;

  const navigateWeek = (direction) => {
    const next = new Date(currentDate);
    next.setDate(currentDate.getDate() + (direction * 7));
    setCurrentDate(next);
  };

  const goToToday = () => setCurrentDate(new Date());

  const today = new Date();
  const isCurrentWeek = weekDays.some(d => d.toDateString() === today.toDateString());

  const weekRangeLabel = `${monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${sunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

  const statusAccent = {
    pending: '#f59e0b',
    confirmed: settings.primaryAccent,
    completed: '#10b981',
    cancelled: '#f43f5e',
    'no-show': '#94a3b8',
  };

  // Robust duration parser to handle "1 hour", "90 min", etc.
  const parseDuration = (durStr) => {
    if (!durStr) return 0;
    const str = durStr.toString().toLowerCase();
    const num = parseInt(str.replace(/[^0-9]/g, '')) || 0;
    if (str.includes('hour') || str.includes('hr')) return num * 60;
    return num || 0;
  };

  // Helper to parse time string (e.g. "09:00 AM") to minutes from midnight
  const timeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const match = timeStr.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
    if (!match) return 0;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const ampm = match[3].toUpperCase();
    if (hours === 12 && ampm === 'AM') hours = 0;
    if (ampm === 'PM' && hours !== 12) hours += 12;
    return hours * 60 + minutes;
  };

  // Get duration of booking
  const getBookingDuration = (booking) => {
    if (booking.duration) return parseDuration(booking.duration);
    if (booking.serviceId) {
      const s = services.find(x => x.id === booking.serviceId);
      if (s) return parseDuration(s.duration);
    }
    if (booking.dealId) {
      const d = deals.find(x => x.id === booking.dealId);
      if (d) return parseDuration(d.duration);
    }
    if (booking.cartItems) {
      return booking.cartItems.reduce((acc, item) => acc + parseDuration(item.duration), 0);
    }
    return 60;
  };

  const selectedService = services.find(s => s.id === formData.serviceId);
  const selectedDeal = deals.find(d => d.id === formData.dealId);

  // Combine durations
  const currentDuration = 
    (selectedService ? parseDuration(selectedService.duration) : 0) +
    (selectedDeal ? parseDuration(selectedDeal.duration) : 0) || 60;

  const bufferTime = Number(settings.bufferTime) || 0;

  const generateTimeSlots = () => {
    const start = settings.workingHoursStart || '09:00 AM';
    const end = settings.workingHoursEnd || '08:00 PM';
    const slots = [];
    
    const parseTime = (timeStr) => {
      try {
        const parts = timeStr.split(' ');
        const time = parts[0];
        const modifier = (parts[1] || 'AM').toUpperCase();
        let [hours, minutes] = time.split(':');
        hours = parseInt(hours);
        if (hours === 12 && modifier === 'AM') hours = 0;
        if (modifier === 'PM' && hours !== 12) hours += 12;
        return hours;
      } catch (e) { return 9; }
    };

    const startH = parseTime(start);
    const endH = parseTime(end);

    for (let h = startH; h <= endH; h++) {
      const displayH = h % 12 || 12;
      const ampm = h < 12 ? 'AM' : 'PM';
      slots.push(`${String(displayH).padStart(2, '0')}:00 ${ampm}`);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Overlap checker for slot conflict
  const isSlotBooked = (slotTimeStr) => {
    if (!formData.date) return false;
    const slotStart = timeToMinutes(slotTimeStr);
    const slotEnd = slotStart + currentDuration;

    // Bookings on selected date (exclude cancelled and fake)
    const dayBookings = bookings.filter(b => b.date === formData.date && b.status !== 'cancelled' && !b.isFake);

    for (const b of dayBookings) {
      const bStart = timeToMinutes(b.time);
      const bDur = getBookingDuration(b);
      const bEnd = bStart + bDur + bufferTime;

      if (slotStart < bEnd && slotEnd > bStart) {
        return true; // Conflict
      }
    }
    return false;
  };

  // Handle selecting an existing customer
  const handleSelectCustomer = (customerId) => {
    if (!customerId) {
      setFormData(prev => ({ ...prev, clientName: '', clientEmail: '', clientPhone: '' }));
      return;
    }
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setFormData(prev => ({
        ...prev,
        clientName: customer.name || '',
        clientEmail: customer.email || '',
        clientPhone: customer.phone || ''
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Verify service/deal selection
    if (!formData.serviceId && !formData.dealId) {
      setToastMessage('Please select a Service or a Deal (or both) to continue.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
      return;
    }

    const price = 
      (selectedService ? Number(selectedService.price) : 0) +
      (selectedDeal ? Number(selectedDeal.discountPrice) : 0);

    let titleParts = [];
    if (selectedService) titleParts.push(selectedService.title);
    if (selectedDeal) titleParts.push(selectedDeal.title);
    const serviceTitle = titleParts.join(' + ') || 'Signature Protocol';

    if (clientMode === 'new' && formData.clientName) {
      addCustomer({
        name: formData.clientName,
        email: formData.clientEmail,
        phone: formData.clientPhone,
        tier: 'Standard'
      });
    }

      addBooking({
        clientDetails: { 
          name: formData.clientName,
          email: formData.clientEmail,
          phone: formData.clientPhone
        },
        serviceId: formData.serviceId,
        dealId: formData.dealId,
        serviceName: serviceTitle,
        date: formData.date,
        time: formData.time,
        totalPrice: price,
        duration: `${currentDuration} min`,
        status: 'confirmed',
        isFake: formData.isFake || false
      });

    if (sendNotification) {
      const smsMessage = `Dear ${formData.clientName}, your booking for ${serviceTitle} on ${formData.date} at ${formData.time} is booked. Thank you for choosing Vlas AESTHETIC!`;
      addMessage({
        clientName: formData.clientName,
        clientPhone: formData.clientPhone,
        clientEmail: formData.clientEmail,
        messageType: 'SMS & Email',
        content: smsMessage
      });

      setDispatchOverlay(true);
      setTimeout(() => {
        setDispatchOverlay(false);
      }, 3200);
    }

    setIsModalOpen(false);
    setFormData({ 
      clientName: '', 
      clientEmail: '', 
      clientPhone: '', 
      serviceId: '', 
      dealId: '',
      date: '', 
      time: '',
      isFake: false 
    });
  };

  const getServiceLabel = (booking) => {
    if (booking.serviceName) return booking.serviceName;
    if (booking.cartItems) return booking.cartItems.map(i => i.name).join(' + ');
    const service = services.find(s => s.id === booking.serviceId);
    return service ? service.title : 'Signature Protocol';
  };

  const calculateTopOffset = (timeStr) => {
    if (!timeStr) return 10;
    try {
      const startLimit = settings.workingHoursStart || '09:00 AM';
      const parts = timeStr.split(' ');
      const time = parts[0];
      const modifier = (parts[1] || 'AM').toUpperCase();
      let [hours, minutes] = time.split(':');
      hours = parseInt(hours);
      minutes = parseInt(minutes) || 0;
      
      if (hours === 12 && modifier === 'AM') hours = 0;
      if (modifier === 'PM' && hours !== 12) hours += 12;
      
      const startParts = startLimit.split(' ');
      let startHour = parseInt(startParts[0]);
      const startMod = (startParts[1] || 'AM').toUpperCase();
      if (startHour === 12 && startMod === 'AM') startHour = 0;
      if (startMod === 'PM' && startHour !== 12) startHour += 12;

      const totalMinutesSinceStart = ((hours - startHour) * 60) + minutes;
      return (totalMinutesSinceStart / 60) * 96 + 10;
    } catch (e) {
      return 10;
    }
  };

  const serviceTitle = 
    (selectedService ? selectedService.title : '') + 
    (selectedService && selectedDeal ? ' + ' : '') + 
    (selectedDeal ? selectedDeal.title : '') || 'Signature Protocol';

  return (
    <div className="space-y-10 h-full flex flex-col relative">
      {/* Toast Notification (Bread Roaster) */}
      {showToast && (
        <div className="fixed top-6 right-6 z-[99999] animate-modal-entrance">
          <div className="bg-slate-950 text-white px-6 py-4 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-3">
            <span className="material-symbols-outlined text-rose-500 animate-bounce">warning</span>
            <span className="text-xs font-bold">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Schedule</h1>
          <p className="text-slate-500 text-sm mt-1">Real-time treatment room and specialist availability.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'calendar' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="material-symbols-outlined text-base">calendar_view_week</span>
              Calendar
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="material-symbols-outlined text-base">format_list_bulleted</span>
              All Bookings
              <span className="bg-slate-900 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">{bookings.length}</span>
            </button>
          </div>

          {viewMode === 'calendar' && (
            <div className="flex items-center bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <button
                onClick={() => navigateWeek(-1)}
                className="p-3 sm:px-4 hover:bg-slate-50 text-slate-500 transition-colors border-r border-slate-100"
                title="Previous week"
              >
                <span className="material-symbols-outlined text-xl">chevron_left</span>
              </button>

              <div className="flex-1 px-4 sm:px-8 py-2.5 text-center min-w-[200px]">
                <p className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
                  {monthYearLabel}
                </p>
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">
                  Week of {weekRangeLabel}
                </p>
              </div>

              <button
                onClick={() => navigateWeek(1)}
                className="p-3 sm:px-4 hover:bg-slate-50 text-slate-500 transition-colors border-l border-slate-100"
                title="Next week"
              >
                <span className="material-symbols-outlined text-xl">chevron_right</span>
              </button>

              {!isCurrentWeek && (
                <button
                  onClick={goToToday}
                  className="flex items-center gap-1.5 ml-1 mr-1.5 px-3 sm:px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95 shadow-sm"
                  style={{ backgroundColor: settings.primaryAccent }}
                  title="Jump to this week"
                >
                  <span className="material-symbols-outlined text-base">today</span>
                  Today
                </button>
              )}
               <ExportBookingsButton />
            </div>
          )}
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="btn-primary shadow-lg shadow-blue-100"
            style={{ backgroundColor: settings.primaryAccent }}
          >
            <span className="material-symbols-outlined text-xl">add_task</span>
            Schedule Appointment
          </button>
        </div>
      </div>

      {/* LIST VIEW */}
      {viewMode === 'list' && (() => {
        const now = new Date();
        const STATUS_COLORS = {
          confirmed:  'bg-emerald-50 text-emerald-700 border-emerald-100',
          pending:    'bg-amber-50 text-amber-700 border-amber-100',
          completed:  'bg-blue-50 text-blue-700 border-blue-100',
          cancelled:  'bg-rose-50 text-rose-700 border-rose-100',
          'no-show':  'bg-slate-100 text-slate-500 border-slate-200',
        };
        const filtered = bookings
          .filter(b => {
            if (listFilter === 'upcoming') return new Date(`${b.date} ${b.time}`) >= now;
            if (listFilter === 'past') return new Date(`${b.date} ${b.time}`) < now;
            return true;
          })
          .sort((a, b) => new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time));

        return (
          <div className="space-y-4 animate-page-entrance">
            {/* Filter tabs */}
            <div className="flex gap-2">
              {['all', 'upcoming', 'past'].map(f => (
                <button
                  key={f}
                  onClick={() => setListFilter(f)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all border ${
                    listFilter === f ? 'text-white border-transparent shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:text-slate-800'
                  }`}
                  style={listFilter === f ? { backgroundColor: settings.primaryAccent } : {}}
                >
                  {f} {f === 'all' ? `(${bookings.length})` : f === 'upcoming' ? `(${bookings.filter(b => new Date(b.date + ' ' + b.time) >= now).length})` : `(${bookings.filter(b => new Date(b.date + ' ' + b.time) < now).length})`}
                </button>
              ))}
            </div>
            <div className="card-pro overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-100">
                      <th className="px-6 py-5">Client</th>
                      <th className="px-6 py-5">Service</th>
                      <th className="px-6 py-5">Date & Time</th>
                      <th className="px-6 py-5">Price</th>
                      <th className="px-6 py-5">Status</th>
                      <th className="px-6 py-5">Flags</th>
                      <th className="px-6 py-5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map(booking => {
                      const isPast = new Date(`${booking.date} ${booking.time}`) < now;
                      const sc = STATUS_COLORS[booking.status] || STATUS_COLORS.pending;
                      return (
                        <tr
                          key={booking.id}
                          className={`hover:bg-slate-50/50 transition-colors cursor-pointer ${ isPast ? 'opacity-70' : ''}`}
                          onClick={() => setSelectedBooking(booking)}
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0" style={{ backgroundColor: settings.primaryAccent }}>
                                {booking.clientDetails?.name?.charAt(0) || '?'}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-900">{booking.clientDetails?.name || 'Anonymous'}</p>
                                <p className="text-[10px] text-slate-400">{booking.clientDetails?.email || booking.clientDetails?.phone || '—'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <p className="text-xs font-bold text-slate-700">{getServiceLabel(booking)}</p>
                          </td>
                          <td className="px-6 py-5">
                            <p className="text-sm font-bold text-slate-900">{booking.date}</p>
                            <p className="text-[10px] text-slate-500">{booking.time}</p>
                          </td>
                          <td className="px-6 py-5">
                            <p className="text-sm font-bold text-slate-900">{booking.totalPrice ? `$${booking.totalPrice}` : '—'}</p>
                          </td>
                          <td className="px-6 py-5">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${sc}`}>
                              {booking.status || 'pending'}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex gap-1.5">
                              {isPast && <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200">Past</span>}
                              {booking.isFake && <span className="text-[9px] font-bold bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full border border-orange-200">Test</span>}
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <button
                              onClick={e => { e.stopPropagation(); setSelectedBooking(booking); }}
                              className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan="7" className="px-8 py-20 text-center text-slate-400 text-sm italic">
                          No bookings found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Calendar Grid */}
      {viewMode === 'calendar' && (
      <div className="card-pro flex-1 min-h-[500px] lg:min-h-[700px] overflow-hidden flex flex-col">
        {/* Responsive day columns */}
        <div className="grid grid-cols-[80px_repeat(7,1fr)] sm:grid-cols-[100px_repeat(7,1fr)] bg-slate-50 border-b border-slate-200 sticky top-0 z-20">
          <div className="p-3 sm:p-6 flex items-center justify-center text-slate-400 border-r border-slate-200">
            <span className="material-symbols-outlined text-lg sm:text-xl">schedule</span>
          </div>
          {weekDays.map((date, i) => {
            const isToday = new Date().toDateString() === date.toDateString();
            const isPastDay = date < new Date() && !isToday;
            const dateStr = date.toLocaleDateString('en-CA');
            const dayCount = bookings.filter(b => b.date === dateStr).length;
            return (
              <div key={i} className={`py-3 px-1 sm:p-4 lg:p-6 text-center border-l border-slate-200 flex flex-col justify-center items-center relative ${isToday ? 'bg-blue-50/60' : isPastDay ? 'bg-slate-50/40' : ''}`}>
                <p className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider ${isToday ? 'text-blue-600' : isPastDay ? 'text-slate-400' : 'text-slate-500'}`}>
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </p>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full font-bold text-sm ${
                      isToday ? 'text-white shadow-md' : isPastDay ? 'text-slate-400' : 'text-slate-900'
                    }`}
                    style={isToday ? { backgroundColor: settings.primaryAccent } : undefined}
                  >
                    {date.getDate()}
                  </span>
                </div>
                {dayCount > 0 && (
                  <span className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 w-4 h-4 sm:w-5 sm:h-5 rounded-full text-white text-[9px] font-black flex items-center justify-center shadow-sm" style={{ backgroundColor: settings.primaryAccent }}>
                    {dayCount}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-auto relative custom-scrollbar">
          <div className="min-w-[800px] sm:min-w-[1000px] grid grid-cols-[80px_repeat(7,1fr)] sm:grid-cols-[100px_repeat(7,1fr)] divide-x divide-slate-100">
            {/* Time Column */}
            <div className="divide-y divide-slate-100 bg-slate-50/50">
              {timeSlots.map(time => (
                <div key={time} className="h-24 p-2 sm:p-4 flex items-center justify-center border-b border-slate-100">
                  <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-tight">{time}</span>
                </div>
              ))}
            </div>

            {/* Grid Columns */}
            {weekDays.map((date, dayIdx) => {
              const dateStr = date.toLocaleDateString('en-CA'); // YYYY-MM-DD
              const dayBookings = bookings.filter(b => b.date === dateStr);
              
              return (
                <div key={dayIdx} className="divide-y divide-slate-100 relative">
                  {timeSlots.map(time => (
                    <div key={time} className="h-24 p-2 group hover:bg-slate-50/50 transition-colors border-b border-slate-100" />
                  ))}

                   {/* Bookings */}
                  {dayBookings.map((booking) => {
                    const label = getServiceLabel(booking);
                    const topOffset = calculateTopOffset(booking.time);
                    const status = booking.status || 'pending';
                    const accent = statusAccent[status] || settings.primaryAccent;
                    const isFake = booking.isFake;
                    const isPast = new Date(`${booking.date} ${booking.time}`) < new Date();
                    
                    return (
                      <div 
                        key={booking.id} 
                        onClick={() => setSelectedBooking(booking)}
                        className={`absolute left-1.5 right-1.5 p-2 sm:p-3 border rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer z-10 border-l-4 group/booking ${isFake ? 'bg-gray-50 opacity-70' : isPast ? 'bg-slate-50/80 opacity-80' : 'bg-white'}`}
                        style={{ top: `${topOffset}px`, borderLeftColor: accent }}
                      >
                        <div className="flex items-center justify-between gap-1 mb-0.5 sm:mb-1">
                          <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider truncate" style={{ color: accent }}>{label}</p>
                          <div className="flex items-center gap-1 shrink-0">
                            {isPast && !isFake && <span className="text-[7px] font-black uppercase tracking-wider text-slate-400 bg-slate-100 px-1 py-0.5 rounded">Past</span>}
                            {isFake && <span className="text-[7px] font-black uppercase tracking-wider text-orange-500 bg-orange-50 px-1 py-0.5 rounded">Test</span>}
                            <span className={`badge-${status === 'no-show' ? 'cancelled' : status} !px-1.5 !py-0 !text-[8px]`}>{status === 'no-show' ? 'no show' : status}</span>
                          </div>
                        </div>
                        <p className="text-xs font-bold text-slate-900 truncate">{booking.clientDetails?.name}</p>
                        <p className="text-[9px] sm:text-[10px] text-slate-400 mt-1.5 sm:mt-2 font-medium flex items-center justify-between">
                          <span>{booking.time}</span>
                          <span className="material-symbols-outlined text-[12px] sm:text-[14px] opacity-0 group-hover/booking:opacity-100 transition-opacity">visibility</span>
                        </p>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      )}

      {/* Manual Booking Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Schedule New Appointment"
        subtitle="Reserve a treatment slot and assign it to a client protocol."
      >
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* CLIENT TYPE SELECTOR */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Client Association</label>
            <div className="grid grid-cols-2 gap-4 bg-slate-100 p-1 rounded-2xl border border-slate-200/50">
              <button
                type="button"
                onClick={() => {
                  setClientMode('new');
                  setFormData(prev => ({ ...prev, clientName: '', clientEmail: '', clientPhone: '' }));
                }}
                className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${clientMode === 'new' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Create New Client
              </button>
              <button
                type="button"
                onClick={() => {
                  setClientMode('existing');
                  setFormData(prev => ({ ...prev, clientName: '', clientEmail: '', clientPhone: '' }));
                }}
                className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${clientMode === 'existing' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Existing Client
              </button>
            </div>
          </div>

          {/* OPTIONAL CUSTOMER SELECTOR IF EXISTING */}
          {clientMode === 'existing' ? (
            <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 animate-page-entrance">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Select Client Profile*</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">group</span>
                <select 
                  required
                  onChange={e => handleSelectCustomer(e.target.value)} 
                  className="input-pro pl-12 appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1.2em_1.2em]"
                >
                  <option value="">-- Choose Profile --</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email || c.phone || 'No Contact'})</option>)}
                </select>
              </div>

              {formData.clientName && (
                <div className="mt-4 pt-4 border-t border-slate-200/50 grid grid-cols-2 gap-2 text-xs text-slate-500 font-medium">
                  <div>
                    <NotificationBell />
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Name</span>
                    <span className="text-slate-800 font-bold">{formData.clientName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Contact</span>
                    <span className="text-slate-800 font-bold truncate block">{formData.clientPhone || formData.clientEmail}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6 animate-page-entrance">
              {/* CLIENT FULL NAME */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Client Full Name*</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">person</span>
                  <input 
                    required 
                    className="input-pro pl-12" 
                    placeholder="e.g. John Doe" 
                    type="text" 
                    value={formData.clientName}
                    onChange={e => setFormData({...formData, clientName: e.target.value})}
                  />
                </div>
              </div>

              {/* CONTACT INFO: EMAIL & PHONE (RESPONSIVE GRID) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Client Email*</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">mail</span>
                    <input 
                      required 
                      type="email"
                      value={formData.clientEmail} 
                      onChange={e=>setFormData({...formData, clientEmail: e.target.value})} 
                      className="input-pro pl-12" 
                      placeholder="client@example.com" 
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Client Phone*</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">phone</span>
                    <input 
                      required 
                      value={formData.clientPhone} 
                      onChange={e=>setFormData({...formData, clientPhone: e.target.value})} 
                      className="input-pro pl-12" 
                      placeholder="e.g. +1 (555) 000-0000" 
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SERVICE & DEAL PICKER */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Service Treatment</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">medical_services</span>
                <select 
                  className="input-pro pl-12 appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1.2em_1.2em]"
                  value={formData.serviceId}
                  onChange={e => setFormData({...formData, serviceId: e.target.value})}
                >
                  <option value="">-- Choose Service --</option>
                  {services.map(s => <option key={s.id} value={s.id}>{s.title} (${s.price})</option>)}
                </select>
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Promotional Deal</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">loyalty</span>
                <select 
                  className="input-pro pl-12 appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1.2em_1.2em]"
                  value={formData.dealId}
                  onChange={e => setFormData({...formData, dealId: e.target.value})}
                >
                  <option value="">-- Choose Deal --</option>
                  {deals.map(d => <option key={d.id} value={d.id}>{d.title} (${d.discountPrice})</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* APPOINTMENT DATE */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Appointment Date*</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">calendar_today</span>
              <input 
                required 
                className="input-pro pl-12" 
                type="date" 
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
              />
            </div>
          </div>

          {/* PREFERRED TIME BUTTON GRID */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Preferred Time Slot*</label>
            {!formData.date ? (
              <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                Please choose an appointment date to reveal timeline windows.
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-48 overflow-y-auto p-2 border border-slate-100 rounded-2xl scrollbar-pro bg-white">
                {timeSlots.map(t => {
                  const booked = isSlotBooked(t);
                  const selected = formData.time === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormData({...formData, time: t})}
                      className={`py-3 px-2 rounded-xl text-[10px] sm:text-xs font-extrabold transition-all border text-center ${
                        selected
                          ? 'text-white border-transparent shadow-sm'
                          : booked
                            ? 'border-slate-100 bg-slate-50 text-slate-400 line-through opacity-30'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white hover:bg-slate-50'
                      }`}
                      style={selected ? { backgroundColor: settings.primaryAccent } : {}}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            )}
            <input type="hidden" required value={formData.time} name="time_verify" />
          </div>

            {/* FAKE BOOKING CHECK */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="fakeBooking"
                checked={formData.isFake || false}
                onChange={e => setFormData({ ...formData, isFake: e.target.checked })}
                className="w-4 h-4 text-primaryAccent border-gray-300 rounded"
              />
              <label htmlFor="fakeBooking" className="text-sm text-slate-600">Mark as Fake Booking (for testing)</label>
            </div>
          {/* SEND NOTIFICATION TOGGLE */}
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <input 
              type="checkbox" 
              id="sendNotifySchedule" 
              checked={sendNotification} 
              onChange={e => setSendNotification(e.target.checked)} 
              className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="sendNotifySchedule" className="text-xs font-bold text-slate-700 select-none cursor-pointer flex-1">
              Dispatch Outbound SMS & Email Notification (Real-time Sync)
            </label>
          </div>

          {/* LIVE MESSAGE PREVIEW */}
          {sendNotification && (
            <div className="bg-slate-950 text-slate-100 rounded-3xl p-6 shadow-xl relative overflow-hidden border border-white/5 font-sans animate-page-entrance">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Live SMS & Email Dispatch Preview</span>
                </div>
                <span className="material-symbols-outlined text-slate-500 text-sm">chat_bubble</span>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                <p className="text-[10px] font-extrabold text-blue-400 mb-1 tracking-widest uppercase">💬 Outbound Dispatcher</p>
                <p className="text-xs text-slate-200 leading-relaxed font-semibold">
                  {formData.clientName 
                    ? `Dear ${formData.clientName}, your booking for ${serviceTitle} on ${formData.date || '___'} at ${formData.time || '___'} is booked. Thank you for choosing Vlas AESTHETIC!`
                    : "Fill client name & details to generate preview..."}
                </p>
                <span className="block text-[8px] text-right text-slate-500 mt-2 font-bold uppercase tracking-widest">Neural Link Sync • Instant Delivery</span>
              </div>
            </div>
          )}

          <div className="flex gap-6 pt-6">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">Cancel</button>
            <button 
              type="submit" 
              className="flex-[2] btn-primary py-4 shadow-xl shadow-blue-100"
              style={{ backgroundColor: settings.primaryAccent }}
            >
              Confirm Schedule
            </button>
          </div>
        </form>
      </Modal>

      {/* Booking Detail Modal */}
      <Modal
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        title="Booking Detail Protocol"
        subtitle="Comprehensive overview of the client's scheduled ritual."
      >
        {selectedBooking && (() => {
          const label = getServiceLabel(selectedBooking);
          const service = services.find(s => s.id === selectedBooking.serviceId) || {};
          return (
            <div className="space-y-10">
              <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-sm" style={{ backgroundColor: settings.primaryAccent }}>
                  {selectedBooking.clientDetails?.name?.charAt(0) || 'C'}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">{selectedBooking.clientDetails?.name}</h3>
                  <p className="text-slate-500 font-medium">{selectedBooking.clientDetails?.email || 'No contact email assigned'}</p>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">{selectedBooking.clientDetails?.phone || 'No contact phone assigned'}</p>
                </div>
              </div>
 
              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Treatment Type</label>
                  <p className="text-lg font-bold text-slate-900">{label}</p>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Investment</label>
                  <p className="text-lg font-bold text-slate-900">${service.price || selectedBooking.totalPrice || 'Market Rate'}</p>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Scheduled Date</label>
                  <p className="text-lg font-bold text-slate-900">{selectedBooking.date}</p>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Temporal Slot</label>
                  <p className="text-lg font-bold text-slate-900">{selectedBooking.time}</p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Protocol Status</label>
                <span className={`badge-${selectedBooking.status === 'no-show' ? 'cancelled' : (selectedBooking.status || 'pending')} inline-block`}>
                  {selectedBooking.status === 'no-show' ? 'Customer Did Not Visit' : (selectedBooking.status || 'pending')}
                </span>
              </div>

              {/* Status action buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { updateBooking(selectedBooking.id, { ...selectedBooking, status: 'completed' }); setSelectedBooking(prev => ({...prev, status: 'completed'})); }}
                  className="py-3 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  Mark Completed
                </button>
                <button
                  onClick={() => { updateBooking(selectedBooking.id, { ...selectedBooking, status: 'confirmed' }); setSelectedBooking(prev => ({...prev, status: 'confirmed'})); }}
                  className="py-3 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all flex items-center justify-center gap-2"
                  style={{ borderColor: settings.primaryAccent }}
                >
                  <span className="material-symbols-outlined text-sm">event_available</span>
                  Confirm
                </button>
                <button
                  onClick={() => { updateBooking(selectedBooking.id, { ...selectedBooking, status: 'cancelled' }); setSelectedBooking(prev => ({...prev, status: 'cancelled'})); }}
                  className="py-3 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">cancel</span>
                  Cancel
                </button>
                <button
                  onClick={() => { updateBooking(selectedBooking.id, { ...selectedBooking, status: 'no-show' }); setSelectedBooking(prev => ({...prev, status: 'no-show'})); }}
                  className="py-3 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">person_off</span>
                  No Show
                </button>
              </div>

              <div className="flex gap-4 pt-2">
                <button 
                  onClick={() => setSelectedBooking(null)}
                  className="flex-1 py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.4em] hover:bg-slate-800 transition-all rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* DISPATCH OVERLAY SCREEN ANIMATION */}
      {dispatchOverlay && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center pointer-events-none p-4">
          <div className="bg-slate-950/90 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/10 shadow-2xl flex flex-col items-center max-w-sm w-full text-center animate-modal-entrance shadow-emerald-500/10">
            <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center text-white mb-4 animate-bounce">
              <span className="material-symbols-outlined text-3xl">sms</span>
            </div>
            <h4 className="text-white text-lg font-black tracking-tight">Booking Notification Sent</h4>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed font-medium">
              SMS & Email confirmation successfully dispatched to <span className="text-emerald-400 font-bold">{formData.clientName}</span>.
            </p>
            <div className="mt-4 bg-white/5 rounded-2xl p-4 border border-white/5 w-full text-left font-sans">
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Outbound Body</p>
              <p className="text-xs text-slate-200 mt-1 italic leading-relaxed font-medium">
                {`"Dear ${formData.clientName}, your booking for ${serviceTitle} on ${formData.date} at ${formData.time} is booked. Thank you for choosing VLAS!"`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
