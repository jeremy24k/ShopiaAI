import { useReading } from '../../context/ReadingContext';

const StreakDisplay = () => {
  const { currentStreak, longestStreak, todayGoal, dailyReadingTime, goalMinutes, loading } = useReading();

  if (loading) {
    return <div className="streak-display loading">Cargando racha...</div>;
  }

  const getStreakMessage = () => {
    if (currentStreak === 0) return "¡Comienza tu racha!";
    if (currentStreak === 1) return "¡Buen comienzo!";
    if (currentStreak <= 7) return `¡Racha de ${currentStreak} días!`;
    if (currentStreak <= 30) return `¡${currentStreak} días seguidos! 🔥`;
    return `¡${currentStreak} días! LEGENDARIO ⚡`;
  };

  const getProgress = () => {
    return Math.min(100, (dailyReadingTime / goalMinutes) * 100);
  };

  return (
    <div className="streak-display">
      <div className="streak-header">
        <h3>🔥 Racha de Lectura</h3>
      </div>
      
      <div className="streak-main">
        <div className="current-streak">
          <span className="streak-count">{currentStreak}</span>
          <span className="streak-label">días seguidos</span>
        </div>
        
        <div className="streak-message">
          {getStreakMessage()}
        </div>
      </div>

      <div className="goal-progress">
        <div className="progress-text">
          {todayGoal ? (
            <span className="goal-achieved">✅ Meta de hoy cumplida</span>
          ) : (
            <span>
              {dailyReadingTime}/{goalMinutes} min para mantener la racha
            </span>
          )}
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${getProgress()}%` }}
          ></div>
        </div>
      </div>

      {longestStreak > currentStreak && (
        <div className="longest-streak">
          <span>Mejor racha: {longestStreak} días</span>
        </div>
      )}
    </div>
  );
};

export default StreakDisplay;