
import { useContext, useEffect, useState } from "react";
import Select from 'react-select';
import { TrackingBookContext } from "../../context/TrackingBookContext";
import { BooksContext } from "../../context/BooksContext";

function DisplayBooksMetrics() {
    const { CompleteChapter, getCompleteChapter } = useContext(TrackingBookContext);
    const { translations, books } = useContext(BooksContext);
    const [selectedTranslation, setSelectedTranslation] = useState({ 
        value: "spa_r09", 
        label: "R09",
        shortName: "R09",
        fullName: "Reina Valera 1909"
    });
    const [filteredCompleteChapter, setFilteredCompleteChapter] = useState([]);

    const handleTranslationChange = (selectedOption) => {
        setSelectedTranslation(selectedOption);
    };

    // Transform options to show shortName as label
    const translationOptions = translations
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((translation) => ({
            value: translation.id,
            label: translation.shortName,
            shortName: translation.shortName,
            fullName: translation.name,
        }));

    useEffect(() => {
        getCompleteChapter();
    }, []);

    useEffect(() => {
        const filtered = CompleteChapter.filter((chapter) => chapter.book_data.translationValue === selectedTranslation.value);
        setFilteredCompleteChapter(filtered);
    }, [CompleteChapter, selectedTranslation]);

    // Calcular libros en progreso (con al menos 1 capítulo completado)
    const booksInProgress = [...new Set(filteredCompleteChapter.map(chapter => chapter.book_data.bookId))].length;
    
    // Calcular libros completados (todos los capítulos completados)
    const booksCompleted = books.filter(book => {
        // Contar cuántos capítulos de este libro están completados
        const completedChaptersCount = filteredCompleteChapter.filter(
            chapter => chapter.book_data.bookId === book.id
        ).length;
        
        // Verificar si el número de capítulos completados es igual al total
        return completedChaptersCount === book.numberOfChapters && completedChaptersCount > 0;
    }).length;
    
    return (
        <div>
            <h3>Books Metrics</h3>
            <Select
                options={translationOptions}
                value={selectedTranslation}
                onChange={handleTranslationChange}
                placeholder="Select a translation"
                classNamePrefix="custom-select-translation custom-select custom-select-home"
            />

            <p>Chapters Completed: {filteredCompleteChapter.length}</p>
            <p>Books In Progress: {booksInProgress}</p>
            <p>Books Completed: {booksCompleted}</p>
        </div>
    );
}

export default DisplayBooksMetrics;
