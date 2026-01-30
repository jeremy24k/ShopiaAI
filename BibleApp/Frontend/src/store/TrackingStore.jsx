import { create } from 'zustand';
import supabase from "../supabase/supabase";
import { useAuthStore } from './AuthStore';

export const useTrackingStore = create((set, get) => ({
  // State
  Minutes: 0,
  TrackingLoading: false,
  TrackingError: null,
  Streak: 0,
  HasInitialized: false,

  // Actions
  setMinutes: (minutes) => set({ Minutes: minutes }),
  
  // Función auxiliar para obtener timezone y formatear fecha cliente
  getClientContext: async (userId) => {
      let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const clientDate = `${year}-${month}-${day}`;
      
      return { timezone, clientDate };
  },

  InitTracking: async () => {
    const { user } = useAuthStore.getState();
    if (!user) return { success: false, error: 'No user found' };

    set({ TrackingLoading: true, TrackingError: null });

    try {
      const { clientDate } = await get().getClientContext(user.id);
      
      // Llamar a la función unificada con 0 incremento
      const { data, error } = await supabase.rpc('process_daily_reading', {
        p_user_id: user.id,
        p_minutes_increment: 0,
        p_client_date: clientDate
      });

      if (error) throw error;

      if (data.success) {
        set({ 
          Minutes: data.minutes, 
          Streak: data.streak, 
          TrackingLoading: false,
          HasInitialized: true
        });
        return { success: true, data };
      } else {
        throw new Error(data.error || 'Error desconocido en InitTracking');
      }

    } catch (error) {
      console.error('❌ Error in InitTracking:', error);
      set({ TrackingLoading: false, TrackingError: error.message });
      return { success: false, error: error.message };
    }
  },

  // Acción para sumar minutos
  addReadingTime: async (increment = 1) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    try {
      const { clientDate } = await get().getClientContext(user.id);

      const { data, error } = await supabase.rpc('process_daily_reading', {
        p_user_id: user.id,
        p_minutes_increment: increment,
        p_client_date: clientDate
      });

      if (error) throw error;

      if (data.success) {
        set({ 
          Minutes: data.minutes, 
          Streak: data.streak 
        });
      }

    } catch (error) {
      console.error('❌ Error calling process_daily_reading:', error);
    }
  }
}));