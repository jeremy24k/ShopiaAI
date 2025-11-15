export const GOAL_MINUTES = 30;

// Función para calcular si se mantiene o reinicia la racha
export const calculateStreak = (currentStreakData, today, yesterday) => {
  if (!currentStreakData || !currentStreakData.last_activity_date) {
    return 1; // Primera racha
  }

  const lastActivity = new Date(currentStreakData.last_activity_date);
  const todayDate = new Date(today);
  const yesterdayDate = new Date(yesterday);
  
  const diffToToday = (todayDate - lastActivity) / (1000 * 60 * 60 * 24);
  const diffToYesterday = (yesterdayDate - lastActivity) / (1000 * 60 * 60 * 24);

  if (Math.floor(diffToToday) === 0) {
    // Mismo día - mantener racha actual
    return currentStreakData.current_streak;
  } else if (Math.floor(diffToYesterday) === 0 || Math.floor(diffToToday) === 1) {
    // Día consecutivo - incrementar racha
    return currentStreakData.current_streak + 1;
  } else {
    // Días perdidos - reiniciar racha
    return 1;
  }
};

// Función para verificar si se cumplió la meta
export const isGoalAchieved = (minutesRead) => {
  return minutesRead >= GOAL_MINUTES;
};