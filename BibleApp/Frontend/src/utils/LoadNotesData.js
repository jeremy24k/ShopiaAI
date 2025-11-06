import supabase from "../supabase/supabase";

const LoadNotesData = async (options = {}) => {
    try {
        if(options.uniqueCheck) {
            let query = supabase
                .from(options.table)
                .select('*')
                .eq('user_id', options.user.id);
            
            const { data: existingRecords, error: checkError } = await query
                .match(options.uniqueCheck)
                .order(options.orderBy?.column || 'id', { 
                    ascending: options.orderBy?.ascending ?? false 
                });
            
            if (checkError) throw checkError;

            if (existingRecords?.length > 0) {
                return { success: true, data: existingRecords };
            }
        }

        if (options.verseKey) {
            let query = supabase
            .from(options.table)
            .select(options.select || '*')
            .eq('user_id', options.user.id)
            .eq('verse_key', options.verseKey);
            
            const { data, error } = await query
                .order(options.orderBy?.column || 'id', { 
                    ascending: options.orderBy?.ascending ?? false 
                });

            if (error) {
                return { success: false, error: error.message };
            }

            console.log("cargado para versekey");
            return { success: true, data };
        }

        let query = supabase
            .from(options.table)
            .select(options.select || '*')
            .eq('user_id', options.user.id);
        
        const { data, error } = await query
            .order(options.orderBy?.column || 'id', { 
                ascending: options.orderBy?.ascending ?? false 
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