import { useTranslation } from '../../hooks/useTranslation';
import styles from '../../styles/LandingTestimonials.module.css';

function LandingTestimonials() {
  const { t } = useTranslation();

  return (
    <section id="testimonials" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {t('landing_testimonials_title')}
          </h2>
          <p className={styles.subtitle}>
            {t('landing_testimonials_subtitle')}
          </p>
        </div>

        {/* Video placeholder */}
        <div className={styles.video_wrapper}>
          {/* Reemplazar src con la URL real de YouTube/Vimeo cuando el video esté listo */}
          <iframe 
            className={styles.video_iframe}
            src="https://www.youtube.com/embed/placeholder" 
            title="SophiaBible Demo" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
          ></iframe>
        </div>

        <div className={styles.callout}>
          {t('landing_testimonials_callout')}
        </div>
      </div>
    </section>
  );
}

export default LandingTestimonials;

