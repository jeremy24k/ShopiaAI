import { useEffect } from "react";
import { useBooksStore } from "../store/BooksStore";
import { Link } from "react-router-dom";
import Loading from "../components/ui/Loading";
import FetchError from "./ui/FetchError";
import BookCard from "./BookCard";
import { useTrackingBookStore } from "../store/TrackingBookStore";

function BookGrid() {
    // Get books data from store
    const { books, loading, error, selectedTranslation, filteredBooks} = useBooksStore();
    const { getCompleteChapter } = useTrackingBookStore();

    // ✅ Cargar TODOS los capítulos completados UNA SOLA VEZ
    useEffect(() => {
        getCompleteChapter();
    }, []);

    return (
        <div>
            {loading ? (
                <Loading />
            ) : error ? (
                <FetchError />
            ) : books.length === 0 ? (
                <p>No books found</p>
            ) : typeof filteredBooks === "string" ? (
                <p>{filteredBooks}</p>
            ) : filteredBooks.length === 0 ? (
                <p>no books found in this testament</p>
            ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem"}}>
                    {filteredBooks.map(book => (
                        <BookCard book={book} selectedTranslation={selectedTranslation} key={book.id} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default BookGrid;
