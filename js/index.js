const form = document.getElementById('search-form');
const input = document.getElementById('symptom-input');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const term = input.value.trim();
  if (!term) return;
  window.location.href = `conditions.html?term=${encodeURIComponent(term)}`;
});
