export default function getVerseRange(verses) {
    const verseArray = verses;
    if (!verseArray || verseArray.length === 0) return '';
    if (verseArray.length === 1) {
        const v = verseArray[0];
        return `${v.bookName} ${v.chapterNumber}:${v.verseNumber}`;
    }
    
    const groupedByBook = {};
    verseArray.forEach(v => {
        if (!groupedByBook[v.bookName]) {
            groupedByBook[v.bookName] = [];
        }
        groupedByBook[v.bookName].push(v);
    });
    
    const bookNames = Object.keys(groupedByBook);
    const maxBooks = 3;
    const totalBooks = bookNames.length;
    const booksToShow = bookNames.slice(0, maxBooks);
    
    const bookStrings = booksToShow.map(bookName => {
        const bookVerses = groupedByBook[bookName];
        bookVerses.sort((a, b) => a.chapterNumber - b.chapterNumber || a.verseNumber - b.verseNumber);
        
        const translations = new Set();
        bookVerses.forEach(v => {
            const trLabel = v.shortName || v.translation || v.translationValue;
            if (trLabel) translations.add(trLabel);
        });
        
        const chapters = {};
        bookVerses.forEach(v => {
            if (!chapters[v.chapterNumber]) {
                chapters[v.chapterNumber] = [];
            }
            chapters[v.chapterNumber].push(Number(v.verseNumber));
        });
        
        const chapterStrings = Object.keys(chapters).map(chapter => {
            const verseNumbers = [...new Set(chapters[chapter])].sort((a, b) => a - b);
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
        
        const trSuffix = translations.size > 1 ? ` ([...translations].join(', ')})` : '';
        return `${bookName.toLowerCase()} ${chapterStrings.join('; ')}${trSuffix}`;
    });
    
    const result = bookStrings.join('; ');
    return totalBooks > maxBooks ? `${result}...` : result;
}
