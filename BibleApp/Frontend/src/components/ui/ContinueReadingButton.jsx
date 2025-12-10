import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useRecentlyReadStore } from '../../store/RecentlyReadStore';
import { useBooksStore } from '../../store/BooksStore';
import styles from '../../styles/ContinueReadingButton.module.css';

function ContinueReadingButton({ filterBookId }) {
    const recentlyRead = useRecentlyReadStore(state => state.recentlyRead);
    const selectedTranslation = useBooksStore(state => state.selectedTranslation);
    const [target, setTarget] = useState(null);

    useEffect(() => {
        if (!recentlyRead || recentlyRead.length === 0) {
            setTarget(null);
            return;
        }

        if (filterBookId) {
            // Buscar último capítulo leído de ESTE libro
            const found = recentlyRead.find(item => 
                item.book_data.bookId === filterBookId &&
                item.book_data.translationValue === selectedTranslation.value
            );
            setTarget(found ? found.book_data : null);
        } else {
            // Buscar el último leído globalmente (el primero de la lista)
            setTarget(recentlyRead[0].book_data);
        }
    }, [recentlyRead, filterBookId, selectedTranslation.value]);

    if (!target) return null;

    return (
        <Link 
            to={`/books/${target.bookId.toLowerCase()}/${target.chapterNumber}?translation=${target.translationValue}`}
            className={styles.continue_btn}
        >
            <span>Continue {target.bookName} {target.chapterNumber}</span>
            <ArrowRight size={18} />
        </Link>
    );
}

export default ContinueReadingButton;
