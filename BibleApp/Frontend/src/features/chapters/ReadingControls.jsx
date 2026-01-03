import styles from "../../styles/ChapterContent.module.css";
import { CirclePlay, CirclePause, CircleX, AArrowUp, AArrowDown, ListChecks, Settings, ChevronDown, ChevronUp, AudioLines, BookOpen } from "lucide-react";
import IconButton from "../../components/ui/IconButton";
import CustomSelect from "../../components/ui/CustomSelect";
import Icon from "../../components/ui/Icon";

function ReadingControls({
    isActionsExpanded,
    setIsActionsExpanded,
    isReadingExpanded,
    setIsReadingExpanded,
    selectionMode,
    setSelectionMode,
    clearSelection,
    isBookUnavailable,
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
    t
}) {
    return (
        <div className={styles.verse_actions}>
            {/* Reading Options Menu */}
            <button 
                className={styles.actions_menu_btn}
                onClick={() => setIsActionsExpanded(!isActionsExpanded)}
                aria-label={t('reading_options')}
            >
                <Icon icon={<Settings />} size="small" color="primary" />
                <span>{t('reading_options')}</span>
                <Icon 
                    icon={isActionsExpanded ? <ChevronUp /> : <ChevronDown />} 
                    size="tiny" 
                    color="primary" 
                />
            </button>

            {/* Reading Controls Menu */}
            {!isBookUnavailable && (
                <button 
                    className={`${styles.actions_menu_btn} ${isReadingExpanded ? styles.active : ''}`}
                    onClick={() => setIsReadingExpanded(!isReadingExpanded)}
                    aria-label="Controles de lectura"
                >
                    <Icon icon={<BookOpen />} size="small" color={isReadingExpanded ? "primary" : "primary"} />
                    <span>Controles</span>
                    <Icon 
                        icon={isReadingExpanded ? <ChevronUp /> : <ChevronDown />} 
                        size="tiny" 
                        color="primary" 
                    />
                </button>
            )}

            {isActionsExpanded && (
                <div className={styles.actions_dropdown_menu}>
                    {/* Selection Mode - first section */}
                    <div className={styles.menu_section}>
                        <p className={styles.menu_section_title}>Modo de Selección</p>
                        <button 
                            className={`${styles.selection_mode_btn} ${selectionMode === 'multiple' ? styles.active : ''}`}
                            onClick={() => {
                                if (selectionMode === 'multiple') {
                                    setSelectionMode('single');
                                    clearSelection();
                                } else {
                                    setSelectionMode('multiple');
                                }
                            }}
                        >
                            <Icon icon={<ListChecks />} size="small" color={selectionMode === 'multiple' ? "primary" : "gray"} />
                            <span>{selectionMode === 'multiple' ? 'Múltiple' : 'Selección Simple'}</span>
                        </button>
                    </div>

                    {/* Translation Selector */}
                    <div className={styles.menu_section}>
                        <p className={styles.menu_section_title}>{t('select_other_translation')}</p>
                        <CustomSelect
                            options={translationOptions}
                            value={selectedTranslation}
                            onChange={onTranslationChange}
                            placeholder="Select a translation"
                            generalPadding="4px 8px"
                            fixedMenuWidth={true}
                        />
                    </div>
                </div>
            )}

            {/* Reading Controls Dropdown */}
            {isReadingExpanded && !isBookUnavailable && (
                <div className={styles.actions_dropdown_menu}>
                    {/* Audio Controls */}
                    <div className={styles.menu_section}>
                        <p className={styles.menu_section_title}>{t('audio_controls')}</p>
                        <div className={styles.voice_reader}>
                            <div className={styles.voice_reader_actions}>
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
                                    placeholder="Voz"
                                    aria-label="Seleccionar voz de lectura"
                                    generalPadding="4px 8px"
                                    fixedMenuWidth={true}
                                    width="210px"
                                />
                            )}
                        </div>
                    </div>

                    {/* Font Size Controls */}
                    <div className={styles.menu_section}>
                        <p className={styles.menu_section_title}>{t('font_size')}</p>
                        <div className={styles.font_size_actions}>
                            <IconButton 
                                onClick={decreaseFontSize}
                                icon={AArrowDown}
                                variant="ghost"
                                size="medium"
                                iconSize="medium"
                                disabled={fontSize <= 12}
                            />
                            
                            <div className={styles.font_size_value}>
                                <p>{fontSize}</p>
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
                </div>
            )}

            {/* Desktop view - keep original layout, only when book is available */}
            {!isBookUnavailable && (
                <div className={styles.desktop_controls}>
                    <div className={styles.voice_reader}>
                        <div className={styles.voice_reader_actions}>
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
                                placeholder="Voz"
                                aria-label="Seleccionar voz de lectura"
                                generalPadding="4px 8px"
                                width="180px"
                                prefixIcon={<AudioLines />}
                                variant="ghost"
                            />
                        )}
                    </div>

                    <div className={styles.font_size_actions}>
                        <div className={styles.font_size_up}>
                            <IconButton 
                                onClick={increaseFontSize}
                                icon={AArrowUp}
                                variant="ghost"
                                size="medium"
                                iconSize="medium"
                                disabled={fontSize >= 48}
                            />
                        </div>

                        <div className={styles.font_size_value}>
                            <p>{fontSize}</p>
                        </div>

                        <div className={styles.font_size_down}>
                            <IconButton 
                                onClick={decreaseFontSize}
                                icon={AArrowDown}
                                variant="ghost"
                                size="medium"
                                iconSize="medium"
                                disabled={fontSize <= 12}
                            />
                        </div>
                    </div>

                    <div className={styles.selection_actions_desktop}>
                         <button
                            onClick={() => {
                                if (selectionMode === 'multiple') {
                                    setSelectionMode('single');
                                    clearSelection();
                                } else {
                                    setSelectionMode('multiple');
                                }
                            }}
                            className={selectionMode === 'multiple' ? styles.active : ''}
                         >
                            <Icon icon={<ListChecks />} size="small" color={selectionMode === 'multiple' ? "primary" : "gray"} />
                            <span>
                                {selectionMode === 'multiple' ? 'Múltiple' : 'Selección'}
                            </span>
                         </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ReadingControls;
