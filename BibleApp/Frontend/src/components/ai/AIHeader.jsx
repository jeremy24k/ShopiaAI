import { useState } from "react";
import { 
    User, 
    History,
    BookOpen, 
    Settings,
    FileText,
    HelpCircle,
    BookMarked,
    MoreVertical,
} from "lucide-react";
import IconButton from "../../components/ui/IconButton";
import Icon from "../../components/ui/Icon";
import MobileSheet from "../../components/ui/MobileSheet";
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
    const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

    const closeSheetAnd = (fn) => {
        setMobileSheetOpen(false);
        fn();
    };

    return (
        <>
            <header className={styles.header}>
                {/* LEFT: Título + badges (desktop only) */}
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

                {/* RIGHT — DESKTOP: DailyBonus + Credits + divider + 4 icon buttons */}
                <div className={`${styles.headerRight} ${styles.headerRightDesktop}`}>
                    {user && (
                        <>
                            <DailyBonusButton />
                            <CreditsDisplay onClick={() => setShowCreditStore(true)} />
                        </>
                    )}
                    <div className={styles.headerDivider} />
                    <IconButton onClick={() => openHistorialSidebar(true)} icon={History} variant="ghost" size="medium" iconSize="medium" circle title={t('ai_historial')} />
                    <IconButton onClick={() => setShowContextModal(true)} icon={FileText} variant="ghost" size="medium" iconSize="medium" circle title={t('ai_context')} />
                    <IconButton onClick={() => setShowModeModal(true)} icon={Settings} variant="ghost" size="medium" iconSize="medium" circle title={t('ai_config')} />
                    <IconButton onClick={() => setShowHelpModal(true)} icon={HelpCircle} variant="ghost" size="medium" iconSize="medium" circle title={t('ai_help') || 'Help'} />
                </div>

                {/* RIGHT — MOBILE: Credits + History + ⋯ button */}
                <div className={`${styles.headerRight} ${styles.headerRightMobile}`}>
                    {user && (
                        <CreditsDisplay onClick={() => setShowCreditStore(true)} />
                    )}
                    <IconButton
                        onClick={() => openHistorialSidebar(true)}
                        icon={History}
                        variant="ghost"
                        size="medium"
                        iconSize="medium"
                        circle
                        title={t('ai_historial')}
                    />
                    <button
                        className={styles.moreButton}
                        onClick={() => setMobileSheetOpen(true)}
                        aria-label="More options"
                        aria-expanded={mobileSheetOpen}
                    >
                        <MoreVertical size={20} />
                    </button>
                </div>
            </header>

            {/* Mobile-only badge strip below the header bar */}
            <div className={styles.mobileHeaderBadgeStrip}>
                <span className={styles.modeBadge} onClick={() => setShowModeModal(true)} title={t('ai_config')}>
                    <Icon icon={<User />} size="tiny" />
                    {getModeName(modeId)}
                </span>
                <span className={styles.modeBadge} onClick={() => setShowModeModal(true)} title={t('ai_config')}>
                    <Icon icon={<BookOpen />} size="tiny" />
                    {getDoctrineName(doctrineId)}
                </span>
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

            {/* ── Mobile actions sheet ── */}
            <MobileSheet
                isOpen={mobileSheetOpen}
                onClose={() => setMobileSheetOpen(false)}
                title={t('ai_title')}
                maxHeight="70vh"
            >
                {/* Daily Bonus */}
                {user && (
                    <div className={styles.sheetDailyBonus}>
                        <DailyBonusButton />
                    </div>
                )}

                {/* Divider */}
                <div className={styles.sheetDivider} />

                {/* Credits shortcut */}
                {user && (
                    <button
                        className={styles.sheetItem}
                        onClick={() => closeSheetAnd(() => setShowCreditStore(true))}
                    >
                        <CreditsDisplay onClick={null} />
                        <span className={styles.sheetItemChevron}>›</span>
                    </button>
                )}

                <div className={styles.sheetDivider} />

                {/* Action items */}
                <button className={styles.sheetItem} onClick={() => closeSheetAnd(() => setShowContextModal(true))}>
                    <FileText size={18} className={styles.sheetItemIcon} />
                    <span className={styles.sheetItemLabel}>{t('ai_context')}</span>
                    {verseToExplain && verseToExplain.length > 0 && (
                        <span className={styles.sheetItemBadge}>{verseToExplain.length}</span>
                    )}
                </button>

                <button className={styles.sheetItem} onClick={() => closeSheetAnd(() => setShowModeModal(true))}>
                    <Settings size={18} className={styles.sheetItemIcon} />
                    <span className={styles.sheetItemLabel}>{t('ai_config')}</span>
                    {/* Current mode summary */}
                    <span className={styles.sheetItemSub}>{getModeName(modeId)}</span>
                </button>

                <button className={styles.sheetItem} onClick={() => closeSheetAnd(() => setShowHelpModal(true))}>
                    <HelpCircle size={18} className={styles.sheetItemIcon} />
                    <span className={styles.sheetItemLabel}>{t('ai_help') || 'Help'}</span>
                </button>
            </MobileSheet>
        </>
    );
}

export default AIHeader;
