import styles from '../../styles/InsufficientCreditsModal.module.css';

function InsufficientCreditsModal({ onClose, onBuyCredits, currentCredits, required }) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.icon}>⚠️</div>
        <h2>Créditos Insuficientes</h2>
        <p>
          Necesitas <strong>{required}</strong> créditos para esta acción.
          <br />
          Actualmente tienes <strong>{currentCredits}</strong> créditos.
        </p>
        <div className={styles.actions}>
          <button className={styles.buyButton} onClick={onBuyCredits}>
            💎 Comprar Créditos
          </button>
          <button className={styles.cancelButton} onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export default InsufficientCreditsModal;