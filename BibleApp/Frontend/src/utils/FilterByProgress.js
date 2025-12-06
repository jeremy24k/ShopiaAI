function filterByProgress(filtered, CompleteChapter) {
    return filtered.filter(book => {
        const bookCompleteChapter = CompleteChapter.find(chapter => (chapter.book_data.bookId === book.id));
        console.log(bookCompleteChapter);
        return bookCompleteChapter;
    });
}

export default filterByProgress;
