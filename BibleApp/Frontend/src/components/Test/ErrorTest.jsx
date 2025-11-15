import { useState } from 'react';

/**
 * Componente de prueba para el ErrorBoundary
 * 
 * INSTRUCCIONES DE USO:
 * 1. Importa este componente en cualquier página: import ErrorTest from './Test/ErrorTest'
 * 2. Agrégalo al JSX: <ErrorTest />
 * 3. Click en "Provocar Error" para ver el ErrorBoundary en acción
 * 4. ELIMINA este componente antes de producción
 */
function ErrorTest() {
    const [shouldThrow, setShouldThrow] = useState(false);

    if (shouldThrow) {
        // Esto provocará un error que será capturado por ErrorBoundary
        throw new Error('¡Error de prueba! El ErrorBoundary está funcionando correctamente.');
    }

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 9999,
            backgroundColor: '#ff9800',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
            border: '2px solid #f57c00'
        }}>
            <p style={{
                margin: '0 0 8px 0',
                fontSize: '12px',
                fontWeight: 'bold',
                color: 'white'
            }}>
                🧪 TEST MODE
            </p>
            <button
                onClick={() => setShouldThrow(true)}
                style={{
                    padding: '8px 16px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: 'white',
                    backgroundColor: '#d32f2f',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    width: '100%'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#b71c1c'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#d32f2f'}
            >
                💥 Provocar Error
            </button>
            <p style={{
                margin: '8px 0 0 0',
                fontSize: '10px',
                color: 'white',
                textAlign: 'center'
            }}>
                Eliminar antes de producción
            </p>
        </div>
    );
}

export default ErrorTest;
