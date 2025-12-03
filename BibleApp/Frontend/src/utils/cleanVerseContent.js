export function cleanVerseContent(content) {
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
    return content;
}