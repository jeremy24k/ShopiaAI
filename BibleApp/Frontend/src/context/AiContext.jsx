import { createContext, useState } from "react";

const AiContext = createContext();

function AiContextProvider({ children }) {
    const [explanation, setExplanation] = useState('');
    const [verseToExplain, setVerseToExplain] = useState([]);
    const [currentVerse, setCurrentVerse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const BASE_URL = 'http://localhost:5000/api';

    const explainVerse = async (verse, type) => {
        try {
            setLoading(true);
            setError(null);
            setExplanation(''); // Limpiar explicación anterior
            
            const response = await fetch(`${BASE_URL}/ai/explain-verse-stream`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    verse: verse.content,
                    bookName: verse.bookName,
                    chapter: verse.chapterNumber,
                    verseNumber: verse.verseNumber,
                    type: type,
                    translationValue: verse.translationValue,
                    bookId: verse.bookId
                }),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            console.log('🌊 Iniciando streaming...');
            setLoading(false); // Cambiar a streaming mode
            
            // Leer stream de texto
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            
            while (true) {
                const { done, value } = await reader.read();
                
                if (done) {
                    console.log('✅ Streaming completado');
                    break;
                }
                
                // Decodificar chunk y agregarlo a la explicación
                const chunk = decoder.decode(value, { stream: true });
                setExplanation(prev => prev + chunk);
            }
            
        } catch (error) {
            console.error('❌ Error en streaming:', error);
            setError('Error al explicar el versículo');
            setLoading(false);
        }
    };

    const value = {
        explainVerse,
        explanation,
        verseToExplain,
        setVerseToExplain,
        setCurrentVerse,
        currentVerse,
        setExplanation,
        setLoading,
        setError,
        loading,
        error,
    };
    
    return (
        <AiContext.Provider value={value}>
            {children}
        </AiContext.Provider>
    );
};

export { AiContext, AiContextProvider };

