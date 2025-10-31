import { useState } from "react";
import Editor from "./Editor";
import NoteList from "./NoteList";

function WriteNotes() {
    const [tabActive, setTabActive] = useState('Editor');

    const tabs = [
        { id: 'Editor', title: 'Editor', content: <Editor /> },
        { id: 'Notes', title: 'Notes', content: <NoteList /> },
    ];
    
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
            {tabActive === 'Editor' && <Editor />}
            {tabActive === 'Notes' && <NoteList />}
        </div>
    );
}

export default WriteNotes;