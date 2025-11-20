import { useContext } from "react";
import { createContext, useState } from "react";
import { AuthContext } from "./AuthContext";
import supabase from "../supabase/supabase";

const TrackingBookContext = createContext();

function TrackingBookContextProvider({ children }) {
    const { user, isAuthenticated } = useContext(AuthContext);

    const [CompleteLoading, setCompleteLoading] = useState(false);
    const [CompleteError, setCompleteError] = useState(null);

    const completeChapter = async (book) => {
        if (!isAuthenticated) {
            console.log('⚠️ No user authenticated');
            return;
        }

        try {
            setCompleteLoading(true);
            setCompleteError(null);

            const { data, error } = await supabase
                .from('books_tracking')
                .insert({
                    user_id: user.id,
                    book_data: book,
                    chapter_id: book.id,
                    update_at: new Date().toISOString()
                })
                .select()
                .single();
            
            if (error) throw error;
            
            console.log('✅ Book completed successfully');
            setCompleteLoading(false);
            return { success: true, data: data };
        } catch (error) {
            console.error('❌ Error completing book:', error);
            setCompleteError(error.message);
            setCompleteLoading(false);
            return { success: false, error: error.message };
        }
    }

    const unCompleteChapter = async (UncompleteBookId) => {
        if (!isAuthenticated) {
            console.log('⚠️ No user authenticated');
            return;
        }

        try {
            setCompleteLoading(true);
            setCompleteError(null);

            const { data, error } = await supabase
                .from('books_tracking')
                .delete()
                .eq('user_id', user.id)
                .eq('chapter_id', UncompleteBookId)
                .select();
            
            if (error) throw error;
            
            console.log('✅ Book uncompleted successfully');
            setCompleteLoading(false);
            return { success: true, data: data };
        } catch (error) {
            console.error('❌ Error uncompleting book:', error);
            setCompleteError(error.message);
            setCompleteLoading(false);
            return { success: false, error: error.message };
        }
    }
    
    const value = {
        completeChapter,
        unCompleteChapter,
        CompleteLoading,
        CompleteError
    };

    return (
        <TrackingBookContext.Provider value={value}>
            {children}
        </TrackingBookContext.Provider>
    );
}

export { TrackingBookContext, TrackingBookContextProvider };
