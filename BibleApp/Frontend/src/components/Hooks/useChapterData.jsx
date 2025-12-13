import { useEffect } from "react";
import { useBooksStore } from "../../store/BooksStore";
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
        setSelectedTranslation, // Importar setter
        clearChapterData
    } = useBooksStore();

    useEffect(() => {
        const loadChapter = async () => {
            if (!bookId || !chapterNumber) return;

            // 🧹 Limpiar datos anteriores al montar
            clearChapterData(); 

            let translationToUse = selectedTranslation.value;
            const urlTranslation = searchParams.get('translation');

            // 🔄 Sincronización URL -> LocalStorage & Store
            if (urlTranslation) {
                // 1. Si la URL tiene traducción y es distinta a la del store, actualizamos el store
                if (urlTranslation !== selectedTranslation.value) {
                    // Nota: Esto actualiza el label a "Loading..." temporalmente si no tenemos el objeto completo,
                    // pero el BooksStore buscará el nombre correcto después.
                    setSelectedTranslation({ 
                        value: urlTranslation, 
                        label: 'Loading...', // Se corregirá automáticamente 
                        shortName: '' 
                    });
                    translationToUse = urlTranslation;
                }

                // 2. Persistir en LocalStorage para futuras sesiones
                const saved = localStorage.getItem('lastBooksFilters') || '';
                const savedParams = new URLSearchParams(saved);
                if (savedParams.get('translation') !== urlTranslation) {
                    savedParams.set('translation', urlTranslation);
                    localStorage.setItem('lastBooksFilters', savedParams.toString());
                }
            }

            // Cargar capítulo
            await fetchChapter(bookId, chapterNumber, translationToUse);
        };

        loadChapter();

        // 🧹 LIMPIEZA AL DESMONTAR
        return () => {
            clearChapterData();
        };

    }, [bookId, chapterNumber, selectedTranslation.value, clearChapterData, fetchChapter, searchParams, setSelectedTranslation]);

    const setChapterNumber = (newChapterNumber) => {
        // 🔥 Limpiar INMEDIATAMENTE antes de navegar para evitar flash en la siguiente pantalla
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