import { useEffect, useState } from "react";
import { useBooksStore } from "../store/BooksStore";
import CustomSelect from "../components/ui/CustomSelect";
import Icon from "../components/ui/Icon";
import { Globe } from "lucide-react";
import Loading from "../components/ui/Loading";
import { filterByCategory, addCategoryToBooks } from "../utils/FilterByCategory";
import RadioButton from "../components/ui/RadioButton";
import { filterByTestament, addTestamentToBooks } from "../utils/FilterByTestament";
import { filterBySearch } from "../utils/FilterBySearch";
import filterByProgress from "../utils/FilterByProgress";
import  useUpdateFilterUrl  from "./Hooks/useUpdateFilterUrl";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTrackingBookStore } from "../store/TrackingBookStore";

function Filter() {
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
    const updateFilter = useUpdateFilterUrl();
    const [searchQuery, setSearchQuery] = useState(""); // Input del usuario
    const [searchQueryToFilter, setSearchQueryToFilter] = useState(""); // Query que se usa para filtrar
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

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

    const categories = [
        { value: "all", label: "All" },
        { value: "pentateuco", label: "Pentateuco" },
        { value: "historicos", label: "Históricos" },
        { value: "poeticos", label: "Poéticos" },
        { value: "profetas_mayores", label: "Profetas Mayores" },
        { value: "profetas_menores", label: "Profetas Menores" },
        { value: "evangelios", label: "Evangelios" },
        { value: "cartas_de_pablo", label: "Cartas de Pablo" },
        { value: "cartas_universales", label: "Cartas Universales" },
        { value: "profeticos", label: "Proféticos" },
        { value: "hechos", label: "Hechos" },
        { value: "libros_apocrifos", label: "Libros Apócrifos" },
    ];

    // Handle category selection change
    const categoryOptions = categories.map((category) => ({
        value: category.value,
        label: category.label,
    }));

    // Format translations for react-select component
    const translationOptions = translations
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((translation) => ({
            value: translation.id,
            label: translation.name,
        }));

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

    const clearAllFilters = () => {
        setSearchQuery('');
        setSearchQueryToFilter(''); // ⭐ Limpiar también el query de filtrado
        setSelectedCategory({ value: "all", label: "All" });
        setSelectedTestament("all");
        setSelectedComplete("all");
        setSelectedTranslation({
            value: "spa_r09",
            label: "Santa Biblia — Reina Valera 1909",
            shortName: "R09"
        });
        localStorage.removeItem('lastBooksFilters');
        navigate('/books', { replace: true });  
    };

    useEffect(() => {
        // Primero intentar leer de la URL
        let searchFromUrl = searchParams.get('search') || '';
        let translationFromUrl = searchParams.get('translation') || '';
        let categoryFromUrl = searchParams.get('category') || '';
        let testamentFromUrl = searchParams.get('testament') || '';
        
        // Si no hay parámetros en la URL, intentar restaurar desde localStorage
        if (!searchFromUrl && !translationFromUrl && !categoryFromUrl && !testamentFromUrl) {
            const savedFilters = localStorage.getItem('lastBooksFilters');
            if (savedFilters) {
                const saved = new URLSearchParams(savedFilters);
                searchFromUrl = saved.get('search') || '';
                translationFromUrl = saved.get('translation') || '';
                categoryFromUrl = saved.get('category') || '';
                testamentFromUrl = saved.get('testament') || '';
                
                // Actualizar la URL con los filtros guardados
                if (savedFilters) {
                    navigate(`/books?${savedFilters}`, { replace: true });
                }
            }
        }
        
        // Aplicar los filtros
        setSearchQuery(searchFromUrl);
        setSearchQueryToFilter(searchFromUrl); // ⭐ También actualizar el query de filtrado
    }, [searchParams]);

    // 🔥 NUEVO: Limpiar filtro automáticamente cuando el search está vacío
    useEffect(() => {
        if (searchQuery === '') {
            setSearchQueryToFilter(''); // Limpiar filtro automáticamente
        }
    }, [searchQuery]);

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
        <div>
            <h1>Filter</h1>
            {loading ? (
                <Loading />
            ) : error ? (
                <p>Error: {error}</p>
            ) : (
                <>
                <div>
                    <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px' }}>
                        <input 
                            type="text" 
                            placeholder="Search books..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button type="submit">
                            🔍 Buscar
                        </button>
                        {searchQuery && (
                            <button 
                                type="button" 
                                onClick={clearSearch}
                            >
                                ✕ Limpiar
                            </button>
                        )}
                    </form>
                </div>
                    <h2>Select a translation</h2>
                    <CustomSelect
                        prefixIcon={<Icon icon={<Globe />} size="small" color="black" />} 
                        options={translationOptions}
                        value={selectedTranslation}
                        onChange={handleTranslationChange}
                        placeholder="Select a translation"
                    />
                    <h2>Select a category</h2>
                    <CustomSelect
                        prefixIcon={<Icon icon={<Globe />} size="small" color="black" />} 
                        options={categoryOptions}
                        value={selectedCategory}
                        onChange={handleCategoryChange}
                        placeholder="Select a category"
                    />
                    <h2>Testamento</h2>
                    <div>
                        <RadioButton
                            name="testament-filter"
                            label="Ambos"
                            value="all"
                            checked={selectedTestament === "all"}
                            onChange={handleTestamentChange}
                        />
                        <RadioButton
                            name="testament-filter"
                            label="Antiguo Testamento"
                            value="old"
                            checked={selectedTestament === "old"}
                            onChange={handleTestamentChange}
                        />
                        <RadioButton
                            name="testament-filter"
                            label="Nuevo Testamento"
                            value="new"
                            checked={selectedTestament === "new"}
                            onChange={handleTestamentChange}    
                        />
                    </div>

                    <h2>Progreso de lectura</h2>
                    <div>
                        <RadioButton
                            name="progress-filter"
                            label="Todos"
                            value="all"
                            checked={selectedComplete === "all"}
                            onChange={handleCompleteChange}    
                        />
                        <RadioButton
                            name="progress-filter"
                            label="Completados"
                            value="completed"
                            checked={selectedComplete === "completed"}
                            onChange={handleCompleteChange}    
                        />
                        <RadioButton
                            name="progress-filter"
                            label="En Progreso"
                            value="inprogress"
                            checked={selectedComplete === "inprogress"}
                            onChange={handleCompleteChange}    
                        />
                        <RadioButton
                            name="progress-filter"
                            label="Sin Empezar"
                            value="incompleted"
                            checked={selectedComplete === "incompleted"}
                            onChange={handleCompleteChange}    
                        />
                    </div>

                    {(searchQuery || selectedCategory.value !== 'all' || selectedTestament !== 'all' || selectedComplete !== 'all') && (
                        <div className="active-filters-badge">
                            🔍 Filtros activos 
                            <button onClick={clearAllFilters}>Limpiar todos</button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default Filter;
