import { useEffect, useRef } from 'react';
import styles from "../../styles/ChapterNavigation.module.css";
import { ArrowLeft, ArrowRight } from "lucide-react";
import scrollToTop from "../../utils/ScrollToTop";
import Icon from "../../components/ui/Icon";
import SkeletonLoader from "../../components/ui/SkeletonLoader"

function ChapterNavigation({ chapterNumber, setChapterNumber, numberOfChapters }) {
    chapterNumber = parseInt(chapterNumber);
    const limitRef = useRef(numberOfChapters);

    useEffect(() => {
        if (numberOfChapters && numberOfChapters !== limitRef.current) {
            limitRef.current = numberOfChapters;
        }
    }, [numberOfChapters]);

    const limit = limitRef.current;

    // Scroll cuando chapterNumber cambia
    useEffect(() => {
        scrollToTop();
    }, [chapterNumber]);

    function handlePreviousClick() {
        if (chapterNumber <= 1) return;
        setChapterNumber(chapterNumber - 1);
    }

    function handleNextClick() {
        if (chapterNumber >= limit) return;
        setChapterNumber(chapterNumber + 1);
    }

    if (limit == null) {
        return (
            <div className={styles.chapter_navigation}>
                {/* Simular botón Previous (aprox 110px ancho x 36px alto) */}
                <SkeletonLoader 
                    variant="rectangular"
                    width="110px"
                    height="36px"
                />

                {/* Simular texto central (aprox 60px ancho x 24px alto) */}
                <SkeletonLoader 
                    variant="rectangular"
                    width="60px"
                    height="24px"
                />

                {/* Simular botón Next */}
                <SkeletonLoader
                    variant="rectangular"
                    width="110px"
                    height="36px" 
                />
            </div>
        );
    }

    return (
        <div className={styles.chapter_navigation}>
            <button className={styles.chapter_navigation_button} 
                    onClick={handlePreviousClick} 
                    disabled={chapterNumber <= 1}>
                <Icon icon={<ArrowLeft />} size="tiny" color="white" />
                Previous
            </button>

            <p className={styles.current_chapter}>{chapterNumber} / {limit}</p>

            <button className={styles.chapter_navigation_button} 
                    onClick={handleNextClick} 
                    disabled={chapterNumber >= limit}>
                Next
                <Icon icon={<ArrowRight />} size="tiny" color="white" />
            </button>
        </div>
    );
}

export default ChapterNavigation;