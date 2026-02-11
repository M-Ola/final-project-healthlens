import { getBookmarks, isBookmarked, toggleBookmark } from './bookmarks.js';

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
