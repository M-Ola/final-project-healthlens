

/* -------------------------------------------------------
   Environment Detection
------------------------------------------------------- */
const isLocal =
  location.hostname === "localhost" ||
  location.hostname === "127.0.0.1";

/* -------------------------------------------------------
   Base URLs
------------------------------------------------------- */
const LOCAL_BASE = "http://localhost:3000";
const PROXY_BASE = "https://corsproxy.io/?"; 


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
   Fetch Conditions 
------------------------------------------------------- */
export async function searchConditions(term) {
  const medlineUrl =
    `https://wsearch.nlm.nih.gov/ws/query?db=healthTopics&term=${encodeURIComponent(term)}`;

  try {
    let xmlText;

    if (isLocal) {
      const res = await fetch(
        `${LOCAL_BASE}/api/conditions?term=${encodeURIComponent(term)}`
      );
      xmlText = await res.text();
    } else {
      const res = await fetch(PROXY_BASE + medlineUrl);
      xmlText = await res.text();
    }

    return parseMedlinePlusXML(xmlText);

  } catch (err) {
    console.error("Error fetching conditions:", err);
    return []; // safe fallback
  }
}

/* -------------------------------------------------------
   Fetch Detail Page 
------------------------------------------------------- */
export async function fetchDetailPage(topicUrl) {
  try {
    let html;

    if (isLocal) {
      const res = await fetch(
        `${LOCAL_BASE}/api/detail?url=${encodeURIComponent(topicUrl)}`
      );
      html = await res.text();
    } else {
      const res = await fetch(PROXY_BASE + topicUrl);
      html = await res.text();
    }

    return html;

  } catch (err) {
    console.error("Error fetching detail page:", err);
    return "<p>Error loading detail page.</p>";
  }
}
