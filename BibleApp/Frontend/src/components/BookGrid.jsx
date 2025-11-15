import { BooksContext } from "../context/BooksContext";
import { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import Loading from "../components/ui/Loading";
import FetchError from "./ui/FetchError";
import BookCard from "./BookCard";

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
            ) : filteredBooks.length === 0 ? (
                <p>no books found in this testament</p>
            ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                    {filteredBooks.map(book => (
                        <BookCard book={book} selectedTranslation={selectedTranslation} key={book.id} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default BookGrid;
