import styles from "../../styles/daily_verse.module.css";
import { useState, useEffect } from "react";
import { setLocalStorageData, getLocalStorageData, removeLocalStorageData } from "../../utils/LocalStorageData";
import Loading from "../../components/ui/Loading";
import { getBooks, getChapter } from "../../utils/GetData";
import getRandomNumber from "../../utils/GetRandomNumber";
import { VerseUrl } from "../../utils/VerseUrl";
import { Star, Share2, Brain, Eye } from "lucide-react";
import IconButton from "../../components/ui/IconButton";
import useProtectedAction from "../../hooks/useProtectedAction";
import { useNavigate } from "react-router-dom";
import { useFavoritesStore } from "../../store/FavoritesStore";
import { getVerseData } from "../../utils/getVerseData";
import { useTranslation } from "../../hooks/useTranslation";
import SkeletonLoader from "../../components/ui/SkeletonLoader";

function DailyVerse() {
    const { t } = useTranslation();
    
    // Component state
    const [verse, setVerse] = useState({});
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [translation, selectedTranslation] = useState("spa_r09");
    const { protectedAction } = useProtectedAction();
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
        <section aria-label={t('aria_daily_verse_section')}>
            {error && <p role="alert">Error: {error}</p>}
            
            {loading ? (
                <article
                    className={styles.daily_verse}
                    aria-labelledby="verse_title verse_reference"
                >
                    <header className={styles.verse_header}>
                        <h2 id="verse_title" className={styles.verse_title}>
                            <SkeletonLoader 
                                variant="rectangular"
                                width="200px"
                                height="30px"
                            />
                        </h2>

                        <div className={styles.verse_actions} role="toolbar" aria-label={t('aria_verse_actions') || 'Verse actions'}>
                            <SkeletonLoader 
                                variant="rectangular"
                                width="30px"
                                height="30px"
                            />

                            <SkeletonLoader 
                                variant="rectangular"
                                width="30px"
                                height="30px"
                            />

                            <SkeletonLoader 
                                variant="rectangular"
                                width="30px"
                                height="30px"
                            />
                            
                            <SkeletonLoader 
                                variant="rectangular"
                                width="30px"
                                height="30px"
                            />
                        </div>
                    </header>

                    <div className={styles.verse_content}>
                        <blockquote className={styles.verse_text} aria-live="polite">
                            <SkeletonLoader 
                                variant="rectangular"
                                width="100%"
                                height="30px"
                            />
                        </blockquote>

                        <footer className={styles.verse_footer}>
                            <p
                                id="verse_reference"
                                className={styles.verse_reference}
                                aria-label={`${t('aria_bible_reference')}: ${verse.book} ${verse.chapterNumber}:${verse.verseNumber}`}
                            >
                                <SkeletonLoader 
                                    variant="rectangular"
                                    width="120px"
                                    height="30px"
                                />
                            </p>

                            <cite className={styles.verse_translation}>
                                <SkeletonLoader 
                                    variant="rectangular"
                                    width="200px"
                                    height="30px"
                                />
                            </cite>
                        </footer>
                    </div>
                </article>
            ) : verse.book ? (
                <article
                    className={styles.daily_verse}
                    aria-labelledby="verse_title verse_reference"
                >
                    <header className={styles.verse_header}>
                        <h2 id="verse_title" className={styles.verse_title}>
                            {t('daily_verse_title')}
                        </h2>
                        <div className={styles.verse_actions} role="toolbar" aria-label={t('aria_verse_actions') || 'Verse actions'}>
                            {alertVerseId.verseId && (
                               <div role="status" aria-live="polite">
                                    <p>{t('verse_already_saved')}</p>
                               </div>
                            )}

                            <IconButton
                                icon={Star}
                                ariaLabel={t('aria_save_favorite')}
                                onClick={() => handleSaveFavorite(verse)}
                                variant="icon"
                                size="icon"
                                type="button"
                            />

                            <IconButton
                                icon={Share2}
                                ariaLabel={t('aria_share_verse')}
                                // onClick={handleShare}
                                variant="icon"
                                size="icon"
                                type="button"
                            />

                            <IconButton
                                icon={Brain}
                                ariaLabel={t('aria_ai_explanation')}
                                // onClick={handleAI}
                                variant="icon"
                                size="icon"
                                type="button"
                            />

                            <IconButton
                                icon={Eye}
                                ariaLabel={t('aria_go_to_verse')}
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

                        <footer className={styles.verse_footer}>
                            <p
                                id="verse_reference"
                                className={styles.verse_reference}
                                aria-label={`${t('aria_bible_reference')}: ${verse.book} ${verse.chapterNumber}:${verse.verseNumber}`}
                            >
                                {verse.book} {verse.chapterNumber}:{verse.verseNumber}
                            </p>

                            <cite className={styles.verse_translation}>
                                ({verse.translation})
                            </cite>
                        </footer>
                    </div>
                </article>
            ) : null}
        </section>
    );
}

export default DailyVerse;
