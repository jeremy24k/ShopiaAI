import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/AuthStore';
import { useThemeStore } from '../../store/ThemeStore';
import { useLanguageStore } from '../../store/LanguageStore';
import { useTranslation } from '../../hooks/useTranslation';
import { Sun, Moon, Languages, LogIn, LayoutDashboard } from 'lucide-react';
import LogoApp from '../../assets/LogoApp';
import styles from '../../styles/LandingHero.module.css';

function LandingNavbar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useThemeStore(state => state.theme);
  const toggleTheme = useThemeStore(state => state.toggleTheme);
  const language = useLanguageStore(state => state.language);
  const toggleLanguage = useLanguageStore(state => state.toggleLanguage);
  const user = useAuthStore(state => state.user);

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className={styles.hero_header}>
      <div className={styles.logo_container}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
          <LogoApp />
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className={styles.nav_links}>
        <button onClick={() => scrollToSection('features')} className={styles.nav_link}>
          {t('landing_nav_features')}
        </button>
        <button onClick={() => scrollToSection('how-it-works')} className={styles.nav_link}>
          {t('landing_nav_how')}
        </button>
        <button onClick={() => scrollToSection('pricing')} className={styles.nav_link}>
          {t('landing_nav_pricing')}
        </button>
        <button onClick={() => scrollToSection('contact')} className={styles.nav_link}>
          {t('landing_nav_contact')}
        </button>
      </nav>

      <div className={styles.toggles_container}>
        {/* Login Button */}
        <button
          onClick={() => navigate(user ? '/home' : '/login')}
          className={styles.login_button}
        >
          {user ? <LayoutDashboard size={20} /> : <LogIn size={20} />}
          {user ? t('landing_cta_secondary') : t('landing_header_login')}
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
  );
}

export default LandingNavbar;
