import { create } from 'zustand';
import supabase from "../supabase/supabase";
import { useAuthStore } from './AuthStore';

export const useTrackingStore = create((set, get) => ({
  // State
  Minutes: 0,
  TrackingLoading: false,
  TrackingError: null,
  Streak: 0,
  Timezone: null,
  LastStreakUpdate: null, // ← Fecha de última actualización de racha
  HasInitialized: false,  // ← NUEVO: Flag para saber si InitTracking terminó

  // Actions
  setMinutes: (minutes) => set({ Minutes: minutes }),
  setStreak: (streak) => set({ Streak: streak }),
  setTimezone: (timezone) => set({ Timezone: timezone }),

  // Función centralizada para obtener/guardar timezone
  ensureUserTimezone: async (userId) => {
    try {
      // 1. Intentar obtener timezone existente
      const { data: existingData, error: fetchError } = await supabase
        .from('profiles_configs')
        .select('timezone')
        .eq('user_id', userId)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      let userTimezone;
      if (existingData?.timezone) {
        userTimezone = existingData.timezone;
      } else {
        // 2. Si no existe, detectar del navegador
        userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        // 3. Guardar en la base de datos
        const { error: upsertError } = await supabase
          .from('profiles_configs')
          .upsert({
            user_id: userId,
            timezone: userTimezone,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id',
            ignoreDuplicates: false
          });

        if (upsertError) throw upsertError;
      }

      set({ Timezone: userTimezone });
      return { success: true, timezone: userTimezone };

    } catch (error) {
      console.error('❌ Error ensuring user timezone:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  },

  InitTracking: async () => {
    const { user } = useAuthStore.getState();
    
    if (!user) {
      return { success: false, error: 'No user found' };
    }

    try {
      set({ TrackingLoading: true, TrackingError: null });

      // 1. Asegurar que tenemos la timezone del usuario
      const timezoneResult = await get().ensureUserTimezone(user.id);
      if (!timezoneResult.success) {
        throw new Error(timezoneResult.error);
      }

      // 2. RESETEAR minutos si es un nuevo día
      // Usar fecha local del usuario, no UTC
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const clientDate = `${year}-${month}-${day}`;
      
      console.log('📅 Fecha local del cliente:', clientDate);
      
      const { data: resetResult, error: resetError } = await supabase
        .rpc('reset_daily_minutes', {
          p_user_id: user.id,
          p_client_date: clientDate
        });

      if (resetError) {
        console.error('❌ Error resetting daily minutes:', resetError);
      } else if (resetResult?.reset) {
        console.log('🔄 Daily minutes reseteados:', resetResult);
      }

      // 3. Cargar datos de reading_tracking
      const { data: trackingData, error: trackingError } = await supabase
        .from('reading_tracking')
        .select('daily_reading_time, streak')
        .eq('user_id', user.id)
        .maybeSingle();

      if (trackingError && trackingError.code !== 'PGRST116') {
        throw trackingError;
      }

      // 4. Si no existe registro de tracking, crearlo (UPSERT para evitar duplicados)
      if (!trackingData) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        const { data: newTracking, error: upsertError } = await supabase
          .from('reading_tracking')
          .upsert({
            user_id: user.id,
            daily_reading_time: 0,
            streak: 0,
            update_at: new Date().toISOString(),
            streak_updated_at: yesterday.toISOString()
          }, {
            onConflict: 'user_id',
            ignoreDuplicates: false
          })
          .select()
          .single();
        
        if (upsertError) throw upsertError;
        
        set({ 
          Minutes: 0, 
          Streak: 0, 
          TrackingLoading: false,
          HasInitialized: true
        });
        return { 
          success: true, 
          data: newTracking,
          timezone: timezoneResult.timezone,
          wasReset: resetResult?.reset || false
        };
      }

      // 5. Si ya existe, cargar los datos
      set({ 
        Minutes: trackingData.daily_reading_time || 0,
        Streak: trackingData.streak || 0,
        TrackingLoading: false,
        HasInitialized: true
      });

      return { 
        success: true, 
        data: trackingData,
        timezone: timezoneResult.timezone,
        wasReset: resetResult?.reset || false
      };

    } catch (error) {
      console.error('❌ Error in InitTracking:', error);
      set({ 
        TrackingError: error.message, 
        TrackingLoading: false 
      });
      return { 
        success: false, 
        error: error.message 
      };
    }
  },

  UpdateMinutes: async () => {
    const { user } = useAuthStore.getState();
    const { Minutes } = get();
    
    if (!user) {
      return { success: false, error: 'No user found' };
    }

    try {
      set({ TrackingLoading: true, TrackingError: null });

      // Verificar si existe el registro
      const { data: existingRecord, error: fetchError } = await supabase
        .from('reading_tracking')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (!existingRecord) {
        set({ TrackingLoading: false });
        return { 
          success: false, 
          error: 'Tracking record not found. Run InitTracking first.' 
        };
      }

      // Actualizar minutos
      const { data, error } = await supabase
        .from('reading_tracking')
        .update({
          daily_reading_time: Minutes,
          update_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      
      set({ TrackingLoading: false });
      return { success: true, data };

    } catch (error) {
      console.error('❌ Error updating minutes:', error);
      set({ 
        TrackingError: error.message, 
        TrackingLoading: false 
      });
      return { 
        success: false, 
        error: error.message 
      };
    }
  },


  updateStreakOnly: async () => {
    const { user } = useAuthStore.getState();
    const { Minutes } = get();
    
    if (!user) {
      return { 
        success: false, 
        error: 'User not authenticated' 
      };
    }

    try {
      set({ TrackingLoading: true, TrackingError: null });

      // OBTENER FECHA LOCAL DEL USUARIO
      // OBTENER FECHA LOCAL DEL USUARIO
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const clientDate = `${year}-${month}-${day}`;
      
      console.log("📅 updateStreakOnly - Fecha enviada:", clientDate);
      console.log("⏱️ updateStreakOnly - Minutos enviados:", Minutes);

      // Llamar a la nueva función SQL que solo maneja streak
      const { data, error } = await supabase
        .rpc('update_streak_only', {
          p_user_id: user.id,
          p_current_minutes: Minutes,
          p_client_date: clientDate
        });

      if (error) throw error;

      const result = data;
      
      if (result.success) {
        set({ 
          Streak: result.streak, 
          TrackingLoading: false,
          LastStreakUpdate: clientDate // ← Guardar fecha de actualización
        });

        console.log("✅ updateStreakOnly resultado:", result);
        return result;
      } else {
        throw new Error(result.error || 'Unknown error from update_streak_only');
      }
      
    } catch (error) {
      console.error('❌ Error in updateStreakOnly:', error);
      set({ 
        TrackingError: error.message, 
        TrackingLoading: false 
      });
      return { 
        success: false, 
        error: error.message,
        streak: get().Streak
      };
    }
  },

  // Opcional: mantener esta función por compatibilidad
  getUserTimeZone: async () => {
    const { user } = useAuthStore.getState();
    if (!user) return null;
    
    return get().ensureUserTimezone(user.id);
  }
}));