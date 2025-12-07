import styles from "../../styles/Search.module.css";
import { Search, X } from "lucide-react";
import IconButton from "../ui/IconButton";

function SearchComponent( {handleSearchSubmit, searchQuery, setSearchQuery, clearSearch}) {
    return (
        <div className={styles.ctn_search}>
            <form onSubmit={handleSearchSubmit} className={styles.ctn_form}>
                <div className={styles.ctn_input}>
                    <input 
                        type="text" 
                        placeholder="Search books..." 
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