import { useEffect, useRef, useState } from "react";
import { useTrackingStore } from "../store/TrackingStore";
import { useTrackingBookStore } from "../store/TrackingBookStore";
import { useRecentlyReadStore } from '../store/RecentlyReadStore';
import { useAuthStore } from '../store/AuthStore';
import { useBooksStore } from "../store/BooksStore";

export function useChapterTracking({ bookId, chapterNumber, selectedTranslation, chapterData, chapterError }) {
    const { UpdateMinutes, Minutes, setMinutes } = useTrackingStore();
    const { markAsCompleted, unCompleteChapter, CompleteLoading, isChapterCompleted } = useTrackingBookStore();
    const { addRecentlyRead } = useRecentlyReadStore();
    
    const user = useAuthStore(state => state.user);
    const { books } = useBooksStore();
    
    // Identificador único del capítulo actual (calculado al vuelo para ser instantáneo)
    const chapterID = (bookId && chapterNumber && selectedTranslation?.value) 
        ? `${bookId}-${chapterNumber}-${selectedTranslation.value}` 
        : null;
        
    const hasAddedRecentlyRead = useRef(false);

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

            // ✅ Validar que el libro encontrado sea de la misma traducción
            if (currentBook && currentBook.translationId === selectedTranslation.value) {
                console.log('✅ Adding to recently read:', currentBook);
                hasAddedRecentlyRead.current = chapterID;
                await addRecentlyRead({
                    bookId: currentBook.id,
                    bookName: currentBook.commonName,
                    numberOfChapters: currentBook.numberOfChapters,
                    chapterNumber: parseInt(chapterNumber),
                    translationValue: selectedTranslation.value,
                    translation: selectedTranslation.label
                });
            } else if (currentBook) {
                console.log('⚠️ Translation mismatch - skipping recently read update', {
                    bookTranslation: currentBook.translationId,
                    selectedTranslation: selectedTranslation.value
                });
            }
        };

        // Solo guardar si el capítulo existe y no hay error
        if (books.length > 0 && bookId && chapterID && chapterData && !chapterError) {
            addCurrentBook();
        }
    }, [bookId, chapterNumber, selectedTranslation, chapterID, books, addRecentlyRead, chapterData, chapterError]);

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
