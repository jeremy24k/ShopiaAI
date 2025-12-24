import styles from "../../styles/NoResults.module.css";
import Icon from "./Icon";
import { SearchX } from "lucide-react";
import { Link } from "react-router-dom";
import { useBooksStore } from '../../store/BooksStore';
import { useTranslation } from '../../hooks/useTranslation';

function NoResults({
    text = "no_results_found",
    subText = "try_different_keywords",
    link = false,
    linkText = "",
    linkURL
}) {
    const { t } = useTranslation();
    // Obtener filtros actuales del store (Zustand Persist los mantiene automáticamente)
    const selectedCategory = useBooksStore(state => state.selectedCategory);
    const selectedTestament = useBooksStore(state => state.selectedTestament);
    const selectedComplete = useBooksStore(state => state.selectedComplete);
    const searchQuery = useBooksStore(state => state.searchQuery);
    
    // Construir URL con filtros actuales
    const getUrlWithCurrentFilters = (path) => {
        const params = new URLSearchParams();
        if (selectedCategory.value !== 'all') params.set('category', selectedCategory.value);
        if (selectedTestament !== 'all') params.set('testament', selectedTestament);
        if (selectedComplete !== 'all') params.set('complete', selectedComplete);
        if (searchQuery) params.set('search', searchQuery);
        
        return params.toString() ? `${path}?${params.toString()}` : path;
    };

    return (
        <div className={styles.ctn_no_results}>
            <Icon icon={<SearchX />} size="large"/>
            <div className={styles.ctn_text}>
                {text && <p>{t(text)}</p>}
                {subText && <p>{t(subText)}</p>}
            </div>
            
            {link &&
                <Link to={getUrlWithCurrentFilters(linkURL)}>{linkText}</Link>
            }
        </div>
    );
}

export default NoResults;
