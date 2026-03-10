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
        const user = session?.user;
        
        useAuthStore.getState().setUser(user || null);
        useAuthStore.getState().setUserEmail(user?.email || null);
        useAuthStore.getState().setUserName(user?.user_metadata?.name || null);
        useAuthStore.getState().setLoading(false);
      }
    );
    
    return () => subscription.unsubscribe();
  };
  
  return { initializeAuth };
};