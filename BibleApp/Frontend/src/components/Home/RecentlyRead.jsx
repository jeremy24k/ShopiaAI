import { useContext } from "react";
import { Link } from "react-router-dom";
import { RecentlyReadContext } from "../../context/RecentlyReadContext";
import { useEffect } from "react";
import { formatDate, formatTime } from "../../utils/FormatTime";

function RecentlyRead() {
    const { recentlyRead, loadRecentlyRead, loading, error } = useContext(RecentlyReadContext);
    
    useEffect(() => {
        loadRecentlyRead();
    }, []);

    useEffect(() => {
        if (recentlyRead.length > 0) {
            console.log("libros leidos recientemente", recentlyRead);
        }
    }, [recentlyRead]);

    return (
        <div>
            <h2>Recently Read</h2>
            <ul>
                {loading ? <p>Loading...</p> 
                : error ? <p>Error: {error}</p> 
                : recentlyRead.length > 0 ? recentlyRead.map((book, index) => (
                    <li key={index}>
                        <p>{book.book_data.bookName} {book.book_data.chapterNumber}</p>
                        <p>{book.book_data.translation}</p>
                        <p>Last Time: {formatDate(book.updated_at)}</p>
                        <p>at {formatTime(book.updated_at)}</p>
                        <Link to={`/books/${book.book_data.bookId.toLowerCase()}/${book.book_data.chapterNumber}?translation=${book.book_data.translationValue}`}>Go to {book.book_data.bookName} {book.book_data.chapterNumber}</Link>
                    </li>
                )) : <p>No recently read books</p>}
            </ul>
        </div>
    );
}

export default RecentlyRead;    