import { useCredits } from '../../store/useCredits';
import { useAuthStore } from '../../store/AuthStore';
import { useTranslation } from "../../hooks/useTranslation";
import styles from '../../styles/CreditsDisplay.module.css';
import Icon from '../ui/Icon';
import { Gem } from 'lucide-react';

function CreditsDisplay({ onClick }) {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { credits, tier, hasFetched } = useCredits();

  console.log('CreditsDisplay:', { credits, tier, hasFetched });

  if (!user) return null;
  
  // Mostrar loading mientras se cargan los créditos
  if (!hasFetched) {
    return (
      <div className={styles.creditsDisplay} onClick={onClick}>
        <div className={styles.creditsInfo}>
          <span className={styles.creditsAmount}>...</span>
          <span className={styles.creditsTier}>Loading...</span>
        </div>
        <div className={styles.creditsIcon}>
          <Icon icon={<Gem />} size="tiny" color="primary"/> 
        </div>
      </div>
    );
  }

  return (
    <div className={styles.creditsDisplay} onClick={onClick}>
      <div className={styles.creditsInfo}>
        <span className={styles.creditsAmount}>{credits}</span>
        <span className={styles.creditsTier}>{tier === 'FREE' ? t('free_plan') : t('premium_plan')}</span>
      </div>
      <div className={styles.creditsIcon}>
        <Icon icon={<Gem />} size="tiny" color="primary"/> 
      </div>
    </div>
  );
}

export default CreditsDisplay;