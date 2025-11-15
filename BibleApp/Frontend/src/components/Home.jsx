import DailyVerse from "./Home/DailyVerse";
import ReadingMetrics from "./Home/ReadingMetrics";
import StreakDisplay from "./Home/StreakDisplay";
import ReadingStats from "./ReadingStats";
import ErrorTest from "./Test/ErrorTest";

function Home() {
    return (
        <div>
            <h1>Home</h1>
            <DailyVerse />
            <ReadingMetrics />
            <StreakDisplay />
            <ReadingStats />
            {/* <ErrorTest /> */}
        </div>
    );
}

export default Home;