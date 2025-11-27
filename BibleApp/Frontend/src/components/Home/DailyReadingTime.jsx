import { useEffect } from "react";
import { useTrackingStore } from "../../store/TrackingStore";

function DailyReadingTime() {
    // Subscribe to store state
    const Minutes = useTrackingStore(state => state.Minutes);
    const TrackingLoading = useTrackingStore(state => state.TrackingLoading);

    const formatTime = (minutes) => {
        if (minutes > 60) {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            return `${hours}h ${mins}m`;
        }
        return `${minutes}m`;
    };

    return (
        <div>
            <h2>Your reading time today</h2>
            <div>{TrackingLoading ? "Loading..." : formatTime(Minutes)}</div>
        </div>
    );
}

export default DailyReadingTime;