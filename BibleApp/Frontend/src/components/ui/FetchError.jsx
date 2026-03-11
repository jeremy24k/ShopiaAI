import { RefreshCw, WifiOff } from "lucide-react";
import styles from "../../styles/FetchError.module.css";

function FetchError({ message, onRetry }) {
    const handleRetry = () => {
        if (onRetry) {
            onRetry();
        } else {
            window.location.reload();
        }
    };

    return (
        <div className={styles.fetch_error}>
            <div className={styles.icon_container}>
                <WifiOff size={48} />
            </div>
            <h3>Something went wrong</h3>
            <p>
                {message || "We couldn't load the data. Please check your connection or try again."}
            </p>
            <button className={styles.retry_button} onClick={handleRetry}>
                <RefreshCw size={18} />
                Try Again
            </button>
        </div>
    );
}

export default FetchError;