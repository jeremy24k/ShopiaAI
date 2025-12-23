import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useRecentlyReadStore } from '../../store/RecentlyReadStore';
import { useBooksStore } from '../../store/BooksStore';
import { useTranslation } from '../../hooks/useTranslation';
import styles from '../../styles/ContinueReadingButton.module.css';

function ContinueReadingButton({ filterBookId }) {
    const { t } = useTranslation();
    const recentlyRead = useRecentlyReadStore(state => state.recentlyRead);
    const selectedTranslation = useBooksStore(state => state.selectedTranslation);
    const books = useBooksStore(state => state.books);
    const [target, setTarget] = useState(() => {
        if (!recentlyRead || recentlyRead.length === 0) return null;
        if (!books || books.length === 0) return null;
        
        const target = recentlyRead[0];

        if (!target || target.book_data.translationValue !== selectedTranslation.value) {
            return null;
        }

        const existsInCurrentTranslation = books.some(
            book => book.id === target.book_data.bookId
        );

        const calculatedTarget = existsInCurrentTranslation ? target.book_data : null;

        return calculatedTarget;
    });



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
            <span>{t('continue_reading')} {target.bookName.toLowerCase()} {target.chapterNumber}</span>
            <ArrowRight size={18} />
        </Link>
    );
}

export default ContinueReadingButton;
