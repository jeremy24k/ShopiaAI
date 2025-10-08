import { BooksContext } from "../context/BooksContext";
import { useEffect, useContext } from "react";
import Select from 'react-select';
import Loading from "../components/ui/Loading";
import { useNavigate } from "react-router-dom";

function Filter() {
    // Get context data for translations and books
    const {     
        translations, 
        selectedTranslation, 
        setSelectedTranslation,
        selectedCategory,
        setSelectedCategory,
        filteredBooks,
        setFilteredBooks,
        books,
        loading,
        error 
    } = useContext(BooksContext);

    
    const navigate = useNavigate();

    const categories = [
        { value: "all", label: "All" },
        { value: "pentateuco", label: "Pentateuco" },
        { value: "históricos", label: "Históricos" },
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

    // Handle category selection change
    const handleCategoryChange = (newCategory) => {
        setSelectedCategory(newCategory);
        filterByCategory(newCategory);
    };

    // Format translations for react-select component
    const translationOptions = translations.map((translation) => ({
        value: translation.id,
        label: translation.name,
    }));

    // Handle translation selection change
    const handleTranslationChange = (newTranslation) => {
        setSelectedTranslation(newTranslation);
        navigate(`/books?translation=${newTranslation.value}`);
    };

    function filterByCategory(category) {        
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

    useEffect(() => {
        if (selectedCategory) {
            filterByCategory(selectedCategory);
        } else if (books.length > 0) {
            filterByCategory({ value: "all", label: "All" });
        }
    }, [books, selectedCategory]);

    return (
        <div>
            <h1>Filter</h1>
            {loading ? (
                <Loading />
            ) : error ? (
                <p>Error: {error}</p>
            ) : (
                <>
                    <h2>Select a translation</h2>
                    <Select
                        options={translationOptions}
                        value={selectedTranslation}
                        onChange={handleTranslationChange}
                        placeholder="Select a translation"
                        classNamePrefix="custom-select-translation custom-select"
                    />
                    <h2>Select a category</h2>
                    <Select
                        options={categoryOptions}
                        value={selectedCategory}
                        onChange={handleCategoryChange}
                        placeholder="Select a category"
                        classNamePrefix="custom-select-category custom-select"
                    />
                </>
            )}
        </div>
    ); 
}

export default Filter;
