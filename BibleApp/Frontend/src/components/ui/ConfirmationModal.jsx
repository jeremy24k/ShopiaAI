import { X, AlertTriangle } from "lucide-react";
import { createPortal } from "react-dom";
import Icon from "./Icon";
import { useTranslation } from "../../hooks/useTranslation";
import styles from './ConfirmationModal.module.css';

function ConfirmationModal({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title,
    message,
    confirmText,
    cancelText,
    variant = 'danger' // 'danger' | 'warning' | 'info'
}) {
    const { t } = useTranslation();

    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    const getIcon = () => {
        switch (variant) {
            case 'danger':
            case 'warning':
                return <AlertTriangle />;
            default:
                return <AlertTriangle />;
        }
    };

    const modalContent = (
        <div className={styles.overlay} onClick={onClose}>
            <div 
                className={styles.modal} 
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles.header}>
                    <div className={`${styles.iconContainer} ${styles[variant]}`}>
                        <Icon icon={getIcon()} size="medium" />
                    </div>
                    <button 
                        className={styles.closeButton}
                        onClick={onClose}
                        aria-label={t('close')}
                    >
                        <Icon icon={<X />} size="small" />
                    </button>
                </div>

                <div className={styles.content}>
                    <h2 className={styles.title}>
                        {title || t('confirm_action')}
                    </h2>
                    <p className={styles.message}>
                        {message || t('confirm_action_message')}
                    </p>
                </div>

                <div className={styles.actions}>
                    <button 
                        className={styles.cancelButton}
                        onClick={onClose}
                    >
                        {cancelText || t('cancel')}
                    </button>
                    <button 
                        className={`${styles.confirmButton} ${styles[variant]}`}
                        onClick={handleConfirm}
                    >
                        {confirmText || t('confirm')}
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}

export default ConfirmationModal;
