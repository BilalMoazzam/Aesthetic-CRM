import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import Modal from '../components/Modal';

export default function VoucherManager() {
  const { vouchers, customers, fetchVouchers, fetchCustomers, addVoucher, updateVoucher, deleteVoucher, settings } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [formData, setFormData] = useState({ code: '', type: 'Percentage', value: '', expiryDate: '', usageLimit: '', status: 'active', assignedClientId: '' });
  const [editingId, setEditingId] = useState(null);
  const [selectedVoucher, setSelectedVoucher] = useState(null);

  useEffect(() => {
    fetchVouchers();
    fetchCustomers();
  }, [fetchVouchers, fetchCustomers]);

  const handleOpenModal = (voucher = null) => {
    if (voucher) {
      setFormData(voucher);
      setEditingId(voucher.id);
    } else {
      setFormData({ code: '', type: 'Percentage', value: '', expiryDate: '', usageLimit: '', status: 'active', assignedClientId: '' });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      updateVoucher(editingId, formData);
    } else {
      addVoucher(formData);
    }
    setIsModalOpen(false);
  };

  const handleAssignVoucher = (clientId) => {
    updateVoucher(selectedVoucher.id, { ...selectedVoucher, assignedClientId: clientId });
    alert(`Voucher ${selectedVoucher.code} successfully assigned to ${customers.find(c => c.id === clientId)?.name}`);
    setIsAssignModalOpen(false);
  };

  const getClientName = (id) => {
    const customer = customers.find(c => c.id === id);
    return customer ? customer.name : 'Global';
  };

  return (
    <div className="space-y-10">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Voucher Management</h1>
          <p className="text-slate-500 text-sm mt-1">Generate and manage promotional discount codes for client acquisition.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          className="btn-primary shadow-lg shadow-blue-100"
          style={{ backgroundColor: settings.primaryAccent }}
        >
          <span className="material-symbols-outlined text-xl">add_card</span>
          Issue New Voucher
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
        {/* Statistics Cards */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-pro p-8 bg-gradient-to-br from-blue-600 to-blue-700 text-white border-none shadow-xl shadow-blue-100" style={{ background: `linear-gradient(135deg, ${settings.primaryAccent}, ${settings.primaryAccent}cc)` }}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-100 opacity-80">Total Vouchers Issued</p>
            <h3 className="text-4xl font-black mt-2">{vouchers.length}</h3>
          </div>
          <div className="card-pro p-8 bg-white flex flex-col justify-between">
            <div>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Targeted Vouchers</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2">
                {vouchers.filter(v => v.assignedClientId).length}
              </h3>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-4">Vouchers assigned to specific high-tier clients.</p>
          </div>
          <div className="card-pro p-8 bg-white flex flex-col justify-between">
            <div>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Active Vouchers</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2">
                {vouchers.filter(v => v.status === 'active').length}
              </h3>
            </div>
          </div>
        </div>

        {/* Voucher List */}
        <div className="lg:col-span-3 card-pro overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-100">
                  <th className="px-8 py-5">Voucher Code</th>
                  <th className="px-8 py-5">Value</th>
                  <th className="px-8 py-5">Expiry Date</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5">Assigned To</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vouchers.map((voucher) => (
                  <tr key={voucher.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                          <span className="material-symbols-outlined">confirmation_number</span>
                        </div>
                        <span className="text-sm font-black text-slate-900 tracking-widest">{voucher.code}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-bold text-blue-600" style={{ color: settings.primaryAccent }}>
                        {voucher.type === 'Percentage' ? `${voucher.value}% OFF` : `$${voucher.value} OFF`}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-medium text-slate-700">{voucher.expiryDate}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`badge-${voucher.status}`}>{voucher.status}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${voucher.assignedClientId ? 'text-slate-900' : 'text-slate-400 italic'}`}>
                          {getClientName(voucher.assignedClientId)}
                        </span>
                        <button 
                          onClick={() => { setSelectedVoucher(voucher); setIsAssignModalOpen(true); }}
                          className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          title="Assign to client"
                        >
                          <span className="material-symbols-outlined text-sm">person_add</span>
                        </button>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenModal(voucher)}
                          className="w-9 h-9 flex items-center justify-center rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                          title="Edit voucher"
                        >
                          <span className="material-symbols-outlined text-xl">edit</span>
                        </button>
                        <button 
                          onClick={() => { if(window.confirm('Delete voucher?')) deleteVoucher(voucher.id); }}
                          className="w-9 h-9 flex items-center justify-center rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
                          title="Delete voucher"
                        >
                          <span className="material-symbols-outlined text-xl">delete</span>
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

      {/* Add/Edit Voucher Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Modify Voucher Terms' : 'Generate New Discount Code'}
        subtitle="Configure the discount parameters and redemption constraints."
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Voucher Code*</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">qr_code</span>
              <input required value={formData.code} onChange={e=>setFormData({...formData, code: e.target.value.toUpperCase()})} className="input-pro pl-12 font-mono tracking-widest" placeholder="e.g. SUMMER24" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Discount Type</label>
              <select 
                required 
                value={formData.type} 
                onChange={e=>setFormData({...formData, type: e.target.value})} 
                className="input-pro appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1.2em_1.2em]"
              >
                <option value="Percentage">Percentage (%)</option>
                <option value="Fixed">Fixed Amount ($)</option>
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Discount Value*</label>
              <input required type="number" value={formData.value} onChange={e=>setFormData({...formData, value: e.target.value})} className="input-pro" placeholder="e.g. 15" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Expiry Date*</label>
              <input required type="date" value={formData.expiryDate} onChange={e=>setFormData({...formData, expiryDate: e.target.value})} className="input-pro" />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Assigned Client (Optional)</label>
              <select 
                value={formData.assignedClientId} 
                onChange={e=>setFormData({...formData, assignedClientId: e.target.value})} 
                className="input-pro appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1.2em_1.2em]"
              >
                <option value="">Global (All Clients)</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
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
              {editingId ? 'Update Terms' : 'Issue Voucher'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Quick Assign Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Quick Assign Voucher"
        subtitle={`Select a client to link with voucher ${selectedVoucher?.code}.`}
      >
        <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
          {customers.map(customer => (
            <div 
              key={customer.id}
              onClick={() => handleAssignVoucher(customer.id)}
              className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-primary hover:bg-blue-50 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-primary font-bold text-xs shadow-sm border border-slate-100 group-hover:bg-primary group-hover:text-white transition-all">
                  {customer.name?.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{customer.name}</p>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">{customer.tier}</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors">add_circle</span>
            </div>
          ))}
          {customers.length === 0 && <p className="text-center py-10 text-slate-400 italic">No customers found Axis.</p>}
        </div>
      </Modal>
    </div>
  );
}
