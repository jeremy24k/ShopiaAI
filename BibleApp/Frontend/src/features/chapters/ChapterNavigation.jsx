import { useEffect, useRef } from 'react';
import styles from "../../styles/ChapterNavigation.module.css";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { scrollToTop } from "../../utils";
import Icon from "../../components/ui/Icon";
import SkeletonLoader from "../../components/ui/SkeletonLoader";
import { useTranslation } from '../../hooks/useTranslation';

function ChapterNavigation({ chapterNumber, setChapterNumber, numberOfChapters }) {
    const { t } = useTranslation();
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
                    disabled={chapterNumber <= 1}
                    aria-label={t('previous_chapter')}>
                <Icon icon={<ArrowLeft />} size="tiny" color="white" />
                <span className={styles.button_text}>
                    {t('previous')}
                </span>
            </button>

            <p className={styles.current_chapter}>{chapterNumber} / {limit}</p>

            <button className={styles.chapter_navigation_button} 
                    onClick={handleNextClick} 
                    disabled={chapterNumber >= limit}
                    aria-label={t('next_chapter')}>
                <span className={styles.button_text}>
                    {t('next')}
                </span>
                <Icon icon={<ArrowRight />} size="tiny" color="white" />
            </button>
        </div>
    );
}

export default ChapterNavigation;