import styles from '../../styles/InsufficientCreditsModal.module.css';
import { useTranslation } from '../../hooks/useTranslation';
import Icon from '../ui/Icon';
import { AlertTriangle, Gem } from 'lucide-react';

function InsufficientCreditsModal({ onClose, onBuyCredits, currentCredits, required }) {
  const { t } = useTranslation();

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.icon}>
          <Icon icon={<AlertTriangle />} size="medium" color="red" />
        </div>
        <h2>{t('insufficient_credits_title')}</h2>
        <p>
          {t('insufficient_credits_need')} <strong>{required}</strong> {t('insufficient_credits_for_action')}
          <br />
          {t('insufficient_credits_current')} <strong>{currentCredits}</strong> {t('credits_label')}
        </p>
        <div className={styles.actions}>
          <button className={styles.buyButton} onClick={onBuyCredits}>
            <Icon icon={<Gem />} size="tiny" color="white" />
            <span>{t('ai_buy_credits')}</span>
          </button>
          <button className={styles.cancelButton} onClick={onClose}>
            {t('insufficient_credits_cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default InsufficientCreditsModal;