import { Component } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

// Error boundary translations (can't use hooks in class components)
const errorTranslations = {
    es: {
        title: 'Algo salió mal',
        message: 'Lo sentimos, ha ocurrido un error inesperado. No te preocupes, tus datos están seguros.',
        reload: 'Recargar página',
        home: 'Ir al inicio',
        persist: 'Si el problema persiste, por favor contacta a soporte.',
        details: 'Ver detalles del error (solo en desarrollo)',
    },
    en: {
        title: 'Something went wrong',
        message: "We're sorry, an unexpected error has occurred. Don't worry, your data is safe.",
        reload: 'Reload page',
        home: 'Go home',
        persist: 'If the problem persists, please contact support.',
        details: 'View error details (development only)',
    }
};

function getLanguage() {
    try {
        const stored = localStorage.getItem('language-storage');
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed?.state?.language === 'en') return 'en';
        }
    } catch { /* fallback */ }
    return 'es';
}

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
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({ error, errorInfo });
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            const lang = getLanguage();
            const t = errorTranslations[lang] || errorTranslations.es;

            const containerStyle = {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100dvh',
                padding: '20px',
                backgroundColor: 'var(--color-grey-100, #f5f5f5)',
                fontFamily: 'var(--primary-font, system-ui, sans-serif)'
            };

            const cardStyle = {
                maxWidth: '560px',
                width: '100%',
                backgroundColor: 'var(--secondary-color, white)',
                padding: '40px',
                borderRadius: '12px',
                border: '1px solid var(--primary-color, #6c35de)',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px'
            };

            const btnBase = {
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                fontSize: '15px',
                fontWeight: '600',
                borderRadius: '8px',
                cursor: 'pointer',
                border: 'none',
                transition: 'all 0.2s'
            };

            return (
                <div style={containerStyle}>
                    <div style={cardStyle}>
                        <AlertTriangle
                            size={52}
                            color="var(--primary-color, #6c35de)"
                            strokeWidth={1.5}
                        />

                        <h1 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary, #333)', margin: 0 }}>
                            {t.title}
                        </h1>

                        <p style={{ fontSize: '15px', color: 'var(--color-grey-600, #666)', lineHeight: '1.6', margin: 0 }}>
                            {t.message}
                        </p>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details style={{
                                width: '100%',
                                textAlign: 'left',
                                backgroundColor: 'var(--color-grey-100, #f8f9fa)',
                                padding: '12px 16px',
                                borderRadius: '8px',
                                fontSize: '13px'
                            }}>
                                <summary style={{ cursor: 'pointer', fontWeight: 'bold', color: 'var(--error-color, #d32f2f)', marginBottom: '8px' }}>
                                    {t.details}
                                </summary>
                                <pre style={{ overflow: 'auto', fontSize: '11px', color: 'var(--error-color, #d32f2f)', margin: '4px 0' }}>
                                    {this.state.error.toString()}
                                </pre>
                                <pre style={{ overflow: 'auto', fontSize: '11px', color: 'var(--color-grey-600, #666)', marginTop: '8px' }}>
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}

                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                            <button
                                onClick={this.handleReset}
                                style={{ ...btnBase, backgroundColor: 'var(--primary-color, #6c35de)', color: 'white' }}
                            >
                                <RefreshCw size={16} />
                                {t.reload}
                            </button>

                            <button
                                onClick={() => window.location.href = '/'}
                                style={{ ...btnBase, backgroundColor: 'transparent', color: 'var(--primary-color, #6c35de)', border: '2px solid var(--primary-color, #6c35de)' }}
                            >
                                <Home size={16} />
                                {t.home}
                            </button>
                        </div>

                        <p style={{ fontSize: '13px', color: 'var(--color-grey-500, #999)', margin: 0 }}>
                            {t.persist}
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
