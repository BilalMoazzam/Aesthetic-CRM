import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';

export default function SettingsManager() {
  const { settings, updateSettings, users, toggleUserApproval, services, deals, addBooking, customers, fetchServices, fetchDeals, fetchCustomers } = useStore();
  const [formData, setFormData] = useState({
    workingHoursStart: '09:00 AM',
    workingHoursEnd: '05:00 PM',
    bufferTime: 15,
    bookingWindow: 30,
    onlineBookings: true,
    staffOverrides: false,
    primaryAccent: '#2563eb',
    secondaryWash: '#f8fafc',
    typography: 'Inter',
    brandName: 'VLAS Clinic',
    brandLogo: ''
  });
  const [isSaved, setIsSaved] = useState(false);

  // Fake booking state
  const [fakeForm, setFakeForm] = useState({
    clientName: '',
    serviceId: '',
    date: '',
    time: '',
    count: 1
  });
  const [fakeToast, setFakeToast] = useState('');

  useEffect(() => {
    fetchServices();
    fetchDeals();
    fetchCustomers();
  }, [fetchServices, fetchDeals, fetchCustomers]);

  useEffect(() => {
    if (settings) {
      setFormData(prev => ({ ...prev, ...settings }));
    }
  }, [settings]);

    // After saving, persist to localStorage for client sync and reload the page to reflect changes
    const handleSave = () => {
      updateSettings(formData);
      // Store the updated settings locally so client can read without stale fallback
      localStorage.setItem('vlas_settings', JSON.stringify(formData));
      // Reload the page to ensure client fetches the latest settings
      window.location.reload();
    };

  const FAKE_NAMES = ['Alex Johnson','Maria Garcia','David Kim','Sophie Chen','James Wilson','Emma Davis','Liam Brown','Olivia Martinez'];
  const TIME_SLOTS = ['09:00 AM','10:00 AM','11:00 AM','12:00 PM','01:00 PM','02:00 PM','03:00 PM','04:00 PM','05:00 PM','06:00 PM'];

  const handleCreateFakeBooking = () => {
    const name = fakeForm.clientName || FAKE_NAMES[Math.floor(Math.random() * FAKE_NAMES.length)];
    const selectedService = fakeForm.serviceId ? services.find(s => s.id === fakeForm.serviceId) : services[Math.floor(Math.random() * services.length)];
    const today = new Date();
    const randomDays = Math.floor(Math.random() * 14);
    const bookingDate = fakeForm.date || new Date(today.getFullYear(), today.getMonth(), today.getDate() + randomDays).toISOString().split('T')[0];
    const time = fakeForm.time || TIME_SLOTS[Math.floor(Math.random() * TIME_SLOTS.length)];

    for (let i = 0; i < (fakeForm.count || 1); i++) {
      const offsetDate = new Date(bookingDate);
      offsetDate.setDate(offsetDate.getDate() + i);
      addBooking({
        clientDetails: { name: i === 0 ? name : FAKE_NAMES[Math.floor(Math.random() * FAKE_NAMES.length)], email: '', phone: '' },
        serviceId: selectedService?.id || '',
        serviceName: selectedService?.title || 'Signature Protocol',
        date: offsetDate.toISOString().split('T')[0],
        time,
        totalPrice: selectedService?.price || 0,
        duration: selectedService?.duration || '60 min',
        status: 'confirmed',
        isFake: true
      });
    }

    setFakeToast(`✓ ${fakeForm.count || 1} fake booking${(fakeForm.count || 1) > 1 ? 's' : ''} created successfully!`);
    setTimeout(() => setFakeToast(''), 3000);
    setFakeForm({ clientName: '', serviceId: '', date: '', time: '', count: 1 });
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Settings</h1>
          <p className="text-slate-500 text-sm mt-1">Configure global application parameters and business logic.</p>
        </div>
        <button onClick={handleSave} className="btn-primary min-w-[160px]">
          <span className="material-symbols-outlined text-xl">{isSaved ? 'check_circle' : 'save'}</span>
          {isSaved ? 'Settings Saved' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Main Settings */}
        <div className="lg:col-span-8 space-y-8">
          {/* Brand Configuration */}
          <div className="card-pro p-8">
            <h3 className="text-sm font-bold text-slate-900 mb-8 flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-blue-600">business</span>
              Brand Configuration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Business Name</label>
                <input 
                  type="text" 
                  value={formData.brandName} 
                  onChange={e => setFormData({...formData, brandName: e.target.value})} 
                  className="input-pro"
                  placeholder="VLAS Clinic"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Logo URL</label>
                <input 
                  type="text" 
                  value={formData.brandLogo} 
                  onChange={e => setFormData({...formData, brandLogo: e.target.value})} 
                  className="input-pro"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          {/* Scheduling Configuration */}
          <div className="card-pro p-8">
            <h3 className="text-sm font-bold text-slate-900 mb-8 flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-blue-600">schedule</span>
              Scheduling Configuration
            </h3>
            
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Working Day Start</label>
                  <input 
                    type="text" 
                    value={formData.workingHoursStart} 
                    onChange={e => setFormData({...formData, workingHoursStart: e.target.value})} 
                    className="input-pro"
                    placeholder="09:00 AM"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Working Day End</label>
                  <input 
                    type="text" 
                    value={formData.workingHoursEnd} 
                    onChange={e => setFormData({...formData, workingHoursEnd: e.target.value})} 
                    className="input-pro"
                    placeholder="05:00 PM"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Buffer Between Sessions</label>
                    <span className="text-sm font-bold text-blue-600">{formData.bufferTime} minutes</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="60" 
                    step="5" 
                    value={formData.bufferTime} 
                    onChange={e => setFormData({...formData, bufferTime: parseInt(e.target.value)})} 
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <p className="text-[10px] text-slate-400 font-medium italic mt-1 px-1">Time allocated for room reset and documentation between clients.</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Max Booking Window</label>
                    <span className="text-sm font-bold text-blue-600">{formData.bookingWindow} days</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="90" 
                    step="1" 
                    value={formData.bookingWindow} 
                    onChange={e => setFormData({...formData, bookingWindow: parseInt(e.target.value)})} 
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <p className="text-[10px] text-slate-400 font-medium italic mt-1 px-1">How many days in advance a client can book a service.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Access Control */}
          <div className="card-pro p-8">
            <h3 className="text-sm font-bold text-slate-900 mb-8 flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-blue-600">security</span>
              Application Access Control
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <p className="text-sm font-bold text-slate-900">Enable Online Bookings</p>
                  <p className="text-xs text-slate-500 mt-0.5">Allow clients to schedule via the public web app.</p>
                </div>
                <button 
                  onClick={() => setFormData({...formData, onlineBookings: !formData.onlineBookings})}
                  className={`w-12 h-6 rounded-full relative transition-colors ${formData.onlineBookings ? 'bg-blue-600' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.onlineBookings ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <p className="text-sm font-bold text-slate-900">Staff Overrides</p>
                  <p className="text-xs text-slate-500 mt-0.5">Enable admins to bypass scheduling constraints.</p>
                </div>
                <button 
                  onClick={() => setFormData({...formData, staffOverrides: !formData.staffOverrides})}
                  className={`w-12 h-6 rounded-full relative transition-colors ${formData.staffOverrides ? 'bg-blue-600' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.staffOverrides ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Staff Approvals & Account Control */}
          <div className="card-pro p-8">
            <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-blue-600" style={{ color: settings.primaryAccent }}>manage_accounts</span>
              Staff Access & Approvals
            </h3>
            {users && users.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {users.map(u => (
                  <div key={u.id} className="py-4 flex items-center justify-between first:pt-0 last:pb-0">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{u.name}</p>
                      <p className="text-xs text-slate-505 font-medium text-slate-400">@{u.username} • {u.role}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                        u.isApproved 
                          ? 'bg-emerald-50 text-emerald-700' 
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {u.isApproved ? 'Approved' : 'Pending'}
                      </span>
                      {u.username !== 'admin' && (
                        <button
                          type="button"
                          onClick={() => toggleUserApproval(u.id)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            u.isApproved 
                              ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' 
                              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                          }`}
                        >
                          {u.isApproved ? 'Revoke' : 'Approve'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No registered staff users found.</p>
            )}
          </div>
        </div>

        {/* Right Column - Appearance & Metadata */}
        <div className="lg:col-span-4 space-y-8">
          <div className="card-pro p-8">
            <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-blue-600">palette</span>
              Brand Identity
            </h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Primary Color</label>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl border border-slate-200 p-1">
                    <input 
                      type="color" 
                      value={formData.primaryAccent} 
                      onChange={e => setFormData({...formData, primaryAccent: e.target.value})} 
                      className="w-full h-full rounded-lg appearance-none cursor-pointer border-none bg-transparent" 
                    />
                  </div>
                  <input 
                    type="text" 
                    value={formData.primaryAccent} 
                    onChange={e => setFormData({...formData, primaryAccent: e.target.value})} 
                    className="input-pro font-mono text-xs" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Typography</label>
                <select 
                  value={formData.typography} 
                  onChange={e => setFormData({...formData, typography: e.target.value})} 
                  className="input-pro appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1em_1em]"
                >
                  <option value="Inter">Inter (Sans-Serif)</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Outfit">Outfit (Premium)</option>
                </select>
              </div>
            </div>
          </div>

          {/* System Status removed - not needed */}
        </div>
      </div>

      {/* ========== FAKE BOOKING GENERATOR ========== */}
      <div className="card-pro p-8 border-2 border-dashed border-orange-200 bg-orange-50/30">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-orange-600">science</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Fake Booking Generator</h3>
            <p className="text-xs text-slate-500 mt-0.5">Create test bookings that appear on the admin calendar but <strong>don't block real client slots</strong>.</p>
          </div>
          <span className="ml-auto text-[10px] font-black bg-orange-100 text-orange-700 px-3 py-1 rounded-full uppercase tracking-wider border border-orange-200">Admin Only</span>
        </div>

        {fakeToast && (
          <div className="mb-4 flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-bold animate-page-entrance">
            <span className="material-symbols-outlined text-lg">check_circle</span>
            {fakeToast}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Client Name */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Client Name (optional)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-lg">person</span>
              <input
                type="text"
                value={fakeForm.clientName}
                onChange={e => setFakeForm({ ...fakeForm, clientName: e.target.value })}
                className="input-pro pl-12"
                placeholder="Leave blank for random name"
              />
            </div>
          </div>

          {/* Service */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Service (optional)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-lg">medical_services</span>
              <select
                value={fakeForm.serviceId}
                onChange={e => setFakeForm({ ...fakeForm, serviceId: e.target.value })}
                className="input-pro pl-12 appearance-none"
              >
                <option value="">Random service</option>
                {services.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
              </select>
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Date (optional)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-lg">calendar_today</span>
              <input
                type="date"
                value={fakeForm.date}
                onChange={e => setFakeForm({ ...fakeForm, date: e.target.value })}
                className="input-pro pl-12"
              />
            </div>
          </div>

          {/* Time */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Time (optional)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-lg">schedule</span>
              <select
                value={fakeForm.time}
                onChange={e => setFakeForm({ ...fakeForm, time: e.target.value })}
                className="input-pro pl-12 appearance-none"
              >
                <option value="">Random time slot</option>
                {['09:00 AM','10:00 AM','11:00 AM','12:00 PM','01:00 PM','02:00 PM','03:00 PM','04:00 PM','05:00 PM','06:00 PM'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Count */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Number of Bookings</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-lg">numbers</span>
              <input
                type="number"
                min="1"
                max="20"
                value={fakeForm.count}
                onChange={e => setFakeForm({ ...fakeForm, count: parseInt(e.target.value) || 1 })}
                className="input-pro pl-12"
              />
            </div>
          </div>

          {/* Generate button */}
          <div className="flex items-end">
            <button
              onClick={handleCreateFakeBooking}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-orange-200 active:scale-95"
            >
              <span className="material-symbols-outlined text-xl">add_circle</span>
              Generate Fake Booking{fakeForm.count > 1 ? 's' : ''}
            </button>
          </div>
        </div>

        <p className="text-[10px] text-slate-400 mt-4 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-sm">info</span>
          Fake bookings are tagged with an orange <strong>Test</strong> badge on the calendar and excluded from client slot blocking. Use them to simulate busy days or test scheduling logic.
        </p>
      </div>
    </div>
  );
}
