import { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/AuthStore';
import { Sparkles, BookOpen, MessageCircle } from 'lucide-react';
import styles from '../../styles/MultiplePerspectives.module.css';

function MultiplePerspectives() {
  const { t, language } = useTranslation();
  const [activeTab, setActiveTab] = useState('evangelical');
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);

  const handleCTA = () => {
    if (user) {
      navigate('/home');
    } else {
      navigate('/ai?ref=landing');
    }
  };

  const currentText = activeTab === 'catholic' 
    ? t('landing_interactive_catholic_text') 
    : t('landing_interactive_evangelical_text');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setIsExpanded(false);
  };

  const paragraphs = currentText.split('\n\n');
  const readMoreText = language === 'en' ? 'Read more' : 'Leer más';
  const readLessText = language === 'en' ? 'Read less' : 'Leer menos';

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
              onClick={() => handleTabChange('evangelical')}
            >
              <BookOpen size={18} />
              {t('landing_interactive_btn_evangelical')}
            </button>
            <button 
              className={`${styles.tab_button} ${activeTab === 'catholic' ? styles.tab_active_catholic : ''}`}
              onClick={() => handleTabChange('catholic')}
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
              {paragraphs.slice(0, isExpanded ? undefined : 2).map((paragraph, idx) => (
                <p key={idx} className={styles.paragraph}>{paragraph}</p>
              ))}
              
              {paragraphs.length > 2 && (
                <button 
                  className={styles.read_more_btn}
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? readLessText : readMoreText}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className={styles.cta_container}>
          <button 
            onClick={handleCTA}
            className={styles.cta_primary}
          >
            {user ? t('landing_cta_secondary') : t('landing_cta_try_demo', t('landing_cta_start_free'))}
          </button>
        </div>
      </div>
    </section>
  );
}

export default MultiplePerspectives;
