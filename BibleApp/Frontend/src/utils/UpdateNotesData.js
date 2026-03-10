import supabase from "../supabase/supabase";

const UpdateNotesData = async (noteId, noteData, options = {}) => {
    try {
        const updateData = {
            note_content: noteData.content_html,
            note_text: noteData.content_text,
            update_at: new Date().toISOString()
        };

        // Agregar note_title solo si está presente en noteData
        if (noteData.note_title !== undefined) {
            updateData.note_title = noteData.note_title;
        }

        const { data: updatedRecord, error } = await supabase
            .from(options.table)
            .update(updateData)
            .eq('id', noteId)
            .select()
            .single();
    
        if (error) throw error;
    
        return { success: true, data: updatedRecord };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export default UpdateNotesData;
