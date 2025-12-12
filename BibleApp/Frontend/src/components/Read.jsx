import { useState, useEffect } from "react";
import { useSearchParams, Routes, Route } from "react-router-dom";
import BookGrid from "./BookGrid";
import Filter from "./Read/Filter";
import ChapterGrid from "./ChapterGrid";
import ChapterContent from "./ChapterContent";
import BooksBreadcrumbs from "./Navigation/BooksBreadcrumbs";
import ActiveFiltersBadge from "../components/Read/ActiveFiltersBadge";
import SearchComponent from "../components/Read/SearchComponent";
import IconButton from "./ui/IconButton";
import { SlidersHorizontal, X, BookOpen } from "lucide-react";
import useUpdateFilterUrl from "./Hooks/useUpdateFilterUrl";
import { useBooksStore } from "../store/BooksStore";
import styles from "../styles/Read.module.css";
import ContinueReadingButton from "./ui/ContinueReadingButton";
import { bookCategories } from "../utils/bookCategories";

function Read() {
    // 🔍 Estado para el Search (elevado desde Filter)
    const [searchParams] = useSearchParams();
    const  { updateFilter } = useUpdateFilterUrl();
    const searchQuery = useBooksStore(state => state.searchQuery);
    const setSearchQuery = useBooksStore(state => state.setSearchQuery);
    const searchQueryToFilter = useBooksStore(state => state.searchQueryToFilter);
    const setSearchQueryToFilter = useBooksStore(state => state.setSearchQueryToFilter);
    
    // 🎛️ Estado para controlar el sidebar de filtros
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // 📖 Obtener la versión actual de la Biblia y otros estados del store
    const selectedTranslation = useBooksStore(state => state.selectedTranslation);
    const translations = useBooksStore(state => state.translations);
    const setSelectedTranslation = useBooksStore(state => state.setSelectedTranslation);
    const setSelectedCategory = useBooksStore(state => state.setSelectedCategory);
    const setSelectedTestament = useBooksStore(state => state.setSelectedTestament);
    const setSelectedComplete = useBooksStore(state => state.setSelectedComplete);
    const translationsLoading = useBooksStore(state => state.loading);

    // 🔄 Sincronizar con URL al cargar
    useEffect(() => {
        if (translationsLoading || translations.length === 0) {
            return; // Esperar
        }

        // Primero intentar leer de la URL
        let params = new URLSearchParams(searchParams);

        // Sincronizar translation
        const urlTranslation = params.get('translation');
    
        if (urlTranslation) {
            const isDifferent = selectedTranslation.value !== urlTranslation;
            const translationObj = translations.find(t => t.id === urlTranslation);
            
            // Solo actualizar si es diferente y válida
            if (isDifferent && translationObj) {
                setSelectedTranslation({
                    value: translationObj.id,
                    label: translationObj.name,
                    shortName: translationObj.shortName
                });
            }
        }
        
        // Si no hay parámetros en la URL, intentar restaurar desde localStorage
        if (params.toString() === '') {
            const savedFilters = localStorage.getItem('lastBooksFilters');
            if (savedFilters) {
                params = new URLSearchParams(savedFilters);
            }
        }
        
        // Sincronizar search
        const searchFromUrl = params.get('search') || '';
        setSearchQuery(searchFromUrl);
        setSearchQueryToFilter(searchFromUrl);
    
        // Sincronizar category
        const categoryValue = params.get('category');
        if (categoryValue) {
            const category = bookCategories.find(cat => cat.value === categoryValue);
            if (category) {
                setSelectedCategory(category);
            }
        }
        
        // Sincronizar testament
        const testamentValue = params.get('testament');
        if (testamentValue) {
            setSelectedTestament(testamentValue);
        }
        
        // Sincronizar complete
        const completeValue = params.get('complete');
        if (completeValue) {
            setSelectedComplete(completeValue);
        }
    }, [searchParams, translations, setSearchQuery, setSearchQueryToFilter, setSelectedCategory, setSelectedTranslation, setSelectedTestament, setSelectedComplete]);

    // Función que se ejecuta al presionar el botón "Buscar"
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setSearchQueryToFilter(searchQuery); // ⭐ Actualizar el query de filtrado
        updateFilter("search", searchQuery);
    };
    
    // Función para limpiar la búsqueda
    const clearSearch = () => {
        setSearchQuery('');
        setSearchQueryToFilter(''); // ⭐ También limpiar el query de filtrado
        updateFilter("search", '');
    };
    
    return (
        <div className={styles.ctn_read_component}>
            <BooksBreadcrumbs />
            <Routes>
                <Route path="/" element={
                    <>

                        <header className={styles.header}>
                            <div>
                                <h1>Read the Bible</h1>
                                <p>Select a book to start reading</p>
                            </div>
                            
                            <div className={styles.header_actions}>
                                {/* 📖 Badge de versión de la Biblia */}
                                <div className={styles.version_badge}>
                                    <BookOpen size={18} />
                                    <span>{selectedTranslation.label}</span>
                                </div>

                                <IconButton 
                                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                                    icon={SlidersHorizontal}
                                    variant="primary"
                                    size="medium"
                                    iconSize="medium"
                                    circle={true}
                                >
                                    Filters
                                </IconButton>
                            </div>
                        </header>
                        
                        {isFilterOpen && (
                            <div 
                                className={styles.filter_overlay}
                                onClick={() => setIsFilterOpen(false)}
                            />
                        )}

                        <div className={`${styles.ctn_filter_sidebar} ${isFilterOpen ? styles.open : ''}`}>
                            <div className={styles.filter_header}>
                                <h2>Filters</h2>
                                <IconButton 
                                    onClick={() => setIsFilterOpen(false)}
                                    icon={X}
                                    variant="ghost"
                                    size="small"
                                    iconSize="medium"
                                    circle={true}
                                />
                            </div>
                            <Filter searchQueryToFilter={searchQueryToFilter} />
                        </div>

                        <div className={styles.ctn_read}>
                            <div className={styles.ctn_books}>
                                <div className={styles.ctn_search}>
                                    <SearchComponent 
                                        handleSearchSubmit={handleSearchSubmit}
                                        searchQuery={searchQuery} 
                                        setSearchQuery={setSearchQuery} 
                                        clearSearch={clearSearch} 
                                    />
                                    <ContinueReadingButton />
                                </div>
                                
                                <ActiveFiltersBadge 
                                    searchQueryToFilter={searchQueryToFilter}
                                    onClearSearch={clearSearch}
                                />
                                
                            </div>  
                                              
                            <BookGrid />
                        </div>
                    </>
                } />
                <Route path="/:bookId" element={
                    <ChapterGrid />
                } />
                <Route path="/:bookId/:chapterNumber" element={
                    <ChapterContent />
                } />
            </Routes>
        </div>
    );
}

export default Read;    
