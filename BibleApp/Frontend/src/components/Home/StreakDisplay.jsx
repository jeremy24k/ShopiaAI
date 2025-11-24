import { useContext, useEffect } from "react";
import { TrackingContext } from "../../context/TrackingContext";
import { Link } from "react-router-dom";

function StreakDisplay() {
    const { Streak, InitTracking, TrackingLoading } = useContext(TrackingContext)

    useEffect(() => {
        InitTracking();
    }, []);

    const formatStreak = (streak) => {
        if (streak <= 0) {
            return (
                <div>
                    <p>Lee al menos 30 minutos al dia para empezar tu racha</p>
                    <Link to="/books">Comienza Ahora</Link>
                </div>
            )
        } else if (streak === 1) {
            return 'Buen comienzo, Sigue asi'   
        } else if (streak > 1) {
            return 'Manten Tu racha al dia!!!'
        }
    }

    return (
        <div>
            <h2>Your Current Streak</h2>
            {TrackingLoading ? (
                <p>Loading...</p>
            ) : (
                <div>
                    <p>{Streak}</p>
                    <div>{formatStreak(Streak)}</div>
                </div>
                )
            }
          
        </div>
    );
}

export default StreakDisplay;