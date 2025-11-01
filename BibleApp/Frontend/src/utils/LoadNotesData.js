import supabase from "../supabase/supabase";

const LoadNotesData = async (options = {}) => {
    try {
        const { data, error } = await supabase
            .from('notes')
            .select(options.select || '*')
            .eq('user_id', options.user.id)
            .order(options.orderBy?.column || 'id', { 
                ascending: options.orderBy?.ascending || false 
            });

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, data };
        
    } catch (error) {
        console.error('❌ Error loading from notes:', error);
        return { success: false, error: error.message };
    }
};

export default LoadNotesData;