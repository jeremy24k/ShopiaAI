import { useState } from 'react';
import { useCredits } from '../../store/useCredits';
import styles from '../../styles/DailyBonusButton.module.css';

function DailyBonusButton() {
  const { claimDailyCredits, loading } = useCredits();
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);

  const handleClaim = async () => {
    const result = await claimDailyCredits();
    
    setMessage(result.message);
    setShowMessage(true);

    setTimeout(() => {
      setShowMessage(false);
    }, 3000);
  };

  return (
    <div className={styles.container}>
      <button 
        onClick={handleClaim} 
        disabled={loading}
        className={styles.dailyButton}
      >
        {loading ? '⏳ Reclamando...' : '🎁 Reclamar Créditos Diarios'}
      </button>
      
      {showMessage && (
        <div className={`${styles.message} ${message.includes('éxito') ? styles.success : styles.error}`}>
          {message}
        </div>
      )}
    </div>
  );
}

export default DailyBonusButton;