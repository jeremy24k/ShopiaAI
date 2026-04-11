// Mapping of categories to their respective IDs
const categoryMap = {
    pentateuco: ["GEN", "EXO", "LEV", "NUM", "DEU"],
    historicos: ["JOS", "JDG", "RUT", "1SA", "2SA", "1KI", "2KI", "1CH", "2CH", "EZR", "NEH", "EST"],
    poeticos: ["JOB", "PSA", "PRO", "ECC", "SNG"],
    profetas_mayores: ["ISA", "JER", "LAM", "EZK", "DAN"],
    profetas_menores: ["HOS", "JOL", "AMO", "OBA", "JON", "MIC", "NAM", "HAB", "ZEP", "HAG", "ZEC", "MAL"],
    evangelios: ["MAT", "MRK", "LUK", "JHN"],
    hechos: ["ACT"],
    profeticos: ["REV"],
    cartas_de_pablo: ["ROM", "1CO", "2CO", "GAL", "EPH", "PHP", "COL", "1TH", "2TH", "1TI", "2TI", "TIT", "PHM"],
    cartas_universales: ["JAS", "1PE", "2PE", "1JN", "2JN", "3JN", "JUD", "HEB"],
};

function addCategoryToBooks(books) {
    const list = Array.isArray(books) ? books : [];
    return list.map(book => {
        let category = 'libros_apocrifos'; // Default to apocryphal if not found in map

        for (const [key, ids] of Object.entries(categoryMap)) {
            if (ids.includes(book.id)) {
                category = key;
                break;
            }
        }

        return { ...book, category };
    });
}

function filterByCategory(category, books) {
    const list = Array.isArray(books) ? books : [];

    if (!category || category.value === "all") {
        return list;
    }

    const filtered = list.filter(book => book.category === category.value);

    if (category.value === "libros_apocrifos" && filtered.length === 0) {
        return [];
    }

    return filtered;
}

export { filterByCategory, addCategoryToBooks };