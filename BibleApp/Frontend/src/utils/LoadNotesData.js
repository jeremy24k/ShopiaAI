import supabase from "../supabase/supabase";

const LoadNotesData = async (options = {}) => {
    try {
        if(options.uniqueCheck) {
            const { data: existingRecords, error: checkError } = await supabase
                .from(options.table)
                .select('*')
                .eq('user_id', options.user.id)
                .match(options.uniqueCheck);
            
            if (checkError) throw checkError;

            if (existingRecords?.length > 0) {
                return { success: true, data: existingRecords };
            }
        }
        
        const { data, error } = await supabase
            .from(options.table)
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