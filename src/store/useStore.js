import { create } from 'zustand';

const API_URL = 'http://localhost:3000';

export const useStore = create((set, get) => ({
  services: [],
  deals: [],
  bookings: [],
  customers: [],
  vouchers: [],
  settings: {
    brandName: 'VLAS Clinic',
    primaryAccent: '#2563eb',
    typography: 'Inter',
  },
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

  // Fetching
  fetchServices: async () => {
    const res = await fetch(`${API_URL}/services`);
    const data = await res.json();
    set({ services: data });
  },
  fetchDeals: async () => {
    const res = await fetch(`${API_URL}/deals`);
    const data = await res.json();
    set({ deals: data });
  },
  fetchBookings: async () => {
    const res = await fetch(`${API_URL}/bookings`);
    const data = await res.json();
    set({ bookings: data });
  },
  fetchCustomers: async () => {
    const res = await fetch(`${API_URL}/customers`);
    const data = await res.json();
    set({ customers: data });
  },
  fetchVouchers: async () => {
    const res = await fetch(`${API_URL}/vouchers`);
    const data = await res.json();
    set({ vouchers: data });
  },
  fetchSettings: async () => {
    const res = await fetch(`${API_URL}/settings`);
    const data = await res.json();
    set({ settings: data });
  },

  // Actions
  addService: async (service) => {
    const res = await fetch(`${API_URL}/services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        ...service, 
        price: Number(service.price),
        id: Date.now().toString() 
      })
    });
    get().fetchServices();
  },
  updateService: async (id, service) => {
    await fetch(`${API_URL}/services/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...service,
        price: service.price ? Number(service.price) : undefined
      })
    });
    get().fetchServices();
  },
  deleteService: async (id) => {
    await fetch(`${API_URL}/services/${id}`, { method: 'DELETE' });
    get().fetchServices();
  },

  addDeal: async (deal) => {
    await fetch(`${API_URL}/deals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        ...deal, 
        originalPrice: Number(deal.originalPrice),
        discountPrice: Number(deal.discountPrice),
        id: Date.now().toString() 
      })
    });
    get().fetchDeals();
  },
  updateDeal: async (id, deal) => {
    await fetch(`${API_URL}/deals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...deal,
        originalPrice: deal.originalPrice ? Number(deal.originalPrice) : undefined,
        discountPrice: deal.discountPrice ? Number(deal.discountPrice) : undefined
      })
    });
    get().fetchDeals();
  },
  deleteDeal: async (id) => {
    await fetch(`${API_URL}/deals/${id}`, { method: 'DELETE' });
    get().fetchDeals();
  },

  addBooking: async (booking) => {
    await fetch(`${API_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...booking, id: Date.now().toString() })
    });
    get().fetchBookings();
  },
  updateBooking: async (id, booking) => {
    await fetch(`${API_URL}/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(booking)
    });
    get().fetchBookings();
  },
  deleteBooking: async (id) => {
    await fetch(`${API_URL}/bookings/${id}`, { method: 'DELETE' });
    get().fetchBookings();
  },

  addCustomer: async (customer) => {
    await fetch(`${API_URL}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...customer, id: Date.now().toString() })
    });
    get().fetchCustomers();
  },
  updateCustomer: async (id, customer) => {
    await fetch(`${API_URL}/customers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customer)
    });
    get().fetchCustomers();
  },
  deleteCustomer: async (id) => {
    await fetch(`${API_URL}/customers/${id}`, { method: 'DELETE' });
    get().fetchCustomers();
  },

  updateSettings: async (newSettings) => {
    await fetch(`${API_URL}/settings`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSettings)
    });
    get().fetchSettings();
  },

  addVoucher: async (voucher) => {
    await fetch(`${API_URL}/vouchers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        ...voucher, 
        value: Number(voucher.value),
        usageLimit: Number(voucher.usageLimit),
        id: Date.now().toString() 
      })
    });
    get().fetchVouchers();
  },
  updateVoucher: async (id, voucher) => {
    await fetch(`${API_URL}/vouchers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...voucher,
        value: voucher.value ? Number(voucher.value) : undefined,
        usageLimit: voucher.usageLimit ? Number(voucher.usageLimit) : undefined
      })
    });
    get().fetchVouchers();
  },
  deleteVoucher: async (id) => {
    await fetch(`${API_URL}/vouchers/${id}`, { method: 'DELETE' });
    get().fetchVouchers();
  },

  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    
    // We'll use port 3001 for the upload server
    const res = await fetch('http://localhost:3001/api/upload', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    return data.url; // Returns the URL of the uploaded image
  },

  initializeStore: () => {
    get().fetchServices();
    get().fetchDeals();
    get().fetchBookings();
    get().fetchCustomers();
    get().fetchVouchers();
    get().fetchSettings();
  }
}));
