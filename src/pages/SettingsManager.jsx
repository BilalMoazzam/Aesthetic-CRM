import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';

export default function SettingsManager() {
  const { settings, updateSettings } = useStore();
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

  useEffect(() => {
    if (settings) {
      setFormData(prev => ({ ...prev, ...settings }));
    }
  }, [settings]);

  const handleSave = () => {
    updateSettings(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
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

          <div className="card-pro p-8 bg-blue-600 text-white border-none shadow-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <span className="material-symbols-outlined">verified</span>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-blue-100">System Status</p>
                <p className="text-sm font-bold">All services active</p>
              </div>
            </div>
            <p className="text-xs text-blue-100 leading-relaxed mb-6">
              The system configuration is synchronized with the main database. Changes will be reflected immediately across all client applications.
            </p>
            <button className="w-full py-3 bg-white text-blue-600 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-blue-50 transition-colors">
              View System Logs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
