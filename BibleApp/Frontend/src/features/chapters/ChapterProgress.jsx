import styles from "../../styles/ChapterContent.module.css";
import { CircleCheckBig, Trophy, Check, User } from "lucide-react";
import Icon from "../../components/ui/Icon";
import { Link } from "react-router-dom";

function ChapterProgress({
    isCompleted,
    isTrackingLoading,
    user,
    authLoading,
    onCompleteChapter,
    onUncompleteChapter,
    t
}) {
    return (
        <div className={styles.ctn_progress}>
            {isCompleted ? (
                <>
                    <Icon icon={<CircleCheckBig />} size="large" color="green" />
                    <div className={styles.ctn_progress_text}>
                        <p>{t('chapter_completed')}</p>
                        <p>{t('chapter_completed_success')}</p>
                    </div>
                    <button onClick={onUncompleteChapter} disabled={isTrackingLoading} className={styles.uncomplete_btn}>
                        {isTrackingLoading ? t('updating') : t('mark_as_unread')}
                    </button>
                </>
            ) : (
                <>
                    <Icon icon={<Trophy />} size="large" color="primary" />
                    {user ? (
                        <>
                            <div className={styles.ctn_progress_text}>
                                <p>{t('finished_reading')}</p>
                                <p>{t('track_progress')}</p>
                            </div>
                            <button onClick={onCompleteChapter} disabled={isTrackingLoading}>
                                <Icon icon={<Check />} size="small" color="white" />
                                {isTrackingLoading ? t('saving') : t('mark_as_complete')}
                            </button>
                        </>
                    ) : (
                        <>
                            <div className={styles.ctn_progress_text}>
                                <p>{t('login_register_progress')}</p>
                                <p>{t('login_register_complete')}</p>
                            </div>
                            <Link to="/login" disabled={authLoading}>
                                <Icon icon={<User />} size="small" color="white" />
                                {authLoading && t('logging_in') || t('login')}
                            </Link>
                        </>
                    )}
                </>
            )}
        </div>
    );
}

export default ChapterProgress;
