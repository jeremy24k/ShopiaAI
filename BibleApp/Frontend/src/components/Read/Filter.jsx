import { useEffect } from "react";
import { useBooksStore } from "../../store/BooksStore";
import CustomSelect from "../ui/CustomSelect";
import Loading from "../ui/Loading";
import { filterByCategory, addCategoryToBooks } from "../../utils/FilterByCategory";
import RadioButton from "../ui/RadioButton";
import { filterByTestament, addTestamentToBooks } from "../../utils/FilterByTestament";
import { filterBySearch } from "../../utils/FilterBySearch";
import  useUpdateFilterUrl  from "../Hooks/useUpdateFilterUrl";
import { useTrackingBookStore } from "../../store/TrackingBookStore";
import styles from "../../styles/Filter.module.css";
import { bookCategories } from "../../utils/bookCategories";
import getTranslationOptions from "../../utils/TranslationOptions";

function Filter({ searchQueryToFilter }) {
    // Get store data for translations and books
    const {     
        translations, 
        selectedTranslation, 
        setSelectedTranslation,
        selectedCategory,
        setSelectedCategory,
        setFilteredBooks,
        selectedTestament,
        setSelectedTestament,
        books,
        loading,
        selectedComplete,
        setSelectedComplete,
        error 
    } = useBooksStore();

    const CompleteChapter = useTrackingBookStore(state => state.CompleteChapter);
    const { updateFilter } = useUpdateFilterUrl();

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
        updateFilter("category", newCategory.value);
    };

    // Handle translation selection change
    const handleTranslationChange = (newTranslation) => {
        setSelectedTranslation(newTranslation);
        updateFilter("translation", newTranslation.value);
    };

    // Handle testament selection change
    const handleTestamentChange = (event) => {
        setSelectedTestament(event.target.value);
        updateFilter("testament", event.target.value);
    };

    const handleCompleteChange = (event) => {
        setSelectedComplete(event.target.value);
        updateFilter("complete", event.target.value);
    };

    // Filter books when books or selected category change
    useEffect(() => {
        let filtered = Array.isArray(books) ? books : [];

        // Filter by search query PRIMERO (usando searchQueryToFilter)
        filtered = filterBySearch(searchQueryToFilter, filtered);

        // Add testament property to books
        filtered = addTestamentToBooks(filtered);
        
        // Filter by testament
        if (selectedTestament !== "all") {
            filtered = filterByTestament(selectedTestament, filtered);
        }

        // Add category property to books
        filtered = addCategoryToBooks(filtered);
        
        // Filter by category (pasar el objeto completo, no solo .value)
        if (selectedCategory.value !== "all") {
            filtered = filterByCategory(selectedCategory, filtered);
        }

        // Filter by progress (usando getBookProgress del store)
        if (CompleteChapter.length > 0 && selectedComplete !== 'all') {
            const { getBookProgress } = useTrackingBookStore.getState();
            
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

    }, [books, selectedCategory, selectedTestament, setFilteredBooks, searchQueryToFilter, CompleteChapter, selectedComplete, selectedTranslation]);

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
                </>
            )}
        </div>
    );
}

export default Filter;
