// stores/authStore.js
import { create } from 'zustand';
import supabase from '../supabase/supabase';

export const useAuthStore = create((set, get) => ({
  user: null,
  userEmail: null,
  userName: null,
  loading: true,
  
  // Actions
  setUser: (user) => set({ user }),
  setUserEmail: (userEmail) => set({ userEmail }),
  setUserName: (userName) => set({ userName }),
  setLoading: (loading) => set({ loading }),
  
  checkUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      set({ 
        user, 
        userEmail: user.email,
        userName: user.user_metadata?.name || null,
        loading: false 
      });
    } else {
      set({ user: null, userEmail: null, userName: null, loading: false });
    }
  },
  
  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email, 
      password
    });
    
    if (!error && data.user) {
      set({ 
        user: data.user,
        userEmail: data.user.email,
        userName: data.user.user_metadata?.name || null
      });
    }
    
    return { data, error };
  },
  
  signUp: async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        },
        emailRedirectTo: window.location.origin,
      },
    });
    
    if (!error && data.user) {
      set({ user: data.user });
    }
    
    return { data, error };
  },

  signInWithGoogle: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/home`,
      },
    });
    return { data, error };
  },
  
  logout: async () => {
    try {
      const { data, error } = await supabase.auth.signOut();
      if (error) throw error;
      
      set({ 
        user: null,
        userEmail: null,
        userName: null
      });
      return { data };
    } catch (error) {
      return { error };
    }
  },

  resetPassword: async (email) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });
      return { data, error };
    } catch (error) {
      return { error };
    }
  },

  deleteAccount: async (password) => {
    try {
      const user = get().user;
      
      if (!user) {
        return { error: { message: 'No user authenticated' } };
      }

      const BASE_URL = import.meta.env.VITE_API_URL;
      
      // Obtener el token de sesión actual
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return { error: { message: 'No active session' } };
      }

      // Llamar al endpoint del backend para eliminar la cuenta
      const response = await fetch(`${BASE_URL}/auth/account/${user.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ password })
      });

      const result = await response.json();

      if (!response.ok) {
        return { error: { message: result.message || 'Failed to delete account' } };
      }

      // Si la eliminación fue exitosa, limpiar el estado local
      set({ 
        user: null,
        userEmail: null,
        userName: null
      });

      return { data: result };
    } catch (error) {
      return { error };
    }
  },
  
  // Computed property
  isAuthenticated: () => !!get().user
}));

