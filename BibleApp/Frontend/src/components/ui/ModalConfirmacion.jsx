import { useState } from 'react';
import './ModalConfirmacion.css';
import { useUIStore } from '../../store/UIStore';

function ModalConfirmacion() {
    const { isOpen, handleCloseModal, handleConfirmAction } = useUIStore();
    
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Confirmar Eliminación</h3>
                </div>
                
                <div className="modal-body">
                    <p>¿Estás seguro de que quieres eliminar este elemento?</p>
                    <div className="warning-message">
                        ⚠️ Esta acción es irreversible
                    </div>
                </div>
                
                <div className="modal-footer">
                    <button 
                        className="btn-cancel"
                        onClick={handleCloseModal} // ← Cerrar sin confirmar
                    >
                        Cancelar
                    </button>
                    <button 
                        className="btn-confirm btn-danger"
                        onClick={handleConfirmAction} // ← Confirmar y ejecutar acción
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ModalConfirmacion;