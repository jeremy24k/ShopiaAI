import styles from "../../styles/Search.module.css";
import { Search, X } from "lucide-react";
import IconButton from "../../components/ui/IconButton";
import { useTranslation } from '../../hooks/useTranslation';

function SearchComponent( {handleSearchSubmit, searchQuery, setSearchQuery, clearSearch, placeholder}) {
    const { t } = useTranslation();

    return (
        <div className={styles.ctn_search}>
            <form onSubmit={handleSearchSubmit} className={styles.ctn_form}>
                <div className={styles.ctn_input}>
                    <input 
                        type="text" 
                        placeholder={placeholder || t('filter_placeholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={styles.input}
                    />
                    <IconButton 
                        onClick={handleSearchSubmit} 
                        type="submit"
                        icon={Search}
                        size="medium"
                        iconSize="large"
                        variant="primary"
                        circle={true}
                    />
                </div>
                {searchQuery && (
                    <IconButton 
                        onClick={clearSearch} 
                        type="button"
                        size="medium"
                        iconSize="large"
                        variant="ghost"
                        circle={true}
                        icon={X}
                    />
                )}
            </form>
        </div>
    );
}

export default SearchComponent;