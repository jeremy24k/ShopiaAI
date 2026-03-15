export function cleanVerseContent(content) {
    if (typeof content === 'string') {
        return content;
    }
    
    if (Array.isArray(content)) {
        return content.map(subItem => {
            if (typeof subItem === 'string') {
                return subItem;
            } else if (subItem && typeof subItem === 'object') {
                if ('text' in subItem) {
                    return subItem.text;
                }
            }
            return '';
        }).filter(text => text.trim() !== '').join(' ');
    }

    // Si el root es un objeto en lugar de array o string
    if (content && typeof content === 'object') {
        if ('text' in content) return content.text;
        if ('poem' in content) return content.poem;
        // Fallback genérico para tratar de convertir valores
        try {
            return Object.values(content).filter(val => typeof val === 'string').join(' ');
        } catch(e) {
            return JSON.stringify(content);
        }
    }

    return String(content || '');
}