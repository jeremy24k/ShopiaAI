import { useEffect } from "react";
import { useFavoritesStore } from "../../store/FavoritesStore";
import { useAuthStore } from "../../store/AuthStore";
import { VerseUrl } from "../../utils";
import { Link } from "react-router-dom";
import LoadingNotes from "../../components/ui/LoadingNotes";

function FavoriteVerses() {
    const { LoadFavorites, LoadFavoritesVerses, RemoveFavorite, loading, loadingFavorites, error } = useFavoritesStore();
    const { user, loading: authLoading } = useAuthStore();

    function RemoveFavoriteHandler(verseKey) {
        RemoveFavorite(verseKey);
    }

    useEffect(() => {
        if (!authLoading && user && LoadFavoritesVerses.length === 0) {
            LoadFavorites();
        }
    }, [user, authLoading]);

    return (
        <div>
            <h1>Your Favorites Verses</h1>
            {loading ? (
                <LoadingNotes numberOfNotes={LoadFavoritesVerses.length > 0 ? LoadFavoritesVerses.length + 1 : 4} />
            ) : error?.message ? (
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
                                    <Link to={VerseUrl(verse.verse_content)}>{t('view_verse')}</Link>
                                    <button 
                                        onClick={() => RemoveFavoriteHandler(verse.id)}
                                    >
                                        {t('remove')}
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
