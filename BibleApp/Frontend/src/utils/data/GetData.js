const BASE_URL = import.meta.env.VITE_API_URL;

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
    // Si el backend responde 404 asumimos que el libro/capítulo no existe para esta traducción
    if (response.status === 404) {
      setError("BOOK_NOT_AVAILABLE_FOR_TRANSLATION");
    } else {
      setError("Failed to fetch chapter");
    }
    setLoading(false);
    return null;
  }

  const data = await response.json();

  // 🔍 Detectar el caso raro: API devuelve HTML de la landing en vez de JSON de capítulo
  if (data && typeof data.data === "string" && data.data.includes("<!doctype html")) {
    setError("BOOK_NOT_AVAILABLE_FOR_TRANSLATION");
    setLoading(false);
    return null;
  }

  // (opcional) sanity check: asegurarse de que viene la estructura esperada
  if (!data?.data?.chapter?.content) {
    setError("Failed to fetch chapter");
    setLoading(false);
    return null;
  }

  setLoading(false);
  return data;
};

export { getBooks, getChapter };
