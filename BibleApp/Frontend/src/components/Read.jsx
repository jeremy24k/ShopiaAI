import BookGrid from "./BookGrid";
import Filter from "./Filter";
import ChapterGrid from "./ChapterGrid";
import ChapterContent from "./ChapterContent";
import { Routes, Route } from "react-router-dom";
import NavigateBack from "./NavigateBack";
import supabase from "../supabase/supabase";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

function Read() {

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        supabase.auth.onAuthStateChange((event, session) => {
          if (!session) {
            navigate('/login');
          } else {
            navigate(location.pathname);
          }
        });
    }, []);
    
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
