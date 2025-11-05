import supabase from "../supabase/supabase";

const DeleteNotesData = async (recordId, options = {}) => {
    try {
        const { error } = await supabase
            .from(options.table)
            .delete()
            .eq('user_id', options.user.id)
            .eq('id', recordId);

        if (error) {
            return { success: false, error: error.message };
        }

        console.log('✅ Record deleted successfully');
        return { success: true };
        
    } catch (error) {
        console.error('❌ Error deleting from notes:', error);
        return { success: false, error: error.message };
    }
};

export default DeleteNotesData;