import { useState, useEffect } from "react";
import { useBooksStore } from "../../store/BooksStore";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";

export function useChapterData() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [chapterData, setChapterData] = useState([]);
    
    let { bookId, chapterNumber } = useParams();
    // Aseguramos mayúsculas siempre
    bookId = bookId ? bookId.toUpperCase() : "";

    const { books, selectedTranslation, getChapter, translations, setSelectedTranslation } = useBooksStore();
    const [currentChapter, setCurrentChapter] = useState(chapterNumber); // Estado local para navegación rápida
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Sincronizar estado local si cambia la URL
    useEffect(() => {
        if (chapterNumber) {
            setCurrentChapter(chapterNumber);
        }
    }, [chapterNumber]);

    // Effect ÚNICO para manejar traducción y capítulo
    useEffect(() => {
        const fetchChapter = async (translationToUse) => {
            if (!bookId || !currentChapter) return;

            try {
                // console.log('📖 Fetching chapter:', bookId, currentChapter, translationToUse);
                
                const chapter = await getChapter(bookId, currentChapter, setLoading, setError, translationToUse);
                
                // Enriquecemos el estado con todos los metadatos necesarios
                const newChapterData = {
                    data: chapter.data.chapter.content,
                    numberOfChapters: chapter.data.book.numberOfChapters,
                    bookName: chapter.data.book.commonName,
                    // Metadatos integrados para contexto global
                    bookId: bookId,
                    chapterNumber: currentChapter,
                    translationLabel: selectedTranslation.label,
                    translationValue: translationToUse
                };

                // console.log('✅ Chapter loaded:', newChapterData.bookName);
                setChapterData(newChapterData);
                
            } catch (error) {
                console.error('❌ Error fetching chapter:', error);
                setError(error.message || "An error occurred while fetching chapter");
                setLoading(false);
            }
        };

        // Detectar traducción desde URL
        const urlTranslation = searchParams.get('translation');
        
        if (urlTranslation && translations.length > 0) {
            const newTranslation = translations.find(t => t.id === urlTranslation);
            if (newTranslation) {
                // Si la traducción de URL es diferente a la del store, actualizar store
                if (urlTranslation !== selectedTranslation.value) {
                    setSelectedTranslation({
                        value: newTranslation.id,
                        label: newTranslation.name
                    });
                }
                // Usar la traducción de URL para el fetch
                fetchChapter(urlTranslation);
            }
        } else if (selectedTranslation.value) {
            // Si no hay traducción en URL, usar la seleccionada en store
            fetchChapter(selectedTranslation.value);
        }
        
        // Sincronizar URL si el estado local difiere (navegación interna)
        if (currentChapter !== chapterNumber) {
            navigate(`/books/${bookId.toLowerCase()}/${currentChapter}?translation=${selectedTranslation.value}`, { replace: true });
        }
    }, [bookId, currentChapter, searchParams, translations, selectedTranslation.value, chapterNumber, navigate, getChapter, setSelectedTranslation, selectedTranslation.label]);

    const setChapterNumber = (num) => {
        setCurrentChapter(num);
        // La navegación real ocurre en el useEffect cuando detecta el cambio, 
        // o podríamos navegar aquí directamente. 
        // Mantendremos el patrón actual de dejar que el effect maneje la sync.
    };

    return {
        loading,
        error,
        chapterData,
        bookId,
        chapterNumber: currentChapter,
        setChapterNumber,
        selectedTranslation
    };
}
