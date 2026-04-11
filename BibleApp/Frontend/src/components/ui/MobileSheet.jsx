import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import styles from './MobileSheet.module.css';

/**
 * MobileSheet — Reusable bottom sheet for mobile.
 *
 * Props:
 *  - isOpen      {boolean}        Whether the sheet is visible
 *  - onClose     {() => void}     Called when overlay or close button is tapped
 *  - title       {string}         Optional header title
 *  - children    {ReactNode}      Content rendered inside the sheet
 *  - bodyClass   {string}         Optional extra class for the scrollable body
 *  - maxHeight   {string}         CSS value for max-height (default '88vh')
 */
function MobileSheet({
    isOpen,
    onClose,
    title,
    children,
    bodyClass = '',
    maxHeight,
}) {
    const sheetRef = useRef(null);

    // Lock body scroll while open — only on mobile where the sheet is visible
    useEffect(() => {
        const isMobileViewport = window.matchMedia('(max-width: 768px)').matches;
        if (isOpen && isMobileViewport) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Close on Escape key — only on mobile
    useEffect(() => {
        if (!isOpen) return;
        const isMobileViewport = window.matchMedia('(max-width: 768px)').matches;
        if (!isMobileViewport) return;
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className={styles.overlay}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Sheet */}
            <div
                ref={sheetRef}
                className={styles.sheet}
                role="dialog"
                aria-modal="true"
                style={maxHeight ? { maxHeight } : undefined}
            >
                {/* Drag handle */}
                <div className={styles.handle} aria-hidden="true" />

                {/* Optional header */}
                {title && (
                    <div className={styles.header}>
                        <h2 className={styles.title}>{title}</h2>
                        <button
                            className={styles.closeButton}
                            onClick={onClose}
                            aria-label="Close"
                        >
                            <X size={18} />
                        </button>
                    </div>
                )}

                {/* Scrollable content */}
                <div className={`${styles.body} ${bodyClass}`}>
                    {children}
                </div>
            </div>
        </>
    );
}

export default MobileSheet;
