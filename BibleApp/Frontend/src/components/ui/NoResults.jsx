import styles from "../../styles/NoResults.module.css";
import Icon from "./Icon";
import { SearchX } from "lucide-react";

function NoResults() {
    return (
        <div className={styles.ctn_no_results}>
            <Icon icon={<SearchX />} size="large"/>
            <div className={styles.ctn_text}>
                <p>No results found</p>
                <p>Try again with different keywords</p>
            </div>
        </div>
    );
}

export default NoResults;
