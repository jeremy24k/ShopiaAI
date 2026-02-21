import { useCredits } from '../../store/useCredits';
import { useAuthStore } from '../../store/AuthStore';
import styles from '../../styles/CreditsDisplay.module.css';

function CreditsDisplay({ onClick }) {
  const { user } = useAuthStore();
  const { credits, tier } = useCredits();

  if (!user) return null;

  return (
    <div className={styles.creditsDisplay} onClick={onClick}>
      <div className={styles.creditsIcon}>💎</div>
      <div className={styles.creditsInfo}>
        <span className={styles.creditsAmount}>{credits}</span>
        <span className={styles.creditsTier}>{tier === 'FREE' ? 'Gratis' : 'Premium'}</span>
      </div>
    </div>
  );
}

export default CreditsDisplay;