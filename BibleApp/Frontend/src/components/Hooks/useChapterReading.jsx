import { useState, useRef, useEffect } from "react";
import { getTextFromItem } from "../../utils/textUtils";

export function useChapterReading(chapterData = null) {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [browserSupportsSpeech, setBrowserSupportsSpeech] = useState(false);
    // Cambiamos a -1 para indicar que no hay nada reproduciéndose, null a veces da problemas en comparaciones estrictas o condicionales de renderizado si no se maneja bien
    const [currentPlayingIndex, setCurrentPlayingIndex] = useState(null); 
    const shouldKeepPlayingRef = useRef(false);
    
    // Voice Selection State
    const [availableVoices, setAvailableVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState(null);

    // Initialize Voices
    useEffect(() => {
        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) {
                // Filtramos y procesamos las voces para tener opciones limpias
                const filteredVoices = voices
                    .filter(v => v.lang.startsWith('es') || v.lang.startsWith('en'))
                    .map(v => ({
                        value: v.name,
                        label: `${v.name.replace(/Microsoft|Google|Android/g, '').trim()} (${v.lang.split('-')[0].toUpperCase()})`,
                        voiceObject: v,
                        lang: v.lang
                    }));
                
                // Ordenar: primero ES, luego EN, y alfabéticamente dentro de cada grupo
                filteredVoices.sort((a, b) => {
                    const langA = a.lang.toLowerCase();
                    const langB = b.lang.toLowerCase();
                    
                    // Prioridad a Español
                    const isSpanishA = langA.startsWith('es');
                    const isSpanishB = langB.startsWith('es');
                    
                    if (isSpanishA && !isSpanishB) return -1;
                    if (!isSpanishA && isSpanishB) return 1;
                    
                    // Si ambos son del mismo grupo (ambos ES o ambos NO-ES), ordenar por nombre
                    return a.label.localeCompare(b.label);
                });
                
                // Uniquify by name just in case
                const uniqueVoices = [...new Map(filteredVoices.map(v => [v.value, v])).values()];

                setAvailableVoices(uniqueVoices);
                
                // Intentar seleccionar una voz en español por defecto si no hay ninguna
                if (!selectedVoice) {
                    const defaultSpanish = uniqueVoices.find(v => v.lang.startsWith('es-ES')) || uniqueVoices.find(v => v.lang.startsWith('es'));
                    if (defaultSpanish) {
                        setSelectedVoice(defaultSpanish);
                    } else if (uniqueVoices.length > 0) {
                        setSelectedVoice(uniqueVoices[0]);
                    }
                }
            }
        };

        loadVoices();
        
        // Chrome a veces carga las voces asíncronamente
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
    }, [selectedVoice]);

    useEffect(() => {
        if ('speechSynthesis' in window) {
            setBrowserSupportsSpeech(true);
        } else {
            console.error("Tu navegador no soporta la Web Speech API de síntesis de voz (Text-to-Speech).");
        }

        // Limpiar al desmontar
        return () => {
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    // Reiniciar si cambia el capítulo
    useEffect(() => {
        resetSpeaking();
    }, [chapterData]);

    const speakSequence = (index) => {
        if (!chapterData?.data || index >= chapterData.data.length || !shouldKeepPlayingRef.current) {
            setIsSpeaking(false);
            setCurrentPlayingIndex(null);
            return;
        }

        const item = chapterData.data[index];
        const textToSpeak = getTextFromItem(item);

        // Si no hay texto (ej. salto de línea), pasamos al siguiente inmediatamente
        if (!textToSpeak) {
            speakSequence(index + 1);
            return;
        }

        setCurrentPlayingIndex(index);
        
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        
        // Configuración de Voz y Lenguaje
        if (selectedVoice?.voiceObject) {
            utterance.voice = selectedVoice.voiceObject;
            utterance.lang = selectedVoice.voiceObject.lang;
        } else {
            utterance.lang = 'es-ES'; // Fallback
        }

        utterance.onend = () => {
            if (shouldKeepPlayingRef.current) {
                speakSequence(index + 1);
            }
        };

        utterance.onerror = (e) => {
            // Ignorar errores por interrupción intencional (stop)
            if (e.error === 'interrupted' || e.error === 'canceled') {
                return;
            }
            console.error("Speech error", e);
            setIsSpeaking(false);
            setCurrentPlayingIndex(null);
        };

        window.speechSynthesis.speak(utterance);
    };

    const startSpeaking = () => {
        if (!browserSupportsSpeech || isSpeaking) return;
        
        window.speechSynthesis.cancel(); // Limpieza preventiva
        shouldKeepPlayingRef.current = true;
        setIsSpeaking(true);
        
        // Reanudar desde donde se quedó o empezar desde 0
        const startIndex = currentPlayingIndex !== null ? currentPlayingIndex : 0;
        speakSequence(startIndex);
    };

    const pauseSpeaking = () => {
        shouldKeepPlayingRef.current = false;
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        setIsSpeaking(false);
        // NO reseteamos currentPlayingIndex para poder reanudar
    };

    // Hot-Swap de voz en tiempo real
    useEffect(() => {
        if (isSpeaking && currentPlayingIndex !== null) {
            // 1. Detener la recursividad anterior para que no salte al siguiente verso con la voz vieja
            shouldKeepPlayingRef.current = false;
            window.speechSynthesis.cancel();

            // 2. Reiniciar con la nueva voz en el MISMO índice
            // Usamos un pequeño timeout para asegurar que el 'cancel' se procese y no haya conflictos
            const timer = setTimeout(() => {
                shouldKeepPlayingRef.current = true;
                speakSequence(currentPlayingIndex);
            }, 10);
            
            return () => clearTimeout(timer);
        }
    }, [selectedVoice]);

    const resetSpeaking = () => {
        shouldKeepPlayingRef.current = false;
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        setIsSpeaking(false);
        setCurrentPlayingIndex(null);
    };

    return {
        isSpeaking,
        browserSupportsSpeech,
        currentPlayingIndex,
        startSpeaking,
        stopSpeaking: resetSpeaking, // Exportamos reset como "stop" real si fuera necesario
        pauseSpeaking, // Nueva función para el botón
        availableVoices,
        selectedVoice,
        setSelectedVoice
    };
}
