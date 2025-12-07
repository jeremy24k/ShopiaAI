
import { NavLink } from "react-router-dom";
import Icon from "../ui/Icon";
import SidebarHeader from "../Sidebar/SidebarHeader";
import SidebarFooter from "../Sidebar/SidebarFooter";
import { House, BookMarked, Star, NotebookPen, Brain } from "lucide-react";
import styles from "../../styles/Sidebar.module.css";

function Sidebar() {
    const savedFilters = localStorage.getItem('lastBooksFilters');
    const booksUrl = savedFilters && savedFilters.length > 0
        ? `/books?${savedFilters}`
        : '/books';
    
    return (
        <div className={styles.sidebar}>
            <div className={styles.sidebar_header}>
                <SidebarHeader />
            </div>
            <ul className={styles.sidebar_list}>
                <li>
                    <NavLink to="/" className={styles.nav_link}>
                        <Icon icon={<House />} size="small" color="primary" />
                        Home
                    </NavLink>
                </li>
                <li>
                    <NavLink to={booksUrl} className={styles.nav_link}>
                        <Icon icon={<BookMarked />} size="small" color="primary" />
                        Read
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/favorites" className={styles.nav_link}>
                        <Icon icon={<Star />} size="small" color="primary" />
                        Favorites
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/notes" className={styles.nav_link}>
                        <Icon icon={<NotebookPen />} size="small" color="primary" />
                        Notes
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/ai" className={styles.nav_link}>
                        <Icon icon={<Brain />} size="small" color="primary" />
                        AI
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