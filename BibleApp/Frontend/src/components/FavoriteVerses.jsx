import { useContext, useEffect } from "react";
import { FavoritesContext } from "../context/FavoritesContext";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import LoadingNotes from "./ui/LoadingNotes";

function FavoriteVerses() {
    const { LoadFavorites, LoadFavoritesVerses, RemoveFavorite, loading, loadingFavorites, error } = useContext(FavoritesContext);
    const { user, loading: authLoading } = useContext(AuthContext);

    const VerseUrl = (verse) => {
        const bookId = verse.bookId.toLowerCase();
        return `/books/${bookId}/${verse.chapterNumber}?translation=${verse.translationValue}#${bookId}-${verse.chapterNumber}-${verse.verseNumber}-${verse.translationValue}`;
    }

    function RemoveFavoriteHandler(verseKey) {
        RemoveFavorite(verseKey);
    }

    useEffect(() => {
        if (!authLoading && user && LoadFavoritesVerses.length === 0) {
            LoadFavorites();
            console.log("Loading favorites for user:", user.id);
        }
    }, [user, authLoading]);

    useEffect(() => {
        if (LoadFavoritesVerses.length > 0) {
            console.log("Favorites updated:", LoadFavoritesVerses);
        }

        console.log("Favorites loading:", loadingFavorites);
    }, [LoadFavoritesVerses]);

    return (
        <div>
            <h1>Your Favorites Verses</h1>
            {loading ? (
                <LoadingNotes numberOfNotes={LoadFavoritesVerses.length > 0 ? LoadFavoritesVerses.length + 1 : 4} />
            ) : error?.isDuplicate ? (
                <p className="alert">{error.message}</p>
            ) : LoadFavoritesVerses.length === 0 ? (
                <p>No favorites found</p>
            ) : (
                <div>
                    {LoadFavoritesVerses.map((verse, idx) => {
                        return (
                            loadingFavorites[verse.verse_content.verseKey] ? (
                                <LoadingNotes numberOfNotes={1} />
                            ) : (
                                <div key={idx}>
                                    <h2>{verse.verse_content.bookName} {verse.verse_content.chapterNumber} {verse.verse_content.verseNumber}</h2>
                                    <h3>{verse.verse_content.translation}</h3>
                                    <p>{verse.verse_content.content}</p>
                                    <Link to={VerseUrl(verse.verse_content)}>View Verse</Link>
                                    <button 
                                        onClick={() => RemoveFavoriteHandler(verse.verse_content.verseKey)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            )
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default FavoriteVerses;
