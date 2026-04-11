import supabase from "../../supabase/supabase";

const LoadVerseData = async (options = {}) => {
    try {
        const { data, error } = await supabase
            .from('notes_verses')
            .select('verse_data')
            .eq('verse_key', options.verseKey)
            .eq('user_id', options.user.id)
            .single();

        if (error) {
            // Si no existe, crear el registro del versículo
            if (error.code === 'PGRST116') { // No rows found
                // Aquí necesitarías los datos del versículo para crear el registro
                // Por ahora, retornamos null y usamos el fallback
                return { success: true, data: null };
            }
            throw error;
        }

        return { success: true, data };
        
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export default LoadVerseData;
