import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  isAuthenticated: localStorage.getItem('vlas_admin_auth') === 'true',
  user: localStorage.getItem('vlas_admin_auth') === 'true' ? { name: 'Admin User', role: 'System Manager' } : null,
  login: (username, password) => {
    // Dummy credentials
    if (username === 'admin' && password === 'vlas2024') {
      localStorage.setItem('vlas_admin_auth', 'true');
      set({ isAuthenticated: true, user: { name: 'Admin User', role: 'System Manager' } });
      return true;
    }
    return false;
  },
  logout: () => {
    localStorage.removeItem('vlas_admin_auth');
    set({ isAuthenticated: false, user: null });
  }
}));
