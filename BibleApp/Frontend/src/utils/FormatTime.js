const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
    });
};

function formatRelativeTime(dateString, t) {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    const formatHour = (d) => {
        const h = d.getHours();
        return `${h % 12 || 12}${h >= 12 ? 'pm' : 'am'}`;
    };
    
    if (diffDays === 0) return `${t('today_at')} ${formatHour(date)}`;
    if (diffDays === 1) return `${t('yesterday_at')} ${formatHour(date)}`;
    if (diffDays <= 7) return `${t('days_ago_at').replace('{days}', diffDays)} ${formatHour(date)}`;
    
    return `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()} ${t('at')} ${formatHour(date)}`;
}

export { formatDate, formatTime, formatRelativeTime };