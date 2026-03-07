import styles from "../../styles/Search.module.css";
import { Search, X } from "lucide-react";
import IconButton from "../../components/ui/IconButton";
import { useTranslation } from '../../hooks/useTranslation';

function SearchComponent( {handleSearchSubmit, searchQuery, setSearchQuery, clearSearch, placeholder}) {
    const { t } = useTranslation();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (handleSearchSubmit) {
            handleSearchSubmit(e);
        }
    };

    return (
        <div className={styles.ctn_search}>
            <form onSubmit={handleSubmit} className={styles.ctn_form}>
                <div className={styles.ctn_input}>
                    <Search className={styles.searchIcon} size={20} />
                    <input 
                        type="text" 
                        placeholder={placeholder || t('filter_placeholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={styles.input}
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