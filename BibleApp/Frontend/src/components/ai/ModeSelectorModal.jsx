import { useState, useEffect } from 'react';
import Icon from '../ui/Icon';
import { Settings, X, Info, Church } from 'lucide-react';
import styles from './ModeSelectorModal.module.css';
import { useTranslation } from '../../hooks/useTranslation';
import LucideIcon from '../ui/LucideIcon';

function ModeSelectorModal({ isOpen, onClose, currentMode, currentDoctrine, onModeChange, onDoctrineChange }) {
    const { language } = useTranslation();
    const [availableModes, setAvailableModes] = useState([]);
    const [availablePerspectives, setAvailablePerspectives] = useState([]);
    const [loading, setLoading] = useState(true);

    // Cargar modos y perspectivas disponibles
    useEffect(() => {
        if (!isOpen) return;
        
        async function loadOptions() {
            try {
                setLoading(true);
                
                const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                
                // Cargar modos
                const modesUrl = `${BASE_URL}/ai/modes?language=${language}`;
                const modesResponse = await fetch(modesUrl);
                
                if (modesResponse.ok) {
                    const modesData = await modesResponse.json();
                    if (modesData.success) {
                        setAvailableModes(modesData.data);
                    }
                }

                // Cargar perspectivas doctrinales
                const perspectivesUrl = `${BASE_URL}/ai/perspectives?language=${language}`;
                const perspectivesResponse = await fetch(perspectivesUrl);
                
                if (perspectivesResponse.ok) {
                    const perspectivesData = await perspectivesResponse.json();
                    if (perspectivesData.success) {
                        setAvailablePerspectives(perspectivesData.data);
                    }
                }
            } catch (error) {
                console.error('Error cargando opciones de IA:', error);
                
                // Cargar datos de fallback
                const fallbackModes = [
                    { id: 'personal_guide', name: language === 'en' ? 'Personal Mode' : 'Modo Personal', icon: 'Heart', description: language === 'en' ? 'The AI responds as a Christian sharing their personal perspective' : 'La IA responde como un cristiano compartiendo su perspectiva personal' },
                    { id: 'impartial', name: language === 'en' ? 'Impartial Mode' : 'Modo Imparcial', icon: 'Balance', description: language === 'en' ? 'The AI presents multiple perspectives without favoring any' : 'La IA presenta múltiples perspectivas sin inclinarse por ninguna' },
                    { id: 'teacher', name: language === 'en' ? 'Student Mode' : 'Modo Estudiantil', icon: 'BookOpen', description: language === 'en' ? 'The AI acts as a teacher who instructs and motivates further learning' : 'La IA actúa como un maestro que enseña y motiva a aprender más' }
                ];
                
                const fallbackPerspectives = [
                    { id: 'evangelical', name: language === 'en' ? 'Evangelical' : 'Evangélico', description: language === 'en' ? 'Emphasis on the gospel, personal conversion and biblical authority' : 'Énfasis en el evangelio, conversión personal y autoridad bíblica' },
                    { id: 'pentecostal', name: language === 'en' ? 'Pentecostal' : 'Pentecostal', description: language === 'en' ? 'Emphasis on the Holy Spirit, spiritual gifts and healing' : 'Énfasis en el Espíritu Santo, dones espirituales y sanidad' },
                    { id: 'catholic', name: language === 'en' ? 'Catholic' : 'Católico', description: language === 'en' ? 'Apostolic tradition, sacraments and Church authority' : 'Tradición apostólica, sacramentos y autoridad de la Iglesia' },
                    { id: 'baptist', name: language === 'en' ? 'Baptist' : 'Bautista', description: language === 'en' ? 'Biblical authority, local church autonomy' : 'Autoridad de la Biblia, autonomía de la iglesia local' },
                    { id: 'adventist', name: language === 'en' ? 'Adventist' : 'Adventista', description: language === 'en' ? 'Emphasis on Sabbath, second coming and holistic health' : 'Énfasis en el sábado, segunda venida y salud integral' },
                    { id: 'ecumenical', name: language === 'en' ? 'Ecumenical' : 'Ecuménico', description: language === 'en' ? 'Inclusive approach that values unity in Christian diversity' : 'Enfoque inclusivo que valora la unidad en la diversidad cristiana' }
                ];
                
                setAvailableModes(fallbackModes);
                setAvailablePerspectives(fallbackPerspectives);
            } finally {
                setLoading(false);
            }
        }

        loadOptions();
    }, [isOpen, language]);

    // Obtener modo y doctrina actuales
    const getCurrentMode = () => {
        if (!availableModes.length) return null;
        return availableModes.find(mode => mode.id === currentMode) || availableModes[0];
    };

    const getCurrentDoctrine = () => {
        if (!availablePerspectives.length) return null;
        return availablePerspectives.find(p => p.id === currentDoctrine) || availablePerspectives[0];
    };

    const currentModeObj = getCurrentMode();
    const currentDoctrineObj = getCurrentDoctrine();

    // Preparar opciones para CustomSelect
    const modeOptions = availableModes.map(mode => ({
        value: mode.id,
        label: mode.name,
        icon: mode.icon,
        description: mode.description
    }));

    const doctrineOptions = availablePerspectives.map(perspective => ({
        value: perspective.id,
        label: perspective.name,
        description: perspective.description
    }));

    // Convertir strings a objetos para CustomSelect
    const currentModeValue = modeOptions.find(opt => opt.value === currentMode) || modeOptions[0];
    const currentDoctrineValue = doctrineOptions.find(opt => opt.value === currentDoctrine) || doctrineOptions[0];

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                {/* Header del Modal */}
                <div className={styles.modalHeader}>
                    <div className={styles.modalTitle}>
                        <Icon icon={<Settings />} size="small" />
                        <span>Configuración de IA</span>
                    </div>
                    <button 
                        className={styles.modalCloseButton}
                        onClick={onClose}
                    >
                        <Icon icon={<X />} size="small" />
                    </button>
                </div>

                {/* Contenido del Modal */}
                <div className={styles.modalBody}>
                    {loading ? (
                        <div className={styles.loadingContainer}>
                            <div className={styles.modeSelector}>
                                <div className={styles.modeSelectorHeader}>
                                    <Icon icon={<Settings />} size="small" />
                                    <span>Cargando configuración...</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.modalContentLayout}>
                            <div className={styles.mainSelectors}>
                                {/* Selector de Modo */}
                                <div className={`${styles.selectorGroup} ${styles.modesGroup}`}>
                                    <label className={styles.selectorLabel}>
                                        Modo de Respuesta:
                                    </label>
                                    <div className={styles.radioButtonsGroup}>
                                        {availableModes.map((mode) => {
                                            const isSelected = currentMode === mode.id;
                                            return (
                                                <button
                                                    key={mode.id}
                                                    className={`${styles.radioButton} ${isSelected ? styles.selected : ''}`}
                                                    onClick={() => onModeChange(mode.id)}
                                                >
                                                    <div className={styles.radioButtonContent}>
                                                        <LucideIcon name={mode.icon} size={20} />
                                                        <div className={styles.radioButtonText}>
                                                            <span className={styles.radioButtonTitle}>{mode.name}</span>
                                                        </div>
                                                    </div>
                                                    {isSelected && (
                                                        <div className={styles.radioButtonCheck}>
                                                            <div className={styles.checkmark}></div>
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Selector de Doctrina */}
                                <div className={`${styles.selectorGroup} ${styles.doctrinesGroup}`}>
                                    <label className={styles.selectorLabel}>
                                        Perspectiva Doctrinal:
                                    </label>
                                    <div className={styles.radioButtonsGroup}>
                                        {availablePerspectives.map((perspective) => {
                                            const isSelected = currentDoctrine === perspective.id;
                                            return (
                                                <button
                                                    key={perspective.id}
                                                    className={`${styles.radioButton} ${isSelected ? styles.selected : ''}`}
                                                    onClick={() => onDoctrineChange(perspective.id)}
                                                >
                                                    <div className={styles.radioButtonContent}>
                                                        <Icon icon={<Church />} size="medium" />
                                                        <div className={styles.radioButtonText}>
                                                            <span className={styles.radioButtonTitle}>{perspective.name}</span>
                                                            <span className={styles.radioButtonDescription}>{perspective.description}</span>
                                                        </div>
                                                    </div>
                                                    {isSelected && (
                                                        <div className={styles.radioButtonCheck}>
                                                            <div className={styles.checkmark}></div>
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar con información de combinación */}
                            <div className={styles.sidebar}>
                                <div className={styles.combinationInfo}>
                                    <div className={styles.combinationHeader}>
                                        <Icon icon={<Info />} size="small" />
                                        <span>Combinación Actual</span>
                                    </div>
                                    <div className={styles.combinationDetails}>
                                        <p><strong>Modo:</strong> {currentModeObj?.name}</p>
                                        <p><strong>Doctrina:</strong> {currentDoctrineObj?.name}</p>
                                        {currentDoctrineObj?.description && (
                                            <p className={styles.doctrineDescription}>
                                                <strong>Descripción:</strong> {currentDoctrineObj.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ModeSelectorModal;
