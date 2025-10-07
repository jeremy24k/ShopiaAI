import { BooksContext } from "../context/BooksContext";
import { useContext } from "react";
import Select from 'react-select';
import Loading from "../components/ui/Loading";
import { useNavigate } from "react-router-dom";

function Filter() {
    // Get context data for translations and books
    const {     
        translations, 
        selectedTranslation, 
        setSelectedTranslation,
        loading,
        error 
    } = useContext(BooksContext);

    const navigate = useNavigate();

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

    return (
        <div>
            <h1>Filter</h1>
            {loading ? (
                <Loading />
            ) : error ? (
                <p>Error: {error}</p>
            ) : (
                <Select
                    options={translationOptions}
                    value={selectedTranslation}
                    onChange={handleTranslationChange}
                    placeholder="Select a translation"
                    classNamePrefix="custom-select"
                />
            )}
        </div>
    ); 
}

export default Filter;
