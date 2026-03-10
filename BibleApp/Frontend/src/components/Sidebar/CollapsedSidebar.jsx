import { NavLink } from "react-router-dom";
import Icon from "../ui/Icon";
import { House, BookMarked, Star, NotebookPen, Brain, ChevronRight, Settings } from "lucide-react";
import styles from "../../styles/Sidebar.module.css";
import { useTranslation } from '../../hooks/useTranslation';
import { useState } from "react";
import SettingsModal from "../ui/SettingsModal";

function CollapsedSidebar({ onExpand, isTablet }) {
    const { t } = useTranslation();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    return (
        <>
            <aside className={styles.sidebar_collapsed} role="navigation" aria-label={t('aria_main_navigation')}>
                {!isTablet && (
                    <button 
                        className={styles.expand_button}
                        onClick={onExpand}
                        aria-label={t('expand_sidebar')}
                    >
                        <Icon icon={<ChevronRight />} size="small" color="primary" aria-hidden="true" />
                    </button>
                )}
                <ul className={styles.collapsed_list}>
                    <li>
                        <NavLink to="/" className={styles.collapsed_link} aria-label={t('home')}>
                            <Icon icon={<House />} size="small" color="primary" aria-hidden="true" />
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/books" className={styles.collapsed_link} aria-label={t('read')}>
                            <Icon icon={<BookMarked />} size="small" color="primary" aria-hidden="true" />
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/favorites" className={styles.collapsed_link} aria-label={t('favorites')}>
                            <Icon icon={<Star />} size="small" color="primary" aria-hidden="true" />
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/notes" className={styles.collapsed_link} aria-label={t('notes')}>
                            <Icon icon={<NotebookPen />} size="small" color="primary" aria-hidden="true" />
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/ai" className={styles.collapsed_link} aria-label={t('ia')}>
                            <Icon icon={<Brain />} size="small" color="primary" aria-hidden="true" />
                        </NavLink>
                    </li>
                </ul>

                <div className={styles.collapsed_footer}>
                    <button 
                        className={styles.collapsed_settings_button}
                        onClick={() => setIsSettingsOpen(true)}
                        aria-label={t('settings')}
                    >
                        <Icon icon={<Settings />} size="small" color="primary" aria-hidden="true" />
                    </button>
                </div>
            </aside>

            <SettingsModal 
                isOpen={isSettingsOpen} 
                onClose={() => setIsSettingsOpen(false)} 
            />
        </>
    );
}

export default CollapsedSidebar;
