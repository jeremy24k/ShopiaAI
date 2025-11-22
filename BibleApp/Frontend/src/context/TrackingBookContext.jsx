import { useContext } from "react";
import { createContext, useState } from "react";
import { AuthContext } from "./AuthContext";
import supabase from "../supabase/supabase";

const TrackingBookContext = createContext();

function TrackingBookContextProvider({ children }) {
    const { user, isAuthenticated } = useContext(AuthContext);

    const [CompleteLoading, setCompleteLoading] = useState(false);
    const [CompleteError, setCompleteError] = useState(null);
    const [CompleteChapter, setCompleteChapter] = useState([]);

    const markAsCompleted = async (book) => {
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
                .select('book_data, chapter_id')
                .single();
            
            if (error) throw error;
            
            console.log('✅ Book completed successfully');
            setCompleteLoading(false);
            setCompleteChapter([...CompleteChapter, data]);
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
            setCompleteChapter(CompleteChapter.filter(item => item.chapter_id !== UncompleteBookId));
            return { success: true, data: data };
        } catch (error) {
            console.error('❌ Error uncompleting book:', error);
            setCompleteError(error.message);
            setCompleteLoading(false);
            return { success: false, error: error.message };
        }
    }

    const getCompleteChapter = async () => {
        if (!isAuthenticated) {
            console.log('⚠️ No user authenticated');
            return;
        }

        try {
            setCompleteLoading(true);
            setCompleteError(null);

            const { data, error } = await supabase
                .from('books_tracking')
                .select('book_data, chapter_id')
                .eq('user_id', user.id);
            
            if (error) throw error;
            
            console.log('✅ All completed chapters loaded:', data.length);
            setCompleteLoading(false);  
            setCompleteChapter(data);
            return { success: true, data: data };
        } catch (error) {
            console.error('❌ Error loading completed chapters:', error);
            setCompleteError(error.message);
            setCompleteLoading(false);
            return { success: false, error: error.message };
        }
    }

    const isChapterCompleted = (chapterId) => {
        return CompleteChapter.some(item => item.chapter_id === chapterId);
    };
    
    const value = {
        markAsCompleted,
        unCompleteChapter,
        getCompleteChapter,
        isChapterCompleted,
        CompleteChapter,
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
