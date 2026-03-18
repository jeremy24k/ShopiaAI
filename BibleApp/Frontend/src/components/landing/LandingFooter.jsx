import { useTranslation } from '../../hooks/useTranslation';
import LogoApp from '../../assets/LogoApp';
import styles from '../../styles/LandingFooter.module.css';

function LandingFooter() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.footer_container}>
        <div className={styles.footer_grid}>
          {/* Logo and Description */}
          <div className={styles.footer_brand}>
            <LogoApp />
            <p className={styles.brand_description}>
              {t('landing_hero_subtitle')}
            </p>
          </div>

          {/* Product Links */}
          <div className={styles.footer_column}>
            <h3 className={styles.column_title}>
              {t('landing_footer_product')}
            </h3>
            <ul className={styles.footer_links}>
              <li>
                <a href="#features">{t('landing_footer_features')}</a>
              </li>
              <li>
                <a href="#pricing">{t('landing_footer_pricing')}</a>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div className={styles.footer_column}>
            <h3 className={styles.column_title}>
              {t('landing_footer_support')}
            </h3>
            <ul className={styles.footer_links}>
              <li>
                <a href="#contact">{t('landing_footer_contact')}</a>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className={styles.footer_column}>
            <h3 className={styles.column_title}>Legal</h3>
            <ul className={styles.footer_links}>
              <li>
                <a href="mailto:support@sophiabible.com?subject=Privacy Policy">{t('landing_footer_privacy')}</a>
              </li>
              <li>
                <a href="mailto:support@sophiabible.com?subject=Terms of Service">{t('landing_footer_terms')}</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={styles.footer_bottom}>
          <p className={styles.copyright}>
            © {currentYear} SophiaBible. {t('landing_footer_rights')}.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default LandingFooter;
