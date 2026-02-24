// ========================================
// IMPORTS
// ========================================
import { 
    User, 
    X,
    History,
    BookOpen, 
    Settings,
    FileText,
} from "lucide-react";
import IconButton from "../../components/ui/IconButton";
import Icon from "../../components/ui/Icon";
import CreditsDisplay from "./CreditsDisplay";
import DailyBonusButton from "./DailyBonusButton";
import styles from '../../pages/AI.module.css';

// ========================================
// AI HEADER COMPONENT
// ========================================
function AIHeader({
    t,
    verseToExplain,
    getVerseRange,
    setShowContextModal,
    openHistorialSidebar,
    setShowModeModal,
    setShowCreditStore,
    user,
    modeId,
    doctrineId,
    getModeName,
    getDoctrineName
}) {
    return (
        <header className={styles.header}>
            <div className={styles.headerLeft}>
                <div className={styles.headerTitle}>
                    <h1>{t('ai_title')}</h1>
                    <p>{t('ai_subtitle')}</p>
                    
                    {/* Verse Citation */}
                    {verseToExplain && verseToExplain.length > 0 && (
                        <div className={styles.verseCitation}>
                            <span className={styles.citationLabel}>{t('ai_current_verse')}:</span>
                            <span 
                                className={styles.citationText}
                                onClick={() => setShowContextModal(true)}
                            >{getVerseRange()}</span>
                        </div>
                    )}
                </div>
                
                <div className={styles.headerConfig}>
                    <div className={styles.headerConfigButtons}>
                        <IconButton 
                            onClick={() => openHistorialSidebar(true)}
                            icon={History}
                            variant="primary"
                            size="medium"
                            iconSize="medium"
                            circle={true}
                            title={t('ai_historial')}
                        />
                        
                        <IconButton 
                            onClick={() => setShowContextModal(true)}
                            icon={FileText}
                            variant="primary"
                            size="medium"
                            iconSize="medium"
                            circle={true}
                            title={t('ai_context')}
                        />
                        
                        <IconButton 
                            onClick={() => setShowModeModal(true)}
                            icon={Settings}
                            variant="primary"
                            size="medium"
                            iconSize="medium"
                            circle={true}
                            title={t('ai_config')}
                        />
                        
                        {user && (
                            <>
                                <DailyBonusButton />
                                <CreditsDisplay onClick={() => setShowCreditStore(true)} />
                            </>
                        )}
                    </div>
                    
                    <div className={styles.headerMode}>
                        <div className={styles.modeBadges}>
                            <p>{t('ai_mode')}</p>
                            <span className={styles.modeBadge}>
                                <Icon icon={<User />} size="tiny" />
                                {getModeName(modeId)}
                            </span>
                            <span className={styles.modeBadge}>
                                <Icon icon={<BookOpen />} size="tiny" />
                                {getDoctrineName(doctrineId)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default AIHeader;
