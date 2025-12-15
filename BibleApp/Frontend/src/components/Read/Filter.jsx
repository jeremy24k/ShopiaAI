import { useEffect, useState } from "react";
import { useBooksStore } from "../../store/BooksStore";
import { useAuthStore } from '../../store/AuthStore';
import CustomSelect from "../ui/CustomSelect";
import Loading from "../ui/Loading";
import Notification from "../ui/Notification";
// import { filterByCategory, addCategoryToBooks } from "../../utils/FilterByCategory";
import RadioButton from "../ui/RadioButton";
// import { filterByTestament, addTestamentToBooks } from "../../utils/FilterByTestament";
import { filterBySearch } from "../../utils/FilterBySearch";
import { applyBookFilters } from "../../utils/applyBookFilters";
import { useReadFilters } from "./Hooks/useReadFilters";
// import  useUpdateFilterUrl  from "../Hooks/useUpdateFilterUrl";
import { useTrackingBookStore } from "../../store/TrackingBookStore";
import styles from "../../styles/Filter.module.css";
import { bookCategories } from "../../utils/bookCategories";
import getTranslationOptions from "../../utils/TranslationOptions";

function Filter({ searchQueryToFilter }) {
    // Obtener datos básicos del store (solo datos, no estado de filtros)
    const translations = useBooksStore(state => state.translations);
    const books = useBooksStore(state => state.books);
    const loading = useBooksStore(state => state.loading);
    const error = useBooksStore(state => state.error);
    const setFilteredBooks = useBooksStore(state => state.setFilteredBooks);
    
    // Auth Store
    const user = useAuthStore(state => state.user);
    const authLoading = useAuthStore(state => state.loading);
    
    // Tracking Store
    const bookProgress = useTrackingBookStore(state => state.bookProgress);
    const getBookProgress = useTrackingBookStore(state => state.getBookProgress);

    // NUEVO: Usar el hook de filtros (Fuente de la Verdad: URL)
    const { 
        translation: selectedTranslation, // Renombrar para compatibilidad
        category: selectedCategory,
        testament: selectedTestament,
        complete: selectedComplete,
        setTranslation,
        setCategory,
        setTestament,
        setComplete,
        updateFilter // Para compatibilidad si se necesitaba
    } = useReadFilters(translations);
    
    // Opciones para UI
    const categoryOptions = bookCategories.map((category) => ({
        value: category.value,
        label: category.label,
    }));

    const translationOptions = getTranslationOptions(translations);
    
    const [showNotification, setShowNotification] = useState(false);

    // Handlers directos
    const handleCategoryChange = (val) => setCategory(val);
    const handleTranslationChange = (val) => setTranslation(val);
    const handleTestamentChange = (e) => setTestament(e.target.value);
    const handleCompleteChange = (e) => setComplete(e.target.value);

    // EFECTO DE FILTRADO (Ahora reacciona a los cambios de la URL/Hook)
    useEffect(() => {
        if (loading || !Array.isArray(books)) return;
        
        const result = applyBookFilters(books, {
            searchQuery: searchQueryToFilter || "", // Viene de props (Read.jsx lo maneja)
            testament: selectedTestament,
            category: selectedCategory,
            complete: selectedComplete,
            selectedTranslationValue: selectedTranslation.value,
            getBookProgress,
            bookProgressData: bookProgress
        });
        
        setFilteredBooks(result);
        
    }, [
        books, 
        selectedCategory, 
        selectedTestament, 
        searchQueryToFilter,
        selectedComplete,
        selectedTranslation.value,
        bookProgress,
        loading
    ]);

    // Security check
    useEffect(() => {
        if (!user && !authLoading && selectedComplete !== 'all') {
            setComplete('all');
            setShowNotification(true);
        }
    }, [user, selectedComplete, setComplete, authLoading]);       

    return (
        <div className={styles.ctn_filter}>
            {loading ? (
                <Loading />
            ) : error ? (
                <p>Error: {error}</p>
            ) : (
                <>
                    <div className={styles.ctn_filter_select}>
                        <p>Bible Version</p>
                        <CustomSelect
                            options={translationOptions}
                            value={selectedTranslation}
                            onChange={handleTranslationChange}
                            placeholder="Select a translation"
                            generalPadding="8px 12px"
                        />
                    </div>
                    <div className={styles.ctn_filter_select}>  
                        <p>Book Category</p>
                        <CustomSelect
                            options={categoryOptions}
                            value={selectedCategory}
                            onChange={handleCategoryChange}
                            placeholder="Select a category"
                            generalPadding="8px 12px"
                        />
                    </div>

                    <div className={styles.ctn_filter_radio}>  
                        <p>Testament</p>
                        <div className={styles.ctn_radio}>
                            <RadioButton
                                name="testament-filter"
                                label="All"
                                value="all"
                                checked={selectedTestament === "all"}
                                onChange={handleTestamentChange}
                            />
                            <RadioButton
                                name="testament-filter"
                                label="Old Testament"
                                value="old"
                                checked={selectedTestament === "old"}
                                onChange={handleTestamentChange}
                            />
                            <RadioButton
                                name="testament-filter"
                                label="New Testament"
                                value="new"
                                checked={selectedTestament === "new"}
                                onChange={handleTestamentChange}    
                            />
                        </div>
                    </div>

                    {user && (
                        <div className={styles.ctn_filter_radio}>  
                            <p>Reading Progress</p>
                            <div className={styles.ctn_radio}>
                                <RadioButton
                                    name="progress-filter"
                                    label="All"
                                    value="all"
                                    checked={selectedComplete === "all"}
                                    onChange={handleCompleteChange}    
                                />
                                <RadioButton
                                    name="progress-filter"
                                    label="Completed"
                                    value="completed"
                                    checked={selectedComplete === "completed"}
                                    onChange={handleCompleteChange}    
                                />
                                <RadioButton
                                    name="progress-filter"
                                    label="In Progress"
                                    value="inprogress"
                                    checked={selectedComplete === "inprogress"}
                                    onChange={handleCompleteChange}    
                                />
                                <RadioButton
                                    name="progress-filter"
                                    label="Not Started"
                                    value="incompleted"
                                    checked={selectedComplete === "incompleted"}
                                    onChange={handleCompleteChange}    
                                />
                            </div>
                        </div>
                    )}
                </>
            )}
            
            {showNotification && (
                 <Notification 
                    message="Please login to filter by reading progress"
                    type="info"
                    onClose={() => setShowNotification(false)}
                 />
            )}
        </div>
    );
}

export default Filter;
