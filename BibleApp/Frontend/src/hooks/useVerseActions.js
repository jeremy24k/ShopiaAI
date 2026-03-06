import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFavoritesStore } from "../store/FavoritesStore";
import { useVersesNotesStore } from "../store/VersesNotesStore";
import { useAiStore } from "../store/AiStore";
import { useNotificationStore } from "../store/NotificationStore";
import useProtectedAction from "./useProtectedAction";

/**
 * Custom hook para manejar las acciones de versículos (favoritos, notas, IA)
 * @param {Object} options - Opciones de configuración
 * @param {string} options.bookId - ID del libro
 * @param {number} options.chapterNumber - Número del capítulo
 * @returns {Object} Funciones y estado para manejar acciones de versículos
 */
function useVerseActions({ bookId, chapterNumber } = {}) {
    const navigate = useNavigate();
    const { SaveFavorite } = useFavoritesStore();
    const { SaveVerses } = useVersesNotesStore();
    const { protectedAction, isAuthenticated } = useProtectedAction();
    const [alertVerseId, setAlertVerseId] = useState({ verseId: null, type: null });

    /**
     * Verifica si se debe mostrar una alerta para un verso específico
     */
    function shouldShowAlert(verseData, type) {
        const verseId = `${verseData.bookId}-${verseData.chapterNumber}-${verseData.verseNumber}`;
        return alertVerseId.verseId === verseId && alertVerseId.type === type;
    }

    /**
     * Guarda un versículo como favorito
     * @param {Object} verseData - Datos del versículo
     */
    async function handleSaveFavorite(verseData) {
        return protectedAction(async () => {
            const result = await SaveFavorite(verseData);
            
            // Handle duplicate favorite error
            if (result.success && result.exists) {
                const verseId = `${verseData.bookId}-${verseData.chapterNumber}-${verseData.verseNumber}`;
                setAlertVerseId({ verseId, type: 'favorite' });
                setTimeout(() => {
                    setAlertVerseId({ verseId: null, type: null });
                }, 3000);
            } else if (result.success) {
                navigate(`/favorites`);
            }
            
            return result;
        }, 'Guardar Un Favorito')();
    }

    /**
     * Crea una nota para un versículo
     * @param {Object} verseData - Datos del versículo
     */
    async function handleCreateNote(verseData) {
        return protectedAction(async () => {
            const result = await SaveVerses(verseData);
            
            // Handle duplicate note error
            if (result.success && result.exists) {
                const verseId = `${verseData.bookId}-${verseData.chapterNumber}-${verseData.verseNumber}`;
                setAlertVerseId({ verseId, type: 'note' });
                setTimeout(() => {
                    setAlertVerseId({ verseId: null, type: null });
                }, 3000);
            } else if (result.success) {
                navigate(`/notes`);
            }
            
            return result;
        }, 'Crear Nota')();
    }

    /**
     * Explica un versículo con IA
     * @param {Object} verseData - Datos del versículo
     */
    function handleExplainVerse(verseData) {
        const { showWithAction } = useNotificationStore.getState();
        const { currentConversationId, setVerseToExplain, verseToExplain } = useAiStore.getState();
        
        // Agregar versículo al contexto de IA
        const updatedVerses = [...verseToExplain, verseData];
        setVerseToExplain(updatedVerses);
        
        // Determinar la ruta de navegación
        const targetRoute = currentConversationId ? `/ai/${currentConversationId}` : '/ai';
        const actionText = currentConversationId ? 'Ir a conversación' : 'Ir a IA';
        
        // Mostrar notificación con botón de acción
        showWithAction(
            `✨ Versículo ${verseData.verseNumber} agregado para explicación`,
            actionText,
            () => {
                navigate(targetRoute, { 
                    state: { 
                        selectedVerses: [verseData],
                        selectionInfo: {
                            mode: 'single',
                            bookId: verseData.bookId,
                            chapterNumber: verseData.chapterNumber,
                            count: 1
                        }
                    }
                });
            },
            {
                duration: 6000,
            }
        );
    }

    return {
        handleSaveFavorite,
        handleCreateNote,
        handleExplainVerse,
        shouldShowAlert,
        alertVerseId,
        isAuthenticated
    };
}

export default useVerseActions;
