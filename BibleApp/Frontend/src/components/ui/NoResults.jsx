import styles from "../../styles/NoResults.module.css";
import Icon from "./Icon";
import { SearchX } from "lucide-react";
import { Link } from "react-router-dom";
import useUpdateFilterUrl from '../Hooks/useUpdateFilterUrl';


function NoResults({
    text = "No results found",
    subText = "Try again with different keywords",
    link = false,
    linkText = "",
    linkURL
}) {
    const { getUrlWithCurrentFilters } = useUpdateFilterUrl();

    return (
        <div className={styles.ctn_no_results}>
            <Icon icon={<SearchX />} size="large"/>
            <div className={styles.ctn_text}>
                {text && <p>{text}</p>}
                {subText && <p>{subText}</p>}
            </div>
            
            {link &&
                <Link to={getUrlWithCurrentFilters(linkURL)}>{linkText}</Link>
            }
        </div>
    );
}

export default NoResults;
