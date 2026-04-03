export const VerseUrl = (verse) => {
    const bookId = verse.bookId.toLowerCase();
    return `/books/${bookId}/${verse.chapterNumber}?translation=${verse.translationValue}#${bookId}-${verse.verseNumber}-${verse.translationValue}`;
}