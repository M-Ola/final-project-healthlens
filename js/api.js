
/* -------------------------------------------------------
   Environment Detection
------------------------------------------------------- */
const isLocal =
  location.hostname === 'localhost' ||
  location.hostname === '127.0.0.1';

/*
  Local → Express backend
  GitHub Pages → AllOrigins /get endpoint (stable)
*/
const BASE_URL = isLocal
  ? 'http://localhost:3000'
  : 'https://api.allorigins.win/get?url=';

/* -------------------------------------------------------
   Parse MedlinePlus XML → JSON
------------------------------------------------------- */

function parseMedlinePlusXML(xmlText) {
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlText, 'text/xml');

  const docs = [...xml.querySelectorAll('document')];

  return docs.map((doc) => {
    const title =
      doc.querySelector("content[name='title']")?.textContent?.trim() ||
      'Unknown';

    // ⭐ REAL topic URL is in the <document url="..."> attribute
    let topicUrl =
      doc.getAttribute('url')?.trim() ||
      doc
        .querySelector("content[name='full-summary-url']")
        ?.textContent?.trim() ||
      doc
        .querySelector("content[name='FullSummaryUrl']")
        ?.textContent?.trim() ||
      doc
        .querySelector("content[name='FullSummaryLink']")
        ?.textContent?.trim() ||
      doc.querySelector("content[name='link']")?.textContent?.trim() ||
      doc.querySelector("content[name='url']")?.textContent?.trim() ||
      '';

    // Fallback: build URL from topic ID
    if (!topicUrl) {
      const id = doc.querySelector("content[name='id']")?.textContent?.trim();
      if (id) {
        topicUrl = `https://medlineplus.gov/${id}.html`;
      }
    }

    const summary =
      doc.querySelector("content[name='Summary']")?.textContent?.trim() ||
      doc.querySelector("content[name='Symptoms']")?.textContent?.trim() ||
      doc.querySelector("content[name='FullSummary']")?.textContent?.trim() ||
      '';

    const shortSnippet =
      summary.length > 160
        ? summary.slice(0, summary.lastIndexOf(' ', 160)) + '…'
        : summary;

    return { title, url: topicUrl, snippet: shortSnippet };
  });
}

/* -------------------------------------------------------
   Search Conditions (XML)
------------------------------------------------------- */
export async function searchConditions(term) {
  if (isLocal) {
    const res = await fetch(
      `${BASE_URL}/api/conditions?term=${encodeURIComponent(term)}`
    );
    const xmlText = await res.text();
    return parseMedlinePlusXML(xmlText);
  }

  const medlineUrl = `https://wsearch.nlm.nih.gov/ws/query?db=healthTopics&term=${encodeURIComponent(
    term
  )}`;

  // ⭐ AllOrigins /get returns JSON with { contents: "<xml>" }
  const res = await fetch(`${BASE_URL}${encodeURIComponent(medlineUrl)}`);
  const data = await res.json();
  const xmlText = data.contents;

  return parseMedlinePlusXML(xmlText);
}

/* -------------------------------------------------------
   Fetch Detail Page (HTML)
------------------------------------------------------- */
export async function fetchDetailPage(topicUrl) {
  if (isLocal) {
    const res = await fetch(
      `${BASE_URL}/api/detail?url=${encodeURIComponent(topicUrl)}`
    );
    return res.text();
  }

  const res = await fetch(`${BASE_URL}${encodeURIComponent(topicUrl)}`);
  const data = await res.json();
  return data.contents; // ⭐ HTML string
}
