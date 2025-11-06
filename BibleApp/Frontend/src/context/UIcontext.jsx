import { createContext, useState, useEffect, useContext } from "react";

const UIcontext = createContext();

function UIcontextProvider({ children }) {
    const [ModalIsOpen, setModalIsOpen] = useState(false);
    const [Action, setAction] = useState(false);

    const handleConfirm = () => {
        setModalIsOpen(false);
        setAction(true);
    };

    const handleCancel = () => {
        setModalIsOpen(false);
        setAction(false);
    };

    return (
        <UIcontext.Provider value={{ ModalIsOpen, setModalIsOpen, Action, setAction, handleConfirm, handleCancel }}>
            {children}
        </UIcontext.Provider>
    );
}

export { UIcontext, UIcontextProvider };