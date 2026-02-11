/* import { getBookmarks, isBookmarked, toggleBookmark } from './bookmarks.js';

const params = new URLSearchParams(window.location.search);
const topicUrl = params.get('url');
const term = params.get('term') || '';

document.getElementById('back-btn').onclick = () => {
  if (term) {
    window.location.href = `conditions.html?term=${encodeURIComponent(term)}`;
  } else {
    history.back();
  }
};

(async () => {
  if (!topicUrl) return;

  const res = await fetch(`/api/detail?url=${encodeURIComponent(topicUrl)}`);
  const htmlText = await res.text();

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlText, 'text/html');

  const title = doc.querySelector('h1')?.textContent?.trim() || 'Condition';
  const summary =
    doc.querySelector('.topic-summary p')?.textContent?.trim() ||
    doc.querySelector('.section-body p')?.textContent?.trim() ||
    doc.querySelector('h1 + p')?.textContent?.trim() ||
    '';


  function extractSection(match) {
    const heading = [...doc.querySelectorAll('h2, h3')].find((h) =>
      h.textContent.toLowerCase().includes(match),
    );
    if (!heading) return '';
    const next = heading.nextElementSibling;
    return next?.textContent?.trim() || '';
  }

  const symptoms = extractSection('symptom');
  const treatment = extractSection('treat');
  const prevention = extractSection('prevent');

  document.getElementById('title').textContent = title;
  document.getElementById('summary').textContent = summary;
  document.getElementById('source-link').href = topicUrl;

  if (symptoms) {
    document.getElementById('symptoms').textContent = symptoms;
    document.getElementById('symptoms-section').hidden = false;
  }
  if (treatment) {
    document.getElementById('treatment').textContent = treatment;
    document.getElementById('treatment-section').hidden = false;
  }
  if (prevention) {
    document.getElementById('prevention').textContent = prevention;
    document.getElementById('prevention-section').hidden = false;
  }

  const saveBtn = document.getElementById('save-btn');
  const id = topicUrl;

  function updateSaveLabel() {
    saveBtn.textContent = isBookmarked(id) ? '★ Saved' : '☆ Save';
  }

  updateSaveLabel();

  saveBtn.onclick = () => {
    toggleBookmark({ id, title, summary, url: topicUrl });
    updateSaveLabel();
  };
})();
 */


import { fetchDetailPage } from './api.js';
import { getBookmarks, isBookmarked, toggleBookmark } from './bookmarks.js';

/* -------------------------------------------------------
   Read URL Params
------------------------------------------------------- */
const params = new URLSearchParams(window.location.search);
const topicUrl = params.get('url'); // ✔ Correct source of the MedlinePlus link
const term = params.get('term') || '';

/* -------------------------------------------------------
   Back Button
------------------------------------------------------- */
document.getElementById('back-btn').onclick = () => {
  if (term) {
    window.location.href = `conditions.html?term=${encodeURIComponent(term)}`;
  } else {
    history.back();
  }
};

/* -------------------------------------------------------
   Extract Summary 
------------------------------------------------------- */
function extractSummary(doc) {
  const candidates = [
    '.topic-summary p',
    '.section-body p',
    'h1 + p',
    'main p',
  ];

  for (const sel of candidates) {
    const el = doc.querySelector(sel);
    if (el && el.textContent.trim().length > 40) {
      return el.textContent.trim();
    }
  }

  return '';
}

/* -------------------------------------------------------
   Extract Section by Heading
------------------------------------------------------- */
function extractSection(doc, match) {
  const heading = [...doc.querySelectorAll('h2, h3')].find((h) =>
    h.textContent.toLowerCase().includes(match),
  );

  if (!heading) return '';

  let text = '';
  let el = heading.nextElementSibling;

  while (el && !['H2', 'H3'].includes(el.tagName)) {
    if (el.textContent.trim()) {
      text += el.textContent.trim() + '\n\n';
    }
    el = el.nextElementSibling;
  }

  return text.trim();
}

/* -------------------------------------------------------
   Main Loader
------------------------------------------------------- */
(async () => {
  if (!topicUrl) {
    console.error('Missing topicUrl in query string');
    return;
  }

  // Fetch HTML (local server OR GitHub Pages proxy)
  const htmlText = await fetchDetailPage(topicUrl);

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlText, 'text/html');

  /* ------------------ Extract Content ------------------ */
  const title = doc.querySelector('h1')?.textContent?.trim() || 'Condition';

  const summary = extractSummary(doc);
  const symptoms = extractSection(doc, 'symptom');
  const treatment = extractSection(doc, 'treat');
  const prevention = extractSection(doc, 'prevent');

  /* ------------------ Render Content ------------------ */
  document.getElementById('title').textContent = title;
  document.getElementById('summary').textContent = summary;

  // ✔ Correct MedlinePlus link
  const sourceLink = document.getElementById('source-link');
  sourceLink.href = topicUrl;
  sourceLink.target = '_blank';
  sourceLink.rel = 'noopener noreferrer';

  if (symptoms) {
    document.getElementById('symptoms').textContent = symptoms;
    document.getElementById('symptoms-section').hidden = false;
  }

  if (treatment) {
    document.getElementById('treatment').textContent = treatment;
    document.getElementById('treatment-section').hidden = false;
  }

  if (prevention) {
    document.getElementById('prevention').textContent = prevention;
    document.getElementById('prevention-section').hidden = false;
  }

  /* ------------------ Bookmark Logic ------------------ */
  const saveBtn = document.getElementById('save-btn');
  const id = topicUrl;

  function updateSaveLabel() {
    saveBtn.textContent = isBookmarked(id) ? '★ Saved' : '☆ Save';
  }

  updateSaveLabel();

  saveBtn.onclick = () => {
    toggleBookmark({ id, title, summary, url: topicUrl });
    updateSaveLabel();
  };
})();
