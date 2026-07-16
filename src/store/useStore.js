import { create } from 'zustand';

const API_URL = 'http://localhost:3000';

// ==========================================
// STATIC OFFLINE FALLBACKS (from db.json)
// ==========================================
const FALLBACK_SERVICES = [
  {
    "id": "1",
    "title": "HydraFacial Pro",
    "category": "Skincare",
    "price": 240,
    "duration": "60 min",
    "description": "The ultimate skin detox. A multi-step treatment that cleanses, exfoliates, and extracts impurities while replenishing skin with vital nutrients.",
    "image": "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=800",
    "featured": true
  },
  {
    "id": "2",
    "title": "Velvet Massage",
    "category": "Wellness",
    "price": 185,
    "duration": "90 min",
    "description": "Our signature deep-tissue ritual. Using warm botanical oils and rhythmic pressure to melt away tension and restore your body's natural harmony.",
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRzawJyID0vJSvxrYkSspBAQ_qZtzm92dTSw&s",
    "featured": true
  },
  {
    "id": "3",
    "title": "Diamond Glow",
    "category": "Facial",
    "price": 210,
    "duration": "45 min",
    "description": "Micro-diamond exfoliation combined with deep infusion of custom serums for an instant red-carpet radiance.",
    "image": "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=800",
    "featured": true
  }
];

const FALLBACK_DEALS = [
  {
    "id": "1",
    "title": "Summer Glow Ritual",
    "subtitle": "Seasonal Sanctuary",
    "description": "A curated journey featuring our HydraFacial Pro followed by a 30-minute stress-relief massage. The perfect reset for your skin and spirit.",
    "duration": "90 min",
    "originalPrice": 425,
    "discountPrice": 299,
    "image": "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=800",
    "status": "Active",
    "tag": "Trending"
  }
];

const FALLBACK_BOOKINGS = [
  {
    "serviceId": "1",
    "serviceName": "HydraFacial Pro",
    "clientDetails": {
      "name": "Bilal Moazzam",
      "email": "bilalmoazzam5@gmail.com",
      "phone": "+923017175262"
    },
    "date": "2026-05-12",
    "time": "10:00 AM",
    "totalPrice": 240,
    "voucherCode": null,
    "status": "pending",
    "id": "8a3EwTizA1g"
  }
];

const FALLBACK_CUSTOMERS = [
  {
    "name": "Bilal Moazzam",
    "email": "bilalmoazzam5@gmail.com",
    "phone": "+923017175262",
    "tier": "Elite",
    "id": "FGIN-pw1eLA"
  },
  {
    "name": "ALI Ahamd",
    "email": "a@gma.c",
    "phone": "000000000",
    "tier": "Elite",
    "id": "97gX4LdOGf8"
  }
];

const FALLBACK_VOUCHERS = [
  {
    "code": "WELCOME2026",
    "type": "Percentage",
    "value": 15,
    "expiryDate": "2026-12-31",
    "usageLimit": 100,
    "status": "active",
    "id": "v1"
  }
];

const FALLBACK_SETTINGS = {
  "brandName": "Vlas AESTHETIC",
  "primaryAccent": "#86626E",
  "typography": "Playfair Display",
  "workingHoursStart": "09:00 AM",
  "workingHoursEnd": "08:00 PM",
  "bufferTime": 10,
  "bookingWindow": 60,
  "onlineBookings": true,
  "staffOverrides": false,
  "secondaryWash": "#0f172a",
  "brandLogo": ""
};

export const useStore = create((set, get) => ({
  // Immediately seed from localStorage cache so UI renders with real data on first paint
  // (API will then refresh these in the background within ~100ms)
  services:  (() => { try { const d = localStorage.getItem('vlas_services');  return d ? JSON.parse(d) : []; } catch { return []; } })(),
  deals:     (() => { try { const d = localStorage.getItem('vlas_deals');    return d ? JSON.parse(d) : []; } catch { return []; } })(),
  bookings:  (() => { try { const d = localStorage.getItem('vlas_bookings'); return d ? JSON.parse(d) : []; } catch { return []; } })(),
  customers: (() => { try { const d = localStorage.getItem('vlas_customers');return d ? JSON.parse(d) : []; } catch { return []; } })(),
  vouchers:  (() => { try { const d = localStorage.getItem('vlas_vouchers'); return d ? JSON.parse(d) : []; } catch { return []; } })(),
  messages:  (() => { try { const d = localStorage.getItem('vlas_messages'); return d ? JSON.parse(d) : []; } catch { return []; } })(),
  users:     (() => { try { const d = localStorage.getItem('vlas_users');    return d ? JSON.parse(d) : []; } catch { return []; } })(),
  settings:  (() => { 
    try { 
      const d = localStorage.getItem('vlas_settings');  
      const parsed = d ? JSON.parse(d) : FALLBACK_SETTINGS;
      // Force overwrite any cached blue/teal accents to Smoky Rose!
      parsed.primaryAccent = '#86626E';
      return parsed;
    } catch { return FALLBACK_SETTINGS; } 
  })(),
  isAuthenticated: localStorage.getItem('vlas_auth') === 'true',
  currentUser: localStorage.getItem('vlas_current_user') ? JSON.parse(localStorage.getItem('vlas_current_user')) : null,
  isLoading: false,

  fetchUsers: async () => {
    try {
      const res = await fetch(`${API_URL}/users`);
      if (!res.ok) throw new Error("API failed");
      const data = await res.json();
      set({ users: data });
      localStorage.setItem('vlas_users', JSON.stringify(data));
    } catch (e) {
      console.warn("Using offline fallback for users");
      const local = localStorage.getItem('vlas_users');
      if (local) {
        set({ users: JSON.parse(local) });
      } else {
        const defaultUsers = [
          {
            "id": "1",
            "username": "admin",
            "password": "vlas2024",
            "name": "System Admin",
            "role": "Admin",
            "isApproved": true
          }
        ];
        set({ users: defaultUsers });
        localStorage.setItem('vlas_users', JSON.stringify(defaultUsers));
      }
    }
  },

  // Normalize phone to +92XXXXXXXXXX format
  normalizePhone: (phone) => {
    if (!phone) return phone;
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('92') && digits.length >= 12) return '+' + digits;
    if (digits.startsWith('0') && digits.length === 11) return '+92' + digits.slice(1);
    if (digits.length === 10) return '+92' + digits;
    if (digits.length === 12 && digits.startsWith('92')) return '+' + digits;
    return phone.startsWith('+') ? phone : '+' + digits;
  },

  login: async (username, password) => {
    await get().fetchUsers();
    const matchedUser = get().users.find(u => u.username === username && u.password === password);
    if (!matchedUser) {
      return { success: false, reason: 'invalid' };
    }
    if (matchedUser.isBlocked) {
      return { success: false, reason: 'blocked' };
    }
    if (!matchedUser.isApproved) {
      return { success: false, reason: 'pending' };
    }
    localStorage.setItem('vlas_auth', 'true');
    localStorage.setItem('vlas_current_user', JSON.stringify(matchedUser));
    set({ isAuthenticated: true, currentUser: matchedUser });
    return { success: true };
  },

  signup: async (user) => {
    const newUser = {
      ...user,
      id: Date.now().toString(),
      isApproved: false,
      role: 'Staff'
    };
    try {
      const res = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      if (!res.ok) throw new Error("API failed");
      await get().fetchUsers();
      return true;
    } catch (e) {
      console.warn("Offline: registered user locally");
      const current = [...get().users, newUser];
      set({ users: current });
      localStorage.setItem('vlas_users', JSON.stringify(current));
      return true;
    }
  },

  toggleUserApproval: async (id) => {
    const user = get().users.find(u => u.id === id);
    if (!user) return;
    const updatedUser = { ...user, isApproved: !user.isApproved };
    try {
      const res = await fetch(`${API_URL}/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved: updatedUser.isApproved })
      });
      if (!res.ok) throw new Error('API failed');
      await get().fetchUsers();
    } catch (e) {
      const current = get().users.map(u => u.id === id ? updatedUser : u);
      set({ users: current });
      localStorage.setItem('vlas_users', JSON.stringify(current));
    }
  },

  toggleUserBlock: async (id) => {
    const user = get().users.find(u => u.id === id);
    if (!user) return;
    const updatedUser = { ...user, isBlocked: !user.isBlocked };
    try {
      const res = await fetch(`${API_URL}/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBlocked: updatedUser.isBlocked })
      });
      if (!res.ok) throw new Error('API failed');
      await get().fetchUsers();
    } catch (e) {
      const current = get().users.map(u => u.id === id ? updatedUser : u);
      set({ users: current });
      localStorage.setItem('vlas_users', JSON.stringify(current));
    }
  },

  logout: () => {
    localStorage.removeItem('vlas_auth');
    localStorage.removeItem('vlas_current_user');
    set({ isAuthenticated: false, currentUser: null });
  },

  // ==========================================
  // IMAGE PRELOADER FOR EXTREMELY FAST RENDERS
  // ==========================================
  preloadImages: (list) => {
    if (typeof window !== 'undefined') {
      list.forEach(item => {
        if (item.image) {
          const img = new Image();
          img.src = item.image;
        }
      });
    }
  },

  // ==========================================
  // FETCH SERVICES
  // ==========================================
  fetchServices: async () => {
    try {
      const res = await fetch(`${API_URL}/services`);
      if (!res.ok) throw new Error("API failed");
      const data = await res.json();
      set({ services: data });
      get().preloadImages(data);
      localStorage.setItem('vlas_services', JSON.stringify(data));
    } catch (e) {
      console.warn("Using offline fallback for services");
      const local = localStorage.getItem('vlas_services');
      if (local) {
        const parsed = JSON.parse(local);
        set({ services: parsed });
        get().preloadImages(parsed);
      } else {
        set({ services: FALLBACK_SERVICES });
        get().preloadImages(FALLBACK_SERVICES);
        localStorage.setItem('vlas_services', JSON.stringify(FALLBACK_SERVICES));
      }
    }
  },

  addService: async (service) => {
    const newItem = { 
      ...service, 
      price: Number(service.price),
      id: Date.now().toString() 
    };
    try {
      const res = await fetch(`${API_URL}/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });
      if (!res.ok) throw new Error("API failed");
      get().fetchServices();
    } catch (e) {
      console.warn("Offline: added service locally");
      const current = [...get().services, newItem];
      set({ services: current });
      localStorage.setItem('vlas_services', JSON.stringify(current));
    }
  },

  updateService: async (id, service) => {
    try {
      const res = await fetch(`${API_URL}/services/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...service,
          price: service.price ? Number(service.price) : undefined
        })
      });
      if (!res.ok) throw new Error("API failed");
      get().fetchServices();
    } catch (e) {
      console.warn("Offline: updated service locally");
      const current = get().services.map(s => s.id === id ? { ...s, ...service, price: service.price ? Number(service.price) : s.price } : s);
      set({ services: current });
      localStorage.setItem('vlas_services', JSON.stringify(current));
    }
  },

  deleteService: async (id) => {
    try {
      const res = await fetch(`${API_URL}/services/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("API failed");
      get().fetchServices();
    } catch (e) {
      console.warn("Offline: deleted service locally");
      const current = get().services.filter(s => s.id !== id);
      set({ services: current });
      localStorage.setItem('vlas_services', JSON.stringify(current));
    }
  },

  // ==========================================
  // FETCH DEALS
  // ==========================================
  fetchDeals: async () => {
    try {
      const res = await fetch(`${API_URL}/deals`);
      if (!res.ok) throw new Error("API failed");
      const data = await res.json();
      set({ deals: data });
      get().preloadImages(data);
      localStorage.setItem('vlas_deals', JSON.stringify(data));
    } catch (e) {
      console.warn("Using offline fallback for deals");
      const local = localStorage.getItem('vlas_deals');
      if (local) {
        const parsed = JSON.parse(local);
        set({ deals: parsed });
        get().preloadImages(parsed);
      } else {
        set({ deals: FALLBACK_DEALS });
        get().preloadImages(FALLBACK_DEALS);
        localStorage.setItem('vlas_deals', JSON.stringify(FALLBACK_DEALS));
      }
    }
  },

  addDeal: async (deal) => {
    const newItem = { 
      ...deal, 
      originalPrice: Number(deal.originalPrice),
      discountPrice: Number(deal.discountPrice),
      id: Date.now().toString() 
    };
    try {
      const res = await fetch(`${API_URL}/deals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });
      if (!res.ok) throw new Error("API failed");
      get().fetchDeals();
    } catch (e) {
      console.warn("Offline: added deal locally");
      const current = [...get().deals, newItem];
      set({ deals: current });
      localStorage.setItem('vlas_deals', JSON.stringify(current));
    }
  },

  updateDeal: async (id, deal) => {
    try {
      const res = await fetch(`${API_URL}/deals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...deal,
          originalPrice: deal.originalPrice ? Number(deal.originalPrice) : undefined,
          discountPrice: deal.discountPrice ? Number(deal.discountPrice) : undefined
        })
      });
      if (!res.ok) throw new Error("API failed");
      get().fetchDeals();
    } catch (e) {
      console.warn("Offline: updated deal locally");
      const current = get().deals.map(d => d.id === id ? { 
        ...d, 
        ...deal, 
        originalPrice: deal.originalPrice ? Number(deal.originalPrice) : d.originalPrice,
        discountPrice: deal.discountPrice ? Number(deal.discountPrice) : d.discountPrice
      } : d);
      set({ deals: current });
      localStorage.setItem('vlas_deals', JSON.stringify(current));
    }
  },

  deleteDeal: async (id) => {
    try {
      const res = await fetch(`${API_URL}/deals/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("API failed");
      get().fetchDeals();
    } catch (e) {
      console.warn("Offline: deleted deal locally");
      const current = get().deals.filter(d => d.id !== id);
      set({ deals: current });
      localStorage.setItem('vlas_deals', JSON.stringify(current));
    }
  },

  // ==========================================
  // FETCH BOOKINGS
  // ==========================================
  fetchBookings: async () => {
    try {
      const res = await fetch(`${API_URL}/bookings`);
      if (!res.ok) throw new Error("API failed");
      const data = await res.json();
      set({ bookings: data });
      localStorage.setItem('vlas_bookings', JSON.stringify(data));
    } catch (e) {
      console.warn("Using offline fallback for bookings");
      const local = localStorage.getItem('vlas_bookings');
      if (local) {
        set({ bookings: JSON.parse(local) });
      } else {
        set({ bookings: FALLBACK_BOOKINGS });
        localStorage.setItem('vlas_bookings', JSON.stringify(FALLBACK_BOOKINGS));
      }
    }
  },

  addBooking: async (booking) => {
    // Normalize phone in client details
    const cd = booking.clientDetails || {};
    const normalizedPhone = get().normalizePhone(cd.phone);
    const newItem = {
      ...booking,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      clientDetails: { ...cd, phone: normalizedPhone }
    };
    try {
      const res = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });
      if (!res.ok) throw new Error('API failed');
      get().fetchBookings();
    } catch (e) {
      const current = [...get().bookings, newItem];
      set({ bookings: current });
      localStorage.setItem('vlas_bookings', JSON.stringify(current));
    }
  },

  updateBooking: async (id, booking) => {
    try {
      const res = await fetch(`${API_URL}/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(booking)
      });
      if (!res.ok) throw new Error("API failed");
      get().fetchBookings();
    } catch (e) {
      console.warn("Offline: updated booking locally");
      const current = get().bookings.map(b => b.id === id ? { ...b, ...booking } : b);
      set({ bookings: current });
      localStorage.setItem('vlas_bookings', JSON.stringify(current));
    }
  },

  deleteBooking: async (id) => {
    try {
      const res = await fetch(`${API_URL}/bookings/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("API failed");
      get().fetchBookings();
    } catch (e) {
      console.warn("Offline: deleted booking locally");
      const current = get().bookings.filter(b => b.id !== id);
      set({ bookings: current });
      localStorage.setItem('vlas_bookings', JSON.stringify(current));
    }
  },

  // ==========================================
  // FETCH CUSTOMERS
  // ==========================================
  fetchCustomers: async () => {
    try {
      const res = await fetch(`${API_URL}/customers`);
      if (!res.ok) throw new Error("API failed");
      const data = await res.json();
      set({ customers: data });
      localStorage.setItem('vlas_customers', JSON.stringify(data));
    } catch (e) {
      console.warn("Using offline fallback for customers");
      const local = localStorage.getItem('vlas_customers');
      if (local) {
        set({ customers: JSON.parse(local) });
      } else {
        set({ customers: FALLBACK_CUSTOMERS });
        localStorage.setItem('vlas_customers', JSON.stringify(FALLBACK_CUSTOMERS));
      }
    }
  },

  addCustomer: async (customer) => {
    const normalizedPhone = get().normalizePhone(customer.phone);
    // Use phone as primary key — check for existing
    const existing = get().customers.find(c => c.phone && normalizedPhone &&
      c.phone.replace(/\D/g,'') === normalizedPhone.replace(/\D/g,''));
    if (existing) {
      // Update existing customer instead of creating duplicate
      return get().updateCustomer(existing.id, { ...customer, phone: normalizedPhone });
    }
    const newItem = { ...customer, phone: normalizedPhone, id: Date.now().toString(), createdAt: new Date().toISOString() };
    try {
      const res = await fetch(`${API_URL}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });
      if (!res.ok) throw new Error('API failed');
      get().fetchCustomers();
    } catch (e) {
      const current = [...get().customers, newItem];
      set({ customers: current });
      localStorage.setItem('vlas_customers', JSON.stringify(current));
    }
  },

  updateCustomer: async (id, customer) => {
    try {
      const res = await fetch(`${API_URL}/customers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customer)
      });
      if (!res.ok) throw new Error("API failed");
      get().fetchCustomers();
    } catch (e) {
      console.warn("Offline: updated customer profile locally");
      const current = get().customers.map(c => c.id === id ? { ...c, ...customer } : c);
      set({ customers: current });
      localStorage.setItem('vlas_customers', JSON.stringify(current));
    }
  },

  deleteCustomer: async (id) => {
    try {
      const res = await fetch(`${API_URL}/customers/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("API failed");
      get().fetchCustomers();
    } catch (e) {
      console.warn("Offline: deleted customer locally");
      const current = get().customers.filter(c => c.id !== id);
      set({ customers: current });
      localStorage.setItem('vlas_customers', JSON.stringify(current));
    }
  },

  // ==========================================
  // FETCH VOUCHERS
  // ==========================================
  fetchVouchers: async () => {
    try {
      const res = await fetch(`${API_URL}/vouchers`);
      if (!res.ok) throw new Error("API failed");
      const data = await res.json();
      set({ vouchers: data });
      localStorage.setItem('vlas_vouchers', JSON.stringify(data));
    } catch (e) {
      console.warn("Using offline fallback for vouchers");
      const local = localStorage.getItem('vlas_vouchers');
      if (local) {
        set({ vouchers: JSON.parse(local) });
      } else {
        set({ vouchers: FALLBACK_VOUCHERS });
        localStorage.setItem('vlas_vouchers', JSON.stringify(FALLBACK_VOUCHERS));
      }
    }
  },

  addVoucher: async (voucher) => {
    const newItem = {
      ...voucher,
      value: Number(voucher.value),
      usageLimit: Number(voucher.usageLimit) || 1,
      usageCount: 0,
      usedBy: [],   // array of phone numbers that used this voucher
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    try {
      const res = await fetch(`${API_URL}/vouchers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });
      if (!res.ok) throw new Error('API failed');
      get().fetchVouchers();
    } catch (e) {
      const current = [...get().vouchers, newItem];
      set({ vouchers: current });
      localStorage.setItem('vlas_vouchers', JSON.stringify(current));
    }
  },

  // Validate + apply voucher (returns discount amount or 0, and updates usedBy)
  applyVoucher: async (code, clientPhone, price) => {
    const vouchers = get().vouchers;
    const v = vouchers.find(x => x.code === code?.toUpperCase());
    if (!v) return { valid: false, reason: 'Code not found' };
    if (v.status !== 'active') return { valid: false, reason: 'Voucher is inactive' };
    const now = new Date();
    if (v.expiryDate && new Date(v.expiryDate) < now) {
      // Auto-expire it
      get().updateVoucher(v.id, { status: 'expired' });
      return { valid: false, reason: 'Voucher has expired' };
    }
    const normalizedPhone = get().normalizePhone(clientPhone);
    const usedBy = v.usedBy || [];
    const usageCount = v.usageCount || 0;
    const usageLimit = Number(v.usageLimit) || 1;
    // Check if this specific phone already used it (one-time per customer)
    if (normalizedPhone && usedBy.includes(normalizedPhone)) {
      return { valid: false, reason: 'You have already used this voucher' };
    }
    // Check overall usage limit
    if (usageCount >= usageLimit) {
      get().updateVoucher(v.id, { status: 'expired' });
      return { valid: false, reason: 'Voucher usage limit reached' };
    }
    // Apply
    let discount = 0;
    if (v.type === 'Percentage') discount = Math.round((price * Number(v.value)) / 100);
    else discount = Number(v.value);
    // Update voucher usage
    const newCount = usageCount + 1;
    const newUsedBy = normalizedPhone ? [...usedBy, normalizedPhone] : usedBy;
    const newStatus = newCount >= usageLimit ? 'expired' : 'active';
    get().updateVoucher(v.id, { usageCount: newCount, usedBy: newUsedBy, status: newStatus });
    return { valid: true, discount, voucherType: v.type, voucherValue: v.value };
  },

  updateVoucher: async (id, voucher) => {
    try {
      const res = await fetch(`${API_URL}/vouchers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...voucher,
          value: voucher.value ? Number(voucher.value) : undefined,
          usageLimit: voucher.usageLimit ? Number(voucher.usageLimit) : undefined
        })
      });
      if (!res.ok) throw new Error("API failed");
      get().fetchVouchers();
    } catch (e) {
      console.warn("Offline: updated voucher locally");
      const current = get().vouchers.map(v => v.id === id ? { 
        ...v, 
        ...voucher, 
        value: voucher.value ? Number(voucher.value) : v.value,
        usageLimit: voucher.usageLimit ? Number(voucher.usageLimit) : v.usageLimit
      } : v);
      set({ vouchers: current });
      localStorage.setItem('vlas_vouchers', JSON.stringify(current));
    }
  },

  deleteVoucher: async (id) => {
    try {
      const res = await fetch(`${API_URL}/vouchers/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("API failed");
      get().fetchVouchers();
    } catch (e) {
      console.warn("Offline: deleted voucher locally");
      const current = get().vouchers.filter(v => v.id !== id);
      set({ vouchers: current });
      localStorage.setItem('vlas_vouchers', JSON.stringify(current));
    }
  },

  // ==========================================
  // FETCH SETTINGS
  // ==========================================
  fetchSettings: async () => {
    try {
      const res = await fetch(`${API_URL}/settings`);
      if (!res.ok) throw new Error("API failed");
      const data = await res.json();
      data.primaryAccent = '#86626E';
      set({ settings: data });
      localStorage.setItem('vlas_settings', JSON.stringify(data));
    } catch (e) {
      console.warn("Using offline fallback for settings");
      const local = localStorage.getItem('vlas_settings');
      if (local) {
        const parsed = JSON.parse(local);
        parsed.primaryAccent = '#86626E';
        set({ settings: parsed });
      } else {
        set({ settings: FALLBACK_SETTINGS });
        localStorage.setItem('vlas_settings', JSON.stringify(FALLBACK_SETTINGS));
      }
    }
  },

  updateSettings: async (newSettings) => {
    try {
      const res = await fetch(`${API_URL}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
      if (!res.ok) throw new Error("API failed");
      get().fetchSettings();
    } catch (e) {
      console.warn("Offline: updated settings locally");
      const current = { ...get().settings, ...newSettings };
      set({ settings: current });
      localStorage.setItem('vlas_settings', JSON.stringify(current));
    }
  },

  // ==========================================
  // FETCH OUTBOUND COMMUNICATION LOGS
  // ==========================================
  fetchMessages: async () => {
    try {
      const res = await fetch(`${API_URL}/messages`);
      if (!res.ok) throw new Error("API failed");
      const data = await res.json();
      set({ messages: data });
      localStorage.setItem('vlas_messages', JSON.stringify(data));
    } catch (e) {
      console.warn("Using offline fallback for messages");
      const local = localStorage.getItem('vlas_messages');
      set({ messages: local ? JSON.parse(local) : [] });
    }
  },

  addMessage: async (message) => {
    const newMessage = {
      ...message,
      id: 'msg_' + Date.now().toString(),
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' - ' + new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Delivered'
    };
    try {
      const res = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMessage)
      });
      if (!res.ok) throw new Error("API failed");
      get().fetchMessages();
    } catch (e) {
      console.warn("Offline: logged message locally");
      const current = [...(get().messages || []), newMessage];
      set({ messages: current });
      localStorage.setItem('vlas_messages', JSON.stringify(current));
    }
  },

  // ==========================================
  // IMAGE UPLOADS
  // ==========================================
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      return data.url;
    } catch (e) {
      console.warn("Image upload server unreachable. Fallback placeholder used.");
      return URL.createObjectURL(file);
    }
  },

  // ==========================================
  // INITIALIZE STORE
  // ==========================================
  initializeStore: () => {
    get().fetchUsers();
    get().fetchServices();
    get().fetchDeals();
    get().fetchBookings();
    get().fetchCustomers();
    get().fetchVouchers();
    get().fetchSettings();
    get().fetchMessages();
  }
}));
