import { useBooksStore } from "../../store/BooksStore";
import { useNavigate } from "react-router-dom";
import { CircleX, Funnel, X } from "lucide-react";
import styles from "../../styles/Read.module.css";
import Icon from "../ui/Icon";
import { useEffect } from "react";  
import { useReadFilters } from "./Hooks/useReadFilters";

function ActiveFiltersBadge({ 
    searchQueryToFilter,  // Solo este viene de Read.jsx
    onClearSearch         // Función para limpiar búsqueda
}) {
    const translations = useBooksStore(state => state.translations);

    // 🔌 Usar hook para leer/escribir estado
    const { 
        category: selectedCategory, 
        testament: selectedTestament, 
        complete: selectedComplete,
        setCategory: setSelectedCategory,
        setTestament: setSelectedTestament,
        setComplete: setSelectedComplete
    } = useReadFilters(translations);
    
    // 📋 Construir array de filtros activos
    const activeFilters = [];

    // Search
    if (searchQueryToFilter) {
        activeFilters.push({
            type: 'search',
            label: `Search: "${searchQueryToFilter}"`,
            onRemove: onClearSearch
        });
    }

    // Category
    if (selectedCategory && selectedCategory.value !== 'all') {
        activeFilters.push({
            type: 'category',
            label: `Category: ${selectedCategory.label}`,
            onRemove: () => setSelectedCategory({ value: "all", label: "All" })
        });
    }

    // Testament
    if (selectedTestament !== 'all') {
        const testamentLabel = selectedTestament === 'old' ? 'Old Testament' : 'New Testament';
        activeFilters.push({
            type: 'testament',
            label: testamentLabel,
            onRemove: () => setSelectedTestament('all')
        });
    }

    // Progress
    if (selectedComplete !== 'all') {
        const progressLabels = {
            completed: 'Completed',
            inprogress: 'In Progress',
            incompleted: 'Not Started'
        };
        activeFilters.push({
            type: 'progress',
            label: `Progress: ${progressLabels[selectedComplete]}`,
            onRemove: () => setSelectedComplete('all')
        });
    }

    // 🧹 Función para limpiar TODOS los filtros
    const clearAllFilters = () => {
        onClearSearch();
        setSelectedCategory({ value: "all", label: "All" });
        setSelectedTestament("all");
        setSelectedComplete("all");
        // No necesitamos navegar ni limpiar localStorage manualmente, 
        // los setters del hook ya hacen todo eso.
    };

    useEffect(() => {
        // console.log('🔄 selectedComplete', selectedComplete);
    }, [selectedComplete]);

    // Si no hay filtros activos, no mostrar nada
    if (activeFilters.length === 0) return null;

    return (
        <div className={styles.active_filters_badge}>
            <div className={styles.filters_list}>
                <span className={styles.filters_label}>
                    <Funnel />
                    Active Filters ({activeFilters.length}):
                </span>
                
                {activeFilters.map((filter) => (
                    <div key={filter.type} className={styles.filter_chip}>
                        <span>{filter.label}</span>
                        <button 
                            onClick={filter.onRemove}
                            className={styles.chip_remove}
                            aria-label={`Remove ${filter.label}`}
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
                Clear All
                <Icon icon={<X />} size="tiny" color="white" />
            </button>
        </div>
    );
}

export default ActiveFiltersBadge;