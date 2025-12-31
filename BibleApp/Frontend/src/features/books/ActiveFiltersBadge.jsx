import { useBooksStore } from "../../store/BooksStore";
import { CircleX, Funnel, X } from "lucide-react";
import useUrlParams from "../../hooks/useUrlParams";
import { useTranslation } from '../../hooks/useTranslation';
import styles from "../../styles/Read.module.css";
import Icon from "../../components/ui/Icon";  

function ActiveFiltersBadge({ 
    searchQueryToFilter,
    onClearSearch
}) {
    const { t } = useTranslation();
    // Get state directly from store
    const selectedCategory = useBooksStore(state => state.selectedCategory);
    const selectedTestament = useBooksStore(state => state.selectedTestament);
    const selectedComplete = useBooksStore(state => state.selectedComplete);
    
    // Get setters from store
    const setSelectedCategory = useBooksStore(state => state.setSelectedCategory);
    const setSelectedTestament = useBooksStore(state => state.setSelectedTestament);
    const setSelectedComplete = useBooksStore(state => state.setSelectedComplete);
    
    const { updateUrlParam, clearAllParams } = useUrlParams();
    
    // Construir array de filtros activos
    const activeFilters = [];

    // Search
    if (searchQueryToFilter) {
        activeFilters.push({
            type: 'search',
            label: `${t('search')}: "${searchQueryToFilter}"`,
            onRemove: () => {
                onClearSearch();
                updateUrlParam('search', '');
            }
        });
    }

    // Category
    if (selectedCategory && selectedCategory.value !== 'all') {
        activeFilters.push({
            type: 'category',
            label: `${t('book_category')}: ${selectedCategory.label}`,
            onRemove: () => {
                setSelectedCategory({ value: "all", label: t('all') });
                updateUrlParam('category', '');
            }
        });
    }

    // Testament
    if (selectedTestament !== 'all') {
        const testamentLabel = selectedTestament === 'old' ? t('old_testament') : t('new_testament');
        activeFilters.push({
            type: 'testament',
            label: testamentLabel,
            onRemove: () => {
                setSelectedTestament('all');
                updateUrlParam('testament', '');
            }
        });
    }

    // Progress
    if (selectedComplete !== 'all') {
        const progressLabels = {
            completed: t('completed'),
            inprogress: t('in_progress'),
            incompleted: t('not_started')
        };
        activeFilters.push({
            type: 'progress',
            label: `${t('progress')}: ${progressLabels[selectedComplete]}`,
            onRemove: () => {
                setSelectedComplete('all');
                updateUrlParam('complete', '');
            }
        });
    }

    // Función para limpiar TODOS los filtros
    const clearAllFilters = () => {
        // Limpiar estados (Zustand Persist los guardará automáticamente)
        onClearSearch();
        setSelectedCategory({ value: "all", label: t('all') });
        setSelectedTestament("all");
        setSelectedComplete("all");
        
        // Navegar a URL limpia
        clearAllParams();
    };

    // Si no hay filtros activos, no mostrar nada
    if (activeFilters.length === 0) return null;

    return (
        <div className={styles.active_filters_badge}>
            <div className={styles.filters_list}>
                <span className={styles.filters_label}>
                    <Funnel />
                    {t('active_filters')} ({activeFilters.length})
                </span>
                
                {activeFilters.map((filter) => (
                    <div key={filter.type} className={styles.filter_chip}>
                        <span>{filter.label}</span>
                        <button 
                            onClick={filter.onRemove}
                            className={styles.chip_remove}
                            aria-label={`${t('remove')} ${filter.label}`}
                        >
                            <CircleX size={18}/>
                        </button>
                    </div>
                ))}
            </div>
            
            <button 
                onClick={clearAllFilters}
                className={styles.clear_all_button}
            >
                {t('clear_all')}
                <Icon icon={<X />} size="tiny" color="white" />
            </button>
        </div>
    );
}

export default ActiveFiltersBadge;