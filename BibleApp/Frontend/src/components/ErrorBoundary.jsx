import { Component } from 'react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error) {
        // Actualizar estado para mostrar UI de fallback
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Puedes enviar el error a un servicio de logging como Sentry
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
    }

    handleReset = () => {
        this.setState({ 
            hasError: false,
            error: null,
            errorInfo: null
        });
        // Recargar la página
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    padding: '20px',
                    backgroundColor: '#f5f5f5',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                }}>
                    <div style={{
                        maxWidth: '600px',
                        backgroundColor: 'white',
                        padding: '40px',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            fontSize: '64px',
                            marginBottom: '20px'
                        }}>
                            😕
                        </div>
                        
                        <h1 style={{
                            fontSize: '24px',
                            fontWeight: 'bold',
                            color: '#333',
                            marginBottom: '16px'
                        }}>
                            ¡Oops! Algo salió mal
                        </h1>
                        
                        <p style={{
                            fontSize: '16px',
                            color: '#666',
                            marginBottom: '24px',
                            lineHeight: '1.5'
                        }}>
                            Lo sentimos, ha ocurrido un error inesperado. 
                            No te preocupes, tus datos están seguros.
                        </p>

                        {/* Mostrar detalles del error solo en desarrollo */}
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details style={{
                                marginBottom: '24px',
                                textAlign: 'left',
                                backgroundColor: '#f8f9fa',
                                padding: '16px',
                                borderRadius: '8px',
                                fontSize: '14px'
                            }}>
                                <summary style={{ 
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    marginBottom: '8px',
                                    color: '#d32f2f'
                                }}>
                                    Ver detalles del error (solo en desarrollo)
                                </summary>
                                <pre style={{
                                    overflow: 'auto',
                                    fontSize: '12px',
                                    color: '#d32f2f',
                                    margin: '8px 0'
                                }}>
                                    {this.state.error.toString()}
                                </pre>
                                <pre style={{
                                    overflow: 'auto',
                                    fontSize: '11px',
                                    color: '#666',
                                    marginTop: '8px'
                                }}>
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}

                        <div style={{
                            display: 'flex',
                            gap: '12px',
                            justifyContent: 'center',
                            flexWrap: 'wrap'
                        }}>
                            <button
                                onClick={this.handleReset}
                                style={{
                                    padding: '12px 24px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    color: 'white',
                                    backgroundColor: '#2196F3',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s'
                                }}
                                onMouseOver={(e) => e.target.style.backgroundColor = '#1976D2'}
                                onMouseOut={(e) => e.target.style.backgroundColor = '#2196F3'}
                            >
                                🔄 Recargar página
                            </button>

                            <button
                                onClick={() => window.location.href = '/'}
                                style={{
                                    padding: '12px 24px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    color: '#2196F3',
                                    backgroundColor: 'white',
                                    border: '2px solid #2196F3',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => {
                                    e.target.style.backgroundColor = '#f0f7ff';
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.backgroundColor = 'white';
                                }}
                            >
                                🏠 Ir al inicio
                            </button>
                        </div>

                        <p style={{
                            fontSize: '14px',
                            color: '#999',
                            marginTop: '24px'
                        }}>
                            Si el problema persiste, por favor contacta a soporte.
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
