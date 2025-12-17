import { useBooksStore } from "../../store/BooksStore";
import FetchError from "../../components/ui/FetchError";
import BookCard from "../../features/books/BookCard";
import NoResults from "../../components/ui/NoResults";
import styles from "../../styles/BookGrid.module.css";

function BookGrid() {
    const { books, loading, error, filteredBooks, selectedTranslation } = useBooksStore();

    return (
        <div>
            {error ? (
                <FetchError />
            ) : (books.length === 0 && !loading) ? (
                <p>No se encontraron libros</p>
            ) : (typeof filteredBooks === "string" && filteredBooks !== "loading_progress") ? (
                <p>{filteredBooks}</p>
            ) : (Array.isArray(filteredBooks) && filteredBooks.length === 0 && !loading) ? (
                <NoResults />
            ) : (
                <div className={styles.ctn_book_grid}>
                    {(loading || filteredBooks === "loading_progress") ? 
                      /* Mostrar Skeleton Loading */
                      Array(10).fill({}).map((_, index) => (
                        <BookCard 
                            book={{}} 
                            selectedTranslation={selectedTranslation} 
                            key={`skeleton-${index}`} 
                            loading={true}
                        />
                      )) :
                      /* Mostrar Resultados Reales */
                      filteredBooks.map((book, index) => (
                        <BookCard 
                            book={book} 
                            selectedTranslation={selectedTranslation} 
                            key={book.id || index} 
                            loading={false}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default BookGrid;
