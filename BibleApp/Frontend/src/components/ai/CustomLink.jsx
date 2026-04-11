import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import styles from '../../styles/AI.module.css';

export default function CustomLink({ href, children, user, onDemoLock }) {
    const { t } = useTranslation();
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLinkClick = (e) => {
        e.preventDefault();
        if (!user) {
            onDemoLock?.();
            return;
        }
        setShowMenu(!showMenu);
    };

    return (
        <span style={{ position: 'relative', display: 'inline-block' }} ref={menuRef}>
            <a href={href} onClick={handleLinkClick}>
                {children}
            </a>
            {showMenu && (
                <span className={styles.linkMenuPopover}>
                    <button 
                        onClick={() => {
                            setShowMenu(false);
                            window.open(href, '_blank');
                        }} 
                        className={styles.linkMenuButton}
                    >
                        {t('ai_open_new_tab', 'Abrir nueva pestaña')}
                    </button>
                    <button 
                        onClick={() => {
                            setShowMenu(false);
                            window.open(href, '_self');
                        }} 
                        className={styles.linkMenuButton}
                    >
                        {t('ai_open_here', 'Abrir aquí')}
                    </button>
                </span>
            )}
        </span>
    );
}
