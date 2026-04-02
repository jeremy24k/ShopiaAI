import { useState, useEffect } from 'react';

const ONBOARDING_KEY = 'shopia_onboarding_done';

/**
 * Simple hook that determines if the onboarding modal should be shown.
 * Returns { showOnboarding, completeOnboarding }
 */
function useOnboarding(user) {
    const [showOnboarding, setShowOnboarding] = useState(false);

    useEffect(() => {
        if (!user) {
            setShowOnboarding(false);
            return;
        }

        const done = localStorage.getItem(ONBOARDING_KEY);
        if (!done) {
            // Small delay to let the layout render first
            const timer = setTimeout(() => {
                setShowOnboarding(true);
            }, 600);
            return () => clearTimeout(timer);
        }
    }, [user]);

    const completeOnboarding = () => {
        setShowOnboarding(false);
    };

    return { showOnboarding, completeOnboarding };
}

export default useOnboarding;
