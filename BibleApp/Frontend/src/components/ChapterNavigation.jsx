import { useEffect } from "react";

function ChapterNavigation({ chapterNumber, setChapterNumber, chapterData }) {

    chapterNumber = parseInt(chapterNumber);
    const limit = chapterData.numberOfChapters;

    function handlePreviousClick() {
        if (chapterNumber <= 1) return;
        setChapterNumber(chapterNumber - 1);
    }

    function handleNextClick() {
        if (chapterNumber >=  limit) return;
        setChapterNumber(chapterNumber + 1);
    }

    return (
        <div>
            {chapterNumber <= 1 ? null : <button onClick={handlePreviousClick}>Previous</button>}
            <p>{chapterNumber} / {limit}</p>
            {chapterNumber >= limit ? null : <button onClick={handleNextClick}>Next</button>}
        </div>
    );
}

export default ChapterNavigation;