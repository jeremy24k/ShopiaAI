import { useTranslation } from '../../hooks/useTranslation';
import { AlertCircle, MessageSquare } from 'lucide-react';
import styles from '../../styles/BetaNotice.module.css';

function BetaNotice() {
  const { t } = useTranslation();

  const handleFeedback = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className={styles.beta_notice}>
      <div className={styles.beta_container}>
        <div className={styles.beta_icon}>
          <AlertCircle size={32} />
        </div>
        
        <div className={styles.beta_content}>
          <h2 className={styles.beta_title}>
            {t('landing_beta_notice_title')}
          </h2>
          <p className={styles.beta_description}>
            {t('landing_beta_notice_desc')}
          </p>
        </div>

        <button 
          onClick={handleFeedback}
          className={styles.beta_button}
        >
          <MessageSquare size={20} />
          {t('landing_beta_notice_feedback')}
        </button>
      </div>
    </section>
  );
}

export default BetaNotice;
