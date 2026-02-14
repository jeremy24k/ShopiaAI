import { useState, useEffect } from 'react';
import Icon from '../ui/Icon';
import { Settings, X, Info, Church } from 'lucide-react';
import styles from './ModeSelectorModal.module.css';
import { useTranslation } from '../../hooks/useTranslation';
import LucideIcon from '../ui/LucideIcon';

function ModeSelectorModal({ 
    isOpen, 
    onClose, 
    currentMode, 
    currentDoctrine, 
    onModeChange, 
    onDoctrineChange,
    availableModes = [],
    availableDoctrines = []
}) {
    const { t } = useTranslation();
    
    // Usar availableDoctrines como availablePerspectives para mantener compatibilidad
    const availablePerspectives = availableDoctrines;
    const loading = availableModes.length === 0 && availableDoctrines.length === 0;

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
                                                        <LucideIcon name={mode.icon} size={'var(--spacing-500)'} />
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
