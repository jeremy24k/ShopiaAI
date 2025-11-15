// context/ReadingContext.js
import {
    createContext,
    useState,
    useEffect,
    useRef,
    useContext,
    useCallback,
} from "react";
import supabase from "../supabase/supabase";
import {
    calculateStreak,
    isGoalAchieved,
    GOAL_MINUTES,
} from "../utils/calculateStreak";

const ReadingContext = createContext();

export const useReading = () => {
    const context = useContext(ReadingContext);
    return context;
};

const ReadingContextProvider = ({ children }) => {
    // Estados de tiempo de lectura
    const [dailyReadingTime, setDailyReadingTime] = useState(0);
    const [currentStreak, setCurrentStreak] = useState(0);
    const [longestStreak, setLongestStreak] = useState(0);
    const [todayGoal, setTodayGoal] = useState(false);
    const [loading, setLoading] = useState(true);
    const intervalRef = useRef(null);

    const updateStreak = async (todayMinutes) => {
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return;

            const today = new Date().toISOString().split("T")[0];
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split("T")[0];

            // Verificar si se cumplió la meta
            const goalAchieved = isGoalAchieved(todayMinutes);
            setTodayGoal(goalAchieved);

            if (!goalAchieved) return; // Solo actualizar racha si se cumplió la meta

            // Obtener datos de racha actual
            const { data: streakData } = await supabase
                .from("reading_streaks")
                .select("*")
                .eq("user_id", user.id)
                .single();

            // Calcular nueva racha
            const newStreak = calculateStreak(streakData, today, yesterdayStr);
            const newLongestStreak = Math.max(
                newStreak,
                streakData?.longest_streak || 0
            );

            // Actualizar base de datos
            await supabase.from("reading_streaks").upsert(
                {
                    user_id: user.id,
                    current_streak: newStreak,
                    longest_streak: newLongestStreak,
                    last_activity_date: today,
                    updated_at: new Date().toISOString(),
                },
                {
                    onConflict: "user_id",
                }
            );

            // Actualizar estado
            setCurrentStreak(newStreak);
            setLongestStreak(newLongestStreak);
        } catch (error) {
            console.error("Error updating streak:", error);
        }
    };

    // Función para cargar datos iniciales
    const loadInitialData = async () => {
        try {
            setLoading(true);
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return;

            const today = new Date().toISOString().split("T")[0];

            // Cargar tiempo de hoy
            const { data: todayData } = await supabase
                .from("daily_reading_time")
                .select("minutes_read")
                .eq("user_id", user.id)
                .eq("date", today)
                .single();

            if (todayData) {
                setDailyReadingTime(todayData.minutes_read);
                // Verificar meta con datos cargados
                updateStreak(todayData.minutes_read);
            } else {
                // Si no existe registro para hoy, crear uno
                await supabase.from("daily_reading_time").upsert(
                    {
                        user_id: user.id,
                        date: today,
                        minutes_read: 0,
                        updated_at: new Date().toISOString(),
                    },
                    {
                        onConflict: "user_id,date",
                    }
                );
            }

            // Cargar racha actual
            const { data: streakData } = await supabase
                .from("reading_streaks")
                .select("*")
                .eq("user_id", user.id)
                .single();

            if (streakData) {
                setCurrentStreak(streakData.current_streak);
                setLongestStreak(streakData.longest_streak);
            } else {
                // Si no existe racha, crear una
                await supabase.from("reading_streaks").upsert(
                    {
                        user_id: user.id,
                        current_streak: 0,
                        longest_streak: 0,
                        last_activity_date: today,
                        updated_at: new Date().toISOString(),
                    },
                    {
                        onConflict: "user_id",
                    }
                );
            }
        } catch (error) {
            console.error("Error loading initial data:", error);
        } finally {
            setLoading(false);
        }
    };

    const saveToDatabase = useCallback(async (minutes) => {
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return;

            const today = new Date().toISOString().split("T")[0];

            const { error } = await supabase.from("daily_reading_time").upsert(
                {
                    user_id: user.id,
                    date: today,
                    minutes_read: minutes,
                    updated_at: new Date().toISOString(),
                },
                {
                    onConflict: "user_id,date",
                }
            );

            if (!error) {
                console.log("✅ Guardado en DB:", minutes, "minutos");
            }
        } catch (error) {
            console.error("Error en saveToDatabase:", error);
        }
    }, []);

    const startReadingTimer = useCallback(() => {
        if (intervalRef.current) return;

        console.log("🟢 Iniciando timer de lectura...");
        intervalRef.current = setInterval(() => {
            setDailyReadingTime((prev) => {
                const newTime = prev + 1;
                saveToDatabase(newTime);
                return newTime;
            });
        }, 60000);
    }, [saveToDatabase]);

    const stopReadingTimer = useCallback(() => {
        if (intervalRef.current) {
            console.log("🔴 Deteniendo timer de lectura...");
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    useEffect(() => {
        loadInitialData();

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    const value = {
        // Tiempo de lectura diario
        dailyReadingTime,
        loading,
        startReadingTimer,
        stopReadingTimer,
        
        // Rachas
        currentStreak,
        longestStreak,
        todayGoal,
        goalMinutes: GOAL_MINUTES,
    };

    return (
        <ReadingContext.Provider value={value}>{children}</ReadingContext.Provider>
    );
};

export { ReadingContextProvider, ReadingContext };