import DailyVerse from "./Home/DailyVerse";
import DisplayMetrics from "./Home/DisplayMetrics"
import StreakDisplay from "./Home/StreakDisplay"
import DisplayBooksMetrics from "./Home/DisplayBooksMetrics"
import RecentlyRead from "./Home/RecentlyRead"

function Home() {
    return (
        <div>
            <h1>Home</h1>
            <DailyVerse />
            <DisplayMetrics />
            <StreakDisplay />
            <DisplayBooksMetrics />
            <RecentlyRead />
        </div>
    );
}

export default Home;