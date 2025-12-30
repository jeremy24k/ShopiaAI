import { NavLink } from "react-router-dom";
import Icon from "../ui/Icon";
import { House, BookMarked, Star, NotebookPen, Brain, ChevronRight, Settings } from "lucide-react";
import styles from "../../styles/Sidebar.module.css";
import { useTranslation } from '../../hooks/useTranslation';
import { useState } from "react";
import SettingsModal from "../ui/SettingsModal";

function CollapsedSidebar({ onExpand }) {
    const { t } = useTranslation();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    return (
        <>
            <div className={styles.sidebar_collapsed}>
                <button 
                    className={styles.expand_button}
                    onClick={onExpand}
                    title={t('expand_sidebar') || 'Expandir'}
                >
                    <Icon icon={<ChevronRight />} size="small" color="primary" />
                </button>

                <ul className={styles.collapsed_list}>
                    <li>
                        <NavLink to="/" className={styles.collapsed_link} title={t('home')}>
                            <Icon icon={<House />} size="small" color="primary" />
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/books" className={styles.collapsed_link} title={t('read')}>
                            <Icon icon={<BookMarked />} size="small" color="primary" />
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/favorites" className={styles.collapsed_link} title={t('favorites')}>
                            <Icon icon={<Star />} size="small" color="primary" />
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/notes" className={styles.collapsed_link} title={t('notes')}>
                            <Icon icon={<NotebookPen />} size="small" color="primary" />
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/ai" className={styles.collapsed_link} title={t('ia')}>
                            <Icon icon={<Brain />} size="small" color="primary" />
                        </NavLink>
                    </li>
                </ul>

                <div className={styles.collapsed_footer}>
                    <button 
                        className={styles.collapsed_settings_button}
                        onClick={() => setIsSettingsOpen(true)}
                        title={t('settings') || 'Configuración'}
                    >
                        <Icon icon={<Settings />} size="small" color="primary" />
                    </button>
                </div>
            </div>

            <SettingsModal 
                isOpen={isSettingsOpen} 
                onClose={() => setIsSettingsOpen(false)} 
            />
        </>
    );
}

export default CollapsedSidebar;
