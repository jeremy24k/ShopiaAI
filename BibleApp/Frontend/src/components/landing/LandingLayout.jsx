import { Outlet } from 'react-router-dom';
import LandingNavbar from './LandingNavbar';
import LandingFooter from './LandingFooter';
import styles from '../../styles/LandingLayout.module.css';

/**
 * Layout compartido para páginas públicas (Privacy Policy, Terms of Service, etc.)
 * Muestra el mismo navbar y footer que la landing page.
 */
function LandingLayout() {
    return (
        <div className={styles.wrapper}>
            <LandingNavbar />
            <main className={styles.main}>
                <Outlet />
            </main>
            <LandingFooter />
        </div>
    );
}

export default LandingLayout;
