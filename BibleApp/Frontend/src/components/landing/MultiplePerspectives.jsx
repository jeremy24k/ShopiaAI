import { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/AuthStore';
import { Sparkles, BookOpen, MessageCircle } from 'lucide-react';
import styles from '../../styles/MultiplePerspectives.module.css';

function MultiplePerspectives() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('evangelical');
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);

  const handleCTA = () => {
    if (user) {
      navigate('/home');
    } else {
      navigate('/login');
    }
  };

  const currentText = activeTab === 'catholic' 
    ? t('landing_interactive_catholic_text') 
    : t('landing_interactive_evangelical_text');

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {t('landing_interactive_title')}
          </h2>
          <p className={styles.subtitle}>
            {t('landing_interactive_subtitle')}
          </p>
        </div>

        <div className={styles.interactive_box}>
          <div className={styles.tabs_container}>
            <button 
              className={`${styles.tab_button} ${activeTab === 'evangelical' ? styles.tab_active_evangelical : ''}`}
              onClick={() => setActiveTab('evangelical')}
            >
              <BookOpen size={18} />
              {t('landing_interactive_btn_evangelical')}
            </button>
            <button 
              className={`${styles.tab_button} ${activeTab === 'catholic' ? styles.tab_active_catholic : ''}`}
              onClick={() => setActiveTab('catholic')}
            >
              <Sparkles size={18} />
              {t('landing_interactive_btn_catholic')}
            </button>
          </div>
          
          <div key={activeTab} className={styles.content_area}>
            <div className={styles.user_prompt}>
              <MessageCircle size={18} />
              {t('question_eucharist')}
            </div>
            <div className={styles.ai_response}>
              {currentText.split('\n\n').map((paragraph, idx) => (
                <p key={idx} className={styles.paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.cta_container}>
          <button 
            onClick={handleCTA}
            className={styles.cta_primary}
          >
            {user ? t('landing_cta_secondary') : t('landing_cta_start_free')}
          </button>
        </div>
      </div>
    </section>
  );
}

export default MultiplePerspectives;
