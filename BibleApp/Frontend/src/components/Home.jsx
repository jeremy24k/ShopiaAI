import DailyVerse from "./Home/DailyVerse";
import ReadingMetrics from "./Home/ReadingMetrics";
import StreakDisplay from "./Home/StreakDisplay";

function Home() {
    return (
        <div>
            <h1>Home</h1>
            <DailyVerse />
            <ReadingMetrics />
            <StreakDisplay />
        </div>
    );
}

export default Home;