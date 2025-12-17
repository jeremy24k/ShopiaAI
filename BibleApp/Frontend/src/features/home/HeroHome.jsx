import HeroImage from '../../assets/Hero_Image.webp';
import styles from "../../styles/hero_home.module.css";

function HeroHome() {
    return (
        <div className={styles.hero}>
            <div className={styles.hero_tlt}>
                <h3>Lámpara es á mis pies tu palabra, y lumbrera á mi camino.</h3>
                <h3>Salmo 119:105</h3>
            </div>
            <img src={HeroImage} alt="Hero Bible" />
        </div>
    );
}

export default HeroHome;