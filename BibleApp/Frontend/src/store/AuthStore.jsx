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
  
  // Computed property
  isAuthenticated: () => !!get().user
}));

