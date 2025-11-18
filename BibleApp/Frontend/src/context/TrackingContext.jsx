import { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";
import supabase from "../supabase/supabase";

const TrackingContext = createContext();

function TrackingContextProvider({ children }) {
    const { user } = useContext(AuthContext);

    const [Minutes, setMinutes] = useState(0);
    const [TrackingLoading, setTrackingLoading] = useState(false);
    const [TrackingError, setTrackingError] = useState(null);
    const [Streak, setStreak] = useState(0);

    const InitMinutes = async () => {
        if (!user) {
            console.log('⚠️ No user authenticated');
            return;
        }

        try {
            setTrackingLoading(true);
            setTrackingError(null);

            const { data: existingData, error: fetchError } = await supabase
            .from('streak')
            .select('minutes')
            .eq('user_id', user.id)
            .maybeSingle();

            if (fetchError && fetchError.code !== 'PGRST116') {
                throw fetchError;
            }

            console.log('has minutes', existingData?.minutes);

            if (existingData) {
                console.log('✅ Minutes found:', existingData.minutes);
                setMinutes(existingData.minutes);
                setTrackingLoading(false);
                return { success: true, data: existingData };
            }

            console.log('✅ Minutes not found, creating new entry');
        
            const { data: newData, error: insertError } = await supabase
                .from('streak')
                .insert({
                    user_id: user.id,
                    minutes: 0
                })
                .select()
                .single();
            
            if (insertError) throw insertError;
            
            console.log('✅ New minutes entry created successfully');
            setMinutes(0);
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
        if (!user) {
            console.log('⚠️ No user authenticated');
            return;
        }

        try {
            setTrackingLoading(true);
            setTrackingError(null);

            const { data, error } = await supabase
                .from('streak')
                .update({
                    minutes: Minutes,
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

    const initStreak = async () => {
        if (!user) {
            console.log('⚠️ No user authenticated');
            return;
        }

        try {
            setTrackingLoading(true);
            setTrackingError(null);

            // 1. Buscar streak existente
            const { data: existingStreak, error: fetchError } = await supabase
                .from('streak')
                .select('streak')
                .eq('user_id', user.id)
                .maybeSingle();
            
            if (fetchError) throw fetchError;
            
            let newStreakValue;

            // 2. Determinar el nuevo valor del streak
            if (!existingStreak) {
                // Primer streak del usuario
                console.log('✅ No existing streak, starting at 1');
                newStreakValue = 1;
            } else {
                // Incrementar streak existente
                newStreakValue = existingStreak.streak + 1;
                console.log('✅ Incrementing streak to:', newStreakValue);
            }

            // 3. Actualizar en base de datos
            const { data: updatedStreak, error: updateError } = await supabase
                .from('streak')
                .update({
                    streak: newStreakValue,
                    update_at: new Date().toISOString()
                })
                .eq('user_id', user.id)
                .select()
                .single();
            
            if (updateError) throw updateError;

            // 4. Actualizar estado local
            setStreak(newStreakValue);
            setTrackingLoading(false);
            console.log('✅ Streak updated successfully:', newStreakValue);
            return { success: true, streak: newStreakValue };
            
        } catch (error) {
            console.error('❌ Error managing streak:', error);
            setTrackingError(error.message);
            setTrackingLoading(false);
            return { success: false, error: error.message };
        }
    }

    useEffect(() => {
        if (Minutes === 30) {
            console.log('✅ Streak updated successfully:');
            initStreak();
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
        InitMinutes,
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