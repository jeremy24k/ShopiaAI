import { BooksContext } from "../context/BooksContext";
import { useContext } from "react";
import { Link } from "react-router-dom";
import Loading from "../components/ui/Loading";
import FetchError from "../components/FetchError";

function BookGrid() {
    // Get books data from context
    const { books, loading, error, selectedTranslation, filteredBooks} = useContext(BooksContext);

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
            ) : (
                <div>
                    {/* Render each book as a clickable link */}
                    {filteredBooks.map(book => (
                            <Link to={`/books/${book.id}?translation=${selectedTranslation.value}`} key={book.id}>{book.name}</Link>
                        ))}
                </div>
            )}
        </div>
    );
}

export default BookGrid;
