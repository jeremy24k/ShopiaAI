import supabase from "../supabase/supabase";

const LoadNotesData = async (options = {}) => {
    try {
        let query = supabase
            .from(options.table)
            .select(options.select || '*')
            .eq('user_id', options.user.id);

        // Aplicar filtros según lo que se necesite
        if (options.uniqueCheck) {
            query = query.match(options.uniqueCheck);
        } else if (options.user_verse_key) {
            query = query.eq('user_verse_key', options.user_verse_key);
        }

        // Aplicar ordenamiento
        const { data, error } = await query
            .order(options.orderBy?.column || 'id', { 
                ascending: options.orderBy?.ascending ?? false 
            });

        if (error) throw error;

        console.log("Notes loaded for:", options.user_verse_key || 'all user notes');
        return { success: true, data };
        
    } catch (error) {
        console.error('❌ Error loading from notes:', error);
        return { success: false, error: error.message };
    }
};

export default LoadNotesData;