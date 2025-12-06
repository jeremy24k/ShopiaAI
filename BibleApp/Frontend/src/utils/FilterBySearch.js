const normalizeText = (text) => {
  return text.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
};

export const filterBySearch = (searchQuery, books) => {
    if (!searchQuery) return books;
    
    const query = normalizeText(searchQuery);

    return books.filter(book => 
        normalizeText(book.commonName).includes(query) ||
        normalizeText(book.name).includes(query) ||
        normalizeText(book.title).includes(query)
    );
};

