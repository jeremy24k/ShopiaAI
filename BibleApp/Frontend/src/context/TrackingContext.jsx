import { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";
import supabase from "../supabase/supabase";

const TrackingContext = createContext();

function TrackingContextProvider({ children }) {
    const { user, isAuthenticated } = useContext(AuthContext);

    const [Minutes, setMinutes] = useState(0);
    const [TrackingLoading, setTrackingLoading] = useState(false);
    const [TrackingError, setTrackingError] = useState(null);
    const [Streak, setStreak] = useState(0);

    const InitTracking = async () => {
        if (!isAuthenticated) {
            console.log('⚠️ No user authenticated');
            return;
        }

        try {
            setTrackingLoading(true);
            setTrackingError(null);

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
                setMinutes(existingData.daily_reading_time || 0);
                setStreak(existingData.streak || 0);
                setTrackingLoading(false);
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
            setMinutes(0);
            setStreak(0);
            setTrackingLoading(false);
            return { success: true, data: newData };

        } catch (error) {
            if (error.code === '23505') {
                console.log('✅ Minutes already exists');
                setTrackingLoading(false);
                return { success: true };
            } else {
                console.error('❌ Error managing minutes:', error);
                setTrackingError(error.message);
                setTrackingLoading(false);
                return { success: false, error: error.message };
            }
        }
    }

    const UpdateMinutes = async () => {
        if (!isAuthenticated) {
            console.log('⚠️ No user authenticated');
            return;
        }

        try {
            setTrackingLoading(true);
            setTrackingError(null);

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
            setTrackingLoading(false);
            return { success: true, data: data };
        } catch (error) {
            console.error('❌ Error updating minutes:', error);
            setTrackingError(error.message);
            setTrackingLoading(false);
            return { success: false, error: error.message };
        }
    }

    const checkAndIncrementStreak = async () => {
        if (!isAuthenticated || Minutes < 30) {
            console.log('⚠️ No user authenticated or Minutes its not 30');
            return;
        }

        try {
            setTrackingLoading(true);
            setTrackingError(null);

            // 1. Buscar streak existente
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

            // Solo incrementar si cumple condiciones (usar Minutes local, no DB)
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
                    setStreak(newStreakValue);
                    setTrackingLoading(false);
                    console.log('🔥 Streak incremented to:', newStreakValue);
                    return { success: true, streak: newStreakValue, incremented: true };
                }
            } else {
                // Ya incrementó hoy o no cumple 30 min
                setStreak(tracking.streak);
                setTrackingLoading(false);
                console.log('ℹ️ Streak not incremented. Current:', tracking.streak);
                return { success: true, streak: tracking.streak, incremented: false };
            }
        } catch (error) {
            console.error('❌ Error managing streak:', error);
            setTrackingError(error.message);
            setTrackingLoading(false);
            return { success: false, error: error.message };
        }
    }

    useEffect(() => {
        if (Minutes >= 30) {
            console.log('✅ Streak updated successfully:');
            checkAndIncrementStreak();
        }
    }, [Minutes]);

    useEffect(() => {
        console.log("HOLA ME EJECUTO");
    }, []);

    const value = {
        Minutes,
        setMinutes,
        TrackingLoading,
        TrackingError,
        InitTracking,
        UpdateMinutes,
        Streak,
        setStreak,
    };

    return (
        <TrackingContext.Provider value={value}>
            {children}
        </TrackingContext.Provider>
    );
}

export { TrackingContext, TrackingContextProvider };