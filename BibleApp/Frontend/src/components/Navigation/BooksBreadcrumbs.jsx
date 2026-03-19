import { useLocation } from 'react-router-dom';
import IconButton from '../ui/IconButton';
import { ChevronRight, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBooksStore } from '../../store/BooksStore';
import { useTranslation } from '../../hooks/useTranslation';
import styles from '../../styles/BreadcrumbsNavigation.module.css';

function BooksBreadcrumbs() {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Obtener filtros del store (Zustand Persist los mantiene automáticamente)
    const selectedCategory = useBooksStore(state => state.selectedCategory);
    const selectedTestament = useBooksStore(state => state.selectedTestament);
    const selectedComplete = useBooksStore(state => state.selectedComplete);
    const searchQuery = useBooksStore(state => state.searchQuery);
    
    // Obtener traducción del store
    const { t } = useTranslation();
    
    // Función para navegar manteniendo filtros actuales
    const navigateWithCurrentFilters = (path) => {
        const params = new URLSearchParams();
        if (selectedCategory.value !== 'all') params.set('category', selectedCategory.value);
        if (selectedTestament !== 'all') params.set('testament', selectedTestament);
        if (selectedComplete !== 'all') params.set('complete', selectedComplete);
        if (searchQuery) params.set('search', searchQuery);
        
        const url = params.toString() ? `${path}?${params.toString()}` : path;
        navigate(url);
    };
    
    const pathParts = location.pathname.split('/').filter(Boolean);
    const searchParams = new URLSearchParams(location.search);
    
    // Determinar en qué nivel estamos
    const isAtBooks = pathParts.length === 1 && pathParts[0] === 'books';
    const isAtBook = pathParts.length === 2 && pathParts[0] === 'books';
    const isAtChapter = pathParts.length === 3 && pathParts[0] === 'books';
    
    // Extraer información
    const bookId = isAtBook || isAtChapter ? pathParts[1] : null;
    const chapterNumber = isAtChapter ? pathParts[2] : null;
    
    const formatBookName = (bookId) => {
        if (!bookId) return '';
        return bookId.charAt(0).toUpperCase() + bookId.slice(1);
    };
    
    // Función para manejar navegación al home (sin filtros)
    const handleHomeNavigate = () => {
        // Si quieres que home también mantenga filtros, usa navigateWithCurrentFilters('/')
        // Si no, usa navigate('/')
        navigate('/home'); // O navigateWithCurrentFilters('/') si quieres filtros
    };
    
    // Si estamos en la ruta base /books, no mostrar breadcrumbs
    if (isAtBooks) {
        return null;
    }
    
    return (
        <nav className={`${styles.breadcrumbs} ${chapterNumber ? styles.chapter : ''}`} aria-label={t('aria_breadcrumb')}>
            <ol className={styles.breadcrumbs_list}>
                {/* Home */}
                <li className={styles.breadcrumbs_item}>
                    <IconButton
                        onClick={handleHomeNavigate}
                        icon={Home}
                        variant="primary"
                        size="small"
                        iconSize="small"
                    >
                        Home
                    </IconButton>
                </li>
                <li className={styles.breadcrumbs_item}>
                    <ChevronRight size={16} className={styles.breadcrumbs_separator} />
                </li>
                
                {/* Books */}
                <li className={styles.breadcrumbs_item}>
                    {isAtBooks ? (
                        <span className={styles.breadcrumbs_current} aria-current="page">
                            Books
                        </span>
                    ) : (
                        <>
                            <button
                                onClick={() => navigateWithCurrentFilters('/books')}
                                className={styles.breadcrumbs_link}
                            >
                                Books
                            </button>
                            <ChevronRight size={16} className={styles.breadcrumbs_separator} />
                        </>
                    )}
                </li>
                
                {/* Book (solo si estamos en un libro o capítulo) */}
                {bookId && (
                    <li className={styles.breadcrumbs_item}>
                        {isAtBook ? (
                            <span className={styles.breadcrumbs_current} aria-current="page">
                                {formatBookName(bookId)}
                            </span>
                        ) : (
                            <>
                                <button
                                    onClick={() => navigate(`/books/${bookId}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`)}
                                    className={styles.breadcrumbs_link}
                                >
                                    {formatBookName(bookId)}
                                </button>
                                {chapterNumber && (
                                    <ChevronRight size={16} className={styles.breadcrumbs_separator} />
                                )}
                            </>
                        )}
                    </li>
                )}
                
                {/* Chapter (solo si estamos en un capítulo) */}
                {chapterNumber && (
                    <li className={styles.breadcrumbs_item}>
                        <span className={styles.breadcrumbs_current} aria-current="page">
                            Chapter {chapterNumber}
                        </span>
                    </li>
                )}
            </ol>
        </nav>
    );
}

export default BooksBreadcrumbs;