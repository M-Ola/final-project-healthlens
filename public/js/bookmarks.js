const KEY = 'healthlens_saved';

export function getBookmarks() {
  return JSON.parse(localStorage.getItem(KEY) || '[]');
}

export function isBookmarked(id) {
  return getBookmarks().some((b) => b.id === id);
}

export function toggleBookmark(item) {
  const saved = getBookmarks();
  const exists = saved.some((b) => b.id === item.id);
  const updated = exists
    ? saved.filter((b) => b.id !== item.id)
    : [...saved, item];
  localStorage.setItem(KEY, JSON.stringify(updated));
}
