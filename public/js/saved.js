import { getBookmarks } from './bookmarks.js';

const listEl = document.getElementById('saved-list');
const saved = getBookmarks();

if (!saved.length) {
  listEl.innerHTML = `<p>No saved conditions yet.</p>`;
} else {
  listEl.innerHTML = saved
    .map(
      (c) => `
      <article class="card" data-url="${c.url}">
        <h3>${c.title}</h3>
        <p>${c.summary}</p>
      </article>
    `,
    )
    .join('');

  listEl.querySelectorAll('.card').forEach((card) => {
    card.addEventListener('click', () => {
      const url = card.dataset.url;
      window.location.href = `detail.html?url=${encodeURIComponent(url)}`;
    });
  });
}
