import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import styles from '../styles/LegalPage.module.css';

function TermsOfService() {
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
                        {isEn ? 'Terms of Service' : 'Términos de Servicio'}
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
                                    ? 'SophiaBible is currently in public Beta. This means the service may change, and some features are still being refined. By using the app, you agree to these terms.'
                                    : 'SophiaBible se encuentra actualmente en Beta pública. Esto significa que el servicio puede cambiar y algunas funcionalidades aún están siendo mejoradas. Al usar la app, aceptas estos términos.'}
                            </p>
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h2>{isEn ? '1. Description of Service' : '1. Descripción del Servicio'}</h2>
                        <p>
                            {isEn
                                ? 'SophiaBible is a Bible study application that combines access to multiple Bible translations, personal notes, reading progress tracking, and an AI assistant powered by DeepSeek. The service requires account registration to use AI features.'
                                : 'SophiaBible es una aplicación de estudio bíblico que combina acceso a múltiples traducciones de la Biblia, notas personales, seguimiento del progreso de lectura y un asistente de IA impulsado por DeepSeek. El servicio requiere registro de cuenta para usar las funciones de IA.'}
                        </p>
                    </div>

                    <div className={styles.section}>
                        <h2>{isEn ? '2. Beta Status' : '2. Estado Beta'}</h2>
                        <p>
                            {isEn
                                ? 'SophiaBible is in public Beta. During this period:'
                                : 'SophiaBible se encuentra en Beta pública. Durante este período:'}
                        </p>
                        <ul>
                            <li>{isEn ? 'Features may change, be added, or be removed without prior notice' : 'Las funcionalidades pueden cambiar, añadirse o eliminarse sin previo aviso'}</li>
                            <li>{isEn ? 'The service may experience downtime or temporary unavailability' : 'El servicio puede experimentar interrupciones o falta de disponibilidad temporal'}</li>
                            <li>{isEn ? 'Credit packages and pricing are subject to change' : 'Los paquetes de créditos y precios están sujetos a cambios'}</li>
                            <li>{isEn ? 'I welcome bug reports and feedback through the in-app feedback button' : 'Agradezco reportes de bugs y feedback a través del botón de feedback dentro de la app'}</li>
                        </ul>
                    </div>

                    <div className={styles.section}>
                        <h2>{isEn ? '3. AI Credits System' : '3. Sistema de Créditos de IA'}</h2>
                        <p>
                            {isEn
                                ? 'The AI assistant in SophiaBible operates on a credit-based system:'
                                : 'El asistente de IA en SophiaBible funciona con un sistema de créditos:'}
                        </p>
                        <ul>
                            <li>{isEn ? 'Free accounts receive a daily credit allocation to use the AI assistant' : 'Las cuentas gratuitas reciben una asignación diaria de créditos para usar el asistente de IA'}</li>
                            <li>{isEn ? 'Additional credits can be purchased through credit packages' : 'Los créditos adicionales se pueden comprar mediante paquetes de créditos'}</li>
                            <li>{isEn ? 'Purchased credits are non-refundable given the digital nature of the service' : 'Los créditos comprados no son reembolsables dado el carácter digital del servicio'}</li>
                            <li>{isEn ? 'Credits do not expire and carry forward month to month' : 'Los créditos no vencen y se acumulan mes a mes'}</li>
                        </ul>
                    </div>

                    <div className={styles.section}>
                        <h2>{isEn ? '4. Payment Terms' : '4. Términos de Pago'}</h2>
                        <p>
                            {isEn
                                ? 'Payments are processed securely through PayPal. All transactions are in USD (US Dollars). Once a credit package is purchased and delivered, the transaction is final and non-refundable. In case of a technical error during purchase, please contact me at '
                                : 'Los pagos se procesan de forma segura a través de PayPal. Todas las transacciones están en USD (dólares estadounidenses). Una vez que se compra y entrega un paquete de créditos, la transacción es definitiva y no reembolsable. En caso de un error técnico durante la compra, contáctame en '}
                            <a href="mailto:sophiabibledev@gmail.com" className={styles.contactLink}>
                                sophiabibledev@gmail.com
                            </a>
                            {isEn ? ' and I will review your case.' : ' y lo revisaré.'}
                        </p>
                    </div>

                    <div className={styles.section}>
                        <h2>{isEn ? '5. Acceptable Use' : '5. Uso Aceptable'}</h2>
                        <p>
                            {isEn ? 'By using SophiaBible you agree not to:' : 'Al usar SophiaBible aceptas no:'}
                        </p>
                        <ul>
                            <li>{isEn ? 'Use the AI assistant for purposes unrelated to Bible study or spiritual growth' : 'Usar el asistente de IA para fines no relacionados con el estudio bíblico o el crecimiento espiritual'}</li>
                            <li>{isEn ? 'Attempt to abuse, exploit, or circumvent the credit system' : 'Intentar abusar, explotar o eludir el sistema de créditos'}</li>
                            <li>{isEn ? 'Use automated scripts to send requests to the AI service' : 'Usar scripts automatizados para enviar solicitudes al servicio de IA'}</li>
                            <li>{isEn ? 'Share your account credentials with others' : 'Compartir las credenciales de tu cuenta con otras personas'}</li>
                        </ul>
                    </div>

                    <div className={styles.section}>
                        <h2>{isEn ? '6. Limitation of Liability' : '6. Limitación de Responsabilidad'}</h2>
                        <p>
                            {isEn
                                ? 'The AI responses generated by SophiaBible are for educational and reflective purposes only. They do not constitute official theological advice. I am not responsible for decisions made based on AI-generated content. AI responses may occasionally contain inaccuracies; always cross-reference with official Bible translations and trusted theological sources.'
                                : 'Las respuestas de IA generadas por SophiaBible son únicamente para fines educativos y reflexivos. No constituyen asesoramiento teológico oficial. No soy responsable de las decisiones tomadas en base al contenido generado por la IA. Las respuestas de IA pueden ocasionalmente contener imprecisiones; siempre contrasta con traducciones bíblicas oficiales y fuentes teológicas de confianza.'}
                        </p>
                    </div>

                    <div className={styles.section}>
                        <h2>{isEn ? '7. Account Termination' : '7. Terminación de Cuenta'}</h2>
                        <p>
                            {isEn
                                ? 'I reserve the right to suspend or terminate accounts that violate these terms.'
                                : 'Me reservo el derecho de suspender o cancelar cuentas que violen estos términos.'}
                        </p>
                        <p>
                            {isEn
                                ? 'You may delete your account at any time directly from the app by going to Account Settings and clicking "Delete Account". Account deletion is immediate and permanent, and will result in:'
                                : 'Puedes eliminar tu cuenta en cualquier momento directamente desde la aplicación yendo a Configuración de Cuenta y haciendo clic en "Eliminar Cuenta". La eliminación de cuenta es inmediata y permanente, y resultará en:'}
                        </p>
                        <ul>
                            <li>{isEn ? 'Permanent deletion of all your data (conversations, notes, favorites, progress)' : 'Eliminación permanente de todos tus datos (conversaciones, notas, favoritos, progreso)'}</li>
                            <li>{isEn ? 'Loss of all purchased and free credits' : 'Pérdida de todos los créditos comprados y gratuitos'}</li>
                            <li>{isEn ? 'Immediate termination of access to AI features' : 'Terminación inmediata del acceso a las funciones de IA'}</li>
                        </ul>
                        <p>
                            {isEn
                                ? 'This action cannot be undone. Credits are non-refundable upon account deletion. If you need assistance, contact me at '
                                : 'Esta acción no se puede deshacer. Los créditos no son reembolsables tras la eliminación de cuenta. Si necesitas ayuda, contáctame en '}
                            <a href="mailto:sophiabibledev@gmail.com" className={styles.contactLink}>
                                sophiabibledev@gmail.com
                            </a>.
                        </p>
                    </div>

                    <div className={styles.section}>
                        <h2>{isEn ? '8. Contact' : '8. Contacto'}</h2>
                        <p>
                            {isEn
                                ? 'If you have questions about these Terms of Service, email me at:'
                                : 'Si tienes preguntas sobre estos Términos de Servicio, escríbeme a:'}
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

export default TermsOfService;
