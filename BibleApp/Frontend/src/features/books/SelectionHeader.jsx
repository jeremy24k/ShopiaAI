import { X, Brain } from "lucide-react";
import styles from "../../styles/VerseContent.module.css";
import Icon from "../../components/ui/Icon";

function SelectionHeader({ selectionMode, selectedVerses, totalVerses, selectAllVerses, clearSelection, explainSelectedVerses, isSelectionAlreadyInContext, onCancel, t }) {
    if (selectionMode !== 'multiple') return null;

    const allSelected = selectedVerses.length === totalVerses && totalVerses > 0;
    const hasSelection = selectedVerses.length > 0;
    const isDisabled = !hasSelection || isSelectionAlreadyInContext;

    function handleToggleAll() {
        if (allSelected) {
            clearSelection();
        } else {
            selectAllVerses();
        }
    }

    return (
        <div className={styles.selection_header}>
            <div className={styles.multiple_controls}>
                <div className={styles.selection_info}>
                    <label className={styles.select_all_switch}>
                        <input 
                            type="checkbox" 
                            checked={allSelected}
                            onChange={handleToggleAll}
                        />
                        <span className={styles.switch_slider}></span>
                    </label>
                    <span>{t('select_all')}</span>
                    <span>|</span>
                    <span className={styles.selection_count}>
                        {selectedVerses.length} {t('selected_count')}
                    </span>
                </div>
                
                <div className={styles.selection_actions}>
                    <button 
                        type="button"
                        onClick={explainSelectedVerses} 
                        className={`${styles.explain_btn} ${isDisabled ? styles.disabled : ''}`}
                        disabled={isDisabled}
                    >
                        <Icon 
                            icon={<Brain />} 
                            size="small" 
                            color={isSelectionAlreadyInContext ? 'grey' : 'var(--primary-color)'} 
                        />
                        <span>{isSelectionAlreadyInContext ? t('already_in_ai_context') : t('explain')}</span>
                    </button>
                    <button 
                        type="button"
                        onClick={() => {
                            if (onCancel) onCancel();
                        }} 
                        className={styles.cancel_btn}
                        aria-label={t('cancel_selection')}
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SelectionHeader;
