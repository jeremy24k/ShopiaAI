import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/AuthStore';
import { useTranslation } from '../../hooks/useTranslation';
import { Check, Zap } from 'lucide-react';
import styles from '../../styles/LandingPricing.module.css';

function LandingPricing() {
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

  const freeFeatures = [
    t('landing_pricing_free_feature1'),
    t('landing_pricing_free_feature2'),
    t('landing_pricing_free_feature3'),
  ];

  const creditPackages = [
    { credits: 50, price: '$4.99', name: t('credits_pkg_basic_name'), ideal: t('landing_pricing_basic_ideal') },
    { credits: 100, price: '$9.99', name: t('credits_pkg_premium_name'), popular: true, ideal: t('landing_pricing_premium_ideal') },
  ];

  return (
    <section id="pricing" className={styles.pricing}>
      <div className={styles.pricing_container}>
        <div className={styles.pricing_header}>
          <h2 className={styles.pricing_title}>
            {t('landing_pricing_title')}
          </h2>
          <p className={styles.pricing_subtitle}>
            {t('landing_pricing_subtitle')}
          </p>
        </div>

        <div className={styles.pricing_grid}>
          {/* Free Plan Card */}
          <div className={styles.free_card}>
            <div className={styles.card_header}>
              <h3 className={styles.card_title}>
                {t('landing_pricing_free_title')}
              </h3>
              <div className={styles.card_price}>
                <span className={styles.price_amount}>
                  {t('landing_pricing_free_price')}
                </span>
              </div>
              <p className={styles.card_description}>
                {t('landing_pricing_free_desc')}
              </p>
            </div>

            <ul className={styles.features_list}>
              {freeFeatures.map((feature, index) => (
                <li key={index} className={styles.feature_item}>
                  <Check size={20} className={styles.check_icon} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button 
              onClick={handleCTA}
              className={styles.cta_button}
            >
              {user ? t('landing_cta_secondary') : t('landing_pricing_cta')}
            </button>
          </div>

          {/* Credits Card */}
          <div className={styles.credits_card}>
            <div className={styles.card_header}>
              <div className={styles.credits_icon}>
                <Zap size={32} />
              </div>
              <h3 className={styles.card_title}>
                {t('landing_pricing_credits_title')}
              </h3>
              <p className={styles.card_description}>
                {t('landing_pricing_credits_desc')}
              </p>
            </div>

            <div className={styles.packages_grid}>
              {creditPackages.map((pkg, index) => (
                <div 
                  key={index} 
                  className={`${styles.package_item} ${pkg.popular ? styles.package_popular : ''}`}
                >
                  {pkg.popular && (
                    <span className={styles.popular_badge}>Popular</span>
                  )}
                  <div className={styles.package_credits}>
                    {pkg.credits} {t('credits')}
                  </div>
                  <div className={styles.package_price}>
                    {pkg.price}
                  </div>
                  <div className={styles.package_name}>
                    {pkg.name}
                  </div>
                  {pkg.ideal && (
                    <div className={styles.package_ideal}>
                      {pkg.ideal}
                    </div>
                  )}
                  <div className={styles.package_questions}>
                    {pkg.credits} {t('landing_pricing_credits')}
                  </div>
                </div>
              ))}
            </div>

            <p className={styles.credits_note}>
              {t('available_after_login')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default LandingPricing;
