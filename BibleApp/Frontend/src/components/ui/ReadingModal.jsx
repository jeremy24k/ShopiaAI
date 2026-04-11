import { createPortal } from "react-dom";
import { CirclePlay, CirclePause, CircleX, AArrowUp, AArrowDown, ListChecks, AudioLines, BookOpen, X } from "lucide-react";
import IconButton from "./IconButton";
import CustomSelect from "./CustomSelect";
import Icon from "./Icon";
import styles from "../../styles/ReadingModal.module.css";

function ReadingModal({ 
    isOpen, 
    onClose,
    // Audio controls
    isSpeaking,
    startSpeaking,
    pauseSpeaking,
    stopSpeaking,
    currentPlayingIndex,
    availableVoices,
    selectedVoice,
    setSelectedVoice,
    // Font controls
    fontSize,
    increaseFontSize,
    decreaseFontSize,
    // Translation
    translationOptions,
    selectedTranslation,
    onTranslationChange,
    // Selection mode
    selectionMode,
    setSelectionMode,
    clearSelection,
    t
}) {
    if (!isOpen) return null;

    const handleSelectionToggle = () => {
        if (selectionMode === 'multiple') {
            setSelectionMode('single');
            clearSelection();
        } else {
            setSelectionMode('multiple');
        }
    };

    return createPortal(
        <div className={styles.modal_overlay} onClick={onClose}>
            <div className={styles.modal_content} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modal_header}>
                    <h3>{t('reading_settings') || 'Configuración de Lectura'}</h3>
                    <button className={styles.close_button} onClick={onClose}>
                        <Icon icon={<X />} size="small" color="black" />
                    </button>
                </div>

                <div className={styles.modal_body}>
                    {/* Voice Reader Section */}
                    <div className={styles.setting_section}>
                        <label className={styles.setting_label}>
                            <Icon icon={<AudioLines />} size="small" color="black" />
                            {t('voice_reader') || 'Lector de Voz'}
                        </label>
                        
                        <div className={styles.voice_controls}>
                            {currentPlayingIndex !== null ? (
                                <>
                                    {isSpeaking ? (
                                        <IconButton 
                                            onClick={pauseSpeaking}
                                            icon={CirclePause}
                                            variant="ghost"
                                            size="medium"
                                            iconSize="medium"
                                        />
                                    ) : (
                                        <IconButton 
                                            onClick={startSpeaking}
                                            icon={CirclePlay}
                                            variant="ghost"
                                            size="medium"
                                            iconSize="medium"
                                        />
                                    )}
                                    <IconButton 
                                        onClick={stopSpeaking}
                                        icon={CircleX}
                                        variant="ghost"
                                        size="medium"
                                        iconSize="medium"
                                    />
                                </>
                            ) : (
                                <IconButton 
                                    onClick={startSpeaking}
                                    icon={CirclePlay}
                                    variant="ghost"
                                    size="medium"
                                    iconSize="medium"
                                />
                            )}
                        </div>

                        {availableVoices.length > 0 && (
                            <CustomSelect 
                                options={availableVoices}
                                value={selectedVoice}
                                onChange={setSelectedVoice}
                                placeholder={t('select_voice') || 'Seleccionar voz'}
                                aria-label={t('aria_select_voice')}
                                generalPadding="8px 12px"
                                width="100%"
                                prefixIcon={<AudioLines />}
                                usePortal={false}
                            />
                        )}

                        <div className={`${styles.voice_status} ${isSpeaking ? styles.playing : ''}`}>
                            {isSpeaking ? (
                                <>{t('reading') || 'Leyendo...'}</>
                            ) : currentPlayingIndex !== null ? (
                                <>{t('paused') || 'Pausado'}</>
                            ) : (
                                <>{t('stopped') || 'Detenido'}</>
                            )}
                        </div>
                    </div>

                    {/* Font Size Section */}
                    <div className={styles.setting_section}>
                        <label className={styles.setting_label}>
                            <Icon icon={<BookOpen />} size="small" color="black" />
                            {t('font_size') || 'Tamaño de Fuente'}
                        </label>
                        
                        <div className={styles.font_size_controls}>
                            <IconButton 
                                onClick={decreaseFontSize}
                                icon={AArrowDown}
                                variant="ghost"
                                size="medium"
                                iconSize="medium"
                                disabled={fontSize <= 12}
                            />
                            
                            <div className={styles.font_size_value}>
                                {fontSize}
                            </div>
                            
                            <IconButton 
                                onClick={increaseFontSize}
                                icon={AArrowUp}
                                variant="ghost"
                                size="medium"
                                iconSize="medium"
                                disabled={fontSize >= 48}
                            />
                        </div>
                    </div>

                    {/* Translation Section */}
                    <div className={styles.setting_section}>
                        <label className={styles.setting_label}>
                            <Icon icon={<BookOpen />} size="small" color="black" />
                            {t('translation') || 'Traducción'}
                        </label>
                        
                        <CustomSelect 
                            options={translationOptions}
                            value={selectedTranslation}
                            onChange={onTranslationChange}
                            placeholder={t('select_translation') || 'Seleccionar traducción'}
                            aria-label={t('aria_select_translation')}
                            generalPadding="8px 12px"
                            width="100%"
                            usePortal={false}
                        />
                    </div>

                    {/* Selection Mode Section */}
                    <div className={styles.setting_section}>
                        <label className={styles.setting_label}>
                            <Icon icon={<ListChecks />} size="small" color="black" />
                            {t('selection_mode') || 'Modo de Selección'}
                        </label>
                        
                        <button 
                            className={`${styles.selection_toggle} ${selectionMode === 'multiple' ? styles.active : ''}`}
                            onClick={handleSelectionToggle}
                        >
                            <Icon 
                                icon={<ListChecks />} 
                                size="small" 
                                color={selectionMode === 'multiple' ? "white" : "black"} 
                            />
                            <span className={styles.selection_text}>
                                {selectionMode === 'multiple' 
                                    ? (t('multiple_selection_active') || 'Selección Múltiple Activa') 
                                    : (t('enable_multiple_selection') || 'Activar Selección Múltiple')
                                }
                            </span>
                        </button>
                    </div>
                </div>

                <div className={styles.modal_footer}>
                    <button className={styles.close_modal_button} onClick={onClose}>
                        {t('close') || 'Cerrar'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

export default ReadingModal;
