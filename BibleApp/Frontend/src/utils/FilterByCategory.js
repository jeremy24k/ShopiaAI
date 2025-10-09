// Mapping of categories to their respective IDs
const categoryMap = {
    pentateuco: ["GEN", "EXO", "LEV", "NUM", "DEU"],
    históricos: ["JOS", "JDG", "RUT", "1SA", "2SA", "1KI", "2KI", "1CH", "2CH", "EZR", "NEH", "EST"],
    poeticos: ["JOB", "PSA", "PRO", "ECC", "SNG"],
    profetas_mayores: ["ISA", "JER", "LAM", "EZK", "DAN"],
    profetas_menores: ["HOS", "JOL", "AMO", "OBA", "JON", "MIC", "NAM", "HAB", "ZEP", "HAG", "ZEC", "MAL"],
    evangelios: ["MAT", "MRK", "LUK", "JHN"],
    hechos: ["ACT"],
    profeticos: ["REV"],
    cartas_de_pablo: ["ROM", "1CO", "2CO", "GAL", "EPH", "PHP", "COL", "1TH", "2TH", "1TI", "2TI", "TIT", "PHM"],
    cartas_universales: ["JAS", "1PE", "2PE", "1JN", "2JN", "3JN", "JUD", "HEB"],
};

function filterByCategory(category, books, setFilteredBooks) {        
    const list = Array.isArray(books) ? books : [];

    if (!category || category.value === "all") {
        setFilteredBooks(list);
        return;
    }

    if (category.value === "all") {
        // Show all books
        setFilteredBooks(books);
    } else if (category.value === "libros_apocrifos") {
        // Filter books that do not belong to any previous category
        const allIds = Object.values(categoryMap).flat(); // Combine all IDs from the categories
        const apocryphalBooks = books.filter(book => !allIds.includes(book.id)); // Exclude books that are in the categories
        setFilteredBooks(apocryphalBooks.length > 0 ? apocryphalBooks : "no apocryphal books found in this translation");
    } else {
        // Filter according to the selected category
        const idsToFilter = categoryMap[category.value] || [];
        setFilteredBooks(books.filter(book => idsToFilter.includes(book.id)));
    }
}

export default filterByCategory;