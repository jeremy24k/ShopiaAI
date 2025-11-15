const calculateReadTime = (book, wordsPerMinute = 150) => {
    const averageWordsPerVerse = 20;
    const totalWords = book.totalNumberOfVerses * averageWordsPerVerse;
    const totalMinutes = Math.ceil(totalWords / wordsPerMinute);

    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);

    return { 
        totalMinutes,
        formattedTime: hours > 0 
            ? `${hours} hr ${minutes} min` 
            : `${minutes} min`
    };
}

export default calculateReadTime;
