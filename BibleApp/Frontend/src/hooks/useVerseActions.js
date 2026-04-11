import { useState } from "react";
import { useTranslation } from "./useTranslation";
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
    const { t } = useTranslation();
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
            const { showWithAction, showWarning } = useNotificationStore.getState();
            const result = await SaveFavorite(verseData);
            
            // Handle duplicate favorite error
            if (result.success && result.exists) {
                const verseId = `${verseData.bookId}-${verseData.chapterNumber}-${verseData.verseNumber}`;
                setAlertVerseId({ verseId, type: 'favorite' });
                setTimeout(() => {
                    setAlertVerseId({ verseId: null, type: null });
                }, 3000);
                
                showWarning(t('favorite_exists_title'), {
                    description: `${verseData.bookName} ${verseData.chapterNumber}:${verseData.verseNumber} ${t('favorite_exists_desc')}`,
                });
            } else if (result.success) {
                showWithAction(
                    t('favorite_saved_title'),
                    t('favorite_saved_button'),
                    () => navigate('/favorites'),
                    {
                        description: `${verseData.bookName} ${verseData.chapterNumber}:${verseData.verseNumber} ${t('favorite_saved_desc')}`,
                        duration: 5000
                    }
                );
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
            const { showWithAction, showWarning } = useNotificationStore.getState();
            const result = await SaveVerses(verseData);
            
            // Handle duplicate note error
            if (result.success && result.exists) {
                const verseId = `${verseData.bookId}-${verseData.chapterNumber}-${verseData.verseNumber}`;
                setAlertVerseId({ verseId, type: 'note' });
                setTimeout(() => {
                    setAlertVerseId({ verseId: null, type: null });
                }, 3000);
                
                showWarning(t('note_exists_title'), {
                    description: `${verseData.bookName} ${verseData.chapterNumber}:${verseData.verseNumber} ${t('note_exists_desc')}`,
                });
            } else if (result.success) {
                showWithAction(
                    t('note_created_title'),
                    t('note_created_button'),
                    () => navigate('/notes'),
                    {
                        description: `${t('note_created_desc')} ${verseData.bookName} ${verseData.chapterNumber}:${verseData.verseNumber}`,
                        duration: 5000
                    }
                );
            }
            
            return result;
        }, 'Crear Nota')();
    }

    /**
     * Explica un versículo con IA
     * @param {Object} verseData - Datos del versículo
     */
    function handleExplainVerse(verseData) {
        const { showWithAction, showWarning } = useNotificationStore.getState();
        const { currentConversationId, setVerseToExplain, verseToExplain } = useAiStore.getState();
        
        // Verificar si el versículo ya existe en el contexto (incluyendo traducción)
        const isDuplicate = verseToExplain.some(v => 
            v.bookName === verseData.bookName &&
            v.chapterNumber === verseData.chapterNumber &&
            v.verseNumber === verseData.verseNumber &&
            v.translationValue === verseData.translationValue
        );

        if (isDuplicate) {
            // Mostrar notificación de advertencia si ya existe
            showWarning(t('verse_already_in_context_title'), {
                description: `${verseData.bookName} ${verseData.chapterNumber}:${verseData.verseNumber} ${t('verse_already_in_context_desc')}`
            });
            return;
        }
        
        // Agregar versículo al contexto de IA
        const updatedVerses = [...verseToExplain, verseData];
        setVerseToExplain(updatedVerses);
        
        // Determinar la ruta de navegación
        const targetRoute = currentConversationId ? `/ai/${currentConversationId}` : '/ai';
        const actionText = currentConversationId ? t('go_to_conversation') : t('go_to_ai');
        
        // Mostrar notificación con botón de acción
        showWithAction(
            t('verse_added_ai_title'),
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
                description: `${verseData.bookName} ${verseData.chapterNumber}:${verseData.verseNumber} ${t('verse_added_ai_desc')}`,
                duration: 5000
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
