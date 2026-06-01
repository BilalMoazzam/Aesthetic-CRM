import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import Modal from '../components/Modal';

export default function ScheduleManager() {
  const { bookings, services, fetchBookings, fetchServices, addBooking, settings } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [formData, setFormData] = useState({ clientName: '', serviceId: '', date: '', time: '' });
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchBookings();
    fetchServices();
  }, [fetchBookings, fetchServices]);

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

  const monthYearLabel = monday.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const navigateWeek = (direction) => {
    const next = new Date(currentDate);
    next.setDate(currentDate.getDate() + (direction * 7));
    setCurrentDate(next);
  };

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
        if (modifier === 'PM' && hours !== '12') hours += 12;
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

  const handleSubmit = (e) => {
    e.preventDefault();
    addBooking({
      clientDetails: { name: formData.clientName },
      serviceId: formData.serviceId,
      date: formData.date,
      time: formData.time,
      status: 'confirmed'
    });
    setIsModalOpen(false);
    setFormData({ clientName: '', serviceId: '', date: '', time: '' });
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
      
      // Each hour (60 min) is 96px high
      return (totalMinutesSinceStart / 60) * 96 + 10;
    } catch (e) {
      return 10;
    }
  };

  return (
    <div className="space-y-10 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Schedule</h1>
          <p className="text-slate-500 text-sm mt-1">Real-time treatment room and specialist availability.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm items-center">
            <button onClick={() => navigateWeek(-1)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 transition-colors">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <div className="px-4 text-xs font-bold text-slate-900 min-w-[150px] text-center">
              {monthYearLabel}
            </div>
            <button onClick={() => navigateWeek(1)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 transition-colors">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
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

      {/* Calendar Grid */}
      <div className="card-pro flex-1 min-h-[700px] overflow-hidden flex flex-col">
        <div className="grid grid-cols-[100px_repeat(7,1fr)] bg-slate-50 border-b border-slate-200 sticky top-0 z-20">
          <div className="p-6 flex items-center justify-center text-slate-400 border-r border-slate-200">
            <span className="material-symbols-outlined">schedule</span>
          </div>
          {weekDays.map((date, i) => {
            const isToday = new Date().toDateString() === date.toDateString();
            return (
              <div key={i} className={`p-6 text-center border-l border-slate-200 ${isToday ? 'bg-blue-50/50' : ''}`}>
                <p className={`text-[10px] font-bold uppercase tracking-widest ${isToday ? 'text-blue-600' : 'text-slate-500'}`}>
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </p>
                <p className={`text-xl font-bold mt-1 ${isToday ? 'text-blue-600' : 'text-slate-900'}`}>
                  {date.getDate()}
                </p>
              </div>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-auto relative custom-scrollbar">
          <div className="min-w-[1000px] grid grid-cols-[100px_repeat(7,1fr)] divide-x divide-slate-100">
            {/* Time Column */}
            <div className="divide-y divide-slate-100 bg-slate-50/50">
              {timeSlots.map(time => (
                <div key={time} className="h-24 p-4 text-center border-b border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{time}</span>
                </div>
              ))}
            </div>

            {/* Grid Columns */}
            {weekDays.map((date, dayIdx) => {
              const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
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
                    
                    return (
                      <div 
                        key={booking.id} 
                        onClick={() => setSelectedBooking(booking)}
                        className="absolute left-2 right-2 p-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer z-10 border-l-4 group/booking"
                        style={{ top: `${topOffset}px`, borderLeftColor: settings.primaryAccent }}
                      >
                        <p className="text-[10px] font-bold uppercase tracking-wider mb-1 truncate" style={{ color: settings.primaryAccent }}>{label}</p>
                        <p className="text-xs font-bold text-slate-900 truncate">{booking.clientDetails?.name}</p>
                        <p className="text-[10px] text-slate-400 mt-2 font-medium flex items-center justify-between">
                          <span>{booking.time}</span>
                          <span className="material-symbols-outlined text-[14px] opacity-0 group-hover/booking:opacity-100 transition-opacity">visibility</span>
                        </p>
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {/* Current Time Indicator */}
            <div className="absolute left-0 right-0 top-[300px] z-30 pointer-events-none opacity-50">
              <div className="h-px w-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)] relative">
                <div className="absolute -left-1 -top-1 w-2 h-2 rounded-full bg-blue-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Booking Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Schedule New Appointment"
        subtitle="Reserve a treatment slot and assign it to a client protocol."
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Client Full Name</label>
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
          
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Service Treatment</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">medical_services</span>
              <select 
                required 
                className="input-pro pl-12 appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1.2em_1.2em]"
                value={formData.serviceId}
                onChange={e => setFormData({...formData, serviceId: e.target.value})}
              >
                <option value="">Select Treatment</option>
                {services.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Appointment Date</label>
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
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Preferred Time</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">schedule</span>
                <select 
                  required 
                  className="input-pro pl-12 appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1.2em_1.2em]"
                  value={formData.time}
                  onChange={e => setFormData({...formData, time: e.target.value})}
                >
                  <option value="">Select Time</option>
                  {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </div>

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
                <div className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-2xl font-bold" style={{ backgroundColor: settings.primaryAccent }}>
                  {selectedBooking.clientDetails?.name?.charAt(0) || 'C'}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">{selectedBooking.clientDetails?.name}</h3>
                  <p className="text-slate-500 font-medium">{selectedBooking.clientDetails?.email || 'No contact ritual assigned'}</p>
                </div>
              </div>
 
              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Treatment Type</label>
                  <p className="text-lg font-bold text-slate-900">{label}</p>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Investment</label>
                  <p className="text-lg font-bold text-slate-900">${service.price || 'Market Rate'}</p>
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
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
                  <p className="font-bold text-slate-900 uppercase tracking-widest text-xs">{selectedBooking.status || 'Active'}</p>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button 
                  onClick={() => setSelectedBooking(null)}
                  className="flex-1 py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.4em] hover:bg-slate-800 transition-all"
                >
                  Close Archive
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
