import { create } from 'zustand';
import supabase from "../supabase/supabase";
import { useAuthStore } from './AuthStore';

export const useTrackingStore = create((set, get) => ({
  // State
  Minutes: 0,
  TrackingLoading: false,
  TrackingError: null,
  Streak: 0,

  // Actions
  setMinutes: (minutes) => set({ Minutes: minutes }),
  setStreak: (streak) => set({ Streak: streak }),

  InitTracking: async () => {
    const { user } = useAuthStore.getState();
    
    if (!user) {
      console.log('⚠️ No user authenticated');
      return;
    }

    try {
      set({ TrackingLoading: true, TrackingError: null });

      const { data: existingData, error: fetchError } = await supabase
        .from('reading_tracking')
        .select('daily_reading_time, streak')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      console.log('has data', existingData);

      if (existingData) {
        console.log('✅ Data found:', existingData);
        set({ 
          Minutes: existingData.daily_reading_time || 0,
          Streak: existingData.streak || 0,
          TrackingLoading: false
        });
        return { success: true, data: existingData };
      }

      console.log('✅ Data not found, creating new entry');
    
      const { data: newData, error: insertError } = await supabase
        .from('reading_tracking')
        .insert({
          user_id: user.id,
          daily_reading_time: 0,
          streak: 0
        })
        .select()
        .single();
      
      if (insertError) throw insertError;
      
      console.log('✅ New entry created successfully');
      set({ Minutes: 0, Streak: 0, TrackingLoading: false });
      return { success: true, data: newData };

    } catch (error) {
      if (error.code === '23505') {
        console.log('✅ Minutes already exists');
        set({ TrackingLoading: false });
        return { success: true };
      } else {
        console.error('❌ Error managing minutes:', error);
        set({ TrackingError: error.message, TrackingLoading: false });
        return { success: false, error: error.message };
      }
    }
  },

  UpdateMinutes: async () => {
    const { user } = useAuthStore.getState();
    const { Minutes } = get();
    
    if (!user) {
      console.log('⚠️ No user authenticated');
      return;
    }

    try {
      set({ TrackingLoading: true, TrackingError: null });

      const { data, error } = await supabase
        .from('reading_tracking')
        .update({
          daily_reading_time: Minutes,
          update_at: new Date()
        })
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      
      console.log('✅ Minutes updated successfully');
      set({ TrackingLoading: false });
      return { success: true, data: data };
    } catch (error) {
      console.error('❌ Error updating minutes:', error);
      set({ TrackingError: error.message, TrackingLoading: false });
      return { success: false, error: error.message };
    }
  },

  checkAndIncrementStreak: async () => {
    const { user } = useAuthStore.getState();
    const { Minutes } = get();
    
    if (!user || Minutes < 30) {
      console.log('⚠️ No user authenticated or Minutes its not 30');
      return;
    }

    try {
      set({ TrackingLoading: true, TrackingError: null });

      // 1. Find existing streak
      const { data: tracking, error: fetchError } = await supabase
        .from('reading_tracking')
        .select('streak, daily_reading_time, streak_updated_at')
        .eq('user_id', user.id)
        .single();
      
      if (fetchError) throw fetchError;

      const today = new Date().toISOString().split('T')[0];

      const lastUpdate = tracking.streak_updated_at 
        ? new Date(tracking.streak_updated_at).toISOString().split('T')[0]
        : null;

      // Only increment if conditions are met (use local Minutes, not DB)
      if (Minutes >= 30 && lastUpdate !== today) {
        const newStreakValue = tracking.streak + 1;
        
        const { error } = await supabase
          .from('reading_tracking')
          .update({
            streak: newStreakValue,
            streak_updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (!error) {
          set({ Streak: newStreakValue, TrackingLoading: false });
          console.log('🔥 Streak incremented to:', newStreakValue);
          return { success: true, streak: newStreakValue, incremented: true };
        }
      } else {
        // Already incremented today or doesn't meet 30 min
        set({ Streak: tracking.streak, TrackingLoading: false });
        console.log('ℹ️ Streak not incremented. Current:', tracking.streak);
        return { success: true, streak: tracking.streak, incremented: false };
      }
    } catch (error) {
      console.error('❌ Error managing streak:', error);
      set({ TrackingError: error.message, TrackingLoading: false });
      return { success: false, error: error.message };
    }
  }
}));
