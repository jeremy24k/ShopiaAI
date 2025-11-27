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

function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    const formatHour = (d) => {
        const h = d.getHours();
        return `${h % 12 || 12}${h >= 12 ? 'pm' : 'am'}`;
    };
    
    if (diffDays === 0) return `hoy a las ${formatHour(date)}`;
    if (diffDays === 1) return `ayer a las ${formatHour(date)}`;
    if (diffDays <= 7) return `hace ${diffDays} días a las ${formatHour(date)}`;
    
    return `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()} a las ${formatHour(date)}`;
}

export { formatDate, formatTime, formatRelativeTime };