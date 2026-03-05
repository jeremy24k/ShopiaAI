import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useFavoritesStore } from "../store/FavoritesStore";
import { useAuthStore } from "../store/AuthStore";
import { VerseUrl } from "../utils/VerseUrl";
import { useTranslation } from "../hooks/useTranslation";
import { Heart, BookOpen, Trash2, ExternalLink, Star, Filter } from "lucide-react";
import VerseCardSkeleton from "../components/ui/VerseCardSkeleton";
import SearchComponent from "../features/books/SearchComponent";
import styles from "./Favorites.module.css";

function Favorites() {
    const { t } = useTranslation();
    const { LoadFavorites, LoadFavoritesVerses, RemoveFavorite, loading, loadingFavorites, error } = useFavoritesStore();
    const { user, loading: authLoading } = useAuthStore();

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTranslation, setSelectedTranslation] = useState("all");

    useEffect(() => {
        if (!authLoading && user && LoadFavoritesVerses.length === 0) {
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

    const handleRemoveFavorite = (verseId) => {
        RemoveFavorite(verseId);
    };

    // Loading state
    if (loading && LoadFavoritesVerses.length === 0) {
        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>{t('favorites')}</h1>
                    <p className={styles.subtitle}>{t('loading_favorites')}</p>
                </div>
                <div className={styles.versesGrid}>
                    {Array(6).fill({}).map((_, index) => (
                        <VerseCardSkeleton key={`skeleton-${index}`} />
                    ))}
                </div>
            </div>
        );
    }

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

    // Empty state
    if (LoadFavoritesVerses.length === 0) {
        return (
            <div className={styles.container}>
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>
                        <Heart size={120} />
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
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <h1 className={styles.title}>
                    <Heart size={32} style={{ display: 'inline', marginRight: '0.5rem', color: 'var(--error-color)' }} />
                    {t('favorites')}
                </h1>
                <p className={styles.subtitle}>
                    {t('favorites_subtitle')}
                </p>
            </div>

            {/* Stats */}
            <div className={styles.stats}>
                <div className={styles.statItem}>
                    <Star className={styles.statIcon} size={20} />
                    <span className={styles.statText}>
                        <span className={styles.statNumber}>{LoadFavoritesVerses.length}</span> {LoadFavoritesVerses.length !== 1 ? t('favorite_count_plural') : t('favorite_count')}
                    </span>
                </div>
                {translations.length > 0 && (
                    <div className={styles.statItem}>
                        <BookOpen className={styles.statIcon} size={20} />
                        <span className={styles.statText}>
                            <span className={styles.statNumber}>{translations.length}</span> {translations.length !== 1 ? t('translation_count_plural') : t('translation_count')}
                        </span>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className={styles.controls}>
                {/* Search */}
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

            {/* Verses Grid */}
            {filteredVerses.length === 0 ? (
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
                            <div key={verse.id} className={styles.verseCard}>
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
                                        onClick={() => handleRemoveFavorite(verse.id)}
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
                                </div>
                            </div>
                        )
                    ))}
                </div>
            )}
        </div>
    );
}

export default Favorites;