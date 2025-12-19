import { useEffect } from "react";
import { useBooksStore } from "../store/BooksStore";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";

export function useChapterData() {
    const { bookId: urlBookId, chapterNumber: urlChapterNumber } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const bookId = urlBookId ? urlBookId.toUpperCase() : "";
    const chapterNumber = urlChapterNumber || "1";
    
    const {
        chapterData,
        chapterLoading,
        chapterError,
        fetchChapter,
        selectedTranslation,
        clearChapterData
    } = useBooksStore();

    useEffect(() => {
        const loadChapter = async () => {
            if (!bookId || !chapterNumber) return;

            // Limpiar datos anteriores al montar
            clearChapterData(); 

            // Priorizar traducción de la URL sobre el store
            const urlTranslation = searchParams.get('translation');
            const translationToUse = urlTranslation || selectedTranslation.value;

            // Cargar capítulo con la traducción actual
            await fetchChapter(bookId, chapterNumber, translationToUse);
        };

        loadChapter();

        // LIMPIEZA AL DESMONTAR
        return () => {
            clearChapterData();
        };

    }, [bookId, chapterNumber, searchParams, selectedTranslation.value, clearChapterData, fetchChapter]);

    const setChapterNumber = (newChapterNumber) => {
        // Limpiar INMEDIATAMENTE antes de navegar para evitar flash en la siguiente pantalla
        clearChapterData();
        
        const urlTranslation = searchParams.get('translation') || selectedTranslation.value;
        navigate(`/books/${bookId.toLowerCase()}/${newChapterNumber}?translation=${urlTranslation}`);
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