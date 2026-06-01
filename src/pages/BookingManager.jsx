import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import Modal from '../components/Modal';

export default function BookingManager() {
  const { bookings, services, fetchBookings, fetchServices, addBooking, updateBooking, deleteBooking, settings } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ clientName: '', serviceId: '', date: '', time: '', status: 'pending' });

  useEffect(() => {
    fetchBookings();
    fetchServices();
  }, [fetchBookings, fetchServices]);

  const handleOpenModal = (booking = null) => {
    if (booking) {
      setFormData({
        clientName: booking.clientDetails?.name || '',
        serviceId: booking.serviceId,
        date: booking.date,
        time: booking.time,
        status: booking.status
      });
      setEditingId(booking.id);
    } else {
      setFormData({ clientName: '', serviceId: '', date: '', time: '', status: 'pending' });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const bookingData = {
      clientDetails: { name: formData.clientName },
      serviceId: formData.serviceId,
      date: formData.date,
      time: formData.time,
      status: formData.status
    };

    if (editingId) {
      updateBooking(editingId, bookingData);
    } else {
      addBooking(bookingData);
    }
    setIsModalOpen(false);
  };

  const getServiceLabel = (booking) => {
    if (booking.serviceName) return booking.serviceName;
    if (booking.cartItems) return booking.cartItems.map(i => i.name).join(' + ');
    const service = services.find(s => s.id === booking.serviceId);
    return service ? service.title : 'Signature Protocol';
  };

  return (
    <div className="space-y-8">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Booking Management</h1>
          <p className="text-slate-500 text-sm mt-1">Review, approve, and manage all client appointments.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          className="btn-primary shadow-lg shadow-blue-100"
          style={{ backgroundColor: settings.primaryAccent }}
        >
          <span className="material-symbols-outlined text-xl">add_circle</span>
          New Appointment
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-8 overflow-x-auto">
        <button className="pb-4 px-2 text-sm font-bold text-blue-600 border-b-2 border-blue-600">All Bookings</button>
        <button className="pb-4 px-2 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">Pending</button>
        <button className="pb-4 px-2 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">Confirmed</button>
        <button className="pb-4 px-2 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">Completed</button>
      </div>

      {/* Bookings Table */}
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
              {bookings.map((booking) => {
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
              {bookings.length === 0 && (
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

      {/* Add/Edit Booking Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Appointment' : 'New Appointment'}
        subtitle="Manage individual appointment records and their current lifecycle status."
      >
        <form onSubmit={handleSubmit} className="space-y-8">
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
                  type="time" 
                />
              </div>
            </div>
          </div>
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
          <div className="flex gap-6 pt-6">
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
    </div>
  );
}
