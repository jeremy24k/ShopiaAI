import { useTranslation } from '../../hooks/useTranslation';
import { UserPlus, BookOpen, Sparkles } from 'lucide-react';
import styles from '../../styles/HowItWorks.module.css';

function HowItWorks() {
  const { t } = useTranslation();

  const steps = [
    {
      number: '1',
      icon: <UserPlus size={32} />,
      title: t('landing_how_step1_title'),
      description: t('landing_how_step1_desc'),
    },
    {
      number: '2',
      icon: <BookOpen size={32} />,
      title: t('landing_how_step2_title'),
      description: t('landing_how_step2_desc'),
    },
    {
      number: '3',
      icon: <Sparkles size={32} />,
      title: t('landing_how_step3_title'),
      description: t('landing_how_step3_desc'),
    },
  ];

  return (
    <section id="how-it-works" className={styles.how_it_works}>
      <div className={styles.how_container}>
        <div className={styles.how_header}>
          <h2 className={styles.how_title}>
            {t('landing_how_title')}
          </h2>
          <p className={styles.how_subtitle}>
            {t('landing_how_subtitle')}
          </p>
        </div>

        <div className={styles.steps_container}>
          {steps.map((step, index) => (
            <div key={index} className={styles.step}>
              <div className={styles.step_number}>
                {step.number}
              </div>
              
              <div className={styles.step_icon}>
                {step.icon}
              </div>

              <h3 className={styles.step_title}>
                {step.title}
              </h3>

              <p className={styles.step_description}>
                {step.description}
              </p>

              {index < steps.length - 1 && (
                <div className={styles.step_connector} />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
