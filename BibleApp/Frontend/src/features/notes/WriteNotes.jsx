import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useNotesStore } from "../../store/NotesStore";
import { useAuthStore } from "../../store/AuthStore";
import { useTranslation } from "../../hooks/useTranslation";
import { Edit, FileText, ArrowLeft, BookOpen } from "lucide-react";
import LoadVerseData from "../../utils/LoadVerseData";
import NoteEditor from "./NoteEditor";
import NoteList from "./NoteList";
import styles from "../../pages/WriteNotes.module.css";

function WriteNotes() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuthStore();
    const { setVerseKey, loadNotes, tabActive, setTabActive, notes } = useNotesStore();
    const { verseId } = useParams();
    const [verseData, setVerseData] = useState(null);
    const [isVerseInfoLoading, setIsVerseInfoLoading] = useState(true);

    const tabs = [
        { id: 'Editor', title: t('editor_tab'), icon: Edit },
        { id: 'Notes', title: t('notes_tab'), icon: FileText },
    ];

    // Get verse info from loaded notes (verse_data from JOIN) or parse verseId as fallback
    const verseInfo = useMemo(() => {
        if (!verseId) return null;
        
        // Debug: Ver qué datos traemos
        console.log('🔍 Notes cargadas:', notes.length, 'notas');
        if (notes.length > 0) {
            console.log('📄 Primera nota:', notes[0]);
            console.log('📖 Verse data:', notes[0].notes_verses?.verse_data);
        }
        
        // Try to get verse_data from the first note (all notes for same verse have same verse_data)
        if (notes.length > 0 && notes[0].notes_verses?.verse_data) {
            const verseData = notes[0].notes_verses.verse_data;
            return {
                bookName: verseData.bookName,
                chapterNumber: verseData.chapterNumber,
                verseNumber: verseData.verseNumber,
                translation: verseData.translation // Ya viene el nombre completo
            };
        }
        
        // Try to get verse_data from local state (loaded separately)
        if (verseData && verseData.verse_data) {
            return {
                bookName: verseData.verse_data.bookName,
                chapterNumber: verseData.verse_data.chapterNumber,
                verseNumber: verseData.verse_data.verseNumber,
                translation: verseData.verse_data.translation
            };
        }
        
        // Fallback: Parse verseId if no notes loaded yet
        const parts = verseId.split('-');
        if (parts.length < 4) return null;
        
        const translation = parts[parts.length - 1];
        const verseNumber = parts[parts.length - 2];
        const chapterNumber = parts[parts.length - 3];
        const bookId = parts.slice(0, parts.length - 3).join('-');
        
        // Capitalize book name
        const bookName = bookId.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        
        return {
            bookName,
            chapterNumber,
            verseNumber,
            translation: translation.toUpperCase() // Fallback: mostrar código en mayúsculas
        };
    }, [verseId, notes, verseData]);

    // Load verse data separately if no notes have verse_data
    useEffect(() => {
        if (verseId && isAuthenticated && notes.length === 0) {
            setIsVerseInfoLoading(true);
            console.log('📖 Cargando verse data para:', verseId);
            LoadVerseData({ verseKey: verseId, user }).then(result => {
                if (result.success && result.data) {
                    setVerseData(result.data);
                    console.log('✅ Verse data cargado:', result.data.verse_data);
                }
                setIsVerseInfoLoading(false);
            }).catch(() => {
                setIsVerseInfoLoading(false);
            });
        } else if (notes.length > 0) {
            setIsVerseInfoLoading(false);
        }
    }, [verseId, isAuthenticated, notes.length]);

    useEffect(() => {
        if (verseId && isAuthenticated) {
            loadNotes(verseId);
            setVerseKey(verseId);
        };
    }, [verseId, isAuthenticated]);

    return (
        <div className={styles.container}>
            {/* Back Button */}
            <button 
                onClick={() => navigate('/notes')}
                className={styles.backButton}
            >
                <ArrowLeft size={18} />
                {t('back')}
            </button>

            {/* Verse Header */}
            {isVerseInfoLoading ? (
                <div className={styles.verseHeaderSkeleton}>
                    <div className={styles.verseIconSkeleton}>
                        <BookOpen size={20} />
                    </div>
                    <div className={styles.verseInfoSkeleton}>
                        <div className={styles.verseReferenceSkeleton}></div>
                        <div className={styles.verseTranslationSkeleton}></div>
                    </div>
                </div>
            ) : verseInfo && (
                <div className={styles.verseHeader}>
                    <BookOpen size={20} className={styles.verseIcon} />
                    <div className={styles.verseInfo}>
                        <h2 className={styles.verseReference}>
                            {verseInfo.bookName} {verseInfo.chapterNumber}:{verseInfo.verseNumber}
                        </h2>
                        <span className={styles.verseTranslation}>{verseInfo.translation}</span>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className={styles.tabs}>
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setTabActive(tab.id)}
                            className={`${styles.tab} ${tabActive === tab.id ? styles.active : ''}`}
                        >
                            <Icon size={18} />
                            {tab.title}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div style={{ display: tabActive === 'Editor' ? 'block' : 'none' }}>
                <NoteEditor isActive={tabActive === 'Editor'} />
            </div>
            <div style={{ display: tabActive === 'Notes' ? 'block' : 'none' }}>
                <NoteList isActive={tabActive === 'Notes'} />
            </div>
        </div>
    );
}

export default WriteNotes;