import { useContext } from "react";
import { AiContext } from "../context/AiContext";
import './AI.css';

function AI() {
    const { explainVerse, explanation, loading, error } = useContext(AiContext);
    
    // Función para formatear la explicación
    const formatExplanation = (text) => {
        if (!text) return null;
        
        return text.split('\n').map((line, index) => {
            // Detectar títulos con **
            if (line.includes('**')) {
                const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                return <p key={index} dangerouslySetInnerHTML={{ __html: formattedLine }} className="ai-text-bold" />;
            }
            // Detectar listas con *
            if (line.trim().startsWith('*')) {
                return <li key={index} className="ai-text-list">{line.replace(/^\*\s*/, '')}</li>;
            }
            // Líneas normales
            if (line.trim()) {
                return <p key={index} className="ai-text-paragraph">{line}</p>;
            }
            return <br key={index} />;
        });
    };
    
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
                
                {explanation && (
                    <div>
                        <h2 className="ai-explanation-title">Explicación:</h2>
                        <div className="ai-explanation-content">
                            <div className="ai-streaming-text">
                                <pre style={{whiteSpace: 'pre-wrap', fontFamily: 'inherit'}}>
                                    {explanation}
                                </pre>
                                {loading && <span className="ai-cursor"></span>}
                            </div>
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
