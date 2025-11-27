import { Link } from "react-router-dom";
import calculateReadTime from "../utils/useReadTime";
import { useTrackingBookStore } from "../store/TrackingBookStore";
import BookProgress from "./BookProgress";

const BookCard = ({ book, selectedTranslation }) => {
    const time = calculateReadTime(book);
    const { CompleteChapter, CompleteLoading, CompleteError } = useTrackingBookStore();

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
            <BookProgress 
                chapterNumber={book.numberOfChapters} 
                chapterCompleted={CompleteChapter} 
                CompleteLoading={CompleteLoading} 
                CompleteError={CompleteError} 
                bookId={book.id}
                translationValue={selectedTranslation.value}
            />
        </div>
    );
};

export default BookCard;