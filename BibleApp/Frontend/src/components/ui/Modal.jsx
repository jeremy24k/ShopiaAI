import { X } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import Icon from './Icon';
import styles from './Modal.module.css';

/**
 * Modal Component - Componente modal reutilizable
 * 
 * @param {boolean} isOpen - Controla si el modal está abierto
 * @param {function} onClose - Callback cuando se cierra el modal
 * @param {string} title - Título del modal
 * @param {React.ReactNode} children - Contenido del modal
 * @param {React.ReactNode} headerActions - Acciones adicionales en el header (botones, etc)
 * @param {string} size - Tamaño del modal: 'small', 'medium', 'large', 'xlarge'
 * @param {boolean} showCloseButton - Mostrar botón de cerrar (default: true)
 * @param {boolean} closeOnOverlayClick - Cerrar al hacer click en el overlay (default: true)
 * @param {string} className - Clase CSS adicional para el modal
 * @param {string} contentClassName - Clase CSS adicional para el contenido
 */
function Modal({
    isOpen,
    onClose,
    title,
    children,
    headerActions,
    size = 'medium',
    showCloseButton = true,
    closeOnOverlayClick = true,
    className = '',
    contentClassName = ''
}) {
    const { t } = useTranslation();

    if (!isOpen) return null;

    const handleOverlayClick = () => {
        if (closeOnOverlayClick && onClose) {
            onClose();
        }
    };

    const sizeClass = {
        small: styles.modalSmall,
        medium: styles.modalMedium,
        large: styles.modalLarge,
        xlarge: styles.modalXLarge
    }[size] || styles.modalMedium;

    return (
        <>
            <div className={styles.overlay} onClick={handleOverlayClick} />
            <div className={`${styles.modal} ${sizeClass} ${className}`}>
                {/* Header */}
                <div className={styles.header}>
                    <h2 className={styles.title}>{title}</h2>
                    <div className={styles.headerActions}>
                        {headerActions}
                        {showCloseButton && (
                            <button 
                                className={styles.closeButton} 
                                onClick={onClose}
                                title={t('close') || 'Cerrar'}
                                aria-label={t('close') || 'Cerrar'}
                            >
                                <Icon icon={<X />} size="small" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className={`${styles.content} ${contentClassName}`}>
                    {children}
                </div>
            </div>
        </>
    );
}

export default Modal;
