import supabase from "../../supabase/supabase";

const DeleteNotesData = async (noteId, options = {}) => {
    try {
        if (options.type === 'notes') {
            const { error } = await supabase
                .from(options.table)
                .delete()
                .eq('user_id', options.user.id)
                .eq('id', noteId);
    
            if (error) {
                // error:('❌ Error deleting Note:', error);
                return { success: false, error: error.message };
            }

            // log:('✅ Note deleted successfully');
            return { success: true };
        }

        if (options.type === 'notes_verses') {
            const { error } = await supabase
                .from(options.table)
                .delete()
                .eq('user_id', options.user.id)
                .eq('user_verse_key', noteId);
    
            if (error) {
                // error:('❌ Error deleting NoteVerse:', error);
                return { success: false, error: error.message };
            }

            // log:('✅ NoteVerse deleted successfully');
            return { success: true };
        }

        return { success: false, error: 'invalid elimination type' };
        
    } catch (error) {
        // error:('❌ Error deleting from notes:', error);
        return { success: false, error: error.message };
    }
};

export default DeleteNotesData;