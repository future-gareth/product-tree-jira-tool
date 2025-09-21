# Deploy to https://garethapi.com/tools/product-tree-from-jira

## Cloudflare Pages (UI)
- Project root: **ui/** (static)
- Build: none • Output directory: `ui`
- Map subpath: `garethapi.com/tools/product-tree-from-jira`

## Cloudflare Worker (Proxy)
- Route: `garethapi.com/tools/api/*`
- Secrets: `JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN`, `PROXY_API_KEY`, `ALLOW_ORIGIN=https://garethapi.com`
- In the UI, set **Proxy URL** to `https://garethapi.com/tools`

## Vercel (UI + API)
- Move **ui/** files to project root; keep function at `api/jira-search.ts`
- Env: `JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN`, `PROXY_API_KEY`, `ALLOW_ORIGIN=https://garethapi.com`
- Reverse-proxy `/tools/product-tree-from-jira/*` and `/tools/api/*` from your main site to the Vercel project

## Netlify (UI + API)
- Publish **ui/**; add function in `netlify/functions/jira-search.js`
- Env vars as above
