import { createContext, useEffect, useState, useMemo, useCallback } from "react";
import { getChapter } from "../utils/GetData";

// Create context for books and translations data
const BooksContext = createContext();

function BooksContextProvider({children}) {
    // Smart initialization - check URL first, then use default
    const getInitialTranslation = () => {
        // Check if we're in browser environment
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const urlTranslation = urlParams.get("translation");
            
            if (urlTranslation) {
                // Return URL translation (label will be updated when translations load)
                return {
                    value: urlTranslation,
                    label: "Loading..."
                };
            }
        }
        
        // Return default translation
        return {
            value: "spa_r09",
            label: "Reina Valera 1909"
        };
    };

    const [selectedTranslation, setSelectedTranslation] = useState(getInitialTranslation());
    const [selectedCategory, setSelectedCategory] = useState({ value: "all", label: "All" });
    const [filteredBooks, setFilteredBooks] = useState([]);

    
    // Loading and error states
    // State for books data
    const [books, setBooks] = useState([]);
    const [translations, setTranslations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const BASE_URL = "http://localhost:5000/api";

    // Fetch available translations from API
    const getTranslation = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${BASE_URL}/translations`);
            if (!response.ok) {
                setError("Failed to fetch translations");
                setLoading(false);
                return;
            }

            const data = await response.json();
            const translations = data.data.translations;
            
            // Filter to only Spanish and English translations
            const filteredTranslations = translations.filter((translation) => 
                translation.language === "spa" ||
                translation.language === "eng"
            );
            
            setTranslations(filteredTranslations);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setError(error);
            setLoading(false);
        }
    }
  
    // Fetch books for a specific translation (memoized to prevent unnecessary re-creations)
    const getBooks = useCallback(async (translation) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${BASE_URL}/books/${translation}`);
            if (!response.ok) {
                setError("Failed to fetch books");
                setLoading(false);
                return;
            }

            const data = await response.json();
            const books = data.data.books;
            setBooks(books);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setError(error.message || "An error occurred while fetching books");
            setLoading(false);
        }
    }, []);

    // Memoize context value to prevent unnecessary re-renders
    const value = useMemo(() => ({
        books,
        translations,
        selectedTranslation,
        setSelectedTranslation,
        selectedCategory,
        setSelectedCategory,
        filteredBooks,
        setFilteredBooks,
        getBooks,
        loading,
        error,
        getChapter
    }), [books, translations, selectedTranslation, selectedCategory, filteredBooks, getBooks, loading, error]);

    // Load translations on component mount
    useEffect(() => {
        getTranslation();
    }, []);

    // Update label when translations are loaded (if initialized from URL)
    useEffect(() => {
        if (translations.length > 0 && selectedTranslation.label === "Loading...") {
            const currentTranslation = translations.find(t => t.id === selectedTranslation.value);
            if (currentTranslation) {
                setSelectedTranslation({
                    value: currentTranslation.id,
                    label: currentTranslation.name
                });
            }
        }
    }, [translations, selectedTranslation]);

    // Load books when translation changes (only if translation value actually changed)
    useEffect(() => {
        if (selectedTranslation.value) {
            getBooks(selectedTranslation.value);
        }
    }, [selectedTranslation.value, getBooks]); // Only depend on the value, not the entire object

   return (
    <BooksContext.Provider value={value}>
        {children}
    </BooksContext.Provider>
   )

}

export { BooksContext, BooksContextProvider };

