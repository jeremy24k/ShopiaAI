import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import Icon from "../../components/ui/Icon";
import SidebarHeader from "../Sidebar/SidebarHeader";
import SidebarFooter from "../Sidebar/SidebarFooter";
import CollapsedSidebar from "../Sidebar/CollapsedSidebar";
import SettingsModal from "../../components/ui/SettingsModal";
import { House, BookMarked, Star, NotebookPen, Brain, Settings, ChevronLeft, MoreHorizontal } from "lucide-react";
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
                <div className={styles.mobile_nav}>
                    <NavLink to="/" className={styles.mobile_nav_link} title={t('home')}>
                        <Icon icon={<House />} size="small" color="primary" />
                    </NavLink>
                    <NavLink to="/books" className={styles.mobile_nav_link} title={t('read')}>
                        <Icon icon={<BookMarked />} size="small" color="primary" />
                    </NavLink>
                    <NavLink to="/favorites" className={styles.mobile_nav_link} title={t('favorites')}>
                        <Icon icon={<Star />} size="small" color="primary" />
                    </NavLink>
                    <NavLink to="/notes" className={styles.mobile_nav_link} title={t('notes')}>
                        <Icon icon={<NotebookPen />} size="small" color="primary" />
                    </NavLink>
                    <NavLink to="/ai" className={styles.mobile_nav_link} title={t('ia')}>
                        <Icon icon={<Brain />} size="small" color="primary" />
                    </NavLink>
                    <button 
                        className={styles.mobile_nav_button}
                        onClick={() => setIsSettingsOpen(true)}
                        title={t('settings') || 'Configuración'}
                    >
                        <Icon icon={<Settings />} size="small" color="primary" />
                    </button>
                </div>
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
        <div className={styles.sidebar}>
            <button 
                className={styles.collapse_button}
                onClick={() => setIsCollapsed(true)}
                title={t('collapse_sidebar') || 'Contraer'}
            >
                <Icon icon={<ChevronLeft />} size="small" color="primary" />
            </button>

            <div className={styles.sidebar_header}>
                <SidebarHeader />
            </div>
            
            <ul className={styles.sidebar_list}>
                <li>
                    <NavLink to="/" className={styles.nav_link}>
                        <Icon icon={<House />} size="small" color="primary" />
                        {t('home')}
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/books" className={styles.nav_link}>
                        <Icon icon={<BookMarked />} size="small" color="primary" />
                        {t('read')}
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/favorites" className={styles.nav_link}>
                        <Icon icon={<Star />} size="small" color="primary" />
                        {t('favorites')}
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/notes" className={styles.nav_link}>
                        <Icon icon={<NotebookPen />} size="small" color="primary" />
                        {t('notes')}
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/ai" className={styles.nav_link}>
                        <Icon icon={<Brain />} size="small" color="primary" />
                        {t('ia')}
                    </NavLink>
                </li>
            </ul>
            
            <div className={styles.sidebar_footer}>
                <SidebarFooter />
            </div>
        </div>
        
    );
}

export default Sidebar;