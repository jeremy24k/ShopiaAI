import { useEffect, useState } from "react";
import { useBooksStore } from "../../store/BooksStore";
import useUrlParams from "../../hooks/useUrlParams";
import { useAuthStore } from '../../store/AuthStore';
import CustomSelect from "../../components/ui/CustomSelect";
import Loading from "../../components/ui/Loading";
import Notification from "../../components/ui/Notification";
import { filterByCategory, addCategoryToBooks } from "../../utils/FilterByCategory";
import RadioButton from "../../components/ui/RadioButton";
import { filterByTestament, addTestamentToBooks } from "../../utils/FilterByTestament";
import { filterBySearch } from "../../utils/FilterBySearch";
import { useTrackingBookStore } from "../../store/TrackingBookStore";
import styles from "../../styles/Filter.module.css";
import { bookCategories } from "../../utils/bookCategories";
import getTranslationOptions from "../../utils/TranslationOptions";

function Filter({ searchQueryToFilter }) {
    // Get store data via individual selectors
    const translations = useBooksStore(state => state.translations);
    const selectedTranslation = useBooksStore(state => state.selectedTranslation);
    const selectedCategory = useBooksStore(state => state.selectedCategory);
    const selectedTestament = useBooksStore(state => state.selectedTestament);
    const books = useBooksStore(state => state.books);
    const loading = useBooksStore(state => state.loading);
    const selectedComplete = useBooksStore(state => state.selectedComplete);
    const error = useBooksStore(state => state.error);

    const setSelectedTranslation = useBooksStore(state => state.setSelectedTranslation);
    const setSelectedCategory = useBooksStore(state => state.setSelectedCategory);
    const setFilteredBooks = useBooksStore(state => state.setFilteredBooks);
    const filteredBooks = useBooksStore(state => state.filteredBooks);
    const setSelectedTestament = useBooksStore(state => state.setSelectedTestament);
    const setSelectedComplete = useBooksStore(state => state.setSelectedComplete);

    const user = useAuthStore(state => state.user);
    const authLoading = useAuthStore(state => state.loading);
    const CompleteChapter = useTrackingBookStore(state => state.CompleteChapter);
    const bookProgress = useTrackingBookStore(state => state.bookProgress);
    const getBookProgress = useTrackingBookStore(state => state.getBookProgress);
    
    const { updateUrlParam } = useUrlParams();
    const [showNotification, setShowNotification] = useState(false);

    // Handle category selection change
    const categoryOptions = bookCategories.map((category) => ({
        value: category.value,
        label: category.label,
    }));

    // Format translations for react-select component
    const translationOptions = getTranslationOptions(translations);

    // Handle category selection change
    const handleCategoryChange = (newCategory) => {
        setSelectedCategory(newCategory);
        updateUrlParam("category", newCategory.value);
    };

    // Handle translation selection change
    const handleTranslationChange = (newTranslation) => {
        setSelectedTranslation({
            value: newTranslation.value,
            label: newTranslation.label,
            shortName: newTranslation.shortName
        });
        updateUrlParam("translation", newTranslation.value);
    };

    // Handle testament selection change
    const handleTestamentChange = (event) => {
        setSelectedTestament(event.target.value);
        updateUrlParam("testament", event.target.value);
    };

    const handleCompleteChange = (event) => {
        setSelectedComplete(event.target.value);
        updateUrlParam("complete", event.target.value);
    };

    useEffect(() => {
        if (loading || !Array.isArray(books)) return;
        
        let filtered = books.map(book => ({...book}));
        
        // 1. Búsqueda
        filtered = filterBySearch(searchQueryToFilter, filtered);
        
        // 2. Añadir propiedades
        filtered = addTestamentToBooks(filtered);
        filtered = addCategoryToBooks(filtered);
        
        // 3. Filtrar por testament
        if (selectedTestament !== "all") {
            filtered = filterByTestament(selectedTestament, filtered);
        }
        
        // 4. Filtrar por categoría
        if (selectedCategory.value !== "all") {
            filtered = filterByCategory(selectedCategory, filtered);
        }
        
        // 5. ✅ FILTRADO CONDICIONAL por progreso
        if (selectedComplete !== 'all') {
            // 🔥 Si estamos filtrando por progreso pero NO han llegado los datos
            if (bookProgress.length === 0) {
                 // Pasamos un string especial para indicar que estamos esperando datos de progreso
                 // BookGrid detectará esto y mostrará el skeleton loading
                 setFilteredBooks("loading_progress"); 
                 return; 
            }

            filtered = filtered.filter(book => {
                const progress = getBookProgress(book.id, selectedTranslation.value);
                
                switch(selectedComplete) {
                    case 'completed':
                        return progress.status === 'completed';
                    case 'inprogress':
                        return progress.status === 'in_progress';
                    case 'incompleted':
                        return progress.status === 'not_started';
                    default:
                        return true;
                }
            });
        }
        
        setFilteredBooks(filtered);
        
    }, [
        books, 
        selectedCategory, 
        selectedTestament, 
        searchQueryToFilter,
        selectedComplete,
        selectedTranslation.value,
        CompleteChapter,
        bookProgress,
        loading
    ]);

    // Security check: Reset progress filter if not logged in
    useEffect(() => {
        if (!user && !authLoading && selectedComplete !== 'all') {
            setSelectedComplete('all');
            updateUrlParam("complete", "all");
            setShowNotification(true);
        }
    }, [user, selectedComplete, authLoading, updateUrlParam]);       

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
