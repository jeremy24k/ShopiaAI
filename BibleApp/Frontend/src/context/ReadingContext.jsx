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

    // Estados de capítulos completados
    const [completedChapters, setCompletedChapters] = useState([]);
    const [loadingChapters, setLoadingChapters] = useState(false);

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

    // Cargar todos los capítulos completados del usuario
    const loadCompletedChapters = useCallback(async () => {
        try {
            setLoadingChapters(true);
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from("completed_chapters")
                .select("*")
                .eq("user_id", user.id)
                .order("completed_at", { ascending: false });

            if (error) throw error;

            setCompletedChapters(data || []);
            console.log("✅ Capítulos completados cargados:", data?.length || 0);
        } catch (error) {
            console.error("Error loading completed chapters:", error);
        } finally {
            setLoadingChapters(false);
        }
    }, []);

    // Marcar un capítulo como completado
    const markChapterAsCompleted = useCallback(async (bookId, bookName, chapterNumber, translationValue) => {
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) {
                console.log("⚠️ Usuario no autenticado");
                return { success: false, error: "User not authenticated" };
            }

            const { data, error } = await supabase
                .from("completed_chapters")
                .insert({
                    user_id: user.id,
                    book_id: bookId,
                    book_name: bookName,
                    chapter_number: chapterNumber,
                    translation_value: translationValue,
                })
                .select()
                .single();

            if (error) {
                // Si es error de duplicado, no es realmente un error
                if (error.code === "23505") {
                    console.log("ℹ️ Capítulo ya estaba marcado como completado");
                    return { success: true, alreadyCompleted: true };
                }
                throw error;
            }

            // Actualizar estado local
            setCompletedChapters((prev) => [data, ...prev]);
            console.log("✅ Capítulo marcado como completado:", bookName, chapterNumber);
            return { success: true, data };
        } catch (error) {
            console.error("Error marking chapter as completed:", error);
            return { success: false, error: error.message };
        }
    }, []);

    // Desmarcar un capítulo como completado
    const unmarkChapter = useCallback(async (bookId, chapterNumber, translationValue) => {
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return { success: false, error: "User not authenticated" };

            const { error } = await supabase
                .from("completed_chapters")
                .delete()
                .eq("user_id", user.id)
                .eq("book_id", bookId)
                .eq("chapter_number", chapterNumber)
                .eq("translation_value", translationValue);

            if (error) throw error;

            // Actualizar estado local
            setCompletedChapters((prev) =>
                prev.filter(
                    (ch) =>
                        !(
                            ch.book_id === bookId &&
                            ch.chapter_number === chapterNumber &&
                            ch.translation_value === translationValue
                        )
                )
            );
            console.log("✅ Capítulo desmarcado:", bookId, chapterNumber);
            return { success: true };
        } catch (error) {
            console.error("Error unmarking chapter:", error);
            return { success: false, error: error.message };
        }
    }, []);

    // Verificar si un capítulo está completado
    const isChapterCompleted = useCallback(
        (bookId, chapterNumber, translationValue) => {
            return completedChapters.some(
                (ch) =>
                    ch.book_id === bookId &&
                    ch.chapter_number === parseInt(chapterNumber) &&
                    ch.translation_value === translationValue
            );
        },
        [completedChapters]
    );

    // Obtener progreso de un libro específico
    const getBookProgress = useCallback(
        (bookId, totalChapters) => {
            const completedInBook = completedChapters.filter(
                (ch) => ch.book_id === bookId
            ).length;

            const percentage = totalChapters > 0
                ? Math.round((completedInBook / totalChapters) * 100)
                : 0;

            return {
                completed: completedInBook,
                total: totalChapters,
                percentage,
                isCompleted: completedInBook === totalChapters && totalChapters > 0,
            };
        },
        [completedChapters]
    );

    // Obtener lista de libros completados (100%)
    const getCompletedBooks = useCallback(() => {
        const bookProgress = {};

        completedChapters.forEach((ch) => {
            if (!bookProgress[ch.book_id]) {
                bookProgress[ch.book_id] = {
                    bookId: ch.book_id,
                    bookName: ch.book_name,
                    chapters: new Set(),
                };
            }
            bookProgress[ch.book_id].chapters.add(ch.chapter_number);
        });

        return Object.values(bookProgress).map((book) => ({
            bookId: book.bookId,
            bookName: book.bookName,
            completedChapters: book.chapters.size,
        }));
    }, [completedChapters]);

    useEffect(() => {
        loadInitialData();
        loadCompletedChapters(); // ✅ Cargar capítulos completados al montar

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [loadCompletedChapters]);

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

        // Capítulos completados
        completedChapters,
        loadingChapters,
        loadCompletedChapters,
        markChapterAsCompleted,
        unmarkChapter,
        isChapterCompleted,
        getBookProgress,
        getCompletedBooks,
    };

    return (
        <ReadingContext.Provider value={value}>{children}</ReadingContext.Provider>
    );
};

export { ReadingContextProvider, ReadingContext };