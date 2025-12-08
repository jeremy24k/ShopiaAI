import { useState, useEffect } from "react";
import { useSearchParams, Routes, Route } from "react-router-dom";
import BookGrid from "./BookGrid";
import Filter from "./Read/Filter";
import ChapterGrid from "./ChapterGrid";
import ChapterContent from "./ChapterContent";
import NavigateBack from "./NavigateBack";
import ActiveFiltersBadge from "../components/Read/ActiveFiltersBadge";
import SearchComponent from "../components/Read/SearchComponent";
import IconButton from "./ui/IconButton";
import { SlidersHorizontal, X, BookOpen } from "lucide-react";
import useUpdateFilterUrl from "./Hooks/useUpdateFilterUrl";
import { useBooksStore } from "../store/BooksStore";
import styles from "../styles/Read.module.css";

function Read() {
    // 🔍 Estado para el Search (elevado desde Filter)
    const [searchQuery, setSearchQuery] = useState(""); // Input del usuario
    const [searchQueryToFilter, setSearchQueryToFilter] = useState(""); // Query que se usa para filtrar
    const [searchParams] = useSearchParams();
    const updateFilter = useUpdateFilterUrl();
    
    // 🎛️ Estado para controlar el sidebar de filtros
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // 📖 Obtener la versión actual de la Biblia
    const selectedTranslation = useBooksStore(state => state.selectedTranslation);

    // 🔄 Sincronizar con URL al cargar
    useEffect(() => {
        // Primero intentar leer de la URL
        let searchFromUrl = searchParams.get('search') || '';
        
        // Si no hay parámetros en la URL, intentar restaurar desde localStorage
        if (!searchFromUrl) {
            const savedFilters = localStorage.getItem('lastBooksFilters');
            if (savedFilters) {
                const saved = new URLSearchParams(savedFilters);
                searchFromUrl = saved.get('search') || '';
            }
        }
        
        // Aplicar los filtros
        setSearchQuery(searchFromUrl);
        setSearchQueryToFilter(searchFromUrl);
    }, [searchParams]);

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

        useEffect(() => {
console.log(selectedTranslation);
    }, [selectedTranslation])
    
    return (
        <div className={styles.ctn_read_component}>
            <NavigateBack />


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
                                <SearchComponent 
                                    handleSearchSubmit={handleSearchSubmit}
                                    searchQuery={searchQuery} 
                                    setSearchQuery={setSearchQuery} 
                                    clearSearch={clearSearch} 
                                />
                                
                                <ActiveFiltersBadge 
                                    searchQueryToFilter={searchQueryToFilter}
                                    onClearSearch={clearSearch}
                                />
                                
                            </div>  
                                              
                            <BookGrid />
                        </div>
                    </>
                } />
                <Route path="/:bookId" element={<ChapterGrid />} />
                <Route path="/:bookId/:chapterNumber" element={<ChapterContent />} />
            </Routes>
        </div>
    );
}

export default Read;    
