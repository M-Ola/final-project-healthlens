import { searchConditions } from './api.js';

const params = new URLSearchParams(window.location.search);
const term = params.get('term') || '';

document.getElementById('query-label').textContent = term
  ? `Results for “${term}”`
  : 'No search term provided.';

const resultsEl = document.getElementById('results');

if (term) {
  (async () => {
    const items = await searchConditions(term);
    if (!items.length) {
      resultsEl.textContent = 'No conditions found.';
      return;
    }

    resultsEl.innerHTML = items
      .map(
        (c) => `
      <article class="card" data-url="${c.url}">
        <h3>${c.title}</h3>
        <p>${c.snippet}</p>
      </article>
    `,
      )
      .join('');

    resultsEl.querySelectorAll('.card').forEach((card) => {
      card.addEventListener('click', () => {
        const url = card.dataset.url;
        window.location.href = `detail.html?url=${encodeURIComponent(url)}&term=${encodeURIComponent(
          term,
        )}`;
      });
    });
  })();
} else {
  resultsEl.textContent = 'Please go back and enter symptoms.';
}
