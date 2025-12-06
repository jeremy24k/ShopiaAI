import { useBooksStore } from "../store/BooksStore";
import Loading from "../components/ui/Loading";
import FetchError from "./ui/FetchError";
import BookCard from "./BookCard";

function BookGrid() {
    const { books, loading, error, selectedTranslation, filteredBooks} = useBooksStore();
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
                <p>no books found for this filter</p>
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
