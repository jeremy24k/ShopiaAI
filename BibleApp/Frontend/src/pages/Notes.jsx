import { Routes, Route } from "react-router-dom";
import NoteVerses from "../features/notes/NoteVerses";
import WriteNotes from "../features/notes/WriteNotes"
import ConfirmationModal from "../components/ui/ConfirmationModal";
import { useUIStore } from "../store/UIStore";
import { useTranslation } from "../hooks/useTranslation";

function Notes() {
    const { t } = useTranslation();
    const { isOpen, handleCloseModal, handleConfirmAction } = useUIStore();

    return (
        <div>
            <Routes>
                <Route index element={<NoteVerses />} />
                <Route path=":verseId" element={<WriteNotes />} />
            </Routes>
            <ConfirmationModal
                isOpen={isOpen}
                onClose={handleCloseModal}
                onConfirm={handleConfirmAction}
                title={t('confirm_action')}
                message={t('confirm_action_message')}
                variant="danger"
            />
        </div>
    );
}

export default Notes;