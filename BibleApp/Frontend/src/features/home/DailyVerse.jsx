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
import { cleanVerseContent } from "../../utils/cleanVerseContent";
import { useTranslation } from "../../hooks/useTranslation";
import { useLanguageStore } from "../../store/LanguageStore";
import SkeletonLoader from "../../components/ui/SkeletonLoader";

function DailyVerse() {
    const { t } = useTranslation();
    
    // Component state
    const [verse, setVerse] = useState({});
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const language = useLanguageStore((state) => state.language);
    const translationToUse = language === "en" ? "eng_web" : "spa_r09";
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

    // Fetch and save the specific verse using the daily seed
    const fetchVerseFromSeed = async (seed, lang, translationValue) => {
        const { bookCode, chapterNumber, verseNumber } = seed;
        const storageKey = `DailyVerse_${lang}`;

        const Bookdata = await getBooks(bookCode, () => {}, setError, translationValue);
        const Chapterdata = await getChapter(bookCode, chapterNumber, () => {}, setError, translationValue);

        if (!Chapterdata?.data?.chapter?.content || Chapterdata.data.chapter.content.length === 0) {
            throw new Error("No verse content found");
        }

        const verses = Chapterdata.data.chapter.content;
        // Safeguard if one translation has fewer verses than another
        const safeIndex = Math.min(verseNumber, verses.length) - 1;
        const actualVerseNumber = verses[safeIndex].number;
        const verseContent = verses[safeIndex].content;

        const verseData = {
            book: Bookdata.data.book.name,
            bookId: bookCode,
            chapterNumber: chapterNumber,
            verse: cleanVerseContent(verseContent),
            verseNumber: actualVerseNumber,
            translationValue: translationValue,
            translation: Bookdata.data.translation.name,
        };

        setVerse(verseData);
        setLocalStorageData(storageKey, verseData);
        setLoading(false);
    };

    // Check if daily verse needs to be updated (once per day)
    const getDailyVerse = async (lang, translationValue) => {
        try {
            setLoading(true);
            const today = new Date().toISOString().split('T')[0];
            const storageKey = `DailyVerse_${lang}`;
            
            const savedVerse = getLocalStorageData(storageKey);
            const seedDate = getLocalStorageData("DailyVerseSeedDate");
            let seed = getLocalStorageData("DailyVerseSeed");
            
            // Generate new verse seed if it's a new day or no seed exists
            if (!seedDate || seedDate !== today || !seed) {
                // Generate a random book
                const BookIndex = Object.keys(Books);
                const RandomBook = getRandomNumber(0, BookIndex.length - 1);
                const selectedBookCode = Books[BookIndex[RandomBook]];

                // Fetch just to know chapter counts in current language
                const Bookdata = await getBooks(selectedBookCode, () => {}, () => {}, translationValue);
                const totalChapters = Bookdata?.data?.book?.numberOfChapters || 1;
                const randomChapter = getRandomNumber(1, totalChapters);

                const Chapterdata = await getChapter(selectedBookCode, randomChapter, () => {}, () => {}, translationValue);
                const verses = Chapterdata?.data?.chapter?.content || [];
                const randomVerseNumber = verses.length > 0 ? getRandomNumber(1, verses.length) : 1;

                seed = {
                    bookCode: selectedBookCode,
                    chapterNumber: randomChapter,
                    verseNumber: randomVerseNumber
                };
                
                // Save seed globally for all languages to use today
                setLocalStorageData("DailyVerseSeed", seed);
                setLocalStorageData("DailyVerseSeedDate", today);
                removeLocalStorageData(`DailyVerse_${lang}`);
            }

            // Use saved verse if exists AND the global seed date is also today
            if (savedVerse && seedDate === today) {
                setVerse(savedVerse);
                setLoading(false);
            } else {
                // Fetch using our global seed
                await fetchVerseFromSeed(seed, lang, translationValue);
            }
        } catch (error) {
            console.error(error);
            setError("Failed to load daily verse");
            setLoading(false);
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

    // Initialize component on mount or when language changes
    useEffect(() => {
        setLoading(true);
        getDailyVerse(language, translationToUse);
    }, [language, translationToUse]);

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
