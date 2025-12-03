import styles from "../../styles/daily_verse.module.css";
import { useState, useEffect } from "react";
import {
    setLocalStorageData,
    getLocalStorageData,
    removeLocalStorageData,
} from "../../utils/LocalStorageData";
import Loading from "../../components/ui/Loading";
import { getBooks, getChapter } from "../../utils/GetData";
import getRandomNumber from "../../utils/GetRandomNumber";
import { VerseUrl } from "../../utils/VerseUrl";
import { Star, Share2, Brain, Eye } from "lucide-react";
import IconButton from "../../components/ui/IconButton";
import useProtectedAction from "../../components/Hooks/useProtectedAction";
import { useNavigate } from "react-router-dom";
import { useFavoritesStore } from "../../store/FavoritesStore";
import { getVerseData } from "../../utils/getVerseData";

function DailyVerse() {
    // Component state
    const [verse, setVerse] = useState({});
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [translation, selectedTranslation] = useState("spa_r09");
    const { protectedAction, isAuthenticated } = useProtectedAction();
    const [alertVerseId, setAlertVerseId] = useState({verseId: null, type: null});
    const { SaveFavorite } = useFavoritesStore();
    const navigate = useNavigate();

    // Book codes mapping for random verse selection
    const Books = {
        Genesis: "GEN",
        SanJuan: "JHN",
        Romanos: "ROM",
        Salmos: "PSA",
        Efesios: "EPH",
        Filipenses: "PHP",
        Gálatas: "GAL",
        Eclesiastés: "ECC",
        Proverbios: "PRO",
        JuanOne: "1JN",
        Santiago: "JAS",
        Isaías: "ISA",
        Judas: "JUD",
    };

    // Generate a random daily verse from API
    const generateVerse = async () => {
        try {
            setLoading(true);
            // check if there is a saved verse
            const savedVerse = getLocalStorageData("DailyVerse");
            if (savedVerse) {
                setVerse(savedVerse);
                setLoading(false);
                return;
            }

            // generate a random book
            const BookIndex = Object.keys(Books);
            const RandomBook = getRandomNumber(0, BookIndex.length - 1);
            const selectedBook = BookIndex[RandomBook];
            const selectedBookCode = Books[selectedBook];

            //get book data
            const Bookdata = await getBooks(
                selectedBookCode,
                setLoading,
                setError,
                translation
            );

            //get chapterNumber
            const chapterNumber = Bookdata.data.book.numberOfChapters;

            //generate a random chapter
            const randomChapter = getRandomNumber(1, chapterNumber);

            //get chapter data
            const Chapterdata = await getChapter(
                selectedBookCode,
                randomChapter,
                setLoading,
                setError,
                translation
            );

            //check if chapter data is valid
            if (
                !Chapterdata.data.chapter.content ||
                Chapterdata.data.chapter.content.length === 0
            ) {
                setError("No verse content found");
                setLoading(false);
                return;
            }

            //get verse number
            const verseNumber = Chapterdata.data.chapter.content.map(
                (content) => content.number
            );
            const randomVerseNumber = getRandomNumber(1, verseNumber.length);

            //get verse content
            const randomVerseContent =
                Chapterdata.data.chapter.content[randomVerseNumber - 1].content;

            //set verse data
            const verseData = {
                book: Bookdata.data.book.name,
                bookId: selectedBookCode,
                chapterNumber: randomChapter,
                verse: randomVerseContent,
                verseNumber: randomVerseNumber,
                translationValue: translation,
                translation: Bookdata.data.translation.name,
            };
            setVerse(verseData);
            // Save verse to localStorage
            setLocalStorageData("DailyVerse", verseData);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setError(error);
            setLoading(false);
        }
    };

    // Check if daily verse needs to be updated (once per day)
    const getDailyVerse = () => {
        const savedVerse = getLocalStorageData("DailyVerse");
        const lastUpdatedDate = getLocalStorageData("LastUpdatedDate");
        
        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];
        
        // Generate new verse if it's a new day
        if (!lastUpdatedDate || lastUpdatedDate !== today) {
            console.log("🔄 Generating new verse for today:", today);
            removeLocalStorageData("DailyVerse");
            generateVerse();
            setLocalStorageData("LastUpdatedDate", today);
        } else {
            // Use saved verse from localStorage
            if (savedVerse) {
                setVerse(savedVerse);
                setLoading(false);
            } else {
                // If date is today but no verse exists, generate one
                generateVerse();
                setLocalStorageData("LastUpdatedDate", today);
            }
        }
    };

    async function handleSaveFavorite(item) {
        // Ejecutar acción protegida directamente
        protectedAction(async () => {
            const verseData = getVerseData(item);
            const result = await SaveFavorite(verseData);
            
            // Handle duplicate favorite error
            if (result.success && result.exists) {
                const verseId = `${verseData.bookId}-${verseData.chapterNumber}-${verseData.verseNumber}`;
                setAlertVerseId({verseId, type: 'favorite'});
                setTimeout(() => {
                    setAlertVerseId({verseId: null, type: null});
                }, 3000);
            } else {
                navigate(`/favorites`)
            }
        }, 'Guardar Un Favorito')();
    }

    // Initialize component on mount
    useEffect(() => {
        getDailyVerse();
    }, []);

    return (
        <div>
            {error && <p>Error: {error}</p>}
            {loading ? (
                <Loading />
            ) : verse.book ? (
                <div
                    className={styles.daily_verse}
                    aria-labelledby="verse_title verse_reference"
                >
                    <header className={styles.verse_header}>
                        <p id="verse_title" className={styles.verse_title}>
                            Daily Verse
                        </p>
                        <div className={styles.verse_actions}>
                            {alertVerseId.verseId && (
                               <div>
                                    <p>Verse already saved</p>
                               </div>
                            )}

                            <IconButton
                                icon={Star}
                                ariaLabel="Save verse to favorites"
                                onClick={() => handleSaveFavorite(verse)}
                                variant="icon"
                                size="icon"
                                type="button"
                            />

                            <IconButton
                                icon={Share2}
                                ariaLabel="Share verse"
                                // onClick={handleShare}
                                variant="icon"
                                size="icon"
                                type="button"
                            />

                            <IconButton
                                icon={Brain}
                                ariaLabel="Generate AI explanation"
                                // onClick={handleAI}
                                variant="icon"
                                size="icon"
                                type="button"
                            />

                            <IconButton
                                icon={Eye}
                                ariaLabel="Go to verse"
                                // onClick={handleNavigate}
                                variant="icon"
                                size="icon"
                                type="link"
                                to={VerseUrl(verse)}
                            />
                        </div>
                    </header>

                    <div className={styles.verse_content}>
                        <blockquote className={styles.verse_text} aria-live="polite">
                            "{verse.verse}"
                        </blockquote>

                        <div className={styles.verse_footer}>
                            <p
                                id="verse_reference"
                                className={styles.verse_reference}
                                aria-label={`Bible reference: ${verse.book} chapter ${verse.chapterNumber}, verse ${verse.verseNumber}`}
                            >
                                {verse.book} {verse.chapterNumber}:{verse.verseNumber}
                            </p>

                            <cite className={styles.verse_translation}>
                                ({verse.translation})
                            </cite>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}

export default DailyVerse;
