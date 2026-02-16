import styles from "../styles/RouteError.module.css";
import { Link } from "react-router-dom";

function RouteError() {
    return (
        <div className={styles.notFound}>
            <div className={styles.content}>
                <h1>404 - Route Error</h1>
                <p>Sorry, the page you are looking for does not exist, check the URL or try again.</p>
                <Link to="/">Go back to home</Link>
            </div>
        </div>
    );
}

export default RouteError;
