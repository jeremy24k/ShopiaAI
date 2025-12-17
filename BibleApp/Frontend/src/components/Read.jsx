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
// import useUpdateFilterUrl from "./Hooks/useUpdateFilterUrl";
import { useReadFilters } from "./Read/Hooks/useReadFilters";
import { useBooksStore } from "../store/BooksStore";
import styles from "../styles/Read.module.css";
import ContinueReadingButton from "./ui/ContinueReadingButton";
import { bookCategories } from "../utils/bookCategories";
import RouteError from "../components/RouteError";

function Read() {
    // 📖 Datos del Store (Solo datos estáticos)
    const translations = useBooksStore(state => state.translations);
    const translationsLoading = useBooksStore(state => state.loading);
    
    // 🔌 Nuevo Hook: Fuente de la Verdad (URL)
    const { 
        translation: selectedTranslation,
        search: searchQuery,
        setSearch: setSearchQuery, // El hook ya actualiza la URL
        clearSearch
    } = useReadFilters(translations);

    // 🎛️ Estado UI local
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Handlers
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        // El input ya está conectado por state local en SearchComponent, 
        // aquí solo necesitaríamos si quisiéramos forzar algo, 
        // pero SearchComponent debería llamar a setSearchQuery
    };
    
    // Nota: SearchComponent espera cierta estructura, vamos a adaptarnos a lo que pide
    // O si SearchComponent maneja su propio estado y solo llama onSearch, mejor.
    // Asumiré por ahora que SearchComponent recibe props controlados.

    // 🔄 Efecto para actualizar el título de la página (opcional)
    useEffect(() => {
        document.title = `Read the Bible - ${selectedTranslation.shortName}`;
    }, [selectedTranslation]);

    // 📡 Efecto para cargar libros cuando cambia la traducción (Ahora Read es responsable de esto)
    const getBooks = useBooksStore(state => state.getBooks);
    
    useEffect(() => {
        if (selectedTranslation.value) {
            getBooks(selectedTranslation.value);
        }
    }, [selectedTranslation.value, getBooks]);
    
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
                            <Filter searchQueryToFilter={searchQuery} />
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
                                    searchQueryToFilter={searchQuery}
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
                <Route path="*" element={
                    <RouteError />
                } />
            </Routes>
        </div>
    );
}

export default Read;    
