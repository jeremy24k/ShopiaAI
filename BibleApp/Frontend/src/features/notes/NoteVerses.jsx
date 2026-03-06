import { useState, useEffect, useMemo } from "react";
import { useVersesNotesStore } from "../../store/VersesNotesStore";
import { useAuthStore } from "../../store/AuthStore";
import { VerseUrl } from "../../utils/VerseUrl";
import { Link } from "react-router-dom";
import { useTranslation } from "../../hooks/useTranslation";
import { BookOpen, Edit, ExternalLink, Trash2, FileText, Star, Search } from "lucide-react";
import NoteCardSkeleton from "../../components/ui/NoteCardSkeleton";
import SkeletonLoader from "../../components/ui/SkeletonLoader";
import SearchComponent from "../books/SearchComponent";
import { useUIStore } from "../../store/UIStore";
import styles from "../../pages/Notes.module.css";

function NoteVerses() {
    const { t } = useTranslation();
    const { noteVerse, loadVerses, loadingVerses, errorVerses, deleteVerse, loadingSpecificVerses } = useVersesNotesStore();
    const { handleOpenModal } = useUIStore();
    const { user, loading } = useAuthStore();

    const [searchQuery, setSearchQuery] = useState("");

    const getVerseKey = (verse) => {
        const verseKey = verse.verse_data.verseKey.toLowerCase();
        return verseKey;
    };

  const handleDeleteVerse = (verseKey) => {
        handleOpenModal(() => {
            const result = deleteVerse(verseKey);
            if (!result.success) {
                console.error('Error deleting verse:', result.error);
                return;
            }
        });
    };

    // Filter notes
    const filteredNotes = useMemo(() => {
        return noteVerse.filter(verse => {
            const matchesSearch = searchQuery === "" || 
                verse.verse_data.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                verse.verse_data.bookName.toLowerCase().includes(searchQuery.toLowerCase());
            
            return matchesSearch;
        });
    }, [noteVerse, searchQuery]);

    useEffect(() => {
        if (!loading && user && noteVerse.length === 0) {
            loadVerses();
        }
    }, [loading, user, noteVerse.length]);

    
    // Error state
    if (errorVerses) {
        return (
            <div className={styles.container}>
                <div className={styles.errorState}>
                    <div className={styles.errorIcon}>
                        <FileText size={80} />
                    </div>
                    <h2 className={styles.errorTitle}>{t('error_loading_notes')}</h2>
                    <p className={styles.errorText}>{errorVerses}</p>
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
                            <FileText size={32} style={{ display: 'inline', marginRight: '0.5rem', color: 'var(--primary-color)' }} />
                            {t('notes')}
                        </h1>
                        <p className={styles.subtitle}>
                            {t('notes_subtitle')}
                        </p>
                    </div>
                    
                    {/* Stats */}
                    <div className={styles.stats}>
                        {loadingVerses ? (
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
                                    <span className={styles.statNumber}>{noteVerse.length}</span> {noteVerse.length !== 1 ? t('note_count_plural') : t('note_count')}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Search */}
                <div className={styles.headerSearch}>
                    <SearchComponent
                        handleSearchSubmit={(e) => e.preventDefault()}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        clearSearch={() => setSearchQuery('')}
                        placeholder={t('search_notes')}
                    />
                </div>
            </div>

            {/* Notes Grid - Loading granular */}
            {loadingVerses && noteVerse.length === 0 ? (
                <div className={styles.notesGrid}>
                    {Array(4).fill({}).map((_, index) => (
                        <NoteCardSkeleton key={`skeleton-${index}`} />
                    ))}
                </div>
            ) : noteVerse.length === 0 && !loadingVerses ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>
                        <FileText size={120} />
                    </div>
                    <h2 className={styles.emptyTitle}>{t('no_notes_title')}</h2>
                    <p className={styles.emptyText}>
                        {t('no_notes_text')}
                    </p>
                    <Link to="/books" className={styles.emptyButton}>
                        <BookOpen size={20} />
                        {t('explore_bible')}
                    </Link>
                </div>
            ) : filteredNotes.length === 0 && !loadingVerses ? (
                <div className={styles.emptyState}>
                    <Search size={80} style={{ color: 'var(--color-grey-300)', margin: '0 auto 1rem' }} />
                    <h2 className={styles.emptyTitle}>{t('no_notes_found')}</h2>
                    <p className={styles.emptyText}>
                        {t('adjust_search_filters')}
                    </p>
                </div>
            ) : (
                <div className={styles.notesGrid}>
                    {filteredNotes.map((verse, idx) => {
                        const verseKey = getVerseKey(verse);
                        return (
                            loadingSpecificVerses[verse.id] ? (
                                <NoteCardSkeleton key={verse.id} />
                            ) : (
                                <div key={verse.id || idx} className={`${styles.noteCard} fadeIn`}>
                                    <div className={styles.noteHeader}>
                                        <div className={styles.noteReference}>
                                            <h3 className={styles.noteTitle}>
                                                {verse.verse_data.bookName} {verse.verse_data.chapterNumber}:{verse.verse_data.verseNumber}
                                            </h3>
                                            <p className={styles.noteTranslation}>
                                                {verse.verse_data.translation}
                                            </p>
                                        </div>
                                        <button
                                            className={styles.deleteButton}
                                            onClick={() => handleDeleteVerse(verseKey)}
                                            title={t('remove_note')}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>

                                    <p className={styles.noteContent}>
                                        {verse.verse_data.content}
                                    </p>

                                    <div className={styles.noteFooter}>
                                        <Link 
                                            to={VerseUrl(verse.verse_data)} 
                                            className={styles.viewButton}
                                        >
                                            <ExternalLink size={16} />
                                            {t('view_verse')}
                                        </Link>
                                        <Link 
                                            to={`/notes/${verseKey}`}
                                            className={styles.editButton}
                                        >
                                            <Edit size={16} />
                                            {t('edit_notes')}
                                        </Link>
                                    </div>
                                </div>
                            )
                        );
                    })}
                </div>
            )}
        </div>
    );
}
export default NoteVerses;
