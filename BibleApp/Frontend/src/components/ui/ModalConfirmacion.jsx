import { useState } from 'react';
import './ModalConfirmacion.css';

function ModalConfirmacion({ 
    isOpen, 
    onClose, 
    handleConfirm, 
    type = 'danger'
}) {
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
                        onClick={onClose}
                    >
                        cancelar
                    </button>
                    <button 
                        className={`btn-confirm btn-${type}`}
                        onClick={handleConfirm}
                    >
                        confirmar
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ModalConfirmacion;