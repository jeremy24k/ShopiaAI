import { Link } from "react-router-dom";
import { BooksContext } from "../context/BooksContext";
import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Loading from "../components/ui/Loading";

function ChapterGrid() {
    const { bookId } = useParams();
    const { books, selectedTranslation, loading, error } = useContext(BooksContext);
    const [chapters, setChapters] = useState([]);
    const [book, setBook] = useState({});

    useEffect(() => {
        if (books.length > 0) {
            const filteredBook = books.find(book => book.id === bookId);
            
            if (filteredBook) {
                setBook(filteredBook);
                const limit = filteredBook.numberOfChapters;
                const chaptersArray = Array.from({ length: limit }, (_, i) => ({
                    id: i + 1,
                    order: i + 1
                }));
                setChapters(chaptersArray);
            }
        }
    }, [books, bookId]);

    return (
        <div>
            <h1>{book.commonName}</h1>
            <h2>{selectedTranslation.label}</h2>
            <div className="chapter-grid">
                {loading ? (
                    <Loading />
                ) : error ? (
                    <p>Error: {error}</p>
                ) : chapters.length > 0 ? (
                    chapters.map(chapter => (
                        <Link 
                            className="chapter-link" 
                            key={chapter.id} 
                            to={
                                `/books/${bookId}/${chapter.order}?translation=${selectedTranslation.value}`
                        }
                    >
                        {chapter.order}
                    </Link>
                ))
                ) : (
                    <p>No chapters found</p>
                )}
            </div>
        </div>
    );
}

export default ChapterGrid;
