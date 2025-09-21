import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOW_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!process.env.PROXY_API_KEY || req.headers['x-api-key'] !== process.env.PROXY_API_KEY) {
    return res.status(401).send('Invalid API key');
  }
  const jql = String(req.query.jql || '');
  if (!jql) return res.status(400).send('Missing jql');

  const base = (process.env.JIRA_BASE_URL || '').replace(/\/$/, '');
  const email = process.env.JIRA_EMAIL;
  const token = process.env.JIRA_API_TOKEN;
  if (!base || !email || !token) return res.status(500).send('Server not configured');

  const jiraUrl = `${base}/rest/api/3/search?jql=${encodeURIComponent(jql)}`;
  const auth = Buffer.from(`${email}:${token}`).toString('base64');

  const r = await fetch(jiraUrl, {
    headers: { Authorization: `Basic ${auth}`, Accept: 'application/json' }
  });
  const text = await r.text();
  res.setHeader('Content-Type', 'application/json');
  return res.status(r.status).send(text);
}
