import { useContext } from 'react';
import { ReadingContext } from '../../context/ReadingContext';

const ReadingMetrics = () => {
    const { dailyReadingTime, loading } = useContext(ReadingContext);

    const formatReadingTime = (minutes) => {
        if (minutes < 60) {
        return `${minutes} min`;
        } else {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        
        if (remainingMinutes === 0) {
            return `${hours} h`;
        } else {
            return `${hours} h ${remainingMinutes} min`;
        }
        }
    };

    return (
        <div className="reading-time-display">
        <div className="reading-time">
            {loading ? (
            <p className="time">Cargando...</p>
            ) : (
            <p className="time">{formatReadingTime(dailyReadingTime)}</p>
            )}
            <p className="label">Tiempo Total Hoy</p>
        </div>
        </div>
    );
};

export default ReadingMetrics;