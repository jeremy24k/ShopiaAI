// stores/authStore.js
import { create } from 'zustand';
import supabase from '../supabase/supabase';

export const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,
  
  // Actions
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  
  checkUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    set({ user, loading: false });
  },
  
  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email, 
      password
    });
    
    if (!error && data.user) {
      set({ user: data.user });
    }
    
    return { data, error };
  },
  
  logout: async () => {
    try {
      const { data, error } = await supabase.auth.signOut();
      if (error) throw error;
      
      set({ user: null });
      return { data };
    } catch (error) {
      return { error };
    }
  },
  
  // Computed property
  isAuthenticated: () => !!get().user
}));

// Hook para inicializar la autenticación (usar en App.js o main.jsx)
export const useAuthInit = () => {
  const { checkUser } = useAuthStore();
  
  // Inicializar la autenticación
  const initializeAuth = () => {
    checkUser();
    
    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        useAuthStore.getState().setUser(session?.user || null);
        useAuthStore.getState().setLoading(false);
      }
    );
    
    return () => subscription.unsubscribe();
  };
  
  return { initializeAuth };
};