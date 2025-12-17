import { useSearchParams } from "react-router-dom";
import { useCallback, useMemo } from "react";
import { bookCategories } from "../../../utils/bookCategories";

// Valores por defecto
const DEFAULT_FILTERS = {
    translation: "spa_r09",
    category: "all",
    testament: "all",
    complete: "all",
    search: ""
};

export function useReadFilters(translations = []) {
    const [searchParams, setSearchParams] = useSearchParams();

    // 1. LEER ESTADO (Fuente de la Verdad: URL)
    // Usamos useMemo para que esto no se recalcule en cada render si la URL no cambia
    const filters = useMemo(() => {
        // Obtener valores crudos de la URL
        const rawTranslation = searchParams.get("translation");
        const rawCategory = searchParams.get("category");
        const rawTestament = searchParams.get("testament");
        const rawComplete = searchParams.get("complete");
        const rawSearch = searchParams.get("search");

        // Procesar Translation (necesitamos el objeto completo para la UI, no solo el ID)
        // Si no hay en URL, usar default (o el primero de la lista si existe)
        const translationValue = rawTranslation || DEFAULT_FILTERS.translation;
        const translationObj = translations.find(t => t.id === translationValue) || {
            value: translationValue,
            label: rawTranslation ? "Loading..." : "Santa Biblia — Reina Valera 1909", // Fallback label
            shortName: rawTranslation ? "..." : "R09",
            id: translationValue
        };

        // Mapear al formato que espera tu Dropdown (CustomSelect)
        const selectedTranslation = {
            value: translationObj.id || translationValue,
            label: translationObj.name || translationObj.label,
            shortName: translationObj.shortName
        };

        // Procesar Categoria
        const categoryValue = rawCategory || DEFAULT_FILTERS.category;
        const categoryObj = bookCategories.find(c => c.value === categoryValue) || { value: "all", label: "All" };

        return {
            translation: selectedTranslation,
            category: categoryObj,
            testament: rawTestament || DEFAULT_FILTERS.testament,
            complete: rawComplete || DEFAULT_FILTERS.complete,
            search: rawSearch || DEFAULT_FILTERS.search,
        };
    }, [searchParams, translations]);

    // 2. ESCRIBIR ESTADO (Actualizar URL)
    const updateFilter = useCallback((key, value) => {
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);

            // Si el valor es el default o vacío, lo quitamos de la URL para tenerla limpia
            // Excepción: siempre queremos translation en la URL si el usuario la cambió explícitamente
            if (value === "all" || value === "" || value === null) {
                // Solo quitamos si no es la traducción (opcional, pero buena práctica)
                if (key !== 'translation') newParams.delete(key);
                else newParams.set(key, value);
            } else {
                newParams.set(key, value);
            }

            // Guardar en localStorage para persistencia
            localStorage.setItem('lastBooksFilters', newParams.toString());

            return newParams;
        });
    }, [setSearchParams]);

    // Helpers específicos para la UI (wrappers sobre updateFilter)
    const setTranslation = useCallback((t) => updateFilter("translation", t.value), [updateFilter]);
    const setCategory = useCallback((c) => updateFilter("category", c.value), [updateFilter]);
    const setTestament = useCallback((val) => updateFilter("testament", val), [updateFilter]);
    const setComplete = useCallback((val) => updateFilter("complete", val), [updateFilter]);
    const setSearch = useCallback((val) => updateFilter("search", val), [updateFilter]);

    const clearSearch = useCallback(() => {
        updateFilter("search", "");
    }, [updateFilter]);

    return {
        ...filters, // translation, category, testament, complete, search
        setTranslation,
        setCategory,
        setTestament,
        setComplete,
        setSearch,
        clearSearch,
        updateFilter
    };
}
