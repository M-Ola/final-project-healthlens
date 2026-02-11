


import { searchConditions } from './api.js';

/* -------------------------------------------------------
   Read URL Params
------------------------------------------------------- */
const params = new URLSearchParams(window.location.search);
const term = params.get('term') || '';

/* -------------------------------------------------------
   DOM Elements
------------------------------------------------------- */
const resultsEl = document.getElementById('results');
const queryLabel = document.getElementById('query-label');

/* -------------------------------------------------------
   Set Query Label
------------------------------------------------------- */
queryLabel.textContent = term
  ? `Results for "${term}"`
  : 'No search term provided.';

/* -------------------------------------------------------
   Render a Single Condition Card
------------------------------------------------------- */
function renderCard(condition) {
  return `
    <article class="card" data-url="${condition.url}">
      <h3>${condition.title}</h3>
      <p>${condition.snippet}</p>
    </article>
  `;
}

/* -------------------------------------------------------
   Render All Results
------------------------------------------------------- */
function renderResults(items) {
  if (!items.length) {
    resultsEl.innerHTML = `<p>No conditions found.</p>`;
    return;
  }

  resultsEl.innerHTML = items.map(renderCard).join('');

  // Add click handlers
  resultsEl.querySelectorAll('.card').forEach((card) => {
    card.addEventListener('click', () => {
      const url = card.dataset.url;

      window.location.href = `detail.html?url=${encodeURIComponent(url)}&term=${encodeURIComponent(term)}`;
    });
  });
}

/* -------------------------------------------------------
   Main Loader
------------------------------------------------------- */
async function loadConditions() {
  if (!term) {
    resultsEl.textContent = 'Please go back and enter symptoms.';
    return;
  }

  resultsEl.innerHTML = `<p class="loading">Loading results...</p>`;

  try {
    const items = await searchConditions(term);
    renderResults(items);
  } catch (err) {
    console.error('Error loading conditions:', err);
    resultsEl.innerHTML = `<p class="error">Unable to load results. Please try again later.</p>`;
  }
const items = await searchConditions(term);
console.log(items);

}

loadConditions();
