import DailyVerse from "../features/home/DailyVerse";
import DailyReadingTime from "../features/home/DailyReadingTime"
import StreakDisplay from "../features/home/StreakDisplay"
import DisplayBooksMetrics from "../features/home/DisplayBooksMetrics"
import RecentlyRead from "../features/home/RecentlyRead"
import GreetingComponent from "../features/home/GreetingComponent"
import HeroHome from "../features/home/HeroHome"
import RequireAuth from "../components/RequireAuth";
import styles from "../styles/Home.module.css"
import { useTranslation } from "../hooks/useTranslation";


function Home() {
    const { t } = useTranslation();

    return (
        <div>
            <GreetingComponent />
            <HeroHome />
            <DailyVerse />
            
            <RequireAuth 
                fallbackMessage={t('login_register_progress')}
            >
                <section className={styles.ctn_metrics__global}>
                    <div className={styles.metric}>
                        <DisplayBooksMetrics />
                    </div>
                    <div className={styles.metric}>
                        <DailyReadingTime />
                    </div>
                    <div className={styles.metric}>
                        <StreakDisplay />
                    </div>
                </section>
                <RecentlyRead />
            </RequireAuth>
        </div>
    );
}

export default Home;