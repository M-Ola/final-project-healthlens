/* import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
app.use(cors());

app.get('/api/conditions', async (req, res) => {
  const term = req.query.term;
  const url = `https://wsearch.nlm.nih.gov/ws/query?db=healthTopics&term=${encodeURIComponent(term)}`;

  try {
    const response = await fetch(url);
    const xml = await response.text();
    res.set('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    console.error('SERVER ERROR:', err);
    res.status(500).send('Error fetching data');
  }
});

app.listen(3000, () => {
  console.log('Proxy server running at http://localhost:3000');
});

 */

import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.static('.'));

app.get('/api/conditions', async (req, res) => {
  const term = req.query.term;
  const url = `https://wsearch.nlm.nih.gov/ws/query?db=healthTopics&term=${encodeURIComponent(
    term,
  )}`;

  try {
    const response = await fetch(url);
    const xml = await response.text();
    res.set('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    console.error('SERVER ERROR:', err);
    res.status(500).send('Error fetching data');
  }
});

app.get('/api/detail', async (req, res) => {
  const topicUrl = req.query.url;
  if (!topicUrl) return res.status(400).json({ error: 'Missing ?url' });

  try {
    const response = await fetch(topicUrl);
    const html = await response.text();
    res.set('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    console.error('DETAIL ERROR:', err);
    res.status(500).json({ error: 'Error fetching detail' });
  }
});

app.listen(3000, () => {
  console.log('HealthLens running at http://localhost:3000');
});
