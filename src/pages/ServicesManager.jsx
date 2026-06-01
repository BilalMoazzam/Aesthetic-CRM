import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import Modal from '../components/Modal';

export default function ServicesManager() {
  const { services, fetchServices, deleteService, addService, updateService, settings } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    title: '', 
    category: '', 
    price: '', 
    duration: '', 
    description: '', 
    image: '', 
    featured: false 
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleOpenModal = (service = null) => {
    if (service) {
      setFormData(service);
      setEditingId(service.id);
    } else {
      setFormData({ title: '', category: '', price: '', duration: '', description: '', image: '', featured: false });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      updateService(editingId, formData);
    } else {
      addService(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-10">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Services Catalogue</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your treatment menu, pricing, and visual presentation.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          className="btn-primary shadow-lg shadow-blue-100"
          style={{ backgroundColor: settings.primaryAccent }}
        >
          <span className="material-symbols-outlined text-xl">add_box</span>
          Add New Service
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
        {services.map((service) => (
          <div key={service.id} className="card-pro group overflow-hidden flex flex-col">
            <div className="h-48 relative overflow-hidden bg-slate-100">
              {service.image ? (
                <img 
                  alt={service.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  src={service.image} 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <span className="material-symbols-outlined text-5xl">image</span>
                </div>
              )}
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-[10px] font-bold text-blue-600 uppercase tracking-wider shadow-sm" style={{ color: settings.primaryAccent }}>
                {service.category}
              </div>
            </div>
            
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start gap-2 mb-3">
                <h3 className="text-lg font-bold text-slate-900 leading-tight truncate" title={service.title}>
                  {service.title}
                </h3>
                <span className="text-xl font-bold" style={{ color: settings.primaryAccent }}>${service.price}</span>
              </div>
              
              <p className="text-slate-500 text-sm line-clamp-2 mb-6 flex-1">
                {service.description || 'No description provided.'}
              </p>
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="material-symbols-outlined text-sm">schedule</span>
                  <span className="text-xs font-semibold">{service.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleOpenModal(service)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">edit</span>
                  </button>
                  <button 
                    onClick={() => { if(window.confirm('Delete service?')) deleteService(service.id); }}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Empty State / Add Card */}
        <button 
          onClick={() => handleOpenModal()}
          className="card-pro border-dashed border-slate-300 bg-slate-50/50 flex flex-col items-center justify-center p-10 gap-4 hover:bg-slate-50 hover:border-blue-300 transition-all group min-h-[350px]"
        >
          <div className="w-16 h-16 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:border-blue-100 transition-all shadow-sm">
            <span className="material-symbols-outlined text-3xl">add</span>
          </div>
          <p className="text-sm font-bold text-slate-500 group-hover:text-blue-600 transition-colors">Create New Service</p>
        </button>
      </div>

      {/* Add/Edit Service Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Service Details' : 'Add New Service'}
        subtitle="Configure the treatment specifications, pricing, and display aesthetics."
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Service Title</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">label</span>
                <input required type="text" value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} className="input-pro pl-12" placeholder="e.g. Skin Rejuvenation" />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Category</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">category</span>
                <input required type="text" value={formData.category} onChange={e=>setFormData({...formData, category: e.target.value})} className="input-pro pl-12" placeholder="e.g. Skincare" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Service Price ($)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">payments</span>
                <input required type="number" value={formData.price} onChange={e=>setFormData({...formData, price: e.target.value})} className="input-pro pl-12" placeholder="150" />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Expected Duration</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">timer</span>
                <input required type="text" value={formData.duration} onChange={e=>setFormData({...formData, duration: e.target.value})} className="input-pro pl-12" placeholder="e.g. 60 min" />
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Treatment Description</label>
            <div className="relative">
              <span className="absolute left-4 top-4 material-symbols-outlined text-slate-400">description</span>
              <textarea rows="3" value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} className="input-pro pl-12 resize-none pt-4" placeholder="Briefly describe the service benefits and procedure..." />
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Hero Image</label>
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">link</span>
                <input type="text" value={formData.image} onChange={e=>setFormData({...formData, image: e.target.value})} className="input-pro pl-12" placeholder="Image URL..." />
              </div>
              <div className="relative">
                <input 
                  type="file" 
                  accept="image/*" 
                  id="image-upload" 
                  className="hidden" 
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const url = await useStore.getState().uploadImage(file);
                      setFormData({...formData, image: url});
                    }
                  }}
                />
                <label htmlFor="image-upload" className="btn-secondary h-full flex items-center gap-2 cursor-pointer border-slate-200">
                  <span className="material-symbols-outlined text-xl">upload</span>
                  Upload
                </label>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 pt-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3">
              <input 
                id="featured" 
                type="checkbox" 
                checked={formData.featured} 
                onChange={e=>setFormData({...formData, featured: e.target.checked})} 
                className="w-5 h-5 text-blue-600 rounded-lg border-slate-300 focus:ring-blue-500 transition-all cursor-pointer"
              />
              <label htmlFor="featured" className="text-sm font-bold text-slate-700 cursor-pointer select-none">Mark as Featured on Homepage</label>
            </div>
          </div>
          
          <div className="flex gap-6 pt-6">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">Cancel</button>
            <button 
              type="submit" 
              className="flex-[2] btn-primary py-4 shadow-xl shadow-blue-100"
              style={{ backgroundColor: settings.primaryAccent }}
            >
              {editingId ? 'Update Service' : 'Save Service'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
