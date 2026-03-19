import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/AuthStore';
import { useTranslation } from '../../hooks/useTranslation';
import LandingNavbar from './LandingNavbar';
import styles from '../../styles/LandingHero.module.css';

function LandingHero() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);

  const handleCTA = () => {
    if (user) {
      navigate('/home');
    } else {
      navigate('/login');
    }
  };

  return (
    <section className={styles.hero}>
      {/* Navbar reutilizable */}
      <LandingNavbar />
      
      {/* Contenido principal del hero */}
      <div className={styles.hero_content}>


        <div className={styles.beta_badge}>
          <span className={styles.beta_text}>{t('landing_beta_badge')}</span>
          <span className={styles.beta_subtitle}>{t('landing_beta_subtitle')}</span>
        </div>

        <h1 className={styles.hero_title}>
          {t('landing_hero_title')}
        </h1>

        <p className={styles.hero_subtitle}>
          {t('landing_hero_subtitle')}
        </p>

        <div className={styles.cta_container}>
          <button 
            onClick={handleCTA}
            className={styles.cta_primary}
          >
            {user ? t('landing_cta_secondary') : t('landing_cta_primary')}
          </button>
        </div>

        <div className={styles.trust_indicators}>
          <span className={styles.trust_item}>✓ {t('landing_trust_credits')}</span>
          <span className={styles.trust_separator}>•</span>
          <span className={styles.trust_item}>✓ {t('landing_trust_no_card')}</span>
          <span className={styles.trust_separator}>•</span>
          <span className={styles.trust_item}>✓ {t('landing_trust_translations')}</span>
        </div>
      </div>
    </section>
  );
}

export default LandingHero;
