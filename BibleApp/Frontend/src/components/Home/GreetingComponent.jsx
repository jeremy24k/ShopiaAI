import getGreeting from "../../utils/GetGreeting";
import { useState, useEffect } from "react";
import styles from "../../styles/greetings.module.css"; // <- .module.css

function GreetingComponent() {
    const [greeting, setGreeting] = useState("");
    
    useEffect(() => {
        getGreeting(setGreeting);
    }, []);

    return (
        <div className={styles.greeting_container}>
            <h1 className={styles.greeting}>
                {greeting} <span>[User]</span>
            </h1>
            <p>Que tu estudio de hoy llene tu corazón de sabiduría y paz, y que su luz guíe tus pasos en este nuevo día.</p>
        </div>
    );
}

export default GreetingComponent;