import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import Modal from '../components/Modal';

export default function DealsManager() {
  const { deals, fetchDeals, addDeal, updateDeal, deleteDeal, settings, uploadImage } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', originalPrice: '', discountPrice: '', duration: '', image: '', status: 'Active' });
  const [editingId, setEditingId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  const handleOpenModal = (deal = null) => {
    if (deal) {
      setFormData(deal);
      setEditingId(deal.id);
    } else {
      setFormData({ title: '', description: '', originalPrice: '', discountPrice: '', duration: '', image: '', status: 'Active' });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsUploading(true);
    try {
      const imageUrl = await uploadImage(file);
      setFormData({ ...formData, image: imageUrl });
    } catch (err) {
      alert("Upload failed. Make sure the upload server is running on port 3001.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      updateDeal(editingId, formData);
    } else {
      addDeal(formData);
    }
    setIsModalOpen(false);
  };

  // Stats
  const activeDeals = deals.filter(d => d.status === 'Active').length;
  const avgDiscount = deals.length > 0 
    ? Math.round(deals.reduce((acc, d) => {
        const orig = Number(d.originalPrice) || 0;
        const disc = Number(d.discountPrice) || 0;
        if (orig === 0) return acc;
        return acc + ((orig - disc) / orig * 100);
      }, 0) / deals.length) 
    : 0;

  return (
    <div className="space-y-10">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Promotional Bundles & Deals</h1>
          <p className="text-primary/80 text-sm mt-1">Design attractive service packages and limited-time offers.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          className="btn-primary shadow-lg shadow-rose-sm bg-primary text-white"
        >
          <span className="material-symbols-outlined text-xl">loyalty</span>
          Create New Deal
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-pro p-6 flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-[#E7C8DD] text-white flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl">local_fire_department</span>
          </div>
          <div>
            <p className="text-primary/80 text-xs font-bold uppercase tracking-widest">Active Deals</p>
            <h3 className="text-2xl font-bold text-primary mt-1">{activeDeals}</h3>
          </div>
        </div>
        <div className="card-pro p-6 flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-[#E7C8DD] text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl">percent</span>
          </div>
          <div>
            <p className="text-primary/80 text-xs font-bold uppercase tracking-widest">Avg. Savings</p>
            <h3 className="text-2xl font-bold text-primary mt-1">{avgDiscount}%</h3>
          </div>
        </div>
        <div className="card-pro p-6 flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-[#E7C8DD] text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl">group</span>
          </div>
          <div>
            <p className="text-primary/80 text-xs font-bold uppercase tracking-widest">Total Redemptions</p>
            <h3 className="text-2xl font-bold text-primary mt-1">248</h3>
          </div>
        </div>
      </div>

      {/* Deals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-20">
        {deals.map((deal) => {
          const orig = Number(deal.originalPrice) || 0;
          const disc = Number(deal.discountPrice) || 0;
          const discountPct = orig > 0 ? Math.round((orig - disc) / orig * 100) : 0;
          
          return (
            <div key={deal.id} className="card-pro group overflow-hidden flex flex-col md:flex-row h-full">
              <div className="md:w-1/3 relative h-48 md:h-auto bg-primary">
                {deal.image ? (
                  <img src={deal.image} alt={deal.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <span className="material-symbols-outlined text-4xl">broken_image</span>
                  </div>
                )}
                <div className="absolute top-4 left-4 badge-active bg-primary text-white border-none shadow-lg bg-primary text-white">
                  {discountPct}% OFF
                </div>
              </div>
              <div className="md:w-2/3 p-8 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">{deal.title}</h3>
                    <p className="text-sm text-primary/80 mt-1">{deal.duration}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-primary/70 line-through font-bold">${deal.originalPrice}</p>
                    <p className="text-2xl font-black text-primary text-primary">${deal.discountPrice}</p>
                  </div>
                </div>
                <p className="text-sm text-primary/80 line-clamp-2 mb-8 flex-1">{deal.description}</p>
                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                  <span className={`badge-${deal.status === 'Active' ? 'active' : 'inactive'}`}>{deal.status}</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleOpenModal(deal)}
                      className="w-10 h-10 flex items-center justify-center rounded-xl text-primary bg-[#E7C8DD] hover:bg-[#DBAFC1] transition-colors"
                      title="Edit deal"
                    >
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                    <button 
                      onClick={() => { if(window.confirm('Delete deal?')) deleteDeal(deal.id); }}
                      className="w-10 h-10 flex items-center justify-center rounded-xl text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
                      title="Delete deal"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Deal Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Promotional Deal' : 'New Bundle Creation'}
        subtitle="Combine multiple treatments into high-value bundles for your clients."
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <label className="text-xs font-bold text-primary/80 uppercase tracking-widest ml-1">Deal Title*</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-primary/70">loyalty</span>
              <input required type="text" value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} className="input-pro pl-12" placeholder="e.g. Refresh & Renew Bundle" />
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-xs font-bold text-primary/80 uppercase tracking-widest ml-1">Marketing Description</label>
            <div className="relative">
              <span className="absolute left-4 top-4 material-symbols-outlined text-primary/70">description</span>
              <textarea rows="2" value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} className="input-pro pl-12 pt-4 resize-none" placeholder="Briefly describe what's included and the benefits..." />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="text-xs font-bold text-primary/80 uppercase tracking-widest ml-1">Original Value ($)*</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-primary/70">payments</span>
                <input required type="number" value={formData.originalPrice} onChange={e=>setFormData({...formData, originalPrice: e.target.value})} className="input-pro pl-12" placeholder="200" />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-xs font-bold text-primary/80 uppercase tracking-widest ml-1">Deal Price ($)*</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-primary/70">sell</span>
                <input required type="number" value={formData.discountPrice} onChange={e=>setFormData({...formData, discountPrice: e.target.value})} className="input-pro pl-12" placeholder="149" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="text-xs font-bold text-primary/80 uppercase tracking-widest ml-1">Bundle Duration*</label>
              <div className="relative flex items-center">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-primary/70">timer</span>
                <input 
                  required 
                  type="number" 
                  min="1" 
                  value={formData.duration ? formData.duration.replace(/\D/g, '') : ''} 
                  onChange={e=>setFormData({...formData, duration: e.target.value ? `${e.target.value} min` : ''})} 
                  className="input-pro pl-12 pr-20" 
                  placeholder="90" 
                />
                <span className="absolute right-4 text-xs font-bold text-primary/70 uppercase">minutes</span>
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-xs font-bold text-primary/80 uppercase tracking-widest ml-1">Operational Status</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-primary/70">sync</span>
                <select 
                  value={formData.status} 
                  onChange={e=>setFormData({...formData, status: e.target.value})} 
                  className="input-pro pl-12 appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1.2em_1.2em]"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-xs font-bold text-primary/80 uppercase tracking-widest ml-1">Hero Image</label>
            <div className="flex flex-col gap-4">
              <div className="relative group cursor-pointer border-2 border-dashed border-slate-200 rounded-2xl p-4 hover:border-primary transition-colors">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <div className="flex items-center justify-center gap-4 py-2">
                  <div className="w-10 h-10 rounded-full bg-[#E7C8DD] flex items-center justify-center text-primary">
                    {isUploading ? (
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <span className="material-symbols-outlined">cloud_upload</span>
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-primary">Upload from system</p>
                    <p className="text-[10px] text-primary/70 uppercase tracking-widest">JPG, PNG, WEBP (Max 5MB)</p>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-primary/70">link</span>
                <input 
                  type="text" 
                  value={formData.image} 
                  onChange={e=>setFormData({...formData, image: e.target.value})} 
                  className="input-pro pl-12" 
                  placeholder="...or paste an external image URL" 
                />
              </div>
            </div>
          </div>
          
          <div className="flex gap-6 pt-6">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-sm font-bold text-primary/80 hover:text-primary transition-colors">Cancel</button>
            <button 
              type="submit" 
              className="flex-[2] btn-primary py-4 shadow-xl shadow-rose-sm bg-primary text-white"
            >
              {editingId ? 'Update Bundle' : 'Launch Deal'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
