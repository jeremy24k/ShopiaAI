
/**
 * Extracts plain text from a chapter content item (verse or heading)
 * @param {Object} item - The content item from the chapter JSON
 * @returns {string} The raw text content
 */
export const getTextFromItem = (item) => {
    if (!item) return "";
    let text = "";

    if (item.type === "heading") {
        text = Array.isArray(item.content) ? item.content.join(" ") : item.content;
    } else if (item.type === "verse") {
        if (Array.isArray(item.content)) {
            item.content.forEach(subItem => {
                if (typeof subItem === 'string') {
                    text += subItem + " ";
                } else if (subItem && typeof subItem === 'object' && subItem.text) {
                    text += subItem.text + " ";
                }
            });
        }
    }
    return text.trim();
};
