import { useEffect, useState } from "react";
import { useAiStore } from "../store/AiStore";
import ReactMarkdown from 'react-markdown';
import { Link } from "react-router-dom";
import './AI.css';

function AI() {
    const { explainVerse, currentVerse, explanation, verseToExplain, loading, error, setCurrentVerse } = useAiStore();
    const [verseSelected, setVerseSelected] = useState('');

    function currentVerseHandler(verse) {
        setCurrentVerse(verse);
        const verseKey = verse.verseKey;
        setVerseSelected(verseKey);
    }

    useEffect(() => {
        console.log('Versículo a explicar:', verseToExplain);
        console.log('Versículo actual:', currentVerse);
    }, [verseToExplain, explainVerse, currentVerse]);

    return (
        <div className="ai-container">
            <h1 className="ai-title">Explicación Bíblica con IA</h1>
            
            <div className="ai-explanation-box">
                <section className="ai-section">
                    <aside>
                        <h2>Versículos</h2>
                        <ul>
                            {verseToExplain?.map((verse, index) => (
                                <li 
                                    key={index} 
                                    onClick={() => currentVerseHandler(verse)}
                                    className={verseSelected === verse.verseKey ? 'selected' : ''}
                                >
                                    <h2 className="ai-explanation-title">Versículo a explicar</h2>
                                    <span>
                                    <p>{verse.bookName}: {verse.chapterNumber}:{verse.verseNumber}</p>
                                    </span>
                                    <p>{verse.translation}</p>
                                    <p>{verse.content}</p>
                                </li>
                            ))}
                        </ul>
                    </aside>

                    <main>
                        <div className="ai-explanation-content">
                            {explanation && (
                                <div className="ai-streaming-text">
                                    <ReactMarkdown style={{whiteSpace: 'pre-wrap', fontFamily: 'inherit'}}>
                                        {explanation}
                                    </ReactMarkdown>
                                    {loading && <span className="ai-cursor"></span>}
                                    
                                    {!loading && explanation && (
                                        <div className="ai-footer" style={{marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '1rem', fontSize: '0.9em', color: '#666', fontStyle: 'italic'}}>
                                            <p>
                                                *Este contenido fue generado por inteligencia artificial con el objetivo de apoyar y enriquecer el estudio bíblico. No pretende sustituir la lectura directa de las Sagradas Escrituras.*
                                            </p>
                                            <p>
                                                *Te animamos a profundizar en tus estudios y a meditar siempre en la Palabra de Dios tal como nos exorta Jesús en
                                                <Link to={`/books/jhn/5?translation=${currentVerse.translationValue}#jhn-5-39-${currentVerse.translationValue}`}> Juan 5:39 </Link>.*
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {loading && (
                                <div className="ai-loading">
                                    <div>
                                        <div className="ai-spinner"></div>
                                        <span className="ai-loading-text">Generando explicación...</span>
                                    </div>
                                    <p className="ai-loading-text">Esto puede tomar un momento por favor se paciente</p>
                                </div>
                            )}
                            
                            {error && (
                                <div className="ai-error">
                                    <strong>Error:</strong> {error}
                                </div>
                            )}

                            {currentVerse && !explanation && !loading && !error && (
                                <div className="ai-placeholder">
                                    <p>clickea un boton para explicar el versículo o escribe una pregunta</p>
                                </div>
                            )}

                            {!explanation && !loading && !error && !currentVerse && (
                                <div className="ai-placeholder">
                                    <p>Por favor, selecciona un versículo para obtener una explicación.</p>
                                </div>
                            )}
                        </div>
                        <div>
                            <button onClick={() => explainVerse(currentVerse, 'contextoHistorico')}>Contexto Historico</button>
                            <button onClick={() => explainVerse(currentVerse, 'aplicacionDiaria')}>Aplicacion Diaria</button>
                            <button onClick={() => explainVerse(currentVerse, 'vesiculosRelacionados')}>Vesiculos Relacionados</button>
                            <button onClick={() => explainVerse(currentVerse, 'explicacionSencilla')}>Explicacion Sencilla</button>
                            <button onClick={() => explainVerse(currentVerse, 'TraducirAlIdiomaOriginal')}>Traducir Al Idioma Original</button>
                            <button onClick={() => explainVerse(currentVerse, 'ProponerGuiaDeEstudio')}>Proponer Guia De Estudio</button>
                        </div>

                        <div>
                            <textarea name="question" id="" placeholder="Escribe tu pregunta...">
                            </textarea>
                            <button>Enviar</button>
                        </div>
                    </main>
                </section>

              
            </div>
        </div>
    );
}

export default AI;
