import supabase from "../supabase/supabase";

const LoadNotesData = async (options = {}) => {
    try {
        // Si estamos cargando de la tabla 'notes', hacer LEFT JOIN con notes_verses para traer verse_data
        // LEFT JOIN permite traer el versículo incluso si no hay notas guardadas
        const selectQuery = options.table === 'notes' 
            ? `${options.select || '*'}, notes_verses!left(verse_data)`
            : options.select || '*';

        let query = supabase
            .from(options.table)
            .select(selectQuery)
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