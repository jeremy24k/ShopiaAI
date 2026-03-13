import { useState, useEffect } from 'react';

export function useFontSize(initialSize = 18) {
    // Inicializar estado leyendo de localStorage o usando el valor por defecto
    const [fontSize, setFontSize] = useState(() => {
        try {
            const savedSize = localStorage.getItem('sophiaBible_verse_font_size');
            return savedSize ? parseInt(savedSize, 10) : initialSize;
        } catch (error) {
            console.warn('Error reading font size from localStorage:', error);
            return initialSize;
        }
    });

    // Guardar en localStorage cada vez que cambie
    useEffect(() => {
        try {
            localStorage.setItem('sophiaBible_verse_font_size', fontSize.toString());
        } catch (error) {
            console.warn('Error saving font size to localStorage:', error);
        }
    }, [fontSize]);

    const increaseFontSize = () => {
        setFontSize((prev) => Math.min(prev + 2, 48)); // Max limit 48px
    };

    const decreaseFontSize = () => {
        setFontSize((prev) => Math.max(prev - 2, 12)); // Min limit 12px
    };

    return { fontSize, increaseFontSize, decreaseFontSize };
}
