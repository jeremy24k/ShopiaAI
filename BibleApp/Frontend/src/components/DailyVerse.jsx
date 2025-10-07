import { useState, useEffect } from "react";
import { setLocalStorageData, getLocalStorageData, removeLocalStorageData } from "../utils/LocalStorageData";
import Loading from "../components/ui/Loading";
import getGreeting  from "../utils/GetGreeting";
import { getBooks, getChapter } from "../utils/GetData";
import getRandomNumber from "../utils/GetRandomNumber";

function DailyVerse() {
    // Component state
    const [verse, setVerse] = useState({});
    const [greeting, setGreeting] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [translation, selectedTranslation] = useState("spa_r09");

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
    }    

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
            const Bookdata = await getBooks( selectedBookCode, setLoading, setError, translation);

            //get chapterNumber
            const chapterNumber = Bookdata.data.book.numberOfChapters;

            //generate a random chapter
            const randomChapter = getRandomNumber(1, chapterNumber);

            //get chapter data
            const Chapterdata = await getChapter(selectedBookCode, randomChapter, setLoading, setError, translation );
          
            //check if chapter data is valid
            if (!Chapterdata.data.chapter.content || Chapterdata.data.chapter.content.length === 0) {
                setError("No verse content found");
                setLoading(false);
                return;
            }

            //get verse number
            const verseNumber = Chapterdata.data.chapter.content.map(content => content.number);
            const randomVerseNumber = getRandomNumber(1, verseNumber.length);

            //get verse content
            const randomVerseContent = Chapterdata.data.chapter.content[randomVerseNumber - 1].content;

            //set verse data
            const verseData = {
                book: Bookdata.data.book.name,
                chapter: randomChapter, 
                verse: randomVerseContent,
                verseNumber: randomVerseNumber,
            }
            setVerse(verseData);

            // Save verse to localStorage
            setLocalStorageData("DailyVerse", verseData);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setError(error);
            setLoading(false);
        }
    }

    // Check if daily verse needs to be updated (once per day)
    const getDailyVerse = () => {
        const lastUpdated = getLocalStorageData("LastUpdated");
        const currentTimestamp = new Date().getTime();
        const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

        // Generate new verse if more than 24 hours have passed
        if ((!lastUpdated || (currentTimestamp - lastUpdated) >= MILLISECONDS_PER_DAY)) {
            console.log("Generating new verse");
            removeLocalStorageData("DailyVerse");
            generateVerse();
            setLocalStorageData("LastUpdated", currentTimestamp);
        } else {
            // Use saved verse from localStorage
            const savedVerse = getLocalStorageData("DailyVerse");
            if (savedVerse) {
                setVerse(savedVerse);
                setLoading(false);
            }
        }
    }

    // Initialize component on mount
    useEffect(() => {
        getGreeting(setGreeting);
        getDailyVerse();
    }, []);

    return (
        <div>
            <h1>{greeting} Verse of the Day</h1>
            {error && <p>Error: {error}</p>}
            {loading ? (
                <Loading />
            ) : verse.book ? (
                <div>
                    <p>{verse.book} {verse.chapter} : {verse.verseNumber}</p>
                    <p>{verse.verse}</p>
                </div>
            ) : null}
        </div>
    );
}

export default DailyVerse;
