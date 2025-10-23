// React imports
import { createContext, useState, useContext } from "react";

// External imports
import supabase from "../supabase/supabase";

// Context imports
import { AuthContext } from "./AuthContext";

// Create Favorites Context
const FavoritesContext = createContext();

function FavoritesContextProvider({ children }) {
    const { user } = useContext(AuthContext);
    const [LoadFavoritesVerses, setLoadFavoritesVerses] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingFavorites, setLoadingFavorites] = useState({});

    const setLoadingFavoritesHandler = (verseKey, isLoading) => {
        setLoadingFavorites(prev => ({
            ...prev,
            [verseKey]: isLoading
        }));
    };

    const SaveFavorite = async (verseToSave = null) => {
        if (!user) {
            console.error('❌ No user authenticated');
            return;
        }

        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('favorites')
                .insert({
                    user_id: user.id,
                    verse_content: verseToSave,
                    verse_key: verseToSave.verseKey
                });

            if (error) {
                setError(error.message || 'Error saving favorite');
                throw error;
            }

            // Handle successful save
            console.log('✅ Favorite saved successfully:', data || 'no data returned');
            setLoading(false);  
            LoadFavorites();
            return { success: true, data }; 
        } catch (error) {
            console.error('❌ Error saving favorite:', error);
            setError(error.message || 'Error saving favorite');
            setLoading(false);
            return { success: false, error: error.message };
        }
    }

    const LoadFavorites = async (silent = false) => {
        if (!user) {
            console.error('❌ No user authenticated');
            return;
        }

        try {
            if (!silent) setLoading(true);
            const { data, error } = await supabase
                .from('favorites')
                .select('verse_content, created_at')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false }); // Último guardado primero

            if (error) {
                setError(error.message || 'Error loading favorites');
                throw error;
            }

            // Update favorites state
            setLoadFavoritesVerses(data || []);
            console.log('✅ Favorites loaded successfully:', data || 'no data returned');
            if (!silent) setLoading(false);
            
        } catch (error) {
            console.error('❌ Error loading favorites:', error);
            setError(error.message || 'Error loading favorites');
            if (!silent) setLoading(false);
            throw error;
        }
    };

    const RemoveFavorite = async (verseKey = null) => {
        if (!user) {
            console.error('❌ No user authenticated');
            return;
        }

        try {
            setLoadingFavoritesHandler(verseKey, true);

            const { error } = await supabase
                .from('favorites')
                .delete()
                .eq('user_id', user.id)
                .eq('verse_key', verseKey);

            if (error) {
                setError(error.message || 'Error removing favorite');
                throw error;
            }

            console.log('✅ Favorite removed successfully');
            setLoadingFavoritesHandler(verseKey, false);
            LoadFavorites(true);
            return { success: true };
        } catch (error) {
            console.error('❌ Error removing favorite:', error);
            setError(error.message || 'Error removing favorite');
            setLoadingFavoritesHandler(verseKey, false);
            return { success: false, error: error.message };
        }
    };

    return (
        <FavoritesContext.Provider value={{ SaveFavorite, LoadFavorites, RemoveFavorite, loading, loadingFavorites, error, LoadFavoritesVerses }}>
            {children}
        </FavoritesContext.Provider>
    );
}

export { FavoritesContextProvider, FavoritesContext };
