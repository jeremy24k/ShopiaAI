import { useEffect } from "react";
import { useBooksStore } from "../../store/BooksStore";
import { useParams, useNavigate } from "react-router-dom";
import { useReadFilters } from "../Read/Hooks/useReadFilters";

export function useChapterData() {
    const { bookId: urlBookId, chapterNumber: urlChapterNumber } = useParams();
    const navigate = useNavigate();
    
    // Obtener traducciones del store
    const translations = useBooksStore(state => state.translations);

    // Usar hook para obtener la traducción actual desde la URL
    const { translation: selectedTranslation } = useReadFilters(translations);

    const bookId = urlBookId ? urlBookId.toUpperCase() : "";
    const chapterNumber = urlChapterNumber || "1";
    
    const {
        chapterData,
        chapterLoading,
        chapterError,
        fetchChapter,
        clearChapterData
    } = useBooksStore();

    useEffect(() => {
        const loadChapter = async () => {
            if (!bookId || !chapterNumber) return;

            // 🧹 Limpiar datos anteriores al montar
            // clearChapterData(); // Comentado pq puede causar parpadeo si se limpia antes de fetch

            // Usar el valor de la traducción del hook (que viene de la URL o Default)
            const translationToUse = selectedTranslation.value;

            // Cargar capítulo
            await fetchChapter(bookId, chapterNumber, translationToUse);
        };

        loadChapter();

        // 🧹 LIMPIEZA AL DESMONTAR
        return () => {
            clearChapterData();
        };

    }, [bookId, chapterNumber, selectedTranslation.value, fetchChapter, clearChapterData]);

    const setChapterNumber = (newChapterNumber) => {
        // 🔥 Limpiar INMEDIATAMENTE antes de navegar para evitar flash en la siguiente pantalla
        clearChapterData();
        
        navigate(`/books/${bookId.toLowerCase()}/${newChapterNumber}?translation=${selectedTranslation.value}`);
    };

    return {
        loading: chapterLoading,
        error: chapterError,
        chapterData,
        bookId,
        chapterNumber,
        setChapterNumber,
        bookName: chapterData?.book?.name,
        numberOfChapters: chapterData?.book?.numberOfChapters,
        currentTranslation: selectedTranslation
    };
}