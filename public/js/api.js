export async function searchConditions(term) {
  const res = await fetch(`/api/conditions?term=${encodeURIComponent(term)}`);
  const xmlText = await res.text();
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlText, 'text/xml');

  const docs = [...xml.querySelectorAll('list > document')];

  return docs.map((doc) => {
    const url = doc.getAttribute('url');
    const title =
      doc.querySelector('content[name=title]')?.textContent || 'Untitled';
    const snippet =
      doc.querySelector('content[name=snippet]')?.textContent || '';
    return { id: url, title, snippet, url };
  });
}
