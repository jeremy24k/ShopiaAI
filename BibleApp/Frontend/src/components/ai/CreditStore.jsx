import { useState, useEffect } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useAuthStore } from '../../store/AuthStore';
import { useCredits } from '../../store/useCredits';
import { getAuthHeaders } from '../../utils/authHeaders';
import styles from '../../styles/CreditStore.module.css';

const BASE_URL = import.meta.env.VITE_API_URL;
const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;

function CreditStore({ onClose }) {
  const { user } = useAuthStore();
  const { fetchCredits } = useCredits();
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
        const response = await fetch(`${BASE_URL}/payments/packages`);
        const data = await response.json();
        
        console.log('📦 Packages fetched:', data);
        
        if (data.packages && Array.isArray(data.packages)) {
        setPackages(data.packages);
        } else {
        console.error('❌ Invalid packages format:', data);
        setError('Error al cargar paquetes');
        }
    } catch (error) {
        console.error('❌ Error fetching packages:', error);
        setError('Error al cargar paquetes');
    }
  };

  const createOrder = async (data, actions) => {
    try {
      const authHeaders = await getAuthHeaders();
      const response = await fetch(`${BASE_URL}/payments/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          packageId: selectedPackage.id,
          userId: user.id
        })
      });

      const order = await response.json();
      
      if (!response.ok || !order.orderID) {
        throw new Error(order.error || 'Error fetching order ID from backend');
      }
      
      return order.orderID;
    } catch (error) {
      console.error('Error creating order:', error);
      setError('Error al crear orden');
      throw error;
    }
  };

  const onApprove = async (data, actions) => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/payments/capture-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderID: data.orderID })
      });

      const result = await response.json();

      // Verificar si la respuesta HTTP fue exitosa
      if (!response.ok) {
        console.error('❌ Error del backend:', result);
        setError(result.error || 'Error procesando el pago');
        return;
      }

      if (result.success) {
        alert(`✅ ¡Compra exitosa! Recibiste ${result.credits} créditos`);
        await fetchCredits(); // Actualizar balance
        onClose();
      } else {
        console.error('❌ Respuesta sin success:', result);
        setError(result.error || 'Error procesando el pago');
      }
    } catch (error) {
      console.error('❌ Error capturing order:', error);
      setError('Error al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  const onError = (err) => {
    console.error('PayPal error:', err);
    setError('Error con PayPal. Intenta de nuevo.');
  };

  if (!user) {
    return (
      <div className={styles.creditStore}>
        <h2>Inicia sesión para comprar créditos</h2>
        <button onClick={onClose} className={styles.closeButton}>Cerrar</button>
      </div>
    );
  }

  return (
    <PayPalScriptProvider options={{ 
      clientId: PAYPAL_CLIENT_ID,
      currency: "USD"
    }}>
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.creditStore} onClick={(e) => e.stopPropagation()}>
          <button className={styles.closeButton} onClick={onClose}>✕</button>
          
          <h2>💎 Comprar Créditos</h2>
          
          {error && <div className={styles.error}>{error}</div>}
          
          {!selectedPackage ? (
            <div className={styles.packagesGrid}>
              {packages.map(pkg => (
                <div 
                  key={pkg.id} 
                  className={`${styles.packageCard} ${pkg.popular ? styles.popular : ''}`}
                >
                  {pkg.popular && <span className={styles.badge}>⭐ Más Popular</span>}
                  <h3>{pkg.name}</h3>
                  <div className={styles.credits}>{pkg.credits} créditos</div>
                  <div className={styles.price}>${pkg.price} USD</div>
                  <p>{pkg.description}</p>
                  <button 
                    onClick={() => setSelectedPackage(pkg)}
                    className={styles.selectButton}
                  >
                    Seleccionar
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.checkout}>
              <div className={styles.selectedPackage}>
                <h3>Comprando: {selectedPackage.name}</h3>
                <p>{selectedPackage.credits} créditos por ${selectedPackage.price} USD</p>
              </div>
              
              {loading ? (
                <div className={styles.loading}>Procesando pago...</div>
              ) : (
                <PayPalButtons
                  createOrder={createOrder}
                  onApprove={onApprove}
                  onError={onError}
                  style={{ layout: 'vertical' }}
                />
              )}

              <button 
                onClick={() => setSelectedPackage(null)}
                className={styles.backButton}
              >
                ← Volver a paquetes
              </button>
            </div>
          )}
        </div>
      </div>
    </PayPalScriptProvider>
  );
}

export default CreditStore;