import { useContext, useEffect } from "react";
import { FavoritesContext } from "../context/FavoritesContext";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import LoadingNotes from "./ui/LoadingNotes";

function FavoriteVerses() {
    const { LoadFavorites, LoadFavoritesVerses, RemoveFavorite, loading, loadingFavorites, error } = useContext(FavoritesContext);
    const { user, loading: authLoading } = useContext(AuthContext);

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
                <LoadingNotes numberOfNotes={LoadFavoritesVerses.length + 1} />
            ) : error ? (
                <p>Error loading favorites: {error}</p>
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
                                    <Link to={`/books/${verse.verse_content.bookId}/${verse.verse_content.chapterNumber}?translation=${verse.verse_content.translationValue}`}>View Verse</Link>
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
