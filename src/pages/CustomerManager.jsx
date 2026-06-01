import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import Modal from '../components/Modal';

export default function CustomerManager() {
  const { customers, bookings, fetchCustomers, fetchBookings, addCustomer, updateCustomer, deleteCustomer, settings } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', tier: 'Regular' });
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    fetchCustomers();
    fetchBookings();
  }, [fetchCustomers, fetchBookings]);

  const handleOpenModal = (customer = null) => {
    if (customer) {
      setFormData({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        tier: customer.tier
      });
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

  const getCustomerHistory = (email) => {
    return bookings.filter(b => b.clientDetails?.email === email);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    alert(`Message sent to ${selectedCustomer.name}: ${messageText}`);
    setIsMessageModalOpen(false);
    setMessageText('');
  };

  return (
    <div className="space-y-8">
      {/* Header Area */}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Customer List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card-pro overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-100">
                    <th className="px-8 py-5">Customer Profile</th>
                    <th className="px-8 py-5">Membership Tier</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customers.map((customer) => (
                    <tr 
                      key={customer.id} 
                      onClick={() => setSelectedCustomer(customer)}
                      className={`hover:bg-slate-50/50 transition-colors cursor-pointer group ${selectedCustomer?.id === customer.id ? 'bg-blue-50/30' : ''}`}
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-sm"
                            style={{ backgroundColor: settings.primaryAccent }}
                          >
                            {customer.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{customer.name}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{customer.email || customer.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="badge-active bg-blue-50 text-blue-700 border-blue-100">{customer.tier}</span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleOpenModal(customer); }}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <span className="material-symbols-outlined text-lg">edit</span>
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); if(window.confirm('Delete customer?')) deleteCustomer(customer.id); }}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Details Sidebar */}
        <div className="space-y-6">
          {selectedCustomer ? (
            <div className="card-pro p-8 sticky top-24">
              <div className="flex flex-col items-center text-center mb-8">
                <div 
                  className="w-20 h-20 rounded-3xl flex items-center justify-center text-3xl text-white font-bold shadow-xl mb-4"
                  style={{ backgroundColor: settings.primaryAccent }}
                >
                  {selectedCustomer.name?.charAt(0)}
                </div>
                <h3 className="text-xl font-bold text-slate-900">{selectedCustomer.name}</h3>
                <p className="text-sm text-slate-500 font-medium">{selectedCustomer.tier} Client</p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm">
                    <span className="material-symbols-outlined text-xl">mail</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</p>
                    <p className="text-xs font-bold text-slate-900 truncate">{selectedCustomer.email || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm">
                    <span className="material-symbols-outlined text-xl">phone</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone Number</p>
                    <p className="text-xs font-bold text-slate-900 truncate">{selectedCustomer.phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-100 flex gap-3">
                <button 
                  onClick={() => setIsMessageModalOpen(true)}
                  className="flex-1 btn-primary py-3"
                  style={{ backgroundColor: settings.primaryAccent }}
                >
                  Send Message
                </button>
                <button 
                  onClick={() => setIsHistoryModalOpen(true)}
                  className="flex-1 btn-secondary py-3 text-xs"
                >
                  View History
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
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Customer Full Name</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">person</span>
              <input 
                required 
                value={formData.name} 
                onChange={e=>setFormData({...formData, name: e.target.value})} 
                className="input-pro pl-12" 
                placeholder="e.g. John Doe" 
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">mail</span>
                <input 
                  required 
                  value={formData.email} 
                  onChange={e=>setFormData({...formData, email: e.target.value})} 
                  className="input-pro pl-12" 
                  placeholder="john@example.com" 
                  type="email" 
                />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">phone</span>
                <input 
                  required 
                  value={formData.phone} 
                  onChange={e=>setFormData({...formData, phone: e.target.value})} 
                  className="input-pro pl-12" 
                  placeholder="+1 555 0000" 
                />
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Membership Tier</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">stars</span>
              <select 
                required 
                value={formData.tier} 
                onChange={e=>setFormData({...formData, tier: e.target.value})} 
                className="input-pro pl-12 appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1.2em_1.2em]"
              >
                <option value="Regular">Regular</option>
                <option value="Silver">Silver</option>
                <option value="Gold">Gold</option>
                <option value="VIP Prestige">VIP Prestige</option>
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
              {editingId ? 'Update Profile' : 'Register Customer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* History Modal */}
      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title="Ritual History"
        subtitle={`Complete timeline of treatments for ${selectedCustomer?.name}.`}
      >
        <div className="space-y-6">
          {selectedCustomer && getCustomerHistory(selectedCustomer.email).length > 0 ? (
            getCustomerHistory(selectedCustomer.email).map((booking, i) => (
              <div key={i} className="flex gap-6 items-start p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm border border-slate-100">
                  <span className="material-symbols-outlined">spa</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-slate-900">{booking.serviceName}</h4>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{booking.date}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">schedule</span>
                      {booking.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">payments</span>
                      ${booking.totalPrice}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center">
              <span className="material-symbols-outlined text-4xl text-slate-200 mb-4">history_toggle_off</span>
              <p className="text-sm font-bold text-slate-400">No past treatments found for this client.</p>
            </div>
          )}
          <button 
            onClick={() => setIsHistoryModalOpen(false)}
            className="w-full btn-secondary py-4"
          >
            Close Timeline
          </button>
        </div>
      </Modal>

      {/* Message Modal */}
      <Modal
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
        title="Send Private Message"
        subtitle={`Direct communication axis with ${selectedCustomer?.name}.`}
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
            <button 
              type="submit" 
              className="flex-[2] btn-primary py-4"
              style={{ backgroundColor: settings.primaryAccent }}
            >
              Send via Neural Link
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
