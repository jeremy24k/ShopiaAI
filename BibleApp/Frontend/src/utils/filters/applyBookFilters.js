import { filterByCategory, addCategoryToBooks } from "./FilterByCategory";
import { filterByTestament, addTestamentToBooks } from "./FilterByTestament";
import { filterBySearch } from "./FilterBySearch";

export const applyBookFilters = (books, {
    searchQuery,
    testament,
    category,
    complete,
    selectedTranslationValue,
    getBookProgress,
    bookProgressData
}) => {
    if (!Array.isArray(books)) return [];

    let filtered = books.map(book => ({ ...book }));

    // 1. Búsqueda
    filtered = filterBySearch(searchQuery, filtered);

    // 2. Añadir propiedades
    filtered = addTestamentToBooks(filtered);
    filtered = addCategoryToBooks(filtered);

    // 3. Filtrar por testament
    if (testament !== "all") {
        filtered = filterByTestament(testament, filtered);
    }

    // 4. Filtrar por categoría
    if (category.value !== "all") {
        filtered = filterByCategory(category, filtered);
    }

    // 5. ✅ FILTRADO CONDICIONAL por progreso
    if (complete !== 'all') {
        // 🔥 Si estamos filtrando por progreso pero NO han llegado los datos
        if (!bookProgressData || bookProgressData.length === 0) {
            // Pasamos un string especial para indicar que estamos esperando datos de progreso
            return "loading_progress";
        }

        filtered = filtered.filter(book => {
            const progress = getBookProgress(book.id, selectedTranslationValue);

            switch (complete) {
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

    return filtered;
};
