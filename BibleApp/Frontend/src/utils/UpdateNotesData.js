import supabase from "../supabase/supabase";

const UpdateNotesData = async (noteId, noteData, options = {}) => {
    try {
        console.log('noteId recibido:', noteId, typeof noteId);
        console.log('noteData recibido:', noteData);

        const { data: updatedRecord, error } = await supabase
            .from(options.table)
            .update({
                note_content: noteData.content_html,
                note_text: noteData.content_text,
                update_at: new Date().toISOString()
            })
            .eq('id', noteId)
            .select()
            .single();
    
        if (error) throw error;
    
        console.log('✅ Note updated successfully');
        return { success: true, data: updatedRecord };
    } catch (error) {
        console.error('❌ Error updating note:', error);
        return { success: false, error: error.message };
    }
};

export default UpdateNotesData;
