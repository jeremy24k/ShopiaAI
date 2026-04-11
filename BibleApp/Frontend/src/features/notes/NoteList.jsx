import { useNotesStore } from "../../store/NotesStore";
import { useTranslation } from "../../hooks/useTranslation";
import NoteViewer from "./NoteViewer";
import Loading from "../../components/ui/Loading";
import styles from "../../styles/WriteNotes.module.css";

function NoteList({ isActive }) {
    const { t } = useTranslation();
    const { loadingNotes, errorNotes } = useNotesStore();
    
    return (
        <div className={styles.notesListSection}>
            {loadingNotes ? (
                <div className={styles.loadingNote}>
                    <Loading />
                    <span className={styles.loadingText}>{t('loading_notes_list')}</span>
                </div>
            ) : errorNotes ? (
                <div className={styles.errorState}>
                    {t('error_loading_notes_list')}: {errorNotes}
                </div>
            ) : (
                <NoteViewer isActive={isActive} />
            )}
        </div>
    );
}

export default NoteList;