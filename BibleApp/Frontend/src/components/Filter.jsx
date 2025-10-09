import { BooksContext } from "../context/BooksContext";
import { useEffect, useContext } from "react";
import Select from 'react-select';
import Loading from "../components/ui/Loading";
import { useNavigate } from "react-router-dom";
import filterByCategory from "../utils/FilterByCategory";
import RadioButton from "../components/ui/RadioButton";
import filterByTestament from "../utils/FilterByTestament";

function Filter() {
    // Get context data for translations and books
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
    };

    // Handle translation selection change
    const handleTranslationChange = (newTranslation) => {
        setSelectedTranslation(newTranslation);
        navigate(`/books?translation=${newTranslation.value}`);
    };

    // Handle testament selection change
    const handleTestamentChange = (event) => {
        setSelectedTestament(event.target.value);
    };

    // Filter books when books or selected category change
   useEffect(() => {
        let filtered = Array.isArray(books) ? books : [];

        if (!selectedTranslation && translationOptions.length > 0) {
            const defaultOption = translationOptions.find(opt => opt.value === "spa_r09");
            if (defaultOption) setSelectedTranslation(defaultOption);
        }

        // Filter by category
        if (selectedCategory && selectedCategory.value !== "all") {
            let temp = [];
            filterByCategory(selectedCategory, filtered, res => temp = res);
            filtered = temp;
        }

        // Filter by testament using the utility function
        filtered = filterByTestament(selectedTestament, filtered || []);

        setFilteredBooks(filtered);

    }, [books, selectedCategory, selectedTestament, setFilteredBooks]);

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
                    <h2>Testamento</h2>
                    <div>
                        <RadioButton
                            label="Ambos"
                            value="all"
                            checked={selectedTestament === "all"}
                            onChange={handleTestamentChange}
                        />
                        <RadioButton
                            label="Antiguo Testamento"
                            value="old"
                            checked={selectedTestament === "old"}
                            onChange={handleTestamentChange}
                        />
                        <RadioButton
                            label="Nuevo Testamento"
                            value="new"
                            checked={selectedTestament === "new"}
                            onChange={handleTestamentChange}    
                        />
                    </div>
                </>
            )}
        </div>
    ); 
}

export default Filter;
