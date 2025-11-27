import { useState, useEffect } from 'react';
import { useNotesStore } from '../../store/NotesStore';

function Notification({ message = '', isError = false }) {
    const { setNotificationMessage } = useNotesStore();
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (!message) return;
        const timer = setTimeout(() => {
            setIsVisible(false);
            setNotificationMessage({message: '', isError: false});
        }, 3000); 

        return () => clearTimeout(timer);
    }, [message]);

    if (!isVisible) return null;

    return (
        <div className={`notification ${isError ? 'error' : 'success'}`}>
            <p>{message}</p>
        </div>
    );
}

export default Notification;