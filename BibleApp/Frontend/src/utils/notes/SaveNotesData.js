import supabase from "../../supabase/supabase";

const SaveNotesData = async (data, options = {}) => {
    try {
        let exists = false;
        let existingRecords = [];

        // Verificar si ya existe (solo para detectar, no para evitar inserción)
        if (options.uniqueCheck) {
            const { data: existingRecords, error: checkError } = await supabase
                .from(options.table)
                .select('*')
                .eq('user_id', options.user.id)
                .match(options.uniqueCheck);
            
            if (checkError) throw checkError;

            if (existingRecords?.length > 0) {
                exists = true; // ✅ DETECTAR que ya existe, pero NO evitar inserción
            }
        }

        if (!exists) {
            // Solo insertar si no existe
            const { data: newRecord, error } = await supabase
                .from(options.table)
                .insert({
                    user_id: options.user.id,
                    ...data,
                    created_at: new Date().toISOString()
                })
                .select()
                .single();
    
            if (error) throw error;

            return { 
                success: true, 
                data: newRecord, 
                exists: exists, // true si ya existía, false si es completamente nuevo
                updated: false 
            };
        } else {
            return { 
                success: true, 
                data: existingRecords, 
                exists: exists, // true si ya existía, false si es completamente nuevo
                updated: false
            };
        }
        
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export default SaveNotesData;