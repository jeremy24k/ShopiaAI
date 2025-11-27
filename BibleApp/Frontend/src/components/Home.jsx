import { useEffect } from "react";
import DailyVerse from "./Home/DailyVerse";
import DailyReadingTime from "./Home/DailyReadingTime"
import StreakDisplay from "./Home/StreakDisplay"
import DisplayBooksMetrics from "./Home/DisplayBooksMetrics"
import RecentlyRead from "./Home/RecentlyRead"
import GreetingComponent from "./Home/GreetingComponent"
import HeroHome from "./Home/HeroHome"
import { useAuthStore } from "../store/AuthStore";
import { useTrackingStore } from "../store/TrackingStore";


function Home() {
    // Subscribe to auth store changes
    const user = useAuthStore(state => state.user);
    const loading = useAuthStore(state => state.loading);
    
    useEffect(() => {
        // Only run when loading is done and user exists
        if (!loading && user) {
            useTrackingStore.getState().InitTracking();
        }
    }, [user, loading]);

    return (
        <div>
            <GreetingComponent />
            <HeroHome />
            <DailyVerse />
            <DailyReadingTime />
            <StreakDisplay />
            <DisplayBooksMetrics />
            <RecentlyRead />
        </div>
    );
}

export default Home;