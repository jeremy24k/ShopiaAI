import { Link } from "react-router-dom";
import { useMemo, useContext, memo } from "react";  
import calculateReadTime from "../utils/useReadTime";
import { ReadingContext } from "../context/ReadingContext";

// ✅ Memoizado para evitar re-renders innecesarios
const BookCard = memo(function BookCard({ book, selectedTranslation }) {
    const time = calculateReadTime(book);
    const { completedChapters } = useContext(ReadingContext);

    // Calcular progreso solo cuando completedChapters cambie para este libro específico
    const progress = useMemo(() => {
        const completedInBook = completedChapters.filter(
            (ch) => ch.book_id === book.id
        ).length;

        const percentage = book.numberOfChapters > 0 
            ? Math.round((completedInBook / book.numberOfChapters) * 100) 
            : 0;

        return {
            completed: completedInBook,
            total: book.numberOfChapters,
            percentage,
            isCompleted: completedInBook === book.numberOfChapters && book.numberOfChapters > 0,
        };
    }, [completedChapters, book.id, book.numberOfChapters]);

    return (
        <div style={{ width: "calc(100% / 4 - 1rem)" }}>
            <Link to={`/books/${(book.id).toLowerCase()}?translation=${selectedTranslation.value}`} key={book.id}>
                {book.name}
            </Link>
            <p>
                {book.numberOfChapters} Capítulos
            </p>
            <p>
                ~{time.formattedTime}
            </p>
            <div style={{
                width: '100%',
                height: '10px',
                backgroundColor: '#e0e0e0',
                borderRadius: '10px',
                overflow: 'hidden',
                position: 'relative'
            }}>
                <div style={{
                    width: `${progress.percentage}%`,
                    height: '100%',
                    backgroundColor: progress.isCompleted ? '#4caf50' : '#2196F3',
                    transition: 'width 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: 'bold'
                }}>
                    {progress.percentage > 10 && `${progress.percentage}%`}
                </div>
            </div>
        </div>
    );
});

export default BookCard;