const BASE_URL = "http://localhost:5000/api";

const getBooks = async (bookCode, setLoading, setError, translation) => {
    const response = await fetch(`${BASE_URL}/chapter/${translation}/${bookCode}/1`);
    if (!response.ok) {
        setError("Failed to fetch books");
        setLoading(false);
        return;
    }
    const data = await response.json();
    setLoading(false);
    return data;
}

const getChapter = async (bookCode, chapterNumber, setLoading, setError, translation) => {
    const response = await fetch(`${BASE_URL}/chapter/${translation}/${bookCode}/${chapterNumber}`);
    if (!response.ok) {
        setError("Failed to fetch chapter");
        setLoading(false);
        return;
    }
    const data = await response.json();
    setLoading(false);
    return data;
}

export { getBooks, getChapter };
