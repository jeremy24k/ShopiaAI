import styles from "../../styles/ChapterContent.module.css";
import SkeletonLoader from "../../components/ui/SkeletonLoader";
import Icon from "../../components/ui/Icon";
import { Check } from "lucide-react";
import CustomSelect from "../../components/ui/CustomSelect";
import getTranslationOptions from "../../utils/TranslationOptions";

function ChapterHeader({ 
    chapterLoading, 
    chapterData, 
    chapterError, 
    bookName, 
    chapterNumber, 
    isCompleted, 
    isBookUnavailable,
    selectedTranslation,
    translations,
    onTranslationChange,
    t
}) {
    const translationOptions = getTranslationOptions(translations);

    return (
        <header>
            <div className={styles.ctn_tlt}>
                <div className={styles.header_title_row}>
                    {(chapterLoading) ? (
                        <SkeletonLoader
                            variant="text"
                            width="250px"
                            height="40px"
                        />
                    ) : (
                        <h1 className={styles.book_name}>
                            {chapterError ? (
                                t('book_not_found')
                            ) : (
                                <>
                                    {bookName ? 
                                        bookName.toLowerCase() : 
                                        chapterData?.book?.name?.toLowerCase() || ''
                                    }
                                    {bookName || chapterData?.book?.name ? ` ${chapterNumber}` : ''}
                                </>
                            )}
                        </h1>
                    )}

                    {(!chapterLoading && chapterData && isCompleted && !isBookUnavailable) && (
                        <div className={styles.completed_badge}>
                            <span>
                                {t('completed')}
                            </span>
                            <Icon icon={<Check />} size="tiny" color="white" />
                        </div>
                    )}
                </div>
                <h2 className={styles.translation_name}>{selectedTranslation.label}</h2>
            </div>

            <div className={styles.ctn_translation_select}>
                <p>{t('select_other_translation')}</p>
                <CustomSelect
                    options={translationOptions}
                    value={selectedTranslation}
                    onChange={onTranslationChange}
                    placeholder="Select a translation"
                    generalPadding="4px 8px"
                    fixedMenuWidth={true}
                />
            </div>
        </header>
    );
}

export default ChapterHeader;
