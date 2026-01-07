import { useEffect, useState } from "react";
import { useAiStore } from "../store/AiStore";
import ReactMarkdown from 'react-markdown';
import { Link, useLocation } from "react-router-dom";
import styles from './AI.module.css';

function AI() {
    const { 
        explainVerse, 
        askQuestion, 
        explanation, 
        verseToExplain, 
        loading, 
        error, 
        setVerseToExplain,
        messages,
        currentResponse,
        clearMessages
    } = useAiStore();
    const [question, setQuestion] = useState('');
    const location = useLocation(); 

    // Manejar envío de pregunta
    function handleSubmitQuestion(e) {
        e.preventDefault();
        if (!question.trim() || loading) return;
        askQuestion(question, verseToExplain?.length > 0 ? verseToExplain : null);
        setQuestion('');
    }

    // Manejar Enter para enviar
    function handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmitQuestion(e);
        }
    }

    // Función para generar el rango de versículos (ej: "Génesis 1:1-12")
    function getVerseRange() {
        if (!verseToExplain || verseToExplain.length === 0) return '';
        
        const first = verseToExplain[0];
        const last = verseToExplain[verseToExplain.length - 1];
        
        if (verseToExplain.length === 1) {
            return `${first.bookName} ${first.chapterNumber}:${first.verseNumber}`;
        }
        
        return `${first.bookName} ${first.chapterNumber}:${first.verseNumber}-${last.verseNumber}`;
    }

    // Recibir versículos desde la navegación
    useEffect(() => {
        if (location.state?.selectedVerses) {
            setVerseToExplain(location.state.selectedVerses);
        }
    }, [location.state]);


    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Explicación Bíblica con IA</h1>
                <p className={styles.subtitle}>Explora y comprende las Escrituras con ayuda de inteligencia artificial</p>
            </header>
            
            <div className={styles.mainBox}>
                <section className={styles.section}>
                    <main className={styles.mainContent}>
                        <div className={styles.chatContainer}>
                            {/* Mostrar historial de mensajes */}
                            {messages.length > 0 && (
                                <div className={styles.messagesContainer}>
                                    {messages.map((msg, index) => (
                                        <div 
                                            key={index} 
                                            className={`${styles.messageBubble} ${msg.role === 'user' ? styles.userMessage : styles.assistantMessage}`}
                                        >
                                            <div className={styles.messageHeader}>
                                                <span className={styles.messageRole}>
                                                    {msg.role === 'user' ? '👤 Tú' : '🤖 Asistente'}
                                                </span>
                                            </div>
                                            <div className={styles.messageContent}>
                                                {msg.role === 'user' ? (
                                                    <p>{msg.content}</p>
                                                ) : (
                                                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    
                                    {/* Respuesta actual en streaming */}
                                    {currentResponse && (
                                        <div className={`${styles.messageBubble} ${styles.assistantMessage}`}>
                                            <div className={styles.messageHeader}>
                                                <span className={styles.messageRole}>🤖 Asistente</span>
                                            </div>
                                            <div className={styles.messageContent}>
                                                <ReactMarkdown>{currentResponse}</ReactMarkdown>
                                                <span className={styles.cursor}></span>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Loading indicator */}
                                    {loading && !currentResponse && (
                                        <div className={`${styles.messageBubble} ${styles.assistantMessage}`}>
                                            <div className={styles.messageHeader}>
                                                <span className={styles.messageRole}>🤖 Asistente</span>
                                            </div>
                                            <div className={styles.messageContent}>
                                                <div className={styles.typingIndicator}>
                                                    <span></span><span></span><span></span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Explicación de versículos (botones de acción) */}
                            {explanation && messages.length === 0 && (
                                <div className={styles.explanationContent}>
                                    <div className={styles.streamingText}>
                                        <ReactMarkdown>{explanation}</ReactMarkdown>
                                        {loading && <span className={styles.cursor}></span>}
                                        
                                        {!loading && explanation && (
                                            <div className={styles.footer}>
                                                <p>
                                                    *Este contenido fue generado por inteligencia artificial con el objetivo de apoyar y enriquecer el estudio bíblico.*
                                                </p>
                                                <p>
                                                    *Te animamos a profundizar en tus estudios - 
                                                    <Link to={`/books/jhn/5?translation=${verseToExplain?.[0]?.translationValue}#jhn-5-39-${verseToExplain?.[0]?.translationValue}`}> Juan 5:39 </Link>*
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Loading para explicación de versículos */}
                            {loading && !explanation && messages.length === 0 && !currentResponse && (
                                <div className={styles.loading}>
                                    <div className={styles.loadingInner}>
                                        <div className={styles.spinner}></div>
                                        <span className={styles.loadingText}>Generando explicación...</span>
                                    </div>
                                    <p className={styles.loadingSubtext}>Esto puede tomar un momento, por favor sé paciente</p>
                                </div>
                            )}
                            
                            {error && (
                                <div className={styles.error}>
                                    <strong>Error:</strong> {error}
                                </div>
                            )}

                            {/* Placeholder cuando no hay mensajes ni explicación */}
                            {messages.length === 0 && !explanation && !loading && !error && (
                                <div className={styles.placeholder}>
                                    <p>
                                        {verseToExplain?.length > 0 
                                            ? 'Haz clic en un botón para explicar el versículo o escribe una pregunta'
                                            : 'Selecciona un versículo o escribe una pregunta para comenzar'
                                        }
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className={styles.actionButtons}>
                            <button 
                                className={styles.btn} 
                                onClick={() => explainVerse(verseToExplain, 'contextoHistorico')}
                                disabled={loading || !verseToExplain?.length}
                            >
                                📜 Contexto Histórico
                            </button>
                            <button 
                                className={styles.btn} 
                                onClick={() => explainVerse(verseToExplain, 'aplicacionDiaria')}
                                disabled={loading || !verseToExplain?.length}
                            >
                                💡 Aplicación Diaria
                            </button>
                            <button 
                                className={styles.btn} 
                                onClick={() => explainVerse(verseToExplain, 'vesiculosRelacionados')}
                                disabled={loading || !verseToExplain?.length}
                            >
                                🔗 Versículos Relacionados
                            </button>
                            <button 
                                className={styles.btn} 
                                onClick={() => explainVerse(verseToExplain, 'explicacionSencilla')}
                                disabled={loading || !verseToExplain?.length}
                            >
                                ✨ Explicación Sencilla
                            </button>
                            <button 
                                className={styles.btn} 
                                onClick={() => explainVerse(verseToExplain, 'TraducirAlIdiomaOriginal')}
                                disabled={loading || !verseToExplain?.length}
                            >
                                🌍 Idioma Original
                            </button>
                            <button 
                                className={styles.btn} 
                                onClick={() => explainVerse(verseToExplain, 'ProponerGuiaDeEstudio')}
                                disabled={loading || !verseToExplain?.length}
                            >
                                📚 Guía de Estudio
                            </button>
                        </div>

                        <form className={styles.chatForm} onSubmit={handleSubmitQuestion}>
                            <textarea 
                                className={styles.chatTextarea}
                                name="question" 
                                placeholder="Escribe tu pregunta sobre el versículo o cualquier tema bíblico..."
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={loading}
                                rows={2}
                            />
                            <div className={styles.chatButtons}>
                                <button 
                                    type="submit" 
                                    className={styles.chatSubmit}
                                    disabled={loading || !question.trim()}
                                >
                                    {loading ? 'Enviando...' : 'Enviar'}
                                </button>
                                {messages.length > 0 && (
                                    <button 
                                        type="button" 
                                        className={styles.clearChat}
                                        onClick={clearMessages}
                                        disabled={loading}
                                    >
                                        🗑️ Limpiar
                                    </button>
                                )}
                            </div>
                        </form>
                    </main>

                    <aside className={styles.sidebar}>
                        <h2 className={styles.sidebarTitle}>Versículos Seleccionados</h2>
                        
                        {/* Modo Single: Card grande con un solo versículo */}
                        {verseToExplain?.length === 1 && (
                            <div className={styles.singleCard}>
                                <div className={styles.singleCardHeader}>
                                    <span className={styles.verseBadge}>{verseToExplain[0].bookName} {verseToExplain[0].chapterNumber}:{verseToExplain[0].verseNumber}</span>
                                    <span className={styles.translationBadge}>{verseToExplain[0].translation}</span>
                                </div>
                                <p className={styles.singleCardContent}>"{verseToExplain[0].content}"</p>
                            </div>
                        )}

                        {/* Modo Multiple: Card unificada con rango de versículos */}
                        {verseToExplain?.length > 1 && (
                            <div className={styles.passageCard}>
                                <div className={styles.passageHeader}>
                                    <span className={styles.verseBadge}>{getVerseRange()}</span>
                                    <span className={styles.translationBadge}>{verseToExplain?.[0]?.translation}</span>
                                </div>
                                <div className={styles.passageContent}>
                                    {verseToExplain?.map((verse, index) => (
                                        <p key={index} className={styles.passageVerse}>
                                            <sup className={styles.verseSup}>{verse.verseNumber}</sup>
                                            {verse.content}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* No hay versículos seleccionados */}
                        {(!verseToExplain || verseToExplain.length === 0) && (
                            <div className={styles.noVerse}>
                                <p>No hay versículos seleccionados</p>
                            </div>
                        )}
                    </aside>
                </section>
            </div>
        </div>
    );
}

export default AI;
