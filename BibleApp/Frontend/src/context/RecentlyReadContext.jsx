import { createContext, useContext, useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import supabase from "../supabase/supabase";

const RecentlyReadContext = createContext();

function RecentlyReadContextProvider({ children }) {
    const { user, isAuthenticated } = useContext(AuthContext);
    const [recentlyRead, setRecentlyRead] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Cargar libros recientes al iniciar
    useEffect(() => {
        if (isAuthenticated) {
            loadRecentlyRead();
        }
    }, [isAuthenticated]);

    const loadRecentlyRead = async () => {
        if (!isAuthenticated) return;

        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('recently_read')
                .select('*')
                .eq('user_id', user.id)
                .order('updated_at', { ascending: false }) // Más reciente primero
                .limit(6);
            
            if (error) throw error;
            
            setRecentlyRead(data || []);
        } catch (error) {
            setError(error.message);
            console.error('❌ Error loading recently read:', error);
        } finally {
            setLoading(false);
        }
    };

    const addRecentlyRead = async (book) => {
        if (!isAuthenticated) {
            console.log('⚠️ No user authenticated');
            return;
        }

        try {
            // 1. Obtener libros actuales
            const { data: existing, error: fetchError } = await supabase
                .from('recently_read')
                .select('*')
                .eq('user_id', user.id)
                .order('updated_at', { ascending: true });

            if (fetchError) throw fetchError;

            // 2. Verificar si el libro ya existe
            const bookExists = existing?.find(
                item => item.book_data.bookId === book.bookId
            );

            if (bookExists) {
                // Actualizar timestamp
                const { error: updateError } = await supabase
                    .from('recently_read')
                    .update({ updated_at: new Date().toISOString() })
                    .eq('id', bookExists.id);
                
                if (updateError) throw updateError;
                console.log('✅ Book timestamp updated');
            } else {
                // 3. Si hay 6 o más, eliminar el más antiguo
                if (existing && existing.length >= 6) {
                    const oldestBook = existing[0];
                    await supabase
                        .from('recently_read')
                        .delete()
                        .eq('id', oldestBook.id);
                    console.log('🗑️ Oldest book removed');
                }

                // 4. Insertar nuevo libro
                const { error: insertError } = await supabase
                    .from('recently_read')
                    .insert({
                        user_id: user.id,
                        book_data: book,
                        updated_at: new Date().toISOString()
                    });
                
                if (insertError) throw insertError;
                console.log('✅ New book added');
            }

            // 5. Recargar lista
            await loadRecentlyRead();
            return { success: true };
            
        } catch (error) {
            setError(error.message);
            console.error('❌ Error adding recently read:', error);
            return { success: false, error: error.message };
        }
    };

    // useEffect(() => {
    //     console.log("libros leidos recientemente", recentlyRead);
    // }, [recentlyRead]);

    const value = {
        recentlyRead,
        loading,
        addRecentlyRead,
        loadRecentlyRead
    };

    return (
        <RecentlyReadContext.Provider value={value}>
            {children}
        </RecentlyReadContext.Provider>
    );
}

export { RecentlyReadContext, RecentlyReadContextProvider };