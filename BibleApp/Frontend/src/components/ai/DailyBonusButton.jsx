import { useState } from 'react';
import { useTranslation } from "../../hooks/useTranslation";
import { useCredits } from '../../store/useCredits';
import styles from '../../styles/DailyBonusButton.module.css';
import Icon from '../ui/Icon';
import { Gift } from 'lucide-react';

function DailyBonusButton() {
  const { t } = useTranslation();
  const { claimDailyCredits, loading } = useCredits();
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState({ visible: false, success: false });

  const handleClaim = async () => {
    const result = await claimDailyCredits();
    
    setMessage(result.message);
    // Usamos el flag success que viene del backend/store para el estilo
    setShowMessage({ visible: true, success: result.success });

    setTimeout(() => {
      setShowMessage({ visible: false, success: false });
    }, 4000);
  };

  return (
    <div className={styles.container}>
      <button 
        onClick={handleClaim} 
        disabled={loading}
        className={styles.dailyButton}
      >
        {loading ?
          '⏳ Reclamando...' : (
            <>
              <Icon icon={<Gift />} size="tiny" color="primary"/> 
              <p>{t('claim_daily_credits')}</p>
            </>
          )
        }
      </button>
      
      {showMessage.visible && (
        <div className={`${styles.message} ${showMessage.success ? styles.success : styles.error}`}>
          {message}
        </div>
      )}
    </div>
  );
}

export default DailyBonusButton;