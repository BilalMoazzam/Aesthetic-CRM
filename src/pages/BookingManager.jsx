import React, { useEffect, useState } from 'react';
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
    settings 
  } = useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'pending', 'confirmed', 'completed', 'logs'
  const [sendNotification, setSendNotification] = useState(true);
  const [dispatchOverlay, setDispatchOverlay] = useState(false);

  const [formData, setFormData] = useState({ 
    clientName: '', 
    clientEmail: '', 
    clientPhone: '', 
    serviceId: '', 
    date: '', 
    time: '', 
    status: 'confirmed' 
  });

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
        date: booking.date || '',
        time: booking.time || '',
        status: booking.status || 'confirmed'
      });
      setEditingId(booking.id);
    } else {
      setFormData({ 
        clientName: '', 
        clientEmail: '', 
        clientPhone: '', 
        serviceId: '', 
        date: '', 
        time: '', 
        status: 'confirmed' 
      });
      setEditingId(null);
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
      status: formData.status
    };

    if (editingId) {
      updateBooking(editingId, bookingData);
    } else {
      addBooking(bookingData);

      if (sendNotification) {
        const smsMessage = `Dear ${formData.clientName}, your booking for ${serviceTitle} on ${formData.date} at ${formData.time} is booked. Thank you for choosing VLAS!`;
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
  });

  const selectedService = services.find(s => s.id === formData.serviceId);
  const serviceTitle = selectedService ? selectedService.title : 'Signature Protocol';

  return (
    <div className="space-y-8 relative">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Booking Management</h1>
          <p className="text-slate-500 text-sm mt-1">Review, approve, and manage all client appointments.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          className="btn-primary shadow-lg shadow-blue-100 w-full md:w-auto"
          style={{ backgroundColor: settings.primaryAccent }}
        >
          <span className="material-symbols-outlined text-xl">add_circle</span>
          New Appointment
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 md:gap-8 overflow-x-auto scrollbar-hide">
        <button 
          onClick={() => setActiveTab('all')} 
          className={`pb-4 px-2 text-sm font-bold whitespace-nowrap border-b-2 transition-all ${activeTab === 'all' ? 'text-blue-600 border-blue-600' : 'text-slate-500 border-transparent hover:text-slate-700'}`}
        >
          All Bookings
        </button>
        <button 
          onClick={() => setActiveTab('pending')} 
          className={`pb-4 px-2 text-sm font-bold whitespace-nowrap border-b-2 transition-all ${activeTab === 'pending' ? 'text-blue-600 border-blue-600' : 'text-slate-500 border-transparent hover:text-slate-700'}`}
        >
          Pending
        </button>
        <button 
          onClick={() => setActiveTab('confirmed')} 
          className={`pb-4 px-2 text-sm font-bold whitespace-nowrap border-b-2 transition-all ${activeTab === 'confirmed' ? 'text-blue-600 border-blue-600' : 'text-slate-500 border-transparent hover:text-slate-700'}`}
        >
          Confirmed
        </button>
        <button 
          onClick={() => setActiveTab('completed')} 
          className={`pb-4 px-2 text-sm font-bold whitespace-nowrap border-b-2 transition-all ${activeTab === 'completed' ? 'text-blue-600 border-blue-600' : 'text-slate-500 border-transparent hover:text-slate-700'}`}
        >
          Completed
        </button>
        <button 
          onClick={() => setActiveTab('logs')} 
          className={`pb-4 px-2 text-sm font-bold whitespace-nowrap border-b-2 transition-all ${activeTab === 'logs' ? 'text-blue-600 border-blue-600' : 'text-slate-500 border-transparent hover:text-slate-700'}`}
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
                <tr className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-100">
                  <th className="px-8 py-5">Client Profile</th>
                  <th className="px-8 py-5">Message Type</th>
                  <th className="px-8 py-5">Content Dispatched</th>
                  <th className="px-8 py-5">Timestamp</th>
                  <th className="px-8 py-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {messages && messages.map((msg) => (
                  <tr key={msg.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{msg.clientName}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{msg.clientPhone || msg.clientEmail}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">{msg.messageType}</span>
                    </td>
                    <td className="px-8 py-6 max-w-xs">
                      <p className="text-xs text-slate-600 leading-relaxed font-medium break-words" title={msg.content}>
                        {msg.content}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-xs font-medium text-slate-500 whitespace-nowrap">{msg.timestamp}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        {msg.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {(!messages || messages.length === 0) && (
                  <tr>
                    <td colSpan="5" className="px-8 py-20 text-center text-slate-400 text-sm italic">
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
                <tr className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-100">
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
                    <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div>
                          <p className="text-sm font-bold text-slate-900">{booking.clientDetails?.name || 'Anonymous'}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{serviceName}</p>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm font-medium text-slate-700">{booking.date}</p>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">{booking.time}</span>
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
                              className="w-9 h-9 flex items-center justify-center rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                              title="Confirm"
                            >
                              <span className="material-symbols-outlined text-xl">check_circle</span>
                            </button>
                          )}
                          <button 
                            onClick={() => handleOpenModal(booking)}
                            className="w-9 h-9 flex items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit"
                          >
                            <span className="material-symbols-outlined text-xl">edit</span>
                          </button>
                          <button 
                            onClick={() => { if(window.confirm('Delete this booking?')) deleteBooking(booking.id); }}
                            className="w-9 h-9 flex items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
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
                    <td colSpan="5" className="px-8 py-20 text-center text-slate-400 text-sm italic">
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
          
          {/* OPTIONAL CUSTOMER SELECTOR */}
          {!editingId && (
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Assign Existing Client (Optional)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">group</span>
                <select 
                  onChange={e => handleSelectCustomer(e.target.value)} 
                  className="input-pro pl-12 appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1.2em_1.2em]"
                >
                  <option value="">-- Create Custom / New Client --</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email || c.phone || 'No Contact'})</option>)}
                </select>
              </div>
            </div>
          )}

          {/* CLIENT FULL NAME */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Client Full Name</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">person</span>
              <input 
                required 
                value={formData.clientName} 
                onChange={e=>setFormData({...formData, clientName: e.target.value})} 
                className="input-pro pl-12" 
                placeholder="e.g. John Doe" 
              />
            </div>
          </div>

          {/* CONTACT INFO: EMAIL & PHONE (RESPONSIVE GRID) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Client Email</label>
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
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Client Phone</label>
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

          {/* SERVICE SELECTOR */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Service Treatment</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">medical_services</span>
              <select 
                required 
                value={formData.serviceId} 
                onChange={e=>setFormData({...formData, serviceId: e.target.value})} 
                className="input-pro pl-12 appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1.2em_1.2em]"
              >
                <option value="">Select a service</option>
                {services.map(s => <option key={s.id} value={s.id}>{s.title} (${s.price})</option>)}
              </select>
            </div>
          </div>

          {/* APPOINTMENT DATE & TIME (RESPONSIVE GRID) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Appointment Date</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">calendar_today</span>
                <input 
                  required 
                  value={formData.date} 
                  onChange={e=>setFormData({...formData, date: e.target.value})} 
                  className="input-pro pl-12" 
                  type="date" 
                />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Appointment Time</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">schedule</span>
                <input 
                  required 
                  value={formData.time} 
                  onChange={e=>setFormData({...formData, time: e.target.value})} 
                  className="input-pro pl-12" 
                  placeholder="e.g. 10:00 AM" 
                />
              </div>
            </div>
          </div>

          {/* STATUS SELECTOR */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Lifecycle Status</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">monitoring</span>
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

          {/* SEND NOTIFICATION TOGGLE */}
          {!editingId && (
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <input 
                type="checkbox" 
                id="sendNotify" 
                checked={sendNotification} 
                onChange={e => setSendNotification(e.target.checked)} 
                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="sendNotify" className="text-xs font-bold text-slate-700 select-none cursor-pointer flex-1">
                Dispatch Outbound SMS & Email Notification (Real-time Sync)
              </label>
            </div>
          )}

          {/* LIVE MESSAGE PREVIEW */}
          {!editingId && sendNotification && (
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
                    ? `Dear ${formData.clientName}, your booking for ${serviceTitle} on ${formData.date || '___'} at ${formData.time || '___'} is booked. Thank you for choosing VLAS!`
                    : "Fill client name & details to generate preview..."}
                </p>
                <span className="block text-[8px] text-right text-slate-500 mt-2 font-bold uppercase tracking-widest">Neural Link Sync • Instant Delivery</span>
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-6">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">Cancel</button>
            <button 
              type="submit" 
              className="flex-[2] btn-primary py-4 shadow-xl shadow-blue-100"
              style={{ backgroundColor: settings.primaryAccent }}
            >
              {editingId ? 'Update Appointment' : 'Create Booking'}
            </button>
          </div>
        </form>
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
                "Dear {formData.clientName}, your booking for {serviceTitle} on {formData.date} at {formData.time} is booked. Thank you for choosing VLAS!"
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
