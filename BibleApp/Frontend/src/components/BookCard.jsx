import { Link } from "react-router-dom";
import { useEffect } from "react";  
import calculateReadTime from "../utils/useReadTime";

function BookCard({ book, selectedTranslation }) {
    const time = calculateReadTime(book);

    return (
        <div>
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
}

export default BookCard;