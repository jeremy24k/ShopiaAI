import styles from "../../styles/SkeletonLoader.module.css";

/**
 * SkeletonLoader - A reusable skeleton loading component with shimmer effect
 * 
 * @param {Object} props
 * @param {string} props.variant - Type of skeleton: 'text', 'circle', 'rectangular' (default: 'rectangular')
 * @param {string} props.width - Width of the skeleton (e.g., '100%', '200px', '50%')
 * @param {string} props.height - Height of the skeleton (e.g., '20px', '2rem')
 * @param {string} props.className - Additional CSS classes
 * @param {number} props.count - Number of skeleton lines to render (default: 1)
 * @param {string} props.gap - Gap between multiple skeleton lines (default: '8px')
 */
function SkeletonLoader({ 
    variant = 'rectangular', 
    width = '100%', 
    height = '20px',
    className = '',
    count = 1,
    gap = '8px'
}) {
    const getVariantClass = () => {
        switch (variant) {
            case 'text':
                return styles.skeleton_text;
            case 'circle':
                return styles.skeleton_circle;
            case 'rectangular':
            default:
                return styles.skeleton_rectangular;
        }
    };

    const skeletonStyle = {
        minWidth: width,
        minHeight: height,
        height: variant === 'circle' ? width : height, // Circle uses width for both dimensions
    };

    // If count > 1, render multiple skeletons
    if (count > 1) {
        return (
            <span className={styles.skeleton_group} style={{ gap }}>
                {Array.from({ length: count }).map((_, index) => (
                    <span
                        key={index}
                        className={`${styles.skeleton} ${getVariantClass()} ${className}`}
                        style={skeletonStyle}
                        aria-label="Loading..."
                        role="status"
                    />
                ))}
            </span>
        );
    }

    return (
        <span
            className={`${styles.skeleton} ${getVariantClass()} ${className}`}
            style={skeletonStyle}
            aria-label="Loading..."
            role="status"
        />
    );
}

export default SkeletonLoader;
