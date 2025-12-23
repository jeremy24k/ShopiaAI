
import { NavLink } from "react-router-dom";
import Icon from "../../components/ui/Icon";
import SidebarHeader from "../Sidebar/SidebarHeader";
import SidebarFooter from "../Sidebar/SidebarFooter";
import { House, BookMarked, Star, NotebookPen, Brain } from "lucide-react";
import styles from "../../styles/Sidebar.module.css";
import { useTranslation } from '../../hooks/useTranslation';

function Sidebar() {
    const { t } = useTranslation();

    return (
        <div className={styles.sidebar}>
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