import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import useUrlParams from "../hooks/useUrlParams";
import BookGrid from "../features/books/BookGrid";
import Filter from "../features/books/Filter";
import ChapterGrid from "../features/chapters/ChapterGrid";
import ChapterContent from "../features/chapters/ChapterContent";
import BooksBreadcrumbs from "../components/Navigation/BooksBreadcrumbs";
import ActiveFiltersBadge from "../features/books/ActiveFiltersBadge";
import SearchComponent from "../features/books/SearchComponent";
import IconButton from "../components/ui/IconButton";
import { SlidersHorizontal, X, BookOpen } from "lucide-react";
import { useBooksStore } from "../store/BooksStore";
import styles from "../styles/Read.module.css";
import ContinueReadingButton from "../components/ui/ContinueReadingButton";
import { bookCategories } from "../utils/bookCategories";
import { useTranslation } from '../hooks/useTranslation';

function Read() {
    const { t } = useTranslation();
    // 🔍 Estado para el Search (elevado desde Filter)
    const { updateUrlParam, updateMultipleParams, searchParams } = useUrlParams();
    const searchQuery = useBooksStore(state => state.searchQuery);
    const setSearchQuery = useBooksStore(state => state.setSearchQuery);
    const searchQueryToFilter = useBooksStore(state => state.searchQueryToFilter);
    const setSearchQueryToFilter = useBooksStore(state => state.setSearchQueryToFilter);
    
    // 🎛️ Estado para controlar el sidebar de filtros
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    
    // � Estados para controlar la sincronización
    const [urlSyncDone, setUrlSyncDone] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // �📖 Obtener la versión actual de la Biblia y otros estados del store
    const selectedTranslation = useBooksStore(state => state.selectedTranslation);
    const translations = useBooksStore(state => state.translations);
    const selectedCategory = useBooksStore(state => state.selectedCategory);
    const selectedTestament = useBooksStore(state => state.selectedTestament);
    const selectedComplete = useBooksStore(state => state.selectedComplete);
    const setSelectedTranslation = useBooksStore(state => state.setSelectedTranslation);
    const setSelectedCategory = useBooksStore(state => state.setSelectedCategory);
    const setSelectedTestament = useBooksStore(state => state.setSelectedTestament);
    const setSelectedComplete = useBooksStore(state => state.setSelectedComplete);
    const translationsLoading = useBooksStore(state => state.loading);
    const CompleteChapter = useBooksStore(state => state.CompleteChapter);

    // Función que se ejecuta al presionar el botón "Buscar"
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setSearchQueryToFilter(searchQuery);
        updateUrlParam("search", searchQuery);
    };
    
    // Función para limpiar la búsqueda
    const clearSearch = () => {
        setSearchQuery('');
        setSearchQueryToFilter('');
        updateUrlParam("search", '');
    };

    // 🔄 Sincronización unificada: URL ↔ Store
    useEffect(() => {
        if (translationsLoading || translations.length === 0) return;

        const params = new URLSearchParams(searchParams);
        const hasParams = params.toString().length > 0;

        // FASE 1: Si hay params en URL → Sincronizar URL → Store
        if (hasParams && !urlSyncDone) {
            // Sincronizar translation desde URL
            const urlTranslation = params.get('translation');
            if (urlTranslation && selectedTranslation.value !== urlTranslation) {
                const translationObj = translations.find(t => t.id === urlTranslation);
                if (translationObj) {
                    setSelectedTranslation({
                        value: translationObj.id,
                        label: translationObj.name,
                        shortName: translationObj.shortName
                    });
                }
            }
            
            // Sincronizar search desde URL
            const searchFromUrl = params.get('search');
            if (searchFromUrl !== null && searchFromUrl !== searchQueryToFilter) {
                setSearchQuery(searchFromUrl);
                setSearchQueryToFilter(searchFromUrl);
            }
        
            // Sincronizar category desde URL
            const categoryValue = params.get('category');
            if (categoryValue) {
                const category = bookCategories.find(cat => cat.value === categoryValue);
                if (category) {
                    setSelectedCategory(category);
                }
            }
            
            // Sincronizar testament desde URL
            const testamentValue = params.get('testament');
            if (testamentValue) {
                setSelectedTestament(testamentValue);
            }
            
            // Sincronizar complete desde URL
            const completeValue = params.get('complete');
            if (completeValue) {
                setSelectedComplete(completeValue);
            }

            setUrlSyncDone(true);
            setIsInitialized(true);
        }
        
        // FASE 2: Si NO hay params → Sincronizar Store → URL
        else if (!hasParams && !isInitialized) {
            const updates = {};
            
            // Siempre incluir traducción si existe
            if (selectedTranslation.value) {
                updates.translation = selectedTranslation.value;
            }
            
            if (selectedCategory.value !== 'all') {
                updates.category = selectedCategory.value;
            }
            if (selectedTestament !== 'all') {
                updates.testament = selectedTestament;
            }
            if (selectedComplete !== 'all') {
                updates.complete = selectedComplete;
            }
            if (searchQueryToFilter) {
                updates.search = searchQueryToFilter;
            }
            
            // Solo actualizar si hay filtros guardados
            if (Object.keys(updates).length > 0) {
                updateMultipleParams(updates);
            }
            
            setIsInitialized(true);
        }
    }, [
        searchParams,
        translations,
        translationsLoading,
        selectedTranslation,
        selectedCategory,
        selectedTestament,
        selectedComplete,
        searchQueryToFilter,
        urlSyncDone,
        isInitialized,
        setSelectedTranslation,
        setSearchQuery,
        setSearchQueryToFilter,
        setSelectedCategory,
        setSelectedTestament,
        setSelectedComplete,
        updateMultipleParams
    ]);
    
    return (
        <div className={styles.ctn_read_component}>
            <BooksBreadcrumbs />
            <Routes>
                <Route path="/" element={
                    <>

                        <header className={styles.header}>
                            <div className={styles.header_title}>
                                <h1>{t('read_bible')}</h1>
                                <p>{t('select_book')}</p>
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
                                    {t('filter')}
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
                                <h2>{t('filter')}</h2>
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
