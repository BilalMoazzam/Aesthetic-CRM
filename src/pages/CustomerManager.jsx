import React, { useEffect, useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import Modal from '../components/Modal';

const TIER_COLORS = {
  Regular:       { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
  Silver:        { bg: 'bg-gray-100',  text: 'text-gray-700',  border: 'border-gray-200' },
  Gold:          { bg: 'bg-amber-50',  text: 'text-amber-700', border: 'border-amber-200' },
  'VIP Prestige':{ bg: 'bg-purple-50', text: 'text-purple-700',border: 'border-purple-200' },
  Standard:      { bg: 'bg-blue-50',   text: 'text-blue-700',  border: 'border-blue-200' },
  Elite:         { bg: 'bg-rose-50',   text: 'text-rose-700',  border: 'border-rose-200' },
};

const STATUS_COLORS = {
  confirmed:  { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  pending:    { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-400' },
  completed:  { bg: 'bg-blue-50',    text: 'text-blue-700',    dot: 'bg-blue-500' },
  cancelled:  { bg: 'bg-rose-50',    text: 'text-rose-700',    dot: 'bg-rose-500' },
  'no-show':  { bg: 'bg-slate-100',  text: 'text-slate-500',   dot: 'bg-slate-400' },
};

export default function CustomerManager() {
  const { customers, bookings, services, fetchCustomers, fetchBookings, fetchServices, addCustomer, updateCustomer, deleteCustomer, settings } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', tier: 'Regular' });
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCustomers();
    fetchBookings();
    fetchServices();
  }, [fetchCustomers, fetchBookings, fetchServices]);

  // Match bookings to a customer by email, phone, or name
  const getCustomerBookings = (customer) => {
    return bookings.filter(b => {
      const cd = b.clientDetails || {};
      if (customer.email && cd.email && cd.email.toLowerCase() === customer.email.toLowerCase()) return true;
      if (customer.phone && cd.phone && cd.phone.replace(/\D/g,'') === customer.phone.replace(/\D/g,'') && cd.phone.replace(/\D/g,'').length > 3) return true;
      if (customer.name && cd.name && cd.name.toLowerCase() === customer.name.toLowerCase()) return true;
      return false;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const getServiceName = (booking) => {
    if (booking.serviceName) return booking.serviceName;
    if (booking.cartItems) return booking.cartItems.map(i => i.name).join(' + ');
    const s = services.find(x => x.id === booking.serviceId);
    return s ? s.title : 'Signature Protocol';
  };

  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers;
    const q = searchQuery.toLowerCase();
    return customers.filter(c =>
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.includes(q)
    );
  }, [customers, searchQuery]);

  const handleOpenModal = (customer = null) => {
    if (customer) {
      setFormData({ name: customer.name, email: customer.email, phone: customer.phone, tier: customer.tier });
      setEditingId(customer.id);
    } else {
      setFormData({ name: '', email: '', phone: '', tier: 'Regular' });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      updateCustomer(editingId, formData);
    } else {
      addCustomer(formData);
    }
    setIsModalOpen(false);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    alert(`Message sent to ${selectedCustomer.name}: ${messageText}`);
    setIsMessageModalOpen(false);
    setMessageText('');
  };

  const selectedBookings = selectedCustomer ? getCustomerBookings(selectedCustomer) : [];
  const totalSpend = selectedBookings.reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Customer Relationship Manager</h1>
          <p className="text-slate-500 text-sm mt-1">Manage client profiles, membership tiers, and interaction history.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary shadow-lg shadow-blue-100"
          style={{ backgroundColor: settings.primaryAccent }}
        >
          <span className="material-symbols-outlined text-xl">person_add</span>
          Add New Customer
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-lg">search</span>
        <input
          type="text"
          className="input-pro pl-12 text-sm"
          placeholder="Search by name, email, or phone…"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Customer List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card-pro overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-100">
                    <th className="px-6 py-5">Customer Profile</th>
                    <th className="px-6 py-5">Booking History</th>
                    <th className="px-6 py-5">Tier</th>
                    <th className="px-6 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCustomers.map((customer) => {
                    const custBookings = getCustomerBookings(customer);
                    const recent = custBookings[0];
                    const tierStyle = TIER_COLORS[customer.tier] || TIER_COLORS.Regular;
                    return (
                      <tr
                        key={customer.id}
                        onClick={() => setSelectedCustomer(customer)}
                        className={`hover:bg-slate-50/50 transition-colors cursor-pointer ${selectedCustomer?.id === customer.id ? 'bg-blue-50/40' : ''}`}
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0"
                              style={{ backgroundColor: settings.primaryAccent }}
                            >
                              {customer.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">{customer.name}</p>
                              <p className="text-xs text-slate-400 mt-0.5">{customer.email || customer.phone || '—'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          {custBookings.length > 0 ? (
                            <div className="space-y-1.5">
                              <div className="text-xs font-bold text-slate-700">
                                {custBookings.length} booking{custBookings.length !== 1 ? 's' : ''}
                              </div>
                              {recent && (
                                <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
                                  <span className={`w-1.5 h-1.5 rounded-full ${STATUS_COLORS[recent.status]?.dot || 'bg-slate-400'}`} />
                                  {recent.date} · {recent.time} ({recent.status})
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">No bookings yet</span>
                          )}
                        </td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${tierStyle.bg} ${tierStyle.text} ${tierStyle.border}`}>
                            {customer.tier || 'Regular'}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleOpenModal(customer); }}
                              className="w-8 h-8 flex items-center justify-center rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                              title="Edit"
                            >
                              <span className="material-symbols-outlined text-lg">edit</span>
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); if (window.confirm('Delete customer?')) deleteCustomer(customer.id); }}
                              className="w-8 h-8 flex items-center justify-center rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
                              title="Delete"
                            >
                              <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredCustomers.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-8 py-20 text-center text-slate-400 text-sm italic">
                        No customers found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Details Sidebar */}
        <div className="space-y-6">
          {selectedCustomer ? (
            <div className="card-pro p-8 sticky top-24 space-y-6">
              {/* Avatar + name */}
              <div className="flex flex-col items-center text-center">
                <div
                  className="w-20 h-20 rounded-3xl flex items-center justify-center text-3xl text-white font-bold shadow-xl mb-4"
                  style={{ backgroundColor: settings.primaryAccent }}
                >
                  {selectedCustomer.name?.charAt(0)?.toUpperCase()}
                </div>
                <h3 className="text-xl font-bold text-slate-900">{selectedCustomer.name}</h3>
                <span className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${(TIER_COLORS[selectedCustomer.tier] || TIER_COLORS.Regular).bg} ${(TIER_COLORS[selectedCustomer.tier] || TIER_COLORS.Regular).text} ${(TIER_COLORS[selectedCustomer.tier] || TIER_COLORS.Regular).border}`}>
                  {selectedCustomer.tier || 'Regular'} Member
                </span>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
                  <p className="text-2xl font-black text-slate-900">{selectedBookings.length}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Total Bookings</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
                  <p className="text-2xl font-black text-slate-900">${totalSpend}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Total Spend</p>
                </div>
              </div>

              {/* Contact info */}
              <div className="space-y-3">
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm shrink-0">
                    <span className="material-symbols-outlined text-lg">mail</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</p>
                    <p className="text-xs font-bold text-slate-900 truncate">{selectedCustomer.email || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm shrink-0">
                    <span className="material-symbols-outlined text-lg">phone</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone</p>
                    <p className="text-xs font-bold text-slate-900 truncate">{selectedCustomer.phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Recent bookings preview */}
              {selectedBookings.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Recent Appointments</p>
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1 custom-scrollbar">
                    {selectedBookings.slice(0, 4).map((b, i) => {
                      const sc = STATUS_COLORS[b.status] || STATUS_COLORS.pending;
                      return (
                        <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${sc.bg}`}>
                          <span className={`w-2 h-2 rounded-full shrink-0 ${sc.dot}`} />
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-bold text-slate-800 truncate">{getServiceName(b)}</p>
                            <p className="text-[10px] text-slate-500">{b.date} · {b.time}</p>
                          </div>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${sc.bg} ${sc.text} border border-current/10 shrink-0`}>
                            {b.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setIsMessageModalOpen(true)}
                  className="flex-1 btn-primary py-3 text-sm"
                  style={{ backgroundColor: settings.primaryAccent }}
                >
                  Message
                </button>
                <button
                  onClick={() => setIsHistoryModalOpen(true)}
                  className="flex-1 btn-secondary py-3 text-xs"
                >
                  Full History
                </button>
              </div>
            </div>
          ) : (
            <div className="card-pro p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-4">
                <span className="material-symbols-outlined text-4xl">contact_page</span>
              </div>
              <p className="text-sm font-bold text-slate-400">Select a client to view full profile details and history.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Customer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Customer Profile' : 'New Customer Registration'}
        subtitle="Maintain accurate client records for personalized service delivery."
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name*</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">person</span>
              <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="input-pro pl-12" placeholder="e.g. John Doe" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">mail</span>
                <input value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="input-pro pl-12" placeholder="john@example.com" type="email" />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">phone</span>
                <input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="input-pro pl-12" placeholder="+1 555 0000" />
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Membership Tier</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">stars</span>
              <select required value={formData.tier} onChange={e => setFormData({ ...formData, tier: e.target.value })} className="input-pro pl-12 appearance-none">
                <option value="Regular">Regular</option>
                <option value="Silver">Silver</option>
                <option value="Gold">Gold</option>
                <option value="VIP Prestige">VIP Prestige</option>
                <option value="Elite">Elite</option>
              </select>
            </div>
          </div>
          <div className="flex gap-6 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">Cancel</button>
            <button type="submit" className="flex-[2] btn-primary py-4 shadow-xl shadow-blue-100" style={{ backgroundColor: settings.primaryAccent }}>
              {editingId ? 'Update Profile' : 'Register Customer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Full History Modal */}
      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title="Complete Booking History"
        subtitle={`All appointments for ${selectedCustomer?.name}.`}
      >
        <div className="space-y-4">
          {selectedBookings.length > 0 ? (
            <>
              {/* Summary bar */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
                  <p className="text-xl font-black text-slate-900">{selectedBookings.length}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bookings</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
                  <p className="text-xl font-black text-slate-900">${totalSpend}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Spend</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
                  <p className="text-xl font-black text-slate-900">{selectedBookings.filter(b => b.status === 'completed').length}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completed</p>
                </div>
              </div>
              {/* Booking list */}
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                {selectedBookings.map((booking, i) => {
                  const sc = STATUS_COLORS[booking.status] || STATUS_COLORS.pending;
                  const svcName = getServiceName(booking);
                  return (
                    <div key={i} className={`flex gap-5 items-start p-5 rounded-2xl border ${sc.bg}`}>
                      <div className={`w-11 h-11 rounded-xl bg-white flex items-center justify-center shadow-sm border border-current/10 shrink-0`}>
                        <span className="material-symbols-outlined text-slate-500">spa</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-4 mb-1">
                          <h4 className="font-bold text-slate-900 text-sm truncate">{svcName}</h4>
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${sc.bg} ${sc.text} border border-current/10`}>
                            {booking.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">calendar_today</span>
                            {booking.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">schedule</span>
                            {booking.time}
                          </span>
                          {booking.totalPrice > 0 && (
                            <span className="flex items-center gap-1 font-bold text-slate-700">
                              <span className="material-symbols-outlined text-sm">payments</span>
                              ${booking.totalPrice}
                            </span>
                          )}
                          {booking.isFake && (
                            <span className="text-[9px] font-bold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full border border-orange-200">TEST</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="py-20 text-center">
              <span className="material-symbols-outlined text-5xl text-slate-200 block mb-4">history_toggle_off</span>
              <p className="text-sm font-bold text-slate-400">No appointments found for this client.</p>
            </div>
          )}
          <button onClick={() => setIsHistoryModalOpen(false)} className="w-full btn-secondary py-4 mt-4">
            Close
          </button>
        </div>
      </Modal>

      {/* Message Modal */}
      <Modal
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
        title="Send Message"
        subtitle={`Direct communication with ${selectedCustomer?.name}.`}
      >
        <form onSubmit={handleSendMessage} className="space-y-6">
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Message Content</label>
            <textarea
              required
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="input-pro h-40 pt-4 resize-none"
              placeholder="Enter your message here..."
            />
          </div>
          <div className="flex gap-6">
            <button type="button" onClick={() => setIsMessageModalOpen(false)} className="flex-1 py-4 text-sm font-bold text-slate-500">Cancel</button>
            <button type="submit" className="flex-[2] btn-primary py-4" style={{ backgroundColor: settings.primaryAccent }}>
              Send via Neural Link
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
