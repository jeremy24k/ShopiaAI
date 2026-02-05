import { useEffect, useState } from 'react';
import FeedbackService from '../../services/FeedbackService';
import { ThumbsUp, ThumbsDown, TrendingUp, Users, Mail, User } from 'lucide-react';
import styles from './FeedbackDashboard.module.css';

function FeedbackDashboard() {
    const [stats, setStats] = useState(null);
    const [feedbackList, setFeedbackList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadStats();
        loadFeedbackList();
    }, []);

    useEffect(() => {
        console.log(feedbackList);
    }, [feedbackList]);

    async function loadStats() {
        try {
            setLoading(true);
            const data = await FeedbackService.getFeedbackStats();
            setStats(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function loadFeedbackList() {
        try {
            const data = await FeedbackService.getAllFeedbackWithUsers();
            setFeedbackList(data);
        } catch (err) {
            console.error('Error loading feedback list:', err);
        }
    }

    if (loading) return <div className={styles.loading}>Cargando estadísticas...</div>;
    if (error) return <div className={styles.error}>Error: {error}</div>;
    if (!stats) return null;

    const likePercentage = stats.total > 0 ? ((stats.likes / stats.total) * 100).toFixed(1) : 0;
    const dislikePercentage = stats.total > 0 ? ((stats.dislikes / stats.total) * 100).toFixed(1) : 0;



    return (
        <div className={styles.dashboard}>
            <h2 className={styles.title}>📊 Dashboard de Feedback</h2>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>
                        <Users size={24} />
                    </div>
                    <div className={styles.statContent}>
                        <p className={styles.statLabel}>Total Feedback</p>
                        <p className={styles.statValue}>{stats.total}</p>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ color: '#10b981' }}>
                        <ThumbsUp size={24} />
                    </div>
                    <div className={styles.statContent}>
                        <p className={styles.statLabel}>Likes</p>
                        <p className={styles.statValue}>{stats.likes}</p>
                        <p className={styles.statPercentage}>{likePercentage}%</p>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ color: '#ef4444' }}>
                        <ThumbsDown size={24} />
                    </div>
                    <div className={styles.statContent}>
                        <p className={styles.statLabel}>Dislikes</p>
                        <p className={styles.statValue}>{stats.dislikes}</p>
                        <p className={styles.statPercentage}>{dislikePercentage}%</p>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ color: '#3b82f6' }}>
                        <TrendingUp size={24} />
                    </div>
                    <div className={styles.statContent}>
                        <p className={styles.statLabel}>Satisfacción</p>
                        <p className={styles.statValue}>{likePercentage}%</p>
                    </div>
                </div>
            </div>

            <div className={styles.detailsGrid}>
                <div className={styles.detailCard}>
                    <h3>Feedback por Modo</h3>
                    <div className={styles.detailList}>
                        {Object.entries(stats.byMode).map(([mode, count]) => (
                            <div key={mode} className={styles.detailItem}>
                                <span className={styles.detailLabel}>{mode}</span>
                                <span className={styles.detailValue}>{count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.detailCard}>
                    <h3>Feedback por Doctrina</h3>
                    <div className={styles.detailList}>
                        {Object.entries(stats.byDoctrine).map(([doctrine, count]) => (
                            <div key={doctrine} className={styles.detailItem}>
                                <span className={styles.detailLabel}>{doctrine}</span>
                                <span className={styles.detailValue}>{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className={styles.feedbackTable}>
                <h3>📝 Feedback Detallado por Usuario</h3>
                {feedbackList.length === 0 ? (
                    <p className={styles.noData}>No hay feedback registrado aún</p>
                ) : (
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Usuario</th>
                                    <th>Email</th>
                                    <th>Tipo</th>
                                    <th>Modo</th>
                                    <th>Doctrina</th>
                                    <th>Fecha</th>
                                    <th>Respuesta</th>
                                </tr>
                            </thead>
                            <tbody>
                                {feedbackList.map((feedback) => (
                                    <tr key={feedback.id}>
                                        <td>
                                            <div className={styles.userCell}>
                                                <User size={16} />
                                                <span>{feedback.user_name || 'Sin nombre'}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles.emailCell}>
                                                <Mail size={16} />
                                                <span>{feedback.user_email}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`${styles.badge} ${
                                                feedback.feedback_type === 'like' 
                                                    ? styles.badgeLike 
                                                    : styles.badgeDislike
                                            }`}>
                                                {feedback.feedback_type === 'like' ? (
                                                    <><ThumbsUp size={14} /> Like</>
                                                ) : (
                                                    <><ThumbsDown size={14} /> Dislike</>
                                                )}
                                            </span>
                                        </td>
                                        <td className={styles.modeCell}>{feedback.mode_id || '-'}</td>
                                        <td className={styles.doctrineCell}>{feedback.doctrine_id || '-'}</td>
                                        <td className={styles.dateCell}>
                                            {new Date(feedback.created_at).toLocaleDateString('es-ES', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </td>
                                        <td className={styles.contentCell}>
                                            <details>
                                                <summary>Ver respuesta</summary>
                                                <div className={styles.messageContent}>
                                                    {feedback.message_content.substring(0, 500)}
                                                    {feedback.message_content.length > 500 && '...'}
                                                </div>
                                            </details>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <button onClick={() => { loadStats(); loadFeedbackList(); }} className={styles.refreshButton}>
                Actualizar Estadísticas
            </button>
        </div>
    );
}

export default FeedbackDashboard;
