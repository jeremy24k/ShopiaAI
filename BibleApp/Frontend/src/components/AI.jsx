import { useContext } from "react";
import { AiContext } from "../context/AiContext";
import ReactMarkdown from 'react-markdown';
import './AI.css';

function AI() {
    const { explainVerse, explanation, verseToExplain, loading, error } = useContext(AiContext);
    
    return (
        <div className="ai-container">
            <h1 className="ai-title">Explicación Bíblica con IA</h1>
            
            <div className="ai-explanation-box">
                {loading && (
                    <div className="ai-loading">
                        <div className="ai-spinner"></div>
                        <span className="ai-loading-text">Generando explicación...</span>
                    </div>
                )}
                
                {error && (
                    <div className="ai-error">
                        <strong>Error:</strong> {error}
                    </div>
                )}

                {verseToExplain && (
                    <div>
                        <h2 className="ai-explanation-title">Versículo a explicar</h2>
                        <span>
                        <p>{verseToExplain.bookName}: {verseToExplain.chapterNumber}:{verseToExplain.verseNumber}</p>
                        </span>
                        <p>{verseToExplain.translation}</p>
                        <p>{verseToExplain.content}</p>

                        {explanation && (
                            <div className="ai-explanation-content">
                                <div className="ai-streaming-text">
                                    <ReactMarkdown style={{whiteSpace: 'pre-wrap', fontFamily: 'inherit'}}>
                                        {explanation}
                                    </ReactMarkdown>
                                    {loading && <span className="ai-cursor"></span>}
                                </div>
                            </div>
                        )} 
                        <div>
                            <button onClick={() => explainVerse(verseToExplain, 'contextoHistorico')}>Contexto Historico</button>
                            <button onClick={() => explainVerse(verseToExplain, 'aplicacionDiaria')}>Aplicacion Diaria</button>
                            <button onClick={() => explainVerse(verseToExplain, 'vesiculosRelacionados')}>Vesiculos Relacionados</button>
                            <button onClick={() => explainVerse(verseToExplain, 'explicacionSencilla')}>Explicacion Sencilla</button>
                            <button onClick={() => explainVerse(verseToExplain, 'TraducirAlIdiomaOriginal')}>Traducir Al Idioma Original</button>
                            <button onClick={() => explainVerse(verseToExplain, 'ProponerGuiaDeEstudio')}>Proponer Guia De Estudio</button>
                        </div>
                    </div>
                )}
                
                {!explanation && !loading && !error && (
                    <div className="ai-placeholder">
                        <p>Haz clic en "Explain Verse" en cualquier versículo para ver la explicación aquí.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AI;
