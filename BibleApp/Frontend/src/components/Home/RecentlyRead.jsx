import { Link } from "react-router-dom";
import { useRecentlyReadStore } from "../../store/RecentlyReadStore";
import { useAuthStore } from "../../store/AuthStore";
import { useEffect } from "react";
import { formatRelativeTime } from "../../utils/FormatTime";

function RecentlyRead() {
    // Subscribe to store state
    const recentlyRead = useRecentlyReadStore(state => state.recentlyRead);
    const loading = useRecentlyReadStore(state => state.loading);
    const error = useRecentlyReadStore(state => state.error);
    const loadRecentlyRead = useRecentlyReadStore(state => state.loadRecentlyRead);
    const user = useAuthStore(state => state.user);
    const authLoading = useAuthStore(state => state.loading);
    
    useEffect(() => {
        // Only load when auth is done and user exists
        if (!authLoading && user) {
            loadRecentlyRead();
        }
    }, [user, authLoading, loadRecentlyRead]);

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
                        <p>Last Time: {formatRelativeTime(book.updated_at)}</p>
                        <Link to={`/books/${book.book_data.bookId.toLowerCase()}/${book.book_data.chapterNumber}?translation=${book.book_data.translationValue}`}>Go to {book.book_data.bookName} {book.book_data.chapterNumber}</Link>
                    </li>
                )) : <p>No recently read books</p>}
            </ul>
        </div>
    );
}

export default RecentlyRead;    