import { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";
import supabase from "../supabase/supabase";

const TrackingContext = createContext();

function TrackingContextProvider({ children }) {
    const { user } = useContext(AuthContext);

    const [Minutes, setMinutes] = useState(0);
    const [TrackingLoading, setTrackingLoading] = useState(false);
    const [TrackingError, setTrackingError] = useState(null);

    const InitMinutes = async () => {
        if (!user) {
            console.log('⚠️ No user authenticated');
            return;
        }

        try {
            setTrackingLoading(true);
            setTrackingError(null);
            
            const { data, error } = await supabase
                .from('read_time')
                .insert({
                    user_id: user.id,
                    minutes: Minutes
                })
                .select()
                .single();
            
            if (error) throw error;
            
            console.log('✅ Minutes saved successfully');
            setTrackingLoading(false);
            return { success: true, data: data };
        } catch (error) {
            if (error.code == '23505') {
                console.log('✅ Minutes already exists');
            } else {
                console.error('❌ Error saving minutes:', error);
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
                .from('read_time')
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

    const LoadCurrentMinute = async () => {
        if (!user) {
            console.log('⚠️ No user authenticated');
            return;
        }

        try {
            setTrackingLoading(true);
            setTrackingError(null);
            
            const { data, error } = await supabase
                .from('read_time')
                .select('minutes')
                .eq('user_id', user.id)
                .single();
            
            if (error) throw error;
            
            console.log('✅ Minutes loaded successfully');
            setMinutes(data.minutes);
            setTrackingLoading(false);
            return { success: true, data: data };
        } catch (error) {
            console.error('❌ Error loading minutes:', error);
            setTrackingError(error.message);
            setTrackingLoading(false);
            return { success: false, error: error.message };
        }
    }

    const value = {
        Minutes,
        setMinutes,
        TrackingLoading,
        TrackingError,
        InitMinutes,
        UpdateMinutes,
        LoadCurrentMinute
    };

    return (
        <TrackingContext.Provider value={value}>
            {children}
        </TrackingContext.Provider>
    );
}

export { TrackingContext, TrackingContextProvider };