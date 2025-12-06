import BookGrid from "./BookGrid";
import Filter from "./Filter";
import ChapterGrid from "./ChapterGrid";
import ChapterContent from "./ChapterContent";
import { Routes, Route } from "react-router-dom";
import NavigateBack from "./NavigateBack";

function Read() {
    // ✅ Ya no necesitamos cargar aquí, se carga globalmente en App.jsx
    
    return (
        <div>
            <NavigateBack />
            <h1>Read</h1>
            <Routes>
                <Route path="/" element={
                    <>
                        <Filter />
                        <BookGrid />
                    </>
                } />
                <Route path="/:bookId" element={<ChapterGrid />} />
                <Route path="/:bookId/:chapterNumber" element={<ChapterContent />} />
            </Routes>
        </div>
    );
}

export default Read;    
