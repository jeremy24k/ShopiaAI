import DailyVerse from "./Home/DailyVerse";
import DisplayMetrics from "./Home/DisplayMetrics"
import StreakDisplay from "./Home/StreakDisplay"

function Home() {
    return (
        <div>
            <h1>Home</h1>
            <DailyVerse />
            <DisplayMetrics />
            <StreakDisplay />
        </div>
    );
}

export default Home;