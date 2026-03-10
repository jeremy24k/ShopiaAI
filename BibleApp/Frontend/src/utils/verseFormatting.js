/**
 * Format verse range for display
 * @param {Array} verses - Array of verse objects
 * @param {boolean} showBookName - Whether to show book names
 * @param {number} maxBooks - Maximum number of books to show
 * @returns {string} Formatted verse range string
 */
export function getVerseRange(verses = [], showBookName = true, maxBooks = 3) {
    if (!verses || verses.length === 0) return '';
    
    if (verses.length === 1) {
        const v = verses[0];
        return `${v.bookName} ${v.chapterNumber}:${v.verseNumber}`;
    }
    
    // Group by book for multiple books display
    const groupedByBook = {};
    verses.forEach(v => {
        if (!groupedByBook[v.bookName]) {
            groupedByBook[v.bookName] = [];
        }
        groupedByBook[v.bookName].push(v);
    });
    
    const bookNames = Object.keys(groupedByBook);
    const totalBooks = bookNames.length;
    const booksToShow = bookNames.slice(0, maxBooks);
    
    // Format each book
    const bookStrings = booksToShow.map(bookName => {
        const verses = groupedByBook[bookName];
        verses.sort((a, b) => a.chapterNumber - b.chapterNumber || a.verseNumber - b.verseNumber);
        
        // Group by chapter
        const chapters = {};
        verses.forEach(v => {
            if (!chapters[v.chapterNumber]) {
                chapters[v.chapterNumber] = [];
            }
            chapters[v.chapterNumber].push(v.verseNumber);
        });
        
        // Format each chapter
        const chapterStrings = Object.keys(chapters).map(chapter => {
            const verseNumbers = chapters[chapter].sort((a, b) => a - b);
            
            // Create consecutive ranges
            const ranges = [];
            let start = verseNumbers[0];
            let end = verseNumbers[0];
            
            for (let i = 1; i < verseNumbers.length; i++) {
                if (verseNumbers[i] === end + 1) {
                    end = verseNumbers[i];
                } else {
                    ranges.push(start === end ? `${start}` : `${start}-${end}`);
                    start = verseNumbers[i];
                    end = verseNumbers[i];
                }
            }
            ranges.push(start === end ? `${start}` : `${start}-${end}`);
            
            return `${chapter}:${ranges.join(',')}`;
        });
        
        return `${showBookName ? (bookName).toLowerCase() : ''} ${chapterStrings.join('; ')}`;
    });
    
    const result = bookStrings.join('; ');
    
    // Add "..." if there are more books
    return totalBooks > maxBooks ? `${result}...` : result;
}

/**
 * Get mode display name from mode ID
 */
export function getModeName(modeId, availableModes) {
    const mode = availableModes.find(m => m.id === modeId);
    return mode?.name || modeId;
}

/**
 * Get doctrine display name from doctrine ID
 */
export function getDoctrineName(doctrineId, availableDoctrines) {
    const doctrine = availableDoctrines.find(p => p.id === doctrineId);
    return doctrine?.name || doctrineId;
}
