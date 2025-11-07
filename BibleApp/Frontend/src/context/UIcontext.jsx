import { createContext, useState } from "react";

const UIcontext = createContext();

function UIcontextProvider({ children }) {
    const [isOpen, setIsOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState(null); // ← Guardar la acción pendiente

    const handleOpenModal = (action) => {
        setPendingAction(() => action); // ← Guardar la acción
        setIsOpen(true);
    };

    const handleCloseModal = () => {
        setPendingAction(null); // ← Limpiar la acción
        setIsOpen(false);
    };

    const handleConfirmAction = () => {
        if (pendingAction) {
            pendingAction(); // ← Ejecutar la acción guardada
        }
        handleCloseModal();
    };

    const value = {
        isOpen,
        handleOpenModal,    // ← Ahora recibe la acción
        handleCloseModal,
        handleConfirmAction
    };

    return (
        <UIcontext.Provider value={value}>
            {children}
        </UIcontext.Provider>
    );
}

export { UIcontextProvider, UIcontext };