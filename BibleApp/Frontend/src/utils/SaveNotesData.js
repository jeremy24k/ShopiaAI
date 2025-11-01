import supabase from "../supabase/supabase";

const SaveNotesData = async (data, options = {}) => {
    try {
        let exists = false;

        // Verificar si ya existe (solo para detectar, no para evitar inserción)
        if (options.uniqueCheck) {
            const { data: existingRecords, error: checkError } = await supabase
                .from('notes')
                .select('*')
                .eq('user_id', options.user.id)
                .match(options.uniqueCheck);
            
            if (checkError) throw checkError;

            if (existingRecords?.length > 0) {
                exists = true; // ✅ DETECTAR que ya existe, pero NO evitar inserción
                console.log('⚠️ Verse key ya existe, pero insertando nuevo registro');
            }
        }

        // ✅ SIEMPRE INSERTAR NUEVO REGISTRO (sin importar si existe)
        const { data: newRecord, error } = await supabase
            .from('notes')
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
            exists: exists, // ← true si ya existía, false si es completamente nuevo
            updated: false 
        };
        
    } catch (error) {
        console.error('❌ Error:', error);
        return { success: false, error: error.message };
    }
};

export default SaveNotesData;