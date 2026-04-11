import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useNotesStore } from "../../store/NotesStore";
import { useAuthStore } from "../../store/AuthStore";
import { useTranslation } from "../../hooks/useTranslation";
import { Edit, FileText, ArrowLeft, BookOpen, Clock } from "lucide-react";
import { LoadVerseData, formatRelativeTime } from "../../utils";
import Loading from "../../components/ui/Loading";
import NoteEditor from "./NoteEditor";
import NoteList from "./NoteList";
import styles from "../../styles/WriteNotes.module.css";

function WriteNotes() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuthStore();
    const { setVerseKey, loadNotes, tabActive, setTabActive, notes } = useNotesStore();
    const { verseId: rawVerseId } = useParams();
    const verseId = rawVerseId?.toLowerCase();
    const [verseData, setVerseData] = useState(null);
    const [isVerseInfoLoading, setIsVerseInfoLoading] = useState(true);

    const tabs = [
        { id: 'Editor', title: t('editor_tab'), icon: Edit },
        { id: 'Notes', title: t('notes_tab'), icon: FileText },
    ];

    // Get verse info from loaded notes (verse_data from JOIN) or parse verseId as fallback
    const verseInfo = useMemo(() => {
        if (!verseId) return null;
        
        // Try to get verse_data from the first note (all notes for same verse have same verse_data)
        if (notes.length > 0 && notes[0].notes_verses?.verse_data) {
            const verseData = notes[0].notes_verses.verse_data;
            return {
                bookName: verseData.bookName,
                chapterNumber: verseData.chapterNumber,
                verseNumber: verseData.verseNumber,
                translation: verseData.translation, // Ya viene el nombre completo
                verseText: verseData.content || null
            };
        }
        
        // Try to get verse_data from local state (loaded separately)
        if (verseData && verseData.verse_data) {
            return {
                bookName: verseData.verse_data.bookName,
                chapterNumber: verseData.verse_data.chapterNumber,
                verseNumber: verseData.verse_data.verseNumber,
                translation: verseData.verse_data.translation,
                verseText: verseData.verse_data.content || null
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
            translation: translation.toUpperCase(), // Fallback: mostrar código en mayúsculas
            verseText: null // No tenemos el texto en el fallback
        };
    }, [verseId, notes, verseData]);

    // Get last update time from most recent note
    const lastUpdateTime = useMemo(() => {
        if (notes.length === 0) return null;
        
        // Encontrar la nota más recientemente actualizada
        const mostRecent = notes.reduce((latest, note) => {
            const noteTime = new Date(note.update_at || note.created_at);
            const latestTime = new Date(latest.update_at || latest.created_at);
            return noteTime > latestTime ? note : latest;
        });
        
        return mostRecent.update_at || mostRecent.created_at;
    }, [notes]);

    // Load notes and verse data
    useEffect(() => {
        if (!verseId || !isAuthenticated) return;

        // Resetear loading state al cambiar de versículo
        setIsVerseInfoLoading(true);
        setVerseKey(verseId);
        
        // Cargar notas primero
        loadNotes(verseId);
    }, [verseId, isAuthenticated]);

    // Load verse data separately only if no notes have verse_data
    useEffect(() => {
        if (!verseId || !isAuthenticated) return;

        // Si ya tenemos notas con verse_data, no necesitamos cargar
        if (notes.length > 0 && notes[0].notes_verses?.verse_data) {
            setIsVerseInfoLoading(false);
            return;
        }

        // Si no hay notas o no tienen verse_data, cargar verse data
        LoadVerseData({ verseKey: verseId, user }).then(result => {
            if (result.success && result.data) {
                setVerseData(result.data);
            }
            setIsVerseInfoLoading(false);
        }).catch((err) => {
            console.error('📝 WriteNotes: LoadVerseData error', err);
            setIsVerseInfoLoading(false);
        });
    }, [verseId, isAuthenticated, notes.length, user]);

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
                <div className={styles.verseHeaderLoading}>
                    <Loading />
                    <span>{t('loading_verse_info')}</span>
                </div>
            ) : verseInfo && (
                <div className={styles.verseHeader}>
                    <div className={styles.verseHeaderTop}>
                        <div className={styles.verseHeaderLeft}>
                            <BookOpen size={20} className={styles.verseIcon} />
                            <div className={styles.verseInfo}>
                                <h2 className={styles.verseReference}>
                                    {verseInfo.bookName} {verseInfo.chapterNumber}:{verseInfo.verseNumber}
                                </h2>
                                <span className={styles.verseTranslation}>{verseInfo.translation}</span>
                            </div>
                        </div>
                        {lastUpdateTime && (
                            <div className={styles.lastUpdate}>
                                <Clock size={14} />
                                <span>{formatRelativeTime(lastUpdateTime, t)}</span>
                            </div>
                        )}
                    </div>
                    {verseInfo.verseText && (
                        <p className={styles.verseText}>
                            {verseInfo.verseText}
                        </p>
                    )}
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