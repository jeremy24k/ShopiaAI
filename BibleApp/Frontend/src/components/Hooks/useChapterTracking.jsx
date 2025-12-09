import { useEffect, useRef, useState } from "react";
import { useTrackingStore } from "../../store/TrackingStore";
import { useTrackingBookStore } from "../../store/TrackingBookStore";
import { useRecentlyReadStore } from '../../store/RecentlyReadStore';
import { useAuthStore } from '../../store/AuthStore';
import { useBooksStore } from "../../store/BooksStore";

export function useChapterTracking({ bookId, chapterNumber, selectedTranslation }) {
    const { UpdateMinutes, Minutes, setMinutes } = useTrackingStore();
    const { markAsCompleted, unCompleteChapter, CompleteLoading, isChapterCompleted } = useTrackingBookStore();
    const { addRecentlyRead } = useRecentlyReadStore();
    const { user } = useAuthStore.getState();
    const { books } = useBooksStore();
    
    // Identificador único del capítulo actual
    const [chapterID, setChapterID] = useState(null);
    const hasAddedRecentlyRead = useRef(false);

    // Actualizar ID cuando cambian params
    useEffect(() => {
        if (bookId && chapterNumber && selectedTranslation?.value) {
            setChapterID(`${bookId}-${chapterNumber}-${selectedTranslation.value}`);
        }
    }, [bookId, chapterNumber, selectedTranslation]);

    // Timer de minutos
    useEffect(() => {
        const intervalId = setInterval(() => {
            const currentMinutes = useTrackingStore.getState().Minutes;
            const newMinutes = currentMinutes + 1;
            // console.log("Minutes updated: ", newMinutes);
            setMinutes(newMinutes);
        }, 60000);

        return () => clearInterval(intervalId);
    }, [setMinutes]);

    // Inicializar tracking de usuario
    useEffect(() => {
        if (user) {
            useTrackingStore.getState().InitTracking();
        }
    }, [user]);

    // Guardar minutos en backend
    useEffect(() => {
        if (Minutes > 0) {
            UpdateMinutes();
        }
    }, [Minutes, UpdateMinutes]);

    // Recientemente leídos
    useEffect(() => {
        const addCurrentBook = async () => {
            if (!chapterID) return;

            if (hasAddedRecentlyRead.current === chapterID) {
                return;
            }
            
            const currentBook = books.find(book => book.id === bookId);
            
            if (currentBook) {
                hasAddedRecentlyRead.current = chapterID;
                await addRecentlyRead({
                    bookId: currentBook.id,
                    bookName: currentBook.commonName,
                    numberOfChapters: currentBook.numberOfChapters,
                    chapterNumber: parseInt(chapterNumber),
                    translationValue: selectedTranslation.value,
                    translation: selectedTranslation.label
                });
            }
        };

        if (books.length > 0 && bookId && chapterID) {
            addCurrentBook();
        }
    }, [bookId, chapterNumber, selectedTranslation, chapterID, books, addRecentlyRead]);

    // Handlers para marcar como completado
    const handleCompleteChapter = () => {
        const currentBook = books.find(book => book.id === bookId);
        if (!currentBook) return;

        const currentChapterData = {
            bookId: bookId,
            chapterNumber: parseInt(chapterNumber),
            translationValue: selectedTranslation.value,
            numberOfChapters: currentBook.numberOfChapters || 0,
            bookName: currentBook.commonName || '',
            id: chapterID
        };
        
        markAsCompleted(currentChapterData);
    };

    const handleUncompleteChapter = () => {
        if (chapterID) {
            unCompleteChapter(chapterID);
        }
    };

    return {
        handleCompleteChapter,
        handleUncompleteChapter,
        isCompleted: isChapterCompleted(chapterID),
        isLoading: CompleteLoading,
        chapterID
    };
}
