import { 
    User, 
    History,
    BookOpen, 
    Settings,
    FileText,
    HelpCircle,
    BookMarked,
} from "lucide-react";
import IconButton from "../../components/ui/IconButton";
import Icon from "../../components/ui/Icon";
import CreditsDisplay from "./CreditsDisplay";
import DailyBonusButton from "./DailyBonusButton";
import styles from '../../styles/AI.module.css';

function AIHeader({
    t,
    verseToExplain,
    getVerseRange,
    getVerseCompactLabel,
    setShowContextModal,
    openHistorialSidebar,
    setShowModeModal,
    setShowCreditStore,
    setShowHelpModal,
    user,
    modeId,
    doctrineId,
    getModeName,
    getDoctrineName
}) {
    return (
        <header className={styles.header}>
            {/* LEFT: Título + badges de modo */}
            <div className={styles.headerLeft}>
                <h1 className={styles.headerTitle}>{t('ai_title')}</h1>

                <div className={styles.modeBadges}>
                    <span
                        className={styles.modeBadge}
                        onClick={() => setShowModeModal(true)}
                        title={t('ai_config')}
                    >
                        <Icon icon={<User />} size="tiny" />
                        {getModeName(modeId)}
                    </span>
                    <span
                        className={styles.modeBadge}
                        onClick={() => setShowModeModal(true)}
                        title={t('ai_config')}
                    >
                        <Icon icon={<BookOpen />} size="tiny" />
                        {getDoctrineName(doctrineId)}
                    </span>

                    {/* Verse context badge — compact label, full ref in tooltip */}
                    {verseToExplain && verseToExplain.length > 0 && (
                        <span
                            className={`${styles.modeBadge} ${styles.verseBadge}`}
                            onClick={() => setShowContextModal(true)}
                            title={getVerseRange(verseToExplain)}
                        >
                            <Icon icon={<BookMarked />} size="tiny" />
                            {getVerseCompactLabel(verseToExplain)}
                        </span>
                    )}
                </div>
            </div>

            {/* RIGHT: Créditos + botones de acción */}
            <div className={styles.headerRight}>
                {user && (
                    <>
                        <DailyBonusButton />
                        <CreditsDisplay onClick={() => setShowCreditStore(true)} />
                    </>
                )}

                <div className={styles.headerDivider} />

                <IconButton
                    onClick={() => openHistorialSidebar(true)}
                    icon={History}
                    variant="ghost"
                    size="medium"
                    iconSize="medium"
                    circle={true}
                    title={t('ai_historial')}
                />

                <IconButton
                    onClick={() => setShowContextModal(true)}
                    icon={FileText}
                    variant="ghost"
                    size="medium"
                    iconSize="medium"
                    circle={true}
                    title={t('ai_context')}
                />

                <IconButton
                    onClick={() => setShowModeModal(true)}
                    icon={Settings}
                    variant="ghost"
                    size="medium"
                    iconSize="medium"
                    circle={true}
                    title={t('ai_config')}
                />

                <IconButton
                    onClick={() => setShowHelpModal(true)}
                    icon={HelpCircle}
                    variant="ghost"
                    size="medium"
                    iconSize="medium"
                    circle={true}
                    title={t('ai_help') || 'Help'}
                />
            </div>
        </header>
    );
}

export default AIHeader;
