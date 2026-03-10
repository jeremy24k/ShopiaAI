import styles from "../../styles/ChapterContent.module.css";
import Icon from "../../components/ui/Icon";
import { ArrowUp } from "lucide-react";
import scrollToTop from "../../utils/ScrollToTop";
import { useTranslation } from '../../hooks/useTranslation';

function ScrollToTopButton({ showScrollTop }) {
    const { t } = useTranslation();
    return (
        <button 
            className={`${styles.scroll_top_btn} ${showScrollTop ? styles.visible : ''}`} 
            onClick={scrollToTop}
            aria-label={t('scroll_to_top')}
        >
            <Icon icon={<ArrowUp />} size="small" color="white" />
        </button>
    );
}

export default ScrollToTopButton;
