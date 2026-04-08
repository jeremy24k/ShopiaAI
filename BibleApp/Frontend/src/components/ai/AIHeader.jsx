import { useState } from "react";
import { Link } from "react-router-dom";
import { 
    User, 
    History,
    BookOpen, 
    Settings,
    FileText,
    HelpCircle,
    BookMarked,
    MoreVertical,
    Sparkles,
    LogIn,
    Lock,
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
    getDoctrineName,
    demoQuestionsUsed,
    demoQuestionLimit,
    onDemoLock
}) {
    const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

    const closeSheetAnd = (fn) => {
        setMobileSheetOpen(false);
        fn();
    };

    const handleBadgeClick = (action) => {
        if (user) {
            action();
        } else {
            onDemoLock?.();
        }
    };

    return (
        <>
            <header className={styles.header}>
                {/* LEFT: Título + badges (desktop only) */}
                <div className={styles.headerLeft}>
                    <h1 className={styles.headerTitle}>{t('ai_title')}</h1>

                    <div className={styles.modeBadges}>
                        <span
                            className={`${styles.modeBadge} ${!user ? styles.lockedBadge : ''}`}
                            onClick={() => handleBadgeClick(() => setShowModeModal(true))}
                            title={user ? t('ai_config') : t('demo_lock_hint', 'Regístrate para personalizar')}
                        >
                            <Icon icon={<User />} size="tiny" />
                            {getModeName(modeId)}
                            {!user && <Lock size={10} className={styles.lockIcon} />}
                        </span>
                        <span
                            className={`${styles.modeBadge} ${!user ? styles.lockedBadge : ''}`}
                            onClick={() => handleBadgeClick(() => setShowModeModal(true))}
                            title={user ? t('ai_config') : t('demo_lock_hint', 'Regístrate para personalizar')}
                        >
                            <Icon icon={<BookOpen />} size="tiny" />
                            {getDoctrineName(doctrineId)}
                            {!user && <Lock size={10} className={styles.lockIcon} />}
                        </span>
                        {!user && (
                            <span
                                className={`${styles.modeBadge} ${styles.lockedBadge}`}
                                onClick={() => handleBadgeClick(() => setShowContextModal(true))}
                            >
                                <Icon icon={<BookMarked />} size="tiny" />
                                {t('ai_context')}
                                <Lock size={10} className={styles.lockIcon} />
                            </span>
                        )}
                        {user && verseToExplain && verseToExplain.length > 0 && (
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

                {/* RIGHT — DESKTOP: full toolbar (logged in) OR demo badge (guest) */}
                <div className={`${styles.headerRight} ${styles.headerRightDesktop}`}>
                    {user ? (
                        <>
                            <DailyBonusButton />
                            <CreditsDisplay onClick={() => setShowCreditStore(true)} />
                            <div className={styles.headerDivider} />
                            <IconButton onClick={() => openHistorialSidebar(true)} icon={History} variant="ghost" size="medium" iconSize="medium" circle title={t('ai_historial')} />
                            <IconButton onClick={() => setShowContextModal(true)} icon={FileText} variant="ghost" size="medium" iconSize="medium" circle title={t('ai_context')} />
                            <IconButton onClick={() => setShowModeModal(true)} icon={Settings} variant="ghost" size="medium" iconSize="medium" circle title={t('ai_config')} />
                            <IconButton onClick={() => setShowHelpModal(true)} icon={HelpCircle} variant="ghost" size="medium" iconSize="medium" circle title={t('ai_help') || 'Help'} />
                        </>
                    ) : (
                        <>
                            <span className={styles.demoBadge}>
                                <Sparkles size={14} />
                                Demo {demoQuestionsUsed}/{demoQuestionLimit}
                            </span>
                            <Link to="/login" className={styles.demoLoginLink}>
                                <LogIn size={16} />
                                Login
                            </Link>
                        </>
                    )}
                </div>

                {/* RIGHT — MOBILE: Credits + History + ⋯ button (logged in) OR demo badge (guest) */}
                <div className={`${styles.headerRight} ${styles.headerRightMobile}`}>
                    {user ? (
                        <>
                            <CreditsDisplay onClick={() => setShowCreditStore(true)} />
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
                        </>
                    ) : (
                        <>
                            <span className={styles.demoBadge}>
                                <Sparkles size={14} />
                                Demo {demoQuestionsUsed}/{demoQuestionLimit}
                            </span>
                            <Link to="/login" className={styles.demoLoginLink}>
                                <LogIn size={16} />
                                Login
                            </Link>
                        </>
                    )}
                </div>
            </header>

            {/* Mobile-only badge strip below the header bar */}
            <div className={styles.mobileHeaderBadgeStrip}>
                <span
                    className={`${styles.modeBadge} ${!user ? styles.lockedBadge : ''}`}
                    onClick={() => handleBadgeClick(() => setShowModeModal(true))}
                >
                    <Icon icon={<User />} size="tiny" />
                    {getModeName(modeId)}
                    {!user && <Lock size={10} className={styles.lockIcon} />}
                </span>
                <span
                    className={`${styles.modeBadge} ${!user ? styles.lockedBadge : ''}`}
                    onClick={() => handleBadgeClick(() => setShowModeModal(true))}
                >
                    <Icon icon={<BookOpen />} size="tiny" />
                    {getDoctrineName(doctrineId)}
                    {!user && <Lock size={10} className={styles.lockIcon} />}
                </span>
                {!user && (
                    <span
                        className={`${styles.modeBadge} ${styles.lockedBadge}`}
                        onClick={() => handleBadgeClick(() => setShowContextModal(true))}
                    >
                        <Icon icon={<BookMarked />} size="tiny" />
                        {t('ai_context')}
                        <Lock size={10} className={styles.lockIcon} />
                    </span>
                )}
                {user && verseToExplain && verseToExplain.length > 0 && (
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
                <button className={styles.sheetItem} onClick={() => closeSheetAnd(() => handleBadgeClick(() => setShowContextModal(true)))}>
                    <FileText size={18} className={styles.sheetItemIcon} />
                    <span className={styles.sheetItemLabel}>{t('ai_context')}</span>
                    {user && verseToExplain && verseToExplain.length > 0 && (
                        <span className={styles.sheetItemBadge}>{verseToExplain.length}</span>
                    )}
                    {!user && <Lock size={14} className={styles.sheetItemLock} />}
                </button>

                <button className={styles.sheetItem} onClick={() => closeSheetAnd(() => handleBadgeClick(() => setShowModeModal(true)))}>
                    <Settings size={18} className={styles.sheetItemIcon} />
                    <span className={styles.sheetItemLabel}>{t('ai_config')}</span>
                    {!user && <Lock size={14} className={styles.sheetItemLock} />}
                    {/* Current mode summary */}
                    {user && <span className={styles.sheetItemSub}>{getModeName(modeId)}</span>}
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
