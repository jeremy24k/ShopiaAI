import { Link } from "react-router-dom";
import calculateReadTime from "../utils/useReadTime";

// ✅ Memoizado para evitar re-renders innecesarios
const BookCard = ({ book, selectedTranslation }) => {
    const time = calculateReadTime(book);
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
        </div>
    );
};

export default BookCard;