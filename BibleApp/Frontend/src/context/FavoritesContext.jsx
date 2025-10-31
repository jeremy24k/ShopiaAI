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
        try {
            setLoading(true);

            if (!user) {
                console.error('❌ No user authenticated');
                return { success: false, error: 'No user authenticated' };
            }

            // 1. VERIFICAR SI EXISTE (método más robusto)
            const { data: existingFavorites, error: checkError } = await supabase
                .from('favorites')
                .select('id')
                .eq('user_id', user.id)
                .eq('verse_key', verseToSave.verseKey.toLowerCase());
            
            if (checkError) throw checkError;
            
            // Si ya existe, retornar sin guardar
            if (existingFavorites && existingFavorites.length > 0) {
                console.log('⚠️ Favorite already exists');
                setLoading(false);
                return { 
                    success: true, 
                    data: existingFavorites[0], 
                    exists: true,
                    message: 'Este versículo ya está en tus favoritos' 
                }; 
            }
            
            // 2. CREAR NUEVO FAVORITO
            const { data: newFavorite, error: insertError } = await supabase
                .from('favorites')
                .insert({
                    user_id: user.id,
                    verse_content: verseToSave,
                    verse_key: verseToSave.verseKey.toLowerCase()
                })
                .select()
                .single(); // ← Ahora sí puedes usar .single() aquí
            
            if (insertError) {
                setError(insertError.message);
                return { success: false, error: insertError.message };
            }

            console.log('✅ Favorite saved successfully');
            setLoading(false);  
            LoadFavorites(); // Recargar la lista
            
            return { 
                success: true, 
                data: newFavorite, 
                exists: false,
                message: 'Versículo agregado a favoritos' 
            }; 
            
        } catch (error) {
            console.error('❌ Error saving favorite:', error);
            setError(error.message);
            setLoading(false);
            return { 
                success: false, 
                error: error.message,
                message: 'Error al guardar el favorito' 
            };
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
                .select('id, verse_content, created_at')
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

    const RemoveFavorite = async (id = null) => {
        if (!user) {
            console.error('❌ No user authenticated');
            return;
        }

        try {
            setLoadingFavoritesHandler(id, true);

            const { error: errorRemoveFavorite } = await supabase
                .from('favorites')
                .delete()
                .eq('user_id', user.id)
                .eq('id', id);

            if (errorRemoveFavorite) {
                setError(errorRemoveFavorite.message || 'Error removing favorite');
                throw errorRemoveFavorite;
            }

            console.log('✅ Favorite removed successfully');
            setLoadingFavoritesHandler(id, false);
            LoadFavorites(true);
            return { success: true };
        } catch (error) {
            console.error('❌ Error removing favorite:', error);
            setError(error.message || 'Error removing favorite');
            setLoadingFavoritesHandler(id, false);
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
