import { useTranslation } from '../../hooks/useTranslation';

function ReadingStats() {
    const { t } = useTranslation();
    
    return (
        <div>
            <h2>{t('reading_stats')}</h2>
        </div>
    );
}

export default ReadingStats;