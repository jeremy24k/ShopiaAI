import styles from "../../styles/ChapterContent.module.css";
import { CirclePlay, CirclePause, CircleX, AArrowUp, AArrowDown, ListChecks, ListTodo, Settings2, AudioLines } from "lucide-react";
import IconButton from "../../components/ui/IconButton";
import CustomSelect from "../../components/ui/CustomSelect";
import Icon from "../../components/ui/Icon";
import ReadingModal from "../../components/ui/ReadingModal";
import { useState } from "react";

function ReadingControls({
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
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            {/* Mobile FAB - Fixed button to open modal */}
            <button 
                className={styles.reading_fab}
                onClick={() => setIsModalOpen(true)}
                aria-label={t('reading_settings') || 'Reading Settings'}
            >
                <Icon icon={<Settings2 />} size="small" color="white" />
            </button>

            {/* Reading Modal for mobile */}
            <ReadingModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                isSpeaking={isSpeaking}
                startSpeaking={startSpeaking}
                pauseSpeaking={pauseSpeaking}
                stopSpeaking={stopSpeaking}
                currentPlayingIndex={currentPlayingIndex}
                availableVoices={availableVoices}
                selectedVoice={selectedVoice}
                setSelectedVoice={setSelectedVoice}
                fontSize={fontSize}
                increaseFontSize={increaseFontSize}
                decreaseFontSize={decreaseFontSize}
                translationOptions={translationOptions}
                selectedTranslation={selectedTranslation}
                onTranslationChange={onTranslationChange}
                selectionMode={selectionMode}
                setSelectionMode={setSelectionMode}
                clearSelection={clearSelection}
                t={t}
            />

            <div className={styles.verse_actions}>
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
                            <IconButton 
                                onClick={() => {
                                    if (selectionMode === 'multiple') {
                                        setSelectionMode('single');
                                        clearSelection();
                                    } else {
                                        setSelectionMode('multiple');
                                    }
                                }}
                                icon={selectionMode === 'multiple' ? ListChecks : ListTodo}
                                variant={selectionMode === 'multiple' ? 'primary' : 'ghost'}
                                size="medium"
                                iconSize="medium"
                                title={selectionMode === 'multiple' ? t('multiple_selection') : t('select_verses_for_ai')}
                            />
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default ReadingControls;
