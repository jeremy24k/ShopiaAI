import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useFavoritesStore } from "../store/FavoritesStore";
import { useAuthStore } from "../store/AuthStore";
import { useNotificationStore } from "../store/NotificationStore";
import { VerseUrl } from "../utils/VerseUrl";
import { useTranslation } from "../hooks/useTranslation";
import { Heart, BookOpen, Trash2, ExternalLink, Star, Filter, NotebookPen, Brain } from "lucide-react";
import VerseCardSkeleton from "../components/ui/VerseCardSkeleton";
import SkeletonLoader from "../components/ui/SkeletonLoader";
import SearchComponent from "../features/books/SearchComponent";
import ConfirmationModal from "../components/ui/ConfirmationModal";
import useVerseActions from "../hooks/useVerseActions";
import styles from "./Favorites.module.css";

function Favorites() {
    const { t } = useTranslation();
    
    // Estado (causa re-renders cuando cambia)
    const LoadFavoritesVerses = useFavoritesStore(state => state.LoadFavoritesVerses);
    const loading = useFavoritesStore(state => state.loading);
    const loadingFavorites = useFavoritesStore(state => state.loadingFavorites);
    const error = useFavoritesStore(state => state.error);
    const initialLoadDone = useFavoritesStore(state => state.initialLoadDone);
    
    // Acciones (no causan re-renders)
    const LoadFavorites = useFavoritesStore(state => state.LoadFavorites);
    const RemoveFavorite = useFavoritesStore(state => state.RemoveFavorite);
    
    const user = useAuthStore(state => state.user);
    const authLoading = useAuthStore(state => state.loading);
    
    const showSuccess = useNotificationStore(state => state.showSuccess);
    const showError = useNotificationStore(state => state.showError);

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTranslation, setSelectedTranslation] = useState("all");
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [verseToDelete, setVerseToDelete] = useState(null);

    // Hook para las acciones de versículos
    const {
        handleCreateNote,
        handleExplainVerse,
        shouldShowAlert
    } = useVerseActions();

    useEffect(() => {
        if (!authLoading && user) {
            LoadFavorites();
        }
    }, [user, authLoading]);

    // Get unique translations
    const translations = useMemo(() => {
        const uniqueTranslations = new Set(
            LoadFavoritesVerses.map(v => v.verse_content.translation)
        );
        return Array.from(uniqueTranslations);
    }, [LoadFavoritesVerses]);

    // Filter verses
    const filteredVerses = useMemo(() => {
        return LoadFavoritesVerses.filter(verse => {
            const matchesSearch = searchQuery === "" || 
                verse.verse_content.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                verse.verse_content.bookName.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesTranslation = selectedTranslation === "all" || 
                verse.verse_content.translation === selectedTranslation;
            
            return matchesSearch && matchesTranslation;
        });
    }, [LoadFavoritesVerses, searchQuery, selectedTranslation]);

    const handleRemoveFavorite = (verse) => {
        setVerseToDelete(verse);
        setShowConfirmDelete(true);
    };

    const confirmDelete = async () => {
        if (!verseToDelete) return;

        const result = await RemoveFavorite(verseToDelete.id);
        
        if (result?.success) {
            showSuccess(t('favorite_removed_success_title'), {
                description: `${verseToDelete.verse_content.bookName} ${verseToDelete.verse_content.chapterNumber}:${verseToDelete.verse_content.verseNumber} ${t('favorite_removed_success_desc')}`,
                fill: 'var(--white-color)'
            });
        } else {
            showError(t('favorite_removed_error_title'), {
                description: t('favorite_removed_error_desc'),
                fill: 'var(--white-color)'
            });
        }

        setShowConfirmDelete(false);
        setVerseToDelete(null);
    };

    const cancelDelete = () => {
        setShowConfirmDelete(false);
        setVerseToDelete(null);
    };

    // Error state
    if (error?.message) {
        return (
            <div className={styles.container}>  
                <div className={styles.errorState}>
                    <div className={styles.errorIcon}>
                        <Heart size={80} />
                    </div>
                    <h2 className={styles.errorTitle}>{t('error_loading_favorites')}</h2>
                    <p className={styles.errorText}>{error.message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Header unificado con stats y search */}
            <div className={styles.header}>
                <div className={styles.headerTop}>
                    <div className={styles.headerTitleSection}>
                        <h1 className={styles.title}>
                            <Star size={32} style={{ display: 'inline', marginRight: '0.5rem', color: 'var(--primary-color)' }} />
                            {t('favorites')}
                        </h1>
                        <p className={styles.subtitle}>
                            {t('favorites_subtitle')}
                        </p>
                    </div>
                    
                    {/* Stats */}
                    <div className={styles.stats}>
                        {loading ? (
                            <div className={styles.statItem}>
                                <SkeletonLoader
                                    variant="circle"
                                    width="20px"
                                    height="20px"
                                />
                                <span className={styles.statText}>
                                    <SkeletonLoader
                                        variant="text"
                                        width="80px"
                                        height="16px"
                                    />
                                </span>
                            </div>
                        ) : (
                            <div className={styles.statItem}>
                                <Star className={styles.statIcon} size={20} />
                                <span className={styles.statText}>
                                    <span className={styles.statNumber}>{LoadFavoritesVerses.length}</span> {LoadFavoritesVerses.length !== 1 ? t('favorite_count_plural') : t('favorite_count')}
                                </span>
                            </div>
                        )}
                        
                        {loading ? (
                            <div className={styles.statItem}>
                                <SkeletonLoader
                                    variant="circle"
                                    width="20px"
                                    height="20px"
                                />
                                <span className={styles.statText}>
                                    <SkeletonLoader
                                        variant="text"
                                        width="80px"
                                        height="16px"
                                    />
                                </span>
                            </div>
                        ) : translations.length > 0 && (
                            <div className={styles.statItem}>
                                <BookOpen className={styles.statIcon} size={20} />
                                <span className={styles.statText}>
                                    <span className={styles.statNumber}>{translations.length}</span> {translations.length !== 1 ? t('translation_count_plural') : t('translation_count')}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Search y filtros */}
                <div className={styles.headerSearch}>
                    <SearchComponent
                        handleSearchSubmit={(e) => e.preventDefault()}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        clearSearch={() => setSearchQuery('')}
                        placeholder={t('search_verses')}
                    />

                    {/* Translation Filters */}
                    {translations.length > 1 && (
                        <div className={styles.filterButtons}>
                            <button
                                className={`${styles.filterButton} ${selectedTranslation === "all" ? styles.active : ""}`}
                                onClick={() => setSelectedTranslation("all")}
                            >
                                {t('all_translations')}
                            </button>
                            {translations.map(trans => (
                                <button
                                    key={trans}
                                    className={`${styles.filterButton} ${selectedTranslation === trans ? styles.active : ""}`}
                                    onClick={() => setSelectedTranslation(trans)}
                                >
                                    {trans.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Verses Grid - Loading granular */}
            {loading && LoadFavoritesVerses.length === 0 ? (
                <div className={styles.versesGrid}>
                    {Array(4).fill({}).map((_, index) => (
                        <VerseCardSkeleton key={`skeleton-${index}`} />
                    ))}
                </div>
            ) : LoadFavoritesVerses.length === 0 && !loading ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>
                        <Star size={120} />
                    </div>
                    <h2 className={styles.emptyTitle}>{t('no_favorites_title')}</h2>
                    <p className={styles.emptyText}>
                        {t('no_favorites_text')}
                    </p>
                    <Link to="/books" className={styles.emptyButton}>
                        <BookOpen size={20} />
                        {t('explore_bible')}
                    </Link>
                </div>
            ) : filteredVerses.length === 0 && !loading ? (
                <div className={styles.emptyState}>
                    <Filter size={80} style={{ color: 'var(--color-grey-300)', margin: '0 auto 1rem' }} />
                    <h2 className={styles.emptyTitle}>{t('no_verses_found')}</h2>
                    <p className={styles.emptyText}>
                        {t('adjust_search_filters')}
                    </p>
                </div>
            ) : (
                <div className={styles.versesGrid}>
                    {filteredVerses.map((verse) => (
                        loadingFavorites[verse.verse_content.verseKey] ? (
                            <VerseCardSkeleton key={verse.id} />
                        ) : (
                            <div key={verse.id} className={`${styles.verseCard} fadeIn`}>
                                <div className={styles.verseHeader}>
                                    <div className={styles.verseReference}>
                                        <h3 className={styles.verseTitle}>
                                            {verse.verse_content.bookName} {verse.verse_content.chapterNumber}:{verse.verse_content.verseNumber}
                                        </h3>
                                        <p className={styles.verseTranslation}>
                                            {verse.verse_content.translation}
                                        </p>
                                    </div>
                                    <button
                                        className={styles.removeButton}
                                        onClick={() => handleRemoveFavorite(verse)}
                                        title={t('remove_from_favorites')}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                <p className={styles.verseContent}>
                                    {verse.verse_content.content}
                                </p>

                                <div className={styles.verseFooter}>
                                    <Link 
                                        to={VerseUrl(verse.verse_content)} 
                                        className={styles.viewButton}
                                    >
                                        <ExternalLink size={16} />
                                        {t('view_in_context')}
                                    </Link>
                                    
                                    <button
                                        className={styles.actionButton}
                                        onClick={() => handleExplainVerse(verse.verse_content)}
                                        title="Explicar con IA"
                                    >
                                        <Brain size={16} />
                                        Explicar
                                    </button>
                                    
                                    <button
                                        className={styles.actionButton}
                                        onClick={() => handleCreateNote(verse.verse_content)}
                                        title="Crear nota"
                                    >
                                        <NotebookPen size={16} />
                                        {shouldShowAlert(verse.verse_content, 'note') ? 'Ya existe' : 'Nota'}
                                    </button>
                                </div>
                            </div>
                        )
                    ))}
                </div>
            )}

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={showConfirmDelete}
                onClose={cancelDelete}
                onConfirm={confirmDelete}
                title={t('confirm_delete_favorite') || 'Eliminar favorito'}
                message={
                    verseToDelete 
                        ? `${t('confirm_delete_favorite_message') || '¿Estás seguro de que quieres eliminar'} ${verseToDelete.verse_content.bookName} ${verseToDelete.verse_content.chapterNumber}:${verseToDelete.verse_content.verseNumber} ${t('from_favorites') || 'de tus favoritos'}?`
                        : ''
                }
                confirmText={t('delete') || 'Eliminar'}
                cancelText={t('cancel') || 'Cancelar'}
                variant="danger"
            />
        </div>
    );
}

export default Favorites;