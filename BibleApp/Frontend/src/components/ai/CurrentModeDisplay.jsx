import Icon from '../ui/Icon';
import { Settings, Info } from 'lucide-react';
import styles from '../../styles/AI.module.css';
import LucideIcon from '../ui/LucideIcon';

function CurrentModeDisplay({ currentMode, currentDoctrine, availableModes, availablePerspectives, onOpenModal }) {
    // Obtener modo y doctrina actuales
    const getCurrentMode = () => {
        return availableModes.find(mode => mode.id === currentMode) || availableModes[0];
    };

    const getCurrentDoctrine = () => {
        return availablePerspectives.find(p => p.id === currentDoctrine) || availablePerspectives[0];
    };

    const currentModeObj = getCurrentMode();
    const currentDoctrineObj = getCurrentDoctrine();

    if (!currentModeObj || !currentDoctrineObj) {
        return null;
    }

    return (
        <div className={styles.currentModeDisplay}>
            <div className={styles.currentModeHeader}>
                <div className={styles.currentModeTitle}>
                    <Icon icon={<Settings />} size="small" />
                    <span>Configuración IA</span>
                </div>
                <button 
                    className={styles.configButton}
                    onClick={onOpenModal}
                    title="Configurar IA"
                >
                    <Icon icon={<Settings />} size="small" />
                </button>
            </div>

            <div className={styles.currentModeContent}>
                <div className={styles.currentModeItem}>
                    <div className={styles.currentModeIcon}>
                        <LucideIcon name={currentModeObj?.icon} size={20} color="#374151" />
                    </div>
                    <div className={styles.currentModeInfo}>
                        <span className={styles.currentModeName}>{currentModeObj.name}</span>
                        <span className={styles.currentModeDescription}>{currentDoctrineObj.name}</span>
                    </div>
                </div>
            </div>

            <div className={styles.currentModeFooter}>
                <div className={styles.combinationMini}>
                    <Icon icon={<Info />} size="small" />
                    <span>{currentModeObj?.characteristics?.tone?.split(',')[0]?.trim()}</span>
                </div>
            </div>
        </div>
    );
}

export default CurrentModeDisplay;
