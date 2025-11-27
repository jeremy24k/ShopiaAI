import { use, useState } from "react";
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { useNotesStore } from "../../store/NotesStore";
import { useAuthStore } from "../../store/AuthStore";
import NoteEditor from "./NoteEditor";
import NoteList from "./NoteList";

function WriteNotes() {
    const { user, isAuthenticated } = useAuthStore();
    const { setVerseKey, loadNotes, tabActive, setTabActive } = useNotesStore();
    const { verseId } = useParams();

    const tabs = [
        { id: 'Editor', title: 'Editor', content: <NoteEditor /> },
        { id: 'Notes', title: 'Notes', content: <NoteList /> },
    ];

    useEffect(() => {
        if (verseId && isAuthenticated) {
            loadNotes(verseId);
            setVerseKey(verseId);
        };
    }, [verseId, isAuthenticated]);

    return (
        <div>
            <div className="ctn_tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setTabActive(tab.id)}
                    >
                        {tab.title}
                    </button>
                ))}
            </div>
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