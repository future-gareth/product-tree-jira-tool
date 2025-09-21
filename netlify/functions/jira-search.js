export async function handler(event, context) {
  const allow = process.env.ALLOW_ORIGIN || '*';
  const headers = {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

  if (process.env.PROXY_API_KEY && event.headers['x-api-key'] !== process.env.PROXY_API_KEY) {
    return { statusCode: 401, headers, body: 'Invalid API key' };
  }

  const jql = event.queryStringParameters?.jql || '';
  if (!jql) return { statusCode: 400, headers, body: 'Missing jql' };

  const base = (process.env.JIRA_BASE_URL || '').replace(/\/$/, '');
  const email = process.env.JIRA_EMAIL;
  const token = process.env.JIRA_API_TOKEN;
  if (!base || !email || !token) return { statusCode: 500, headers, body: 'Server not configured' };

  const auth = Buffer.from(`${email}:${token}`).toString('base64');
  const url = `${base}/rest/api/3/search?jql=${encodeURIComponent(jql)}`;
  const r = await fetch(url, { headers: { Authorization: `Basic ${auth}`, Accept: 'application/json' } });
  const text = await r.text();
  return { statusCode: r.status, headers: { ...headers, 'Content-Type': 'application/json' }, body: text };
}
