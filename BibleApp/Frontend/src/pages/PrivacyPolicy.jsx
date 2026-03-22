import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import styles from '../styles/LegalPage.module.css';

function PrivacyPolicy() {
    const { language } = useTranslation();
    const lastUpdated = language === 'en' ? 'March 2026' : 'Marzo 2026';

    const isEn = language === 'en';

    return (
        <div className={styles.container}>
            <div className={styles.inner}>
                <Link to="/" className={styles.backLink}>
                    <ArrowLeft size={16} />
                    {isEn ? 'Back to home' : 'Volver al inicio'}
                </Link>

                <div className={styles.header}>
                    <span className={styles.badge}>Legal</span>
                    <h1 className={styles.title}>
                        {isEn ? 'Privacy Policy' : 'Política de Privacidad'}
                    </h1>
                    <p className={styles.meta}>
                        {isEn ? 'Last updated: ' : 'Última actualización: '}{lastUpdated}
                    </p>
                </div>

                <div className={styles.content}>
                    <div className={styles.section}>
                        <div className={styles.highlight}>
                            <p>
                                {isEn
                                    ? 'SophiaBible is committed to protecting your privacy. This policy explains what data I collect, how I use it, and the third-party services I rely on.'
                                    : 'SophiaBible está comprometida con la protección de tu privacidad. Esta política explica qué datos recopilo, cómo los uso y los servicios de terceros en los que me apoyo.'}
                            </p>
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h2>{isEn ? '1. Data I Collect' : '1. Datos que recopilo'}</h2>
                        <p>
                            {isEn
                                ? 'When you create an account and use SophiaBible, I collect the following information:'
                                : 'Cuando creas una cuenta y usas SophiaBible, recopilo la siguiente información:'}
                        </p>
                        <ul>
                            <li>{isEn ? 'Email address and name (for account creation)' : 'Dirección de email y nombre (para la creación de cuenta)'}</li>
                            <li>{isEn ? 'AI chat conversation history' : 'Historial de conversaciones con la IA'}</li>
                            <li>{isEn ? 'Personal notes you create on Bible verses' : 'Notas personales que creas sobre versículos bíblicos'}</li>
                            <li>{isEn ? 'Favorite verses and reading progress (chapters read, streak)' : 'Versículos favoritos y progreso de lectura (capítulos leídos, racha)'}</li>
                            <li>{isEn ? 'Credit balance and transaction history for AI credit purchases' : 'Saldo de créditos e historial de transacciones para compras de créditos de IA'}</li>
                        </ul>
                    </div>

                    <div className={styles.section}>
                        <h2>{isEn ? '2. How I Use Your Data' : '2. Cómo uso tus datos'}</h2>
                        <ul>
                            <li>{isEn ? 'To authenticate you and keep your account secure' : 'Para autenticarte y mantener tu cuenta segura'}</li>
                            <li>{isEn ? 'To save and sync your notes, favorites, and reading progress across devices' : 'Para guardar y sincronizar tus notas, favoritos y progreso en tus dispositivos'}</li>
                            <li>{isEn ? 'To process AI requests and manage your credit balance' : 'Para procesar solicitudes de IA y gestionar tu saldo de créditos'}</li>
                            <li>{isEn ? 'To process payments securely through PayPal' : 'Para procesar pagos de forma segura a través de PayPal'}</li>
                        </ul>
                        <p>
                            {isEn
                                ? 'I do not sell your personal data to third parties.'
                                : 'No vendo tus datos personales a terceros.'}
                        </p>
                    </div>

                    <div className={styles.section}>
                        <h2>{isEn ? '3. Third-Party Services' : '3. Servicios de terceros'}</h2>
                        <p>{isEn ? 'SophiaBible uses the following third-party services to operate:' : 'SophiaBible usa los siguientes servicios de terceros para funcionar:'}</p>
                        <ul>
                            <li>
                                <strong>Supabase</strong> — {isEn
                                    ? 'Provides authentication, database storage (notes, favorites, conversations, credits), and security. Your data is stored on Supabase servers.'
                                    : 'Provee autenticación, almacenamiento en base de datos (notas, favoritos, conversaciones, créditos) y seguridad. Tus datos se almacenan en los servidores de Supabase.'}
                            </li>
                            <li>
                                <strong>DeepSeek AI</strong> — {isEn
                                    ? 'Processes your AI chat messages to generate responses. Messages are sent to DeepSeek API and are subject to their privacy policy.'
                                    : 'Procesa tus mensajes de chat de IA para generar respuestas. Los mensajes se envían a la API de DeepSeek y están sujetos a su política de privacidad.'}
                            </li>
                            <li>
                                <strong>PayPal</strong> — {isEn
                                    ? 'Processes credit package payments. I do not store your payment card information; PayPal handles all payment data.'
                                    : 'Procesa los pagos de paquetes de créditos. No almaceno tu información de tarjeta de pago; PayPal maneja todos los datos de pago.'}
                            </li>
                            <li>
                                <strong>Bible API (bible.helloao.org)</strong> — {isEn
                                    ? 'Provides Bible translations and text content. No personal data is shared with this service.'
                                    : 'Provee traducciones y contenido bíblico. No se comparten datos personales con este servicio.'}
                            </li>
                        </ul>
                    </div>

                    <div className={styles.section}>
                        <h2>{isEn ? '4. Data Retention & Deletion' : '4. Retención y eliminación de datos'}</h2>
                        <p>
                            {isEn
                                ? 'Your data is retained as long as your account is active. You have full control over your data and can delete your account at any time directly from the app.'
                                : 'Tus datos se conservan mientras tu cuenta esté activa. Tienes control total sobre tus datos y puedes eliminar tu cuenta en cualquier momento directamente desde la aplicación.'}
                        </p>
                        <p>
                            {isEn
                                ? 'To delete your account, go to your Account Settings and click "Delete Account". This action will permanently delete:'
                                : 'Para eliminar tu cuenta, ve a Configuración de Cuenta y haz clic en "Eliminar Cuenta". Esta acción eliminará permanentemente:'}
                        </p>
                        <ul>
                            <li>{isEn ? 'All your AI conversations and chat history' : 'Todas tus conversaciones con la IA e historial de chat'}</li>
                            <li>{isEn ? 'All your personal notes on Bible verses' : 'Todas tus notas personales sobre versículos bíblicos'}</li>
                            <li>{isEn ? 'All your favorite verses' : 'Todos tus versículos favoritos'}</li>
                            <li>{isEn ? 'Your reading progress and streak data' : 'Tu progreso de lectura y datos de racha'}</li>
                            <li>{isEn ? 'All your credits and transaction history' : 'Todos tus créditos e historial de transacciones'}</li>
                            <li>{isEn ? 'Your account and authentication data' : 'Tu cuenta y datos de autenticación'}</li>
                        </ul>
                        <p>
                            {isEn
                                ? 'Account deletion is immediate and permanent. This action cannot be undone. If you need assistance, you can contact me at:'
                                : 'La eliminación de cuenta es inmediata y permanente. Esta acción no se puede deshacer. Si necesitas ayuda, puedes contactarme en:'}
                        </p>
                        <p>
                            <a href="mailto:sophiabibledev@gmail.com" className={styles.contactLink}>
                                sophiabibledev@gmail.com
                            </a>
                        </p>
                    </div>

                    <div className={styles.section}>
                        <h2>{isEn ? '5. Cookies & Local Storage' : '5. Cookies y Almacenamiento Local'}</h2>
                        <p>
                            {isEn
                                ? 'SophiaBible uses browser localStorage to save your preferences (theme, language) and session data. No advertising or tracking cookies are used.'
                                : 'SophiaBible usa el localStorage del navegador para guardar tus preferencias (tema, idioma) y datos de sesión. No se usan cookies de publicidad ni de seguimiento.'}
                        </p>
                    </div>

                    <div className={styles.section}>
                        <h2>{isEn ? '6. Contact' : '6. Contacto'}</h2>
                        <p>
                            {isEn
                                ? 'For any privacy-related questions or data requests, email me at:'
                                : 'Para cualquier pregunta relacionada con la privacidad o solicitudes de datos, escríbeme a:'}
                        </p>
                        <p>
                            <a href="mailto:sophiabibledev@gmail.com" className={styles.contactLink}>
                                sophiabibledev@gmail.com
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PrivacyPolicy;
