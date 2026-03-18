import { useTranslation } from '../../hooks/useTranslation';
import { Heart } from 'lucide-react';
import styles from '../../styles/AboutProject.module.css';

function AboutProject() {
  const { t } = useTranslation();

  const scrollToContact = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
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
          onClick={scrollToContact}
          className={styles.about_cta}
        >
          {t('landing_about_cta')}
        </button>
      </div>
    </section>
  );
}

export default AboutProject;
