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
            ) : (books.length === 0 && !loading) ? (
                <p>No se encontraron libros</p>
            ) : typeof filteredBooks === "string" ? (
                <p>{filteredBooks}</p>
            ) : (filteredBooks.length === 0 && !loading) ? (
                <NoResults />
            ) : (
                <div className={styles.ctn_book_grid}>
                    {(loading && 
                      filteredBooks.length === 0 ?
                      Array(10).fill({}) :
                      filteredBooks).map((book, index) => (
                        <BookCard 
                            book={book} 
                            selectedTranslation={selectedTranslation} 
                            key={book.id || index} 
                            loading={loading}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default BookGrid;
