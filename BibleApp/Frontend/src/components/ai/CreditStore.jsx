import { useState, useEffect } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { X, Zap, BookOpen, Crown, Check, ChevronLeft, Leaf } from 'lucide-react';
import { useAuthStore } from '../../store/AuthStore';
import { useCredits } from '../../store/useCredits';
import { getAuthHeaders } from '../../utils/api';
import { useTranslation } from '../../hooks/useTranslation';
import SkeletonLoader from '../ui/SkeletonLoader';
import styles from '../../styles/CreditStore.module.css';

const BASE_URL = import.meta.env.VITE_API_URL;
const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;

// Metadatos locales por paquete (icon + features)
const PACKAGE_META = {
    starter: {
        icon: <Leaf size={28} />,
        color: '#10b981',
        featuresKey: 'credits_starter_features',
    },
    basic: {
        icon: <Zap size={28} />,
        color: 'var(--color-grey-600)',
        featuresKey: 'credits_basic_features',
    },
    premium: {
        icon: <BookOpen size={28} />,
        color: 'var(--primary-color)',
        featuresKey: 'credits_premium_features',
    },
    unlimited: {
        icon: <Crown size={28} />,
        color: '#f59e0b',
        featuresKey: 'credits_unlimited_features',
    },
};

function CreditStore({ onClose }) {
    const { user } = useAuthStore();
    const { fetchCredits } = useCredits();
    const { t, language } = useTranslation();
    const isEs = language === 'es';

    const [packages, setPackages] = useState([]);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${BASE_URL}/payments/packages`);
            const data = await response.json();
            if (data.packages && Array.isArray(data.packages)) {
                setPackages(data.packages);
                setLoading(false);
            } else {
                setError(t('credits_load_error'));
                setLoading(false);
            }
        } catch {
            setError(t('credits_load_error'));
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    const createOrder = async () => {
        try {
            const authHeaders = await getAuthHeaders();
            const response = await fetch(`${BASE_URL}/payments/create-order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeaders },
                body: JSON.stringify({ packageId: selectedPackage.id, userId: user.id }),
            });
            const order = await response.json();
            if (!response.ok || !order.orderID) throw new Error(order.error || 'Error fetching order ID');
            return order.orderID;
        } catch (err) {
            setError(t('credits_order_error'));
            throw err;
        }
    };

    const onApprove = async (data) => {
        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/payments/capture-order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderID: data.orderID }),
            });
            const result = await response.json();
            if (!response.ok || !result.success) {
                setError(result.error || t('credits_payment_error'));
                return;
            }
            setSuccessMsg(
                isEs
                    ? `¡Listo! Recibiste ${result.credits} créditos 🎉`
                    : `Done! You received ${result.credits} credits 🎉`
            );
            await fetchCredits();
            setTimeout(onClose, 2500);
        } catch {
            setError(t('credits_payment_error'));
        } finally {
            setLoading(false);
        }
    };

    const onPaypalError = () => setError(t('credits_paypal_error'));

    if (!user) {
        return (
            <div className={styles.overlay} onClick={onClose}>
                <div className={styles.creditStore} onClick={(e) => e.stopPropagation()}>
                    <p className={styles.needLogin}>{t('credits_need_login')}</p>
                    <button onClick={onClose} className={styles.backButton}>{t('close_button')}</button>
                </div>
            </div>
        );
    }

    return (
        <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency: 'USD' }}>
            <div className={styles.overlay} onClick={onClose}>
                <div className={styles.creditStore} onClick={(e) => e.stopPropagation()}>

                    {/* Header */}
                    <div className={styles.storeHeader}>
                        <div className={styles.storeHeaderText}>
                            <h2>{t('credits_store_title')}</h2>
                            <p>{t('credits_store_subtitle')}</p>
                        </div>
                        <button className={styles.closeButton} onClick={onClose} title={t('close_button')}>
                            <X size={20} />
                        </button>
                    </div>

                    {/* Success */}
                    {successMsg && <div className={styles.success}>{successMsg}</div>}

                    {/* Error */}
                    {error && <div className={styles.error}>{error}</div>}

                    {!selectedPackage ? (
                        <>
                            {/* Daily credits reminder */}
                            <p className={styles.dailyNote}>
                                {t('credits_daily_note')}
                            </p>

                            <div className={styles.packagesGrid}>
                                {loading ? (
                                    <SkeletonLoader count={4} gap='16px' variant="rectangular" width="100%" height="400px" direction="row"/>
                                ) : (
                                    packages.map((pkg) => {
                                        const meta = PACKAGE_META[pkg.name] || {};
                                        const features = t(meta.featuresKey) || [];
                                        const perCredit = (pkg.price / pkg.credits).toFixed(3);
                                        return (
                                            <div
                                                key={pkg.id}
                                                className={`${styles.packageCard} ${pkg.popular ? styles.popular : ''}`}
                                            >
                                                {pkg.popular && (
                                                    <span className={styles.badge}>{t('credits_most_popular')}</span>
                                                )}

                                                {/* Icon */}
                                                <div className={styles.packageIcon} style={{ color: meta.color }}>
                                                    {meta.icon}
                                                </div>

                                                {/* Name */}
                                                <h3>{t(`credits_pkg_${pkg.name}_name`) || pkg.name}</h3>

                                                {/* Credits big */}
                                                <div className={styles.credits}>
                                                    {pkg.credits}
                                                    <span>{t('credits_label')}</span>
                                                </div>

                                                {/* Price */}
                                                <div className={styles.price}>${pkg.price} <span>USD</span></div>

                                                {/* Per-credit rate */}
                                                <div className={styles.perCredit}>
                                                    ${perCredit} {t('credits_per_credit')}
                                                </div>

                                                {/* Features */}
                                                {Array.isArray(features) && features.length > 0 && (
                                                    <ul className={styles.featureList}>
                                                        {features.map((f, i) => (
                                                            <li key={i}>
                                                                <Check size={14} />
                                                                {f}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}

                                                <button
                                                    onClick={() => setSelectedPackage(pkg)}
                                                    className={styles.selectButton}
                                                >
                                                    {t('credits_select')}
                                                </button>
                                            </div>
                                        );
                                    })
                                )}  {/* ← Aquí faltaba cerrar el paréntesis del operador ternario */}
                            </div>

                            {/* Footer note */}
                            <p className={styles.footerNote}>{t('credits_footer_note')}</p>
                        </>
                    ) : (
                        <div className={styles.checkout}>
                            <div className={styles.selectedPackage}>
                                <div className={styles.selectedIcon} style={{ color: PACKAGE_META[selectedPackage.name.toLowerCase()]?.color }}>
                                    {PACKAGE_META[selectedPackage.name]?.icon}
                                </div>
                                <h3>{t(`credits_pkg_${selectedPackage.name}_name`) || selectedPackage.name}</h3>
                                <p>
                                    {selectedPackage.credits} {t('credits_label')} — ${selectedPackage.price} USD
                                </p>
                            </div>

                            {loading ? (
                                <div className={styles.loading}>{t('credits_processing')}</div>
                            ) : (
                                <PayPalButtons
                                    createOrder={createOrder}
                                    onApprove={onApprove}
                                    onError={onPaypalError}
                                    style={{ layout: 'vertical', shape: 'rect', label: 'pay' }}
                                />
                            )}

                            <button onClick={() => setSelectedPackage(null)} className={styles.backButton}>
                                <ChevronLeft size={16} />
                                {t('credits_back')}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </PayPalScriptProvider>
    );
}

export default CreditStore;