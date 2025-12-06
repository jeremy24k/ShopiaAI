import { Link } from "react-router-dom";
import calculateReadTime from "../utils/useReadTime";
import BookProgress from "./BookProgress";

const BookCard = ({ book, selectedTranslation }) => {
    const time = calculateReadTime(book);

    const testament = 
        book.testament === "old" 
            ? "Antiguo Testamento" 
        : book.testament === "new" 
            ? "Nuevo Testamento" 
        : "Otros";

    const category = 
        book.category === "pentateuco" 
            ? "Pentateuco" 
        : book.category === "historicos" 
            ? "Histórico" 
        : book.category === "poeticos" 
            ? "Poético" 
        : book.category === "profetas_mayores" 
            ? "Profeta Mayor" 
        : book.category === "profetas_menores" 
            ? "Profeta Menor" 
        : book.category === "evangelios" 
            ? "Evangelio" 
        : book.category === "hechos" 
            ? "Hechos" 
        : book.category === "profeticos" 
            ? "Profético" 
        : book.category === "cartas_de_pablo" 
            ? "Carta de Pablo" 
        : book.category === "cartas_universales" 
            ? "Carta Universal" 
        : "Otros";

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
            <p>{testament}</p>
            <p>{category}</p>
            <BookProgress 
                bookId={book.id}
                translationValue={selectedTranslation.value}
            />
        </div>
    );
};

export default BookCard;