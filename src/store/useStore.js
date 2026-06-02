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
  },
  {
    "serviceId": "2",
    "serviceName": "Velvet Massage",
    "clientDetails": {
      "name": "Tatheer fatima",
      "email": "alexandra@editorial.com",
      "phone": "0011223344"
    },
    "date": "2026-05-15",
    "time": "12:45 PM",
    "totalPrice": 185,
    "voucherCode": null,
    "status": "pending",
    "id": "8crVYHKkUX8"
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
    "name": "Tatheer fatima",
    "email": "alexandra@editorial.com",
    "phone": "0011223344",
    "tier": "Elite",
    "id": "Wem1epx7TD4"
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
  "brandName": "TF AESTHETIC",
  "primaryAccent": "#0e74a0",
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
  services: [],
  deals: [],
  bookings: [],
  customers: [],
  vouchers: [],
  messages: [],
  settings: FALLBACK_SETTINGS,
  isAuthenticated: localStorage.getItem('vlas_auth') === 'true',
  isLoading: false,

  login: (username, password) => {
    if (username === 'admin' && password === 'vlas2024') {
      localStorage.setItem('vlas_auth', 'true');
      set({ isAuthenticated: true });
      return true;
    }
    return false;
  },

  logout: () => {
    localStorage.removeItem('vlas_auth');
    set({ isAuthenticated: false });
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
      localStorage.setItem('vlas_services', JSON.stringify(data));
    } catch (e) {
      console.warn("Using offline fallback for services");
      const local = localStorage.getItem('vlas_services');
      if (local) {
        set({ services: JSON.parse(local) });
      } else {
        set({ services: FALLBACK_SERVICES });
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
      localStorage.setItem('vlas_deals', JSON.stringify(data));
    } catch (e) {
      console.warn("Using offline fallback for deals");
      const local = localStorage.getItem('vlas_deals');
      if (local) {
        set({ deals: JSON.parse(local) });
      } else {
        set({ deals: FALLBACK_DEALS });
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
    const newItem = { ...booking, id: Date.now().toString() };
    try {
      const res = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });
      if (!res.ok) throw new Error("API failed");
      get().fetchBookings();
    } catch (e) {
      console.warn("Offline: added booking locally");
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
    const newItem = { ...customer, id: Date.now().toString() };
    try {
      const res = await fetch(`${API_URL}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });
      if (!res.ok) throw new Error("API failed");
      get().fetchCustomers();
    } catch (e) {
      console.warn("Offline: registered customer locally");
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
      usageLimit: Number(voucher.usageLimit),
      id: Date.now().toString() 
    };
    try {
      const res = await fetch(`${API_URL}/vouchers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });
      if (!res.ok) throw new Error("API failed");
      get().fetchVouchers();
    } catch (e) {
      console.warn("Offline: added voucher locally");
      const current = [...get().vouchers, newItem];
      set({ vouchers: current });
      localStorage.setItem('vlas_vouchers', JSON.stringify(current));
    }
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
      set({ settings: data });
      localStorage.setItem('vlas_settings', JSON.stringify(data));
    } catch (e) {
      console.warn("Using offline fallback for settings");
      const local = localStorage.getItem('vlas_settings');
      if (local) {
        set({ settings: JSON.parse(local) });
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
    get().fetchServices();
    get().fetchDeals();
    get().fetchBookings();
    get().fetchCustomers();
    get().fetchVouchers();
    get().fetchSettings();
    get().fetchMessages();
  }
}));
