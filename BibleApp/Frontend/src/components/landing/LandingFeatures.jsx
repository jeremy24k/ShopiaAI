import { useTranslation } from '../../hooks/useTranslation';
import { Brain, Languages, NotebookPen, Star, TrendingUp, Sparkles } from 'lucide-react';
import styles from '../../styles/LandingFeatures.module.css';

function LandingFeatures() {
  const { t } = useTranslation();

  const features = [
    {
      icon: <Sparkles size={32} />, 
      title: t('landing_feature_doctrines_title'),
      description: t('landing_feature_doctrines_desc'),
    },
    {
      icon: <Languages size={32} />,
      title: t('landing_feature_translations_title'),
      description: t('landing_feature_translations_desc'),
    },
    {
      icon: <NotebookPen size={32} />,
      title: t('landing_feature_notes_title'),
      description: t('landing_feature_notes_desc'),
    },
    {
      icon: <TrendingUp size={32} />,
      title: t('landing_feature_progress_title'),
      description: t('landing_feature_progress_desc'),
    },
    {
      icon: <Star size={32} />,
      title: t('landing_feature_favorites_title'),
      description: t('landing_feature_favorites_desc'),
    },
    {
      // Optional: 3 AI modes
      icon: <Brain size={32} />,
      title: t('landing_feature_modes_title'),
      description: t('landing_feature_modes_desc'),
    },
  ];

  return (
    <section id="features" className={styles.features}>
      <div className={styles.features_container}>
        <div className={styles.features_header}>
          <h2 className={styles.features_title}>
            {t('landing_features_title')}
          </h2>
          <p className={styles.features_subtitle}>
            {t('landing_features_subtitle')}
          </p>
        </div>

        <div className={styles.features_grid}>
          {features.map((feature, index) => (
            <div key={index} className={styles.feature_card}>
              <div className={styles.feature_icon}>
                {feature.icon}
              </div>
              <h3 className={styles.feature_title}>
                {feature.title}
              </h3>
              <p className={styles.feature_description}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default LandingFeatures;
