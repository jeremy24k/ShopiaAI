import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/AuthStore';
import { useThemeStore } from '../../store/ThemeStore';
import { useLanguageStore } from '../../store/LanguageStore';
import { useTranslation } from '../../hooks/useTranslation';
import { Sun, Moon, Languages, LogIn } from 'lucide-react';
import LogoApp from '../../assets/LogoApp';
import styles from '../../styles/LandingHero.module.css';

function LandingHero() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const theme = useThemeStore(state => state.theme);
  const toggleTheme = useThemeStore(state => state.toggleTheme);
  const language = useLanguageStore(state => state.language);
  const toggleLanguage = useLanguageStore(state => state.toggleLanguage);

  const handleCTA = () => {
    if (user) {
      navigate('/home');
    } else {
      navigate('/login');
    }
  };

  return (
    <section className={styles.hero}>
      {/* Header con Logo y Toggles */}
      <header className={styles.hero_header}>
        <div className={styles.logo_container}>
          <LogoApp />
        </div>

        <div className={styles.toggles_container}>
          {/* Login Button */}
          <button 
            onClick={() => navigate('/login')}
            className={styles.login_button}
          >
            <LogIn size={20} />
            {t('landing_header_login')}
          </button>
          
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className={styles.toggle_button}
            aria-label={theme === 'light' ? t('dark_mode') : t('light_mode')}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {/* Language Toggle */}
          <button 
            onClick={toggleLanguage}
            className={styles.toggle_button}
            aria-label={t('language')}
          >
            <Languages size={20} />
            <span className={styles.lang_text}>
              {language.toUpperCase()}
            </span>
          </button>
        </div>
      </header>
      
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
