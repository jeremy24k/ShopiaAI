import { Component } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import styles from './ErrorBoundary.module.css';

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

            return (
                <div className={styles.container}>
                    <div className={styles.card}>
                        <AlertTriangle
                            size={52}
                            color="var(--primary-color, #6c35de)"
                            strokeWidth={1.5}
                        />

                        <h1 className={styles.title}>
                            {t.title}
                        </h1>

                        <p className={styles.message}>
                            {t.message}
                        </p>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className={styles.details}>
                                <summary className={styles.detailsSummary}>
                                    {t.details}
                                </summary>
                                <pre className={styles.errorText}>
                                    {this.state.error.toString()}
                                </pre>
                                <pre className={styles.stackText}>
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}

                        <div className={styles.buttonGroup}>
                            <button
                                onClick={this.handleReset}
                                className={`${styles.btnBase} ${styles.btnPrimary}`}
                            >
                                <RefreshCw size={16} />
                                {t.reload}
                            </button>

                            <button
                                onClick={() => window.location.href = '/'}
                                className={`${styles.btnBase} ${styles.btnSecondary}`}
                            >
                                <Home size={16} />
                                {t.home}
                            </button>
                        </div>

                        <p className={styles.persistText}>
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
