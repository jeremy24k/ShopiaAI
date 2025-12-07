import { useBooksStore } from "../store/BooksStore";
import FetchError from "./ui/FetchError";
import BookCard from "./BookCard";
import NoResults from "../components/ui/NoResults";
import styles from "../styles/BookGrid.module.css";

function BookGrid() {
    const { books, loading, error, selectedTranslation, filteredBooks} = useBooksStore();
    return (
        <div>
            {error ? (
                <FetchError />
            ) : books.length === 0 ? (
                <p>No books found</p>
            ) : typeof filteredBooks === "string" ? (
                <p>{filteredBooks}</p>
            ) : filteredBooks.length === 0 ? (
                <NoResults />
            ) : (
                <div className={styles.ctn_book_grid}>
                    {filteredBooks.map(book => (
                        <BookCard book={book} selectedTranslation={selectedTranslation} key={book.id} loading={loading}/>
                    ))}
                </div>
            )}
        </div>
    );
}

export default BookGrid;
