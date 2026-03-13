import { useEffect } from "react";
import { create } from "zustand";
import { useAuthStore } from './AuthStore';
import { getAuthHeaders } from '../utils/authHeaders';

const BASE_URL = import.meta.env.VITE_API_URL;

// 1. Creamos un store de Zustand para centralizar el estado y evitar re-renders múltiples
// Esto mantendrá sincronizados los créditos en cualquier componente sin redescargar de la API repetidas veces.
const useCreditStore = create((set, get) => ({
    credits: 0,
    tier: 'FREE',
    loading: false,
    hasFetched: false,
    fetchPromise: null,

    fetchCredits: async (userId) => {
        if (!userId) {
            set({ credits: 0, tier: 'FREE', hasFetched: false });
            return;
        }

        // Si ya hay una solicitud en vuelo, esperamos a esa en lugar de hacer otra
        const { fetchPromise } = get();
        if (fetchPromise) {
            return fetchPromise;
        }

        const promise = (async () => {
            try {
                const authHeaders = await getAuthHeaders();
                const response = await fetch(`${BASE_URL}/payments/credits/${userId}`, {
                    headers: authHeaders
                });
                const data = await response.json();
                set({ credits: data.credits, tier: data.tier, hasFetched: true });
                return data;
            } catch (error) {
                console.error('Error fetching credits:', error);
            } finally {
                set({ fetchPromise: null });
            }
        })();

        set({ fetchPromise: promise });
        return promise;
    },

    claimDailyCredits: async (userId) => {
        if (!userId) return { success: false, message: 'No autenticado' };

        set({ loading: true });

        try {
            const authHeaders = await getAuthHeaders();
            const response = await fetch(`${BASE_URL}/payments/daily-credits`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeaders },
                body: JSON.stringify({ userId })
            });

            const data = await response.json();

            if (data.success) {
                await get().fetchCredits(userId);
            }

            set({ loading: false });
            return data;
        } catch (error) {
            console.error('Error claiming daily credits:', error);
            set({ loading: false });
            return { success: false, message: 'Error al reclamar créditos' };
        }
    },
    
    // Método para forzar refetch
    resetFetchState: () => set({ hasFetched: false })
}));

export const useCredits = () => {
    const { user } = useAuthStore();
    
    const credits = useCreditStore(state => state.credits);
    const tier = useCreditStore(state => state.tier);
    const loading = useCreditStore(state => state.loading);
    const hasFetched = useCreditStore(state => state.hasFetched);
    const storeFetchCredits = useCreditStore(state => state.fetchCredits);
    const storeClaimDailyCredits = useCreditStore(state => state.claimDailyCredits);
    const resetFetchState = useCreditStore(state => state.resetFetchState);

    // Envolvemos las funciones para que automáticamente usen el usuario actual
    const fetchCredits = async (force = false) => {
        if (user?.id) {
            if (force) resetFetchState();
            return storeFetchCredits(user.id);
        }
    };

    const claimDailyCredits = async () => {
        return storeClaimDailyCredits(user?.id);
    };

    useEffect(() => {
        // Solo obtener si tenemos un usuario y no hemos fetcheado aún
        if (user?.id && !hasFetched) {
            fetchCredits();
        }
    }, [user?.id, hasFetched]);

    return {
        credits,
        tier,
        loading,
        hasFetched,
        fetchCredits,
        claimDailyCredits
    };
};