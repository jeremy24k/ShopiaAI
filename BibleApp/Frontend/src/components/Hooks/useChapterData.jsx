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
    } = useBooksStore();

    useEffect(() => {
        const loadChapter = async () => {
            if (!bookId || !chapterNumber) return;

            // Usar la traducción actual del store (ya sincronizada)
            const translationToUse = selectedTranslation.value;

            // Cargar capítulo
            await fetchChapter(bookId, chapterNumber, translationToUse);
        };

        loadChapter();
    }, [bookId, chapterNumber, selectedTranslation.value]);

    // Navegación entre capítulos
    const setChapterNumber = (newChapterNumber) => {
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
        // Datos útiles para la UI
        bookName: chapterData?.book?.name,
        numberOfChapters: chapterData?.book?.numberOfChapters,
        currentTranslation: selectedTranslation
    };
}