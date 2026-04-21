import { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/AuthStore';
import { Sparkles, BookOpen, MessageCircle } from 'lucide-react';
import styles from '../../styles/MultiplePerspectives.module.css';

function MultiplePerspectives() {
  const { t, language } = useTranslation();
  const [activeTradition, setActiveTradition] = useState('evangelical');
  const [activeQuestion, setActiveQuestion] = useState('eucharist');
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);

  const handleCTA = () => {
    if (user) {
      navigate('/ai?ref=landing');
    } else {
      navigate('/ai?ref=landing');
    }
  };

  const questionMap = {
    eucharist: {
      prompt: t('question_eucharist'),
      catholic: t('landing_interactive_catholic_text'),
      evangelical: t('landing_interactive_evangelical_text'),
    },
    salvation: {
      prompt: t('question_salvation'),
      catholic: t('landing_interactive_catholic_salvation_text'),
      evangelical: t('landing_interactive_evangelical_salvation_text'),
    },
  };

  const currentScenario = questionMap[activeQuestion];
  const currentText = currentScenario[activeTradition];

  const handleTraditionChange = (tab) => {
    setActiveTradition(tab);
    setIsExpanded(false);
  };

  const handleQuestionChange = (question) => {
    setActiveQuestion(question);
    setIsExpanded(false);
  };

  const paragraphs = currentText.split('\n\n');
  const readMoreText = language === 'en' ? 'Read more' : 'Leer más';
  const readLessText = language === 'en' ? 'Read less' : 'Leer menos';

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.real_case_badge}>{t('landing_interactive_real_case')}</span>
          <h2 className={styles.title}>
            {t('landing_interactive_title')}
          </h2>
          <p className={styles.subtitle}>
            {t('landing_interactive_subtitle')}
          </p>
        </div>

        <div className={styles.question_selector}>
          <button
            className={`${styles.question_button} ${activeQuestion === 'eucharist' ? styles.question_button_active : ''}`}
            onClick={() => handleQuestionChange('eucharist')}
          >
            {t('question_eucharist')}
          </button>
          <button
            className={`${styles.question_button} ${activeQuestion === 'salvation' ? styles.question_button_active : ''}`}
            onClick={() => handleQuestionChange('salvation')}
          >
            {t('question_salvation')}
          </button>
        </div>

        <div className={styles.interactive_box}>
          <div className={styles.tabs_container}>
            <button 
              className={`${styles.tab_button} ${activeTradition === 'evangelical' ? styles.tab_active_evangelical : ''}`}
              onClick={() => handleTraditionChange('evangelical')}
            >
              <BookOpen size={18} />
              {t('landing_interactive_btn_evangelical')}
            </button>
            <button 
              className={`${styles.tab_button} ${activeTradition === 'catholic' ? styles.tab_active_catholic : ''}`}
              onClick={() => handleTraditionChange('catholic')}
            >
              <Sparkles size={18} />
              {t('landing_interactive_btn_catholic')}
            </button>
          </div>
          
          <div key={`${activeQuestion}-${activeTradition}`} className={styles.content_area}>
            <div className={styles.user_prompt}>
              <MessageCircle size={18} />
              {currentScenario.prompt}
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
