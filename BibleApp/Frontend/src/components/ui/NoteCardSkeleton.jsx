import SkeletonLoader from "./SkeletonLoader";
import styles from "../../pages/Notes.module.css";

function NoteCardSkeleton() {
    return (
        <div className={styles.noteCard}>
            <div className={styles.noteHeader}>
                <div className={styles.noteReference}>
                    <SkeletonLoader
                        variant="text"
                        width="60%"
                        height="24px"
                    />
                    <SkeletonLoader
                        variant="text"
                        width="80px"
                        height="16px"
                        margin="8px 0 0 0"
                    />
                </div>
                <SkeletonLoader
                    variant="rectangular"
                    width="36px"
                    height="36px"
                />
            </div>

            <div style={{ marginBottom: 'var(--spacing-400)' }}>
                <SkeletonLoader
                    variant="text"
                    width="100%"
                    height="20px"
                />
                <SkeletonLoader
                    variant="text"
                    width="95%"
                    height="20px"
                    margin="8px 0 0 0"
                />
                <SkeletonLoader
                    variant="text"
                    width="85%"
                    height="20px"
                    margin="8px 0 0 0"
                />
            </div>

            <div className={styles.noteFooter}>
                <SkeletonLoader
                    variant="rectangular"
                    width="48%"
                    height="36px"
                />
                <SkeletonLoader
                    variant="rectangular"
                    width="48%"
                    height="36px"
                />
            </div>
        </div>
    );
}

export default NoteCardSkeleton;
