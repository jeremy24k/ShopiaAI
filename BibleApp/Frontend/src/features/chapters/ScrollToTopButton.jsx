import styles from "../../styles/ChapterContent.module.css";
import Icon from "../../components/ui/Icon";
import { ArrowUp } from "lucide-react";
import scrollToTop from "../../utils/ScrollToTop";

function ScrollToTopButton({ showScrollTop }) {
    return (
        <button 
            className={`${styles.scroll_top_btn} ${showScrollTop ? styles.visible : ''}`} 
            onClick={scrollToTop}
            aria-label="Scroll to top"
        >
            <Icon icon={<ArrowUp />} size="small" color="white" />
        </button>
    );
}

export default ScrollToTopButton;
