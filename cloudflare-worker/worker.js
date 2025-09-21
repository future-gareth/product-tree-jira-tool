export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const allowOrigin = env.ALLOW_ORIGIN || "*";
    const corsHeaders = {
      "Access-Control-Allow-Origin": allowOrigin,
      "Access-Control-Allow-Methods": "GET,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-API-Key"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (!url.pathname.endsWith("/api/jira-search")) {
      return new Response("Not found", { status: 404, headers: corsHeaders });
    }

    // Simple origin + API key check
    const origin = request.headers.get("Origin") || "";
    if (allowOrigin !== "*" && origin !== allowOrigin) {
      return new Response("Origin not allowed", { status: 403, headers: corsHeaders });
    }
    const providedKey = request.headers.get("x-api-key") || "";
    if (env.PROXY_API_KEY && providedKey !== env.PROXY_API_KEY) {
      return new Response("Invalid API key", { status: 401, headers: corsHeaders });
    }

    const jql = url.searchParams.get("jql") || "";
    if (!jql) return new Response("Missing jql", { status: 400, headers: corsHeaders });

    const jiraBase = env.JIRA_BASE_URL;
    const email = env.JIRA_EMAIL;
    const token = env.JIRA_API_TOKEN;
    if (!jiraBase || !email || !token) {
      return new Response("Server not configured", { status: 500, headers: corsHeaders });
    }

    const auth = btoa(`${email}:${token}`);
    const jiraUrl = `${jiraBase.replace(/\/$/, "")}/rest/api/3/search?jql=${encodeURIComponent(jql)}`;
    const r = await fetch(jiraUrl, {
      headers: {
        "Authorization": `Basic ${auth}`,
        "Accept": "application/json"
      }
    });

    const text = await r.text();
    return new Response(text, { status: r.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
}