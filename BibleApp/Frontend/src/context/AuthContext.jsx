import { createContext, useState, useEffect } from "react";
import supabase from "../supabase/supabase";

const AuthContext = createContext();

function AuthContextProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkUser = async () => {
        console.log('🔐 AuthContext - Checking user...');
        const { data: { user } } = await supabase.auth.getUser();
        console.log('🔐 AuthContext - User found:', user);
        setUser(user);
        setLoading(false);
        console.log('🔐 AuthContext - Loading set to false');
    };

    const login = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email, 
            password
        });
        return { data, error };
    };

    const logout = async () => {
        const { error } = await supabase.auth.signOut();
        return { error };
    };

    const value = {
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user
    };

    useEffect(() => {
        // Verificar sesión al cargar
        checkUser();

        // Escuchar cambios de autenticación
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
            console.log('🔐 Auth state change:', event, session?.user ? 'User found' : 'No user');
            setUser(session?.user || null);
            setLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthContextProvider };
