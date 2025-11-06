import { useState } from "react";
import { useParams } from "react-router-dom";
import { useContext, useEffect } from "react";
import { NotesContext } from "../../context/NotesContext";
import NoteEditor from "./NoteEditor";
import NoteList from "./NoteList";

function WriteNotes() {
    const { setVerseKey, loadNotes } = useContext(NotesContext);
    const [tabActive, setTabActive] = useState('Editor');
    const { verseId } = useParams();

    const tabs = [
        { id: 'Editor', title: 'Editor', content: <NoteEditor /> },
        { id: 'Notes', title: 'Notes', content: <NoteList /> },
    ];

    useEffect(() => {
        if (verseId) {
            loadNotes(verseId);
            setVerseKey(verseId);
            console.log(verseId);
        }
    }, [verseId]);
    
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