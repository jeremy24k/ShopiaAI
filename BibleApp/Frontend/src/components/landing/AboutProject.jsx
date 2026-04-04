import { useTranslation } from '../../hooks/useTranslation';
import { Heart, ArrowDown } from 'lucide-react';
import styles from '../../styles/AboutProject.module.css';

import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/AuthStore';

function AboutProject() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);

  const handleCTA = () => {
    if (user) {
      navigate('/home');
    } else {
      navigate('/ai?ref=landing');
    }
  };

  return (
    <section className={styles.about}>
      <div className={styles.about_container}>
        <div className={styles.about_icon}>
          <Heart size={48} />
        </div>

        <h2 className={styles.about_title}>
          {t('landing_about_title')}
        </h2>

        <div className={styles.about_content}>
          <p className={styles.about_text}>
            {t('landing_about_text1')}
          </p>
          <p className={styles.about_text}>
            {t('landing_about_text2')}
          </p>
          <p className={styles.about_text}>
            {t('landing_about_text3')}
          </p>
        </div>

        <button 
          onClick={handleCTA}
          className={styles.about_cta}
        >
          {user ? t('landing_cta_secondary') : t('landing_cta_try_demo', t('landing_cta_start_free'))}
        </button>
      </div>
    </section>
  );
}

export default AboutProject;
