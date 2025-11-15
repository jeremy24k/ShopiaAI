import { useContext, useEffect, useState, memo } from "react";
import { ReadingContext } from "../context/ReadingContext";

// Memoizado para evitar re-renders innecesarios
const BookProgress = memo(function BookProgress({ bookId, totalChapters }) {
    const { getBookProgress, completedChapters } = useContext(ReadingContext);
    const [progress, setProgress] = useState({ completed: 0, total: 0, percentage: 0, isCompleted: false });

    useEffect(() => {
        if (bookId && totalChapters) {
            const bookProgress = getBookProgress(bookId, totalChapters);
            setProgress(bookProgress);
        }
    }, [bookId, totalChapters, completedChapters, getBookProgress]);

    if (!totalChapters) return null;

    return (
        <div style={{
            margin: '20px 0',
            padding: '15px',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            border: progress.isCompleted ? '2px solid #4caf50' : '1px solid #ddd'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px'
            }}>
                <h3 style={{ margin: 0, fontSize: '18px' }}>
                    {progress.isCompleted ? '✓ ' : ''}Progreso del Libro
                </h3>
                <span style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: progress.isCompleted ? '#4caf50' : '#2196F3'
                }}>
                    {progress.completed} / {progress.total} capítulos
                </span>
            </div>
            
            {/* Barra de progreso */}
            <div style={{
                width: '100%',
                height: '20px',
                backgroundColor: '#e0e0e0',
                borderRadius: '10px',
                overflow: 'hidden',
                position: 'relative'
            }}>
                <div style={{
                    width: `${progress.percentage}%`,
                    height: '100%',
                    backgroundColor: progress.isCompleted ? '#4caf50' : '#2196F3',
                    transition: 'width 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: 'bold'
                }}>
                    {progress.percentage > 10 && `${progress.percentage}%`}
                </div>
            </div>
            
            {progress.percentage > 0 && progress.percentage < 100 && (
                <p style={{
                    marginTop: '10px',
                    fontSize: '14px',
                    color: '#666',
                    textAlign: 'center'
                }}>
                    ¡Sigue así! Te faltan {progress.total - progress.completed} capítulos
                </p>
            )}
            
            {progress.isCompleted && (
                <p style={{
                    marginTop: '10px',
                    fontSize: '14px',
                    color: '#4caf50',
                    textAlign: 'center',
                    fontWeight: 'bold'
                }}>
                    🎉 ¡Felicidades! Has completado este libro
                </p>
            )}
        </div>
    );
});

export default BookProgress;
