import { cleanVerseContent } from "./cleanVerseContent";

export function getVerseData(item, contextData = {}) {
    // Para el contenido, DailyVerse usa 'verse', otros usan 'content' o 'text'
    const rawContent = item.content || item.text || item.verse;
    const cleanContent = cleanVerseContent(rawContent);

    // Si contextData está vacío, intentamos sacar los datos del propio item (caso DailyVerse)
    const bookName = contextData.book?.name || item.bookName || item.book;
    const bookId = contextData.book?.id || item.bookId;
    const chapterNumber = contextData.chapterNumber || item.chapterNumber || item.chapter;

    // En DailyVerse 'verseNumber' es la propiedad correcta. En otros contextos es 'number'.
    const verseNumber = item.number || item.verseNumber;

    const translationLabel = contextData.translationLabel || item.translation || 'Reina Valera 1909';
    const translationValue = contextData.translationValue || item.translationValue || 'spa_r09';
    const shortName = contextData.shortName || item.shortName || 'R09';

    return {
        bookName: bookName,
        bookId: bookId,
        chapterNumber: chapterNumber,
        verseNumber: verseNumber,
        translation: translationLabel,
        translationValue: translationValue,
        shortName: shortName,
        content: cleanContent,
        verseKey: `${bookId}-${chapterNumber}-${verseNumber}-${translationValue}`
    };
}