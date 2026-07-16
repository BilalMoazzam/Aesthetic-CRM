import React, { useEffect, useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import Modal from '../components/Modal';

export default function BookingManager() {
  const { 
    bookings, 
    services, 
    messages, 
    customers, 
    fetchBookings, 
    fetchServices, 
    fetchMessages, 
    fetchCustomers, 
    addBooking, 
    updateBooking, 
    deleteBooking, 
    addMessage, 
    settings,
    deals,
    addCustomer
  } = useStore();

  // Generate time slots from settings (same as ScheduleManager)
  const timeSlots = useMemo(() => {
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
  }, [settings]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'pending', 'confirmed', 'completed', 'logs'
  const [sendNotification, setSendNotification] = useState(true);
  const [dispatchOverlay, setDispatchOverlay] = useState(false);

  const [clientMode, setClientMode] = useState('new');
  const [formData, setFormData] = useState({ 
    clientName: '', 
    clientEmail: '', 
    clientPhone: '', 
    serviceId: '', 
    dealId: '',
    date: '', 
    time: '', 
    status: 'confirmed',
    isFake: false 
  });

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
    return 60;
  };

  const bufferTime = Number(settings.bufferTime) || 0;

  const isSlotBooked = (slotTimeStr) => {
    if (!formData.date) return false;
    
    const selectedService = services.find(s => s.id === formData.serviceId);
    const selectedDeal = deals.find(d => d.id === formData.dealId);
    const currentDuration = 
      (selectedService ? parseDuration(selectedService.duration) : 0) +
      (selectedDeal ? parseDuration(selectedDeal.duration) : 0) || 60;

    const slotStart = timeToMinutes(slotTimeStr);
    const slotEnd = slotStart + currentDuration;

    // Bookings on selected date
    const dayBookings = bookings.filter(b => b.date === formData.date && b.status !== 'cancelled');

    for (const b of dayBookings) {
      const bStart = timeToMinutes(b.time);
      const bDur = getBookingDuration(b);
      const bEnd = bStart + bDur + bufferTime;

      // Don't count overlap if editing the same booking
      if (editingId && b.id === editingId) continue;

      if (slotStart < bEnd && slotEnd > bStart) {
        return true; // Conflict
      }
    }
    return false;
  };

  useEffect(() => {
    fetchBookings();
    fetchServices();
    fetchMessages();
    fetchCustomers();
  }, [fetchBookings, fetchServices, fetchMessages, fetchCustomers]);

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

  const handleOpenModal = (booking = null) => {
    if (booking) {
      setFormData({
        clientName: booking.clientDetails?.name || '',
        clientEmail: booking.clientDetails?.email || '',
        clientPhone: booking.clientDetails?.phone || '',
        serviceId: booking.serviceId || '',
        dealId: booking.dealId || '',
        date: booking.date || '',
        time: booking.time || '',
        status: booking.status || 'confirmed',
        isFake: booking.isFake || false
      });
      setEditingId(booking.id);
      setClientMode('existing'); // Default to existing when editing
    } else {
      setFormData({ 
        clientName: '', 
        clientEmail: '', 
        clientPhone: '', 
        serviceId: '', 
        dealId: '',
        date: '', 
        time: '', 
        status: 'confirmed',
        isFake: false 
      });
      setEditingId(null);
      setClientMode('new');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedService = services.find(s => s.id === formData.serviceId);
    const serviceTitle = selectedService ? selectedService.title : 'Signature Protocol';
    const price = selectedService ? Number(selectedService.price) : 0;

    const bookingData = {
      clientDetails: { 
        name: formData.clientName,
        email: formData.clientEmail,
        phone: formData.clientPhone
      },
      serviceId: formData.serviceId,
      serviceName: serviceTitle,
      date: formData.date,
      time: formData.time,
      totalPrice: price,
      status: formData.status,
      isFake: formData.isFake || false
    };

    if (editingId) {
      updateBooking(editingId, bookingData);
    } else {
      if (clientMode === 'new' && formData.clientName) {
        addCustomer({
          name: formData.clientName,
          email: formData.clientEmail,
          phone: formData.clientPhone,
          tier: 'Standard'
        });
      }
      addBooking(bookingData);

      if (sendNotification) {
        const smsMessage = `Dear ${formData.clientName}, your booking for ${serviceTitle} on ${formData.date} at ${formData.time} is booked. Thank you for choosing Vlas AESTHETIC!`;
        addMessage({
          clientName: formData.clientName,
          clientPhone: formData.clientPhone,
          clientEmail: formData.clientEmail,
          messageType: 'SMS & Email',
          content: smsMessage
        });

        // Trigger SMS Dispatched overlay notification
        setDispatchOverlay(true);
        setTimeout(() => {
          setDispatchOverlay(false);
        }, 3200);
      }
    }
    setIsModalOpen(false);
  };

  const getServiceLabel = (booking) => {
    if (booking.serviceName) return booking.serviceName;
    if (booking.cartItems) return booking.cartItems.map(i => i.name).join(' + ');
    const service = services.find(s => s.id === booking.serviceId);
    return service ? service.title : 'Signature Protocol';
  };

  const filteredBookings = bookings.filter(b => {
    if (activeTab === 'all') return true;
    return b.status === activeTab;
  }).sort((a, b) => new Date(b.date) - new Date(a.date));

  const selectedService = services.find(s => s.id === formData.serviceId);
  const serviceTitle = selectedService ? selectedService.title : 'Signature Protocol';

  return (
    <div className="space-y-8 relative">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Booking Management</h1>
          <p className="text-primary/80 text-sm mt-1">Review, approve, and manage all client appointments.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          className="btn-primary shadow-lg shadow-rose-sm w-full md:w-auto bg-primary text-white"
        >
          <span className="material-symbols-outlined text-xl">add_circle</span>
          New Appointment
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 md:gap-8 overflow-x-auto scrollbar-hide">
        <button 
          onClick={() => setActiveTab('all')} 
          className={`pb-4 px-2 text-sm font-bold whitespace-nowrap border-b-2 transition-all ${activeTab === 'all' ? 'text-white border-primary' : 'text-primary/80 border-transparent hover:text-primary'}`}
        >
          All Bookings
        </button>
        <button 
          onClick={() => setActiveTab('pending')} 
          className={`pb-4 px-2 text-sm font-bold whitespace-nowrap border-b-2 transition-all ${activeTab === 'pending' ? 'text-primary border-primary' : 'text-primary/80 border-transparent hover:text-primary'}`}
        >
          Pending
        </button>
        <button 
          onClick={() => setActiveTab('confirmed')} 
          className={`pb-4 px-2 text-sm font-bold whitespace-nowrap border-b-2 transition-all ${activeTab === 'confirmed' ? 'text-primary border-primary' : 'text-primary/80 border-transparent hover:text-primary'}`}
        >
          Confirmed
        </button>
        <button 
          onClick={() => setActiveTab('completed')} 
          className={`pb-4 px-2 text-sm font-bold whitespace-nowrap border-b-2 transition-all ${activeTab === 'completed' ? 'text-primary border-primary' : 'text-primary/80 border-transparent hover:text-primary'}`}
        >
          Completed
        </button>
        <button 
          onClick={() => setActiveTab('logs')} 
          className={`pb-4 px-2 text-sm font-bold whitespace-nowrap border-b-2 transition-all ${activeTab === 'logs' ? 'text-primary border-primary' : 'text-primary/80 border-transparent hover:text-primary'}`}
        >
          Outbound Logs
        </button>
      </div>

      {/* Conditional Table View */}
      {activeTab === 'logs' ? (
        <div className="card-pro overflow-hidden animate-page-entrance">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-primary text-[10px] uppercase tracking-wider text-white/80 font-bold border-b border-slate-100">
                  <th className="px-8 py-5">Client Profile</th>
                  <th className="px-8 py-5">Message Type</th>
                  <th className="px-8 py-5">Content Dispatched</th>
                  <th className="px-8 py-5">Timestamp</th>
                  <th className="px-8 py-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {messages && messages.map((msg) => (
                  <tr key={msg.id} className="hover:bg-transparent transition-colors group">
                    <td className="px-8 py-6">
                      <div>
                        <p className="text-sm font-bold text-primary">{msg.clientName}</p>
                        <p className="text-xs text-primary/80 mt-0.5">{msg.clientPhone || msg.clientEmail}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-bold text-white bg-primary px-2.5 py-1 rounded-md">{msg.messageType}</span>
                    </td>
                    <td className="px-8 py-6 max-w-xs">
                      <p className="text-xs text-primary leading-relaxed font-medium break-words" title={msg.content}>
                        {msg.content}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-xs font-medium text-primary/80 whitespace-nowrap">{msg.timestamp}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className="bg-[#E7C8DD] text-primary border border-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        {msg.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {(!messages || messages.length === 0) && (
                  <tr>
                    <td colSpan="5" className="px-8 py-20 text-center text-primary/70 text-sm italic">
                      No outbound notifications logged yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card-pro overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-primary text-[10px] uppercase tracking-wider text-white/80 font-bold border-b border-slate-100">
                  <th className="px-8 py-5">Client & Service</th>
                  <th className="px-8 py-5">Appointment Date</th>
                  <th className="px-8 py-5">Time Slot</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.map((booking) => {
                  const serviceName = getServiceLabel(booking);
                  return (
                    <tr key={booking.id} className="hover:bg-transparent transition-colors group">
                      <td className="px-8 py-6">
                        <div>
                          <p className="text-sm font-bold text-primary">{booking.clientDetails?.name || 'Anonymous'}</p>
                          <p className="text-xs text-primary/80 mt-0.5">{serviceName}</p>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm font-medium text-primary">{booking.date}</p>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-xs font-bold text-white bg-primary px-2.5 py-1 rounded-md">{booking.time}</span>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`badge-${booking.status || 'pending'}`}>
                          {booking.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {booking.status === 'pending' && (
                            <button 
                              onClick={() => updateBooking(booking.id, { status: 'confirmed' })}
                              className="w-9 h-9 flex items-center justify-center rounded-lg text-primary bg-[#E7C8DD] hover:bg-[#DBAFC1] transition-colors"
                              title="Confirm Booking"
                            >
                              <span className="material-symbols-outlined text-xl">check_circle</span>
                            </button>
                          )}
                          <button 
                            onClick={() => handleOpenModal(booking)}
                            className="w-9 h-9 flex items-center justify-center rounded-lg text-primary bg-[#E7C8DD] hover:bg-[#DBAFC1] transition-colors"
                            title="Edit Booking"
                          >
                            <span className="material-symbols-outlined text-xl">edit</span>
                          </button>
                          <button 
                            onClick={() => { if(window.confirm('Delete this booking?')) deleteBooking(booking.id); }}
                            className="w-9 h-9 flex items-center justify-center rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
                            title="Delete Booking"
                          >
                            <span className="material-symbols-outlined text-xl">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {filteredBookings.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-8 py-20 text-center text-primary/70 text-sm italic">
                      No bookings found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Booking Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Appointment' : 'New Appointment'}
        subtitle="Manage individual appointment records and their current lifecycle status."
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* CLIENT TYPE SELECTOR */}
          {!editingId && (
            <div className="space-y-3">
              <label className="text-xs font-bold text-primary/80 uppercase tracking-widest ml-1">Client Association</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-primary p-1 rounded-2xl border border-slate-200/50">
                <button
                  type="button"
                  onClick={() => {
                    setClientMode('new');
                    setFormData(prev => ({ ...prev, clientName: '', clientEmail: '', clientPhone: '' }));
                  }}
                  className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${clientMode === 'new' ? 'bg-primary text-white shadow-sm' : 'text-primary/80 hover:text-primary'}`}
                >
                  Create New Client
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setClientMode('existing');
                    setFormData(prev => ({ ...prev, clientName: '', clientEmail: '', clientPhone: '' }));
                  }}
                  className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${clientMode === 'existing' ? 'bg-primary text-white shadow-sm' : 'text-primary/80 hover:text-primary'}`}
                >
                  Existing Client
                </button>
              </div>
            </div>
          )}

          {/* OPTIONAL CUSTOMER SELECTOR IF EXISTING */}
          {clientMode === 'existing' || editingId ? (
            <div className="space-y-3 p-4 bg-primary rounded-2xl border border-slate-100 animate-page-entrance">
              <label className="text-xs font-bold text-primary/80 uppercase tracking-widest ml-1">Select Client Profile*</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-primary/70">group</span>
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
                <div className="mt-4 pt-4 border-t border-slate-200/50 grid grid-cols-2 gap-2 text-xs text-primary/80 font-medium">
                  <div>
                    <span className="text-[10px] font-bold text-primary/70 block uppercase">Name</span>
                    <span className="text-primary font-bold">{formData.clientName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-primary/70 block uppercase">Contact</span>
                    <span className="text-primary font-bold truncate block">{formData.clientPhone || formData.clientEmail}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6 animate-page-entrance">
              {/* CLIENT FULL NAME */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-primary/80 uppercase tracking-widest ml-1">Client Full Name*</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-primary/70">person</span>
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
                  <label className="text-xs font-bold text-primary/80 uppercase tracking-widest ml-1">Client Email*</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-primary/70">mail</span>
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
                  <label className="text-xs font-bold text-primary/80 uppercase tracking-widest ml-1">Client Phone*</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-primary/70">phone</span>
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
              <label className="text-xs font-bold text-primary/80 uppercase tracking-widest ml-1">Service Treatment</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-primary/70">medical_services</span>
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
              <label className="text-xs font-bold text-primary/80 uppercase tracking-widest ml-1">Promotional Deal</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-primary/70">loyalty</span>
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
            <label className="text-xs font-bold text-primary/80 uppercase tracking-widest ml-1">Appointment Date*</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-primary/70">calendar_today</span>
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
            <label className="text-xs font-bold text-primary/80 uppercase tracking-widest ml-1">Preferred Time Slot*</label>
            {!formData.date ? (
              <div className="p-4 bg-primary rounded-2xl border border-dashed border-slate-200 text-center text-xs text-white/70">
                Please choose an appointment date to reveal timeline windows.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 border border-slate-100 rounded-2xl scrollbar-pro bg-primary">
                {timeSlots.map(t => {
                  const booked = isSlotBooked(t);
                  const selected = formData.time === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormData({...formData, time: t})}
                      disabled={booked}
                      className={`
                        py-3 px-2 rounded-xl text-xs font-bold transition-all border 
                        ${booked ? 'opacity-40 bg-primary border-slate-200 cursor-not-allowed text-white/70' 
                          : selected ? 'bg-primary text-white border-primary shadow-md scale-[1.02]' 
                          : 'bg-primary text-primary border-slate-200 hover:border-primary hover:text-white'}
                      `}
                      style={selected ? { backgroundColor: settings.primaryAccent, borderColor: settings.primaryAccent } : {}}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* STATUS SELECTOR */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-primary/80 uppercase tracking-widest ml-1">Lifecycle Status</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-primary/70">monitoring</span>
              <select 
                required 
                value={formData.status} 
                onChange={e=>setFormData({...formData, status: e.target.value})} 
                className="input-pro pl-12 appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1.2em_1.2em]"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* FAKE BOOKING CHECK */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="fakeBookingMgr"
              checked={formData.isFake || false}
              onChange={e => setFormData({ ...formData, isFake: e.target.checked })}
              className="w-4 h-4 text-primaryAccent border-gray-300 rounded"
            />
            <label htmlFor="fakeBookingMgr" className="text-sm text-primary">Mark as Fake Booking (for testing)</label>
          </div>

          {/* SEND NOTIFICATION TOGGLE */}
          {!editingId && (
            <div className="flex items-center gap-3 p-4 bg-primary rounded-2xl border border-slate-100">
              <input 
                type="checkbox" 
                id="sendNotify" 
                checked={sendNotification} 
                onChange={e => setSendNotification(e.target.checked)} 
                className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
              />
              <label htmlFor="sendNotify" className="text-xs font-bold text-primary select-none cursor-pointer flex-1">
                Dispatch Outbound SMS & Email Notification (Real-time Sync)
              </label>
            </div>
          )}

          {/* LIVE MESSAGE PREVIEW */}
          {!editingId && sendNotification && (
            <div className="bg-slate-950 text-slate-100 rounded-3xl p-6 shadow-xl relative overflow-hidden border border-white/5 font-sans animate-page-entrance">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#E7C8DD]0 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary/70">Live SMS & Email Dispatch Preview</span>
                </div>
                <span className="material-symbols-outlined text-primary/80 text-sm">chat_bubble</span>
              </div>
              <div className="bg-primary/5 rounded-2xl p-4 border border-white/5">
                <p className="text-[10px] font-extrabold text-primary mb-1 tracking-widest uppercase">💬 Outbound Dispatcher</p>
                <p className="text-xs text-slate-200 leading-relaxed font-semibold">
                  {formData.clientName 
                    ? `Dear ${formData.clientName}, your booking for ${serviceTitle} on ${formData.date || '___'} at ${formData.time || '___'} is booked. Thank you for choosing Vlas AESTHETIC!`
                    : "Fill client name & details to generate preview..."}
                </p>
                <span className="block text-[8px] text-right text-primary/80 mt-2 font-bold uppercase tracking-widest">Neural Link Sync • Instant Delivery</span>
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-6">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-sm font-bold text-primary/80 hover:text-primary transition-colors">Cancel</button>
            <button 
              type="submit" 
              className="flex-[2] btn-primary py-4 shadow-xl shadow-rose-sm bg-primary text-white"
            >
              {editingId ? 'Update Appointment' : 'Create Booking'}
            </button>
          </div>
        </form>
      </Modal>

      {/* DISPATCH OVERLAY SCREEN ANIMATION */}
      {dispatchOverlay && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center pointer-events-none p-4">
          <div className="bg-slate-950/90  rounded-[2.5rem] p-8 border border-white/10 shadow-2xl flex flex-col items-center max-w-sm w-full text-center animate-modal-entrance shadow-rose-sm">
            <div className="w-16 h-16 rounded-full bg-[#E7C8DD]0 flex items-center justify-center text-primary mb-4 animate-bounce">
              <span className="material-symbols-outlined text-3xl">sms</span>
            </div>
            <h4 className="text-primary text-lg font-black tracking-tight">Booking Notification Sent</h4>
            <p className="text-primary/70 text-xs mt-2 leading-relaxed font-medium">
              SMS & Email confirmation successfully dispatched to <span className="text-primary font-bold">{formData.clientName}</span>.
            </p>
            <div className="mt-4 bg-primary/5 rounded-2xl p-4 border border-white/5 w-full text-left font-sans">
              <p className="text-[9px] text-primary/80 font-bold uppercase tracking-wider">Outbound Body</p>
              <p className="text-xs text-slate-200 mt-1 italic leading-relaxed font-medium">
                {`"Dear ${formData.clientName}, your booking for ${serviceTitle} on ${formData.date} at ${formData.time} is booked. Thank you for choosing Vlas AESTHETIC!"`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
