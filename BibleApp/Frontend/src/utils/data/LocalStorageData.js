export function setLocalStorageData(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

export function getLocalStorageData(key) {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
}

export function removeLocalStorageData(key) {
    localStorage.removeItem(key);
}