import { useContext, useEffect, useState } from "react";
import { ReadingContext } from "../context/ReadingContext";

function ReadingStats() {
    const { completedChapters, loadCompletedChapters, getCompletedBooks } = useContext(ReadingContext);
    const [stats, setStats] = useState({
        totalChapters: 0,
        booksWithProgress: 0,
        completedBooks: []
    });

    useEffect(() => {
        loadCompletedChapters();
    }, [loadCompletedChapters]);

    useEffect(() => {
        if (completedChapters.length > 0) {
            const completedBooks = getCompletedBooks();
            const uniqueBooks = new Set(completedChapters.map(ch => ch.book_id));
            
            setStats({
                totalChapters: completedChapters.length,
                booksWithProgress: uniqueBooks.size,
                completedBooks: completedBooks
            });
        }
    }, [completedChapters, getCompletedBooks]);

    if (completedChapters.length === 0) {
        return (
            <div style={{
                padding: '20px',
                backgroundColor: '#f5f5f5',
                borderRadius: '10px',
                margin: '20px 0',
                textAlign: 'center'
            }}>
                <h2>📖 Estadísticas de Lectura</h2>
                <p style={{ color: '#666' }}>
                    Aún no has completado ningún capítulo. ¡Comienza a leer y marca tus progresos!
                </p>
            </div>
        );
    }

    return (
        <div style={{
            padding: '20px',
            backgroundColor: '#f5f5f5',
            borderRadius: '10px',
            margin: '20px 0'
        }}>
            <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>📖 Estadísticas de Lectura</h2>
            
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px',
                marginBottom: '20px'
            }}>
                {/* Total de capítulos completados */}
                <div style={{
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    textAlign: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    <div style={{
                        fontSize: '36px',
                        fontWeight: 'bold',
                        color: '#2196F3'
                    }}>
                        {stats.totalChapters}
                    </div>
                    <div style={{ color: '#666', marginTop: '5px' }}>
                        Capítulos Completados
                    </div>
                </div>

                {/* Libros con progreso */}
                <div style={{
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    textAlign: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    <div style={{
                        fontSize: '36px',
                        fontWeight: 'bold',
                        color: '#ff9800'
                    }}>
                        {stats.booksWithProgress}
                    </div>
                    <div style={{ color: '#666', marginTop: '5px' }}>
                        Libros en Progreso
                    </div>
                </div>
            </div>

            {/* Lista de libros con progreso */}
            {stats.completedBooks.length > 0 && (
                <div style={{
                    backgroundColor: 'white',
                    padding: '15px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    <h3 style={{ marginBottom: '15px', fontSize: '18px' }}>
                        📚 Libros en Progreso
                    </h3>
                    <div style={{
                        display: 'grid',
                        gap: '10px'
                    }}>
                        {stats.completedBooks.map((book) => (
                            <div 
                                key={book.bookId}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '10px',
                                    backgroundColor: '#f5f5f5',
                                    borderRadius: '5px'
                                }}
                            >
                                <span style={{ fontWeight: '500' }}>
                                    {book.bookName}
                                </span>
                                <span style={{
                                    backgroundColor: '#2196F3',
                                    color: 'white',
                                    padding: '4px 12px',
                                    borderRadius: '12px',
                                    fontSize: '14px',
                                    fontWeight: 'bold'
                                }}>
                                    {book.completedChapters} cap.
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div style={{
                marginTop: '15px',
                textAlign: 'center',
                color: '#666',
                fontSize: '14px'
            }}>
                💡 Sigue leyendo para completar más libros de la Biblia
            </div>
        </div>
    );
}

export default ReadingStats;
