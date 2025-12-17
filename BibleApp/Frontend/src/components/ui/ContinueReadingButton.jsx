import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useRecentlyReadStore } from '../../store/RecentlyReadStore';
import { useBooksStore } from '../../store/BooksStore';
import { useReadFilters } from "../Read/Hooks/useReadFilters";
import styles from '../../styles/ContinueReadingButton.module.css';

function ContinueReadingButton({ filterBookId }) {
    const recentlyRead = useRecentlyReadStore(state => state.recentlyRead);
    const translations = useBooksStore(state => state.translations);
    const { translation: selectedTranslation } = useReadFilters(translations);

    const books = useBooksStore(state => state.books);
    const [target, setTarget] = useState(null);

    useEffect(() => {
        if (!recentlyRead || recentlyRead.length === 0) {
            setTarget(null);
            return;
        }

        if (!books || books.length === 0) {
            setTarget(null);
            return;
        }

        if (filterBookId) {
            const found = recentlyRead.find(item => 
                item.book_data.bookId === filterBookId &&
                item.book_data.translationValue === selectedTranslation.value
            );

            if (!found) {
                setTarget(null);
                return;
            }

            // ✅ comprobar que el libro existe en la lista de libros actual
            const existsInCurrentTranslation = books.some(
                book => book.id === found.book_data.bookId
            );

            setTarget(existsInCurrentTranslation ? found.book_data : null);
        } else {
            const last = recentlyRead[0];

            if (!last || last.book_data.translationValue !== selectedTranslation.value) {
                setTarget(null);
                return;
            }

            const existsInCurrentTranslation = books.some(
                book => book.id === last.book_data.bookId
            );

            setTarget(existsInCurrentTranslation ? last.book_data : null);
        }
    }, [recentlyRead, filterBookId, selectedTranslation.value, books]);

    if (!target) return null;

    return (
        <Link 
            to={`/books/${target.bookId.toLowerCase()}/${target.chapterNumber}?translation=${target.translationValue}`}
            className={styles.continue_btn}
        >
            <span>Continue {target.bookName.toLowerCase()} {target.chapterNumber}</span>
            <ArrowRight size={18} />
        </Link>
    );
}

export default ContinueReadingButton;
