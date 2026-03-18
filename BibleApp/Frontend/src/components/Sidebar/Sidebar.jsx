import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import Icon from "../../components/ui/Icon";
import SidebarHeader from "../Sidebar/SidebarHeader";
import SidebarFooter from "../Sidebar/SidebarFooter";
import CollapsedSidebar from "../Sidebar/CollapsedSidebar";
import SettingsModal from "../../components/ui/SettingsModal";
import { House, BookMarked, Star, NotebookPen, Brain, Settings, ArrowLeftToLine } from "lucide-react";
import styles from "../../styles/Sidebar.module.css";
import { useTranslation } from '../../hooks/useTranslation';

function Sidebar() {
    const { t } = useTranslation();
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [isTablet, setIsTablet] = useState(window.innerWidth <= 1024);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            setIsMobile(width <= 768);
            
            // Auto-colapsar entre 768px y 1024px
            if (width > 768 && width <= 1024) {
                setIsTablet(true);
                setIsCollapsed(true);
            } else if (width > 1024) {
                setIsTablet(false);
                setIsCollapsed(false);
            }
        };

        // Ejecutar al montar
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (isMobile) {
        return (
            <>
                <nav className={styles.mobile_nav} role="navigation" aria-label={t('aria_main_navigation')}>
                    <NavLink to="/home" className={styles.mobile_nav_link} aria-label={t('home')}>
                        <Icon icon={<House />} size="small" color="primary" aria-hidden="true" />
                    </NavLink>
                    <NavLink to="/books" className={styles.mobile_nav_link} aria-label={t('read')}>
                        <Icon icon={<BookMarked />} size="small" color="primary" aria-hidden="true" />
                    </NavLink>
                    <NavLink to="/favorites" className={styles.mobile_nav_link} aria-label={t('favorites')}>
                        <Icon icon={<Star />} size="small" color="primary" aria-hidden="true" />
                    </NavLink>
                    <NavLink to="/notes" className={styles.mobile_nav_link} aria-label={t('notes')}>
                        <Icon icon={<NotebookPen />} size="small" color="primary" aria-hidden="true" />
                    </NavLink>
                    <NavLink to="/ai" className={styles.mobile_nav_link} aria-label={t('ia')}>
                        <Icon icon={<Brain />} size="small" color="primary" aria-hidden="true" />
                    </NavLink>
                    <button 
                        className={styles.mobile_nav_button}
                        onClick={() => setIsSettingsOpen(true)}
                        aria-label={t('settings')}
                    >
                        <Icon icon={<Settings />} size="small" color="primary" aria-hidden="true" />
                    </button>
                </nav>
                <SettingsModal 
                    isOpen={isSettingsOpen} 
                    onClose={() => setIsSettingsOpen(false)} 
                />
            </>
        );
    }

    if (isCollapsed) {
        return <CollapsedSidebar isTablet={isTablet} onExpand={() => setIsCollapsed(false)} />;
    }

    return (
        <aside id="onboarding-nav" className={styles.sidebar} role="navigation" aria-label={t('aria_main_navigation')}>
            <button 
                className={styles.collapse_button}
                onClick={() => setIsCollapsed(true)}
                aria-label={t('collapse_sidebar')}
            >
                <Icon icon={<ArrowLeftToLine />} size="small" color="primary" aria-hidden="true" />
            </button>

            <div className={styles.sidebar_header}>
                <SidebarHeader />
            </div>
            
            <nav>
                <ul className={styles.sidebar_list}>
                    <li>
                        <NavLink to="/home" className={styles.nav_link}>
                            <Icon icon={<House />} size="small" color="primary" aria-hidden="true" />
                            {t('home')}
                        </NavLink>
                    </li>
                    <li>
                        <NavLink id="onboarding-read" to="/books" className={styles.nav_link}>
                            <Icon icon={<BookMarked />} size="small" color="primary" aria-hidden="true" />
                            {t('read')}
                        </NavLink>
                    </li>
                    <li>
                        <NavLink id="onboarding-favorites" to="/favorites" className={styles.nav_link}>
                            <Icon icon={<Star />} size="small" color="primary" aria-hidden="true" />
                            {t('favorites')}
                        </NavLink>
                    </li>
                    <li>
                        <NavLink id="onboarding-notes" to="/notes" className={styles.nav_link}>
                            <Icon icon={<NotebookPen />} size="small" color="primary" aria-hidden="true" />
                            {t('notes')}
                        </NavLink>
                    </li>
                    <li>
                        <NavLink id="onboarding-ai" to="/ai" className={styles.nav_link}>
                            <Icon icon={<Brain />} size="small" color="primary" aria-hidden="true" />
                            {t('ia')}
                        </NavLink>
                    </li>
                </ul>
            </nav>
            
            <div className={styles.sidebar_footer}>
                <SidebarFooter />
            </div>
        </aside>
    );
}

export default Sidebar;