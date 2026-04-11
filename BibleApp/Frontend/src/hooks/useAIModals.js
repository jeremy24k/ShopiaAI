import { useState } from 'react';

export function useAIModals() {
    const [showModeModal, setShowModeModal] = useState(false);
    const [showContextModal, setShowContextModal] = useState(false);
    const [showHistorialSidebar, setShowHistorialSidebar] = useState(false);
    const [showCreditStore, setShowCreditStore] = useState(false);
    const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] = useState(false);

    const openHistorialSidebar = (value) => {
        setShowHistorialSidebar(value);
    };

    return {
        // State
        showModeModal,
        showContextModal,
        showHistorialSidebar,
        showCreditStore,
        showInsufficientCreditsModal,
        
        // Actions
        setShowModeModal,
        setShowContextModal,
        setShowHistorialSidebar,
        setShowCreditStore,
        setShowInsufficientCreditsModal,
        openHistorialSidebar,
    };
}
