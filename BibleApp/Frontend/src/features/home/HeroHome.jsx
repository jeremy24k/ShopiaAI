import HeroImage from '../../assets/Hero_Image.webp';
import styles from "../../styles/hero_home.module.css";
import { useTranslation } from "../../hooks/useTranslation";

function HeroHome() {
    const { t } = useTranslation();

    return (
        <section className={styles.hero} aria-label={t('aria_hero_section')}>
            <div className={styles.hero_tlt} role="article" aria-label={t('aria_bible_verse')}>
                <h2>{t('hero_verse')}</h2>
                <cite>{t('hero_verse_reference')}</cite>
            </div>
            <img 
                src={HeroImage} 
                alt={t('aria_hero_image')} 
                loading="lazy"
                role="img"
            />
        </section>
    );
}

export default HeroHome;