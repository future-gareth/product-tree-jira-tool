// Emits Product Tree XML in the attached format.
// Theme/fonts handled via CSS. Uses PapaParse for CSV.
//
// Mapping: set Jira Issue Type => role (goal | job | work_item | work)
const DEFAULT_MAPPING = {
  columns: {
    key: "Issue key",
    id: "Issue id",
    type: "Issue Type",
    summary: "Summary",
    description: "Description",
    status: "Status",
    priority: "Priority",
    assignee: "Assignee",
    reporter: "Reporter",
    labels: "Labels",
    components: "Components",
    fix_versions: "Fix versions",
    sprint: "Sprint",
    story_points: "Story Points",
    epic_link: "Epic Link",
    parent: "Parent",
    team: "Team", // adjust if you have a custom field name
    quarter: "Quarter",
    year: "Year",
    start: "Start Date",
    end: "End Date"
  },
  status_map: {
    "To Do": "not_started",
    "In Progress": "in_progress",
    "Selected for Development": "ready",
    "In Review": "review",
    "Blocked": "blocked",
    "Done": "done"
  },
  type_map: {
    "Epic": "goal",
    "Initiative": "job",
    "Story": "work_item",
    "Task": "work_item",
    "Bug": "work_item",
    "Sub-task": "work_item"
  }
};

let state = {
  rows: [],
  mapping: JSON.parse(JSON.stringify(DEFAULT_MAPPING)),
  productName: "",
  defaults: "status=active; priority=P0; team=",
  xml: ""
};

const el = (id)=>document.getElementById(id);
const productNameEl = el("productName");
const defaultsEl = el("defaults");
const dropZone = el("dropZone");
const csvFileEl = el("csvFile");
const proxyUrlEl = el("proxyUrl");
const proxyKeyEl = el("proxyKey");
const jqlEl = el("jql");
const btnFetch = el("btnFetch");
const sourceSummaryEl = el("sourceSummary");
const columnsEl = el("columns");
const statusMapEl = el("statusMap");
const typeMapEl = el("typeMap");
const btnGenerate = el("btnGenerate");
const btnDownload = el("btnDownload");
const btnCopy = el("btnCopy");
const xmlPreviewEl = el("xmlPreview");
const countsEl = el("counts");

function init(){
  productNameEl.addEventListener("input", (e)=> state.productName = e.target.value.trim());
  defaultsEl.addEventListener("input", (e)=> state.defaults = e.target.value);
  dropZone.addEventListener("dragover", (e)=>{ e.preventDefault(); dropZone.classList.add("drag"); });
  dropZone.addEventListener("dragleave", ()=> dropZone.classList.remove("drag"));
  dropZone.addEventListener("drop", (e)=>{ e.preventDefault(); dropZone.classList.remove("drag"); const f=e.dataTransfer.files[0]; if(f) parseCsvFile(f); });
  csvFileEl.addEventListener("change", (e)=>{ const f=e.target.files[0]; if(f) parseCsvFile(f); });
  btnFetch?.addEventListener("click", fetchFromJiraProxy);

  renderColumnEditors();
  statusMapEl.value = kvStringFromMap(state.mapping.status_map);
  typeMapEl.value = kvStringFromMap(state.mapping.type_map);
  statusMapEl.addEventListener("input", ()=> state.mapping.status_map = mapFromKvString(statusMapEl.value));
  typeMapEl.addEventListener("input", ()=> state.mapping.type_map = mapFromKvString(typeMapEl.value));

  btnGenerate.addEventListener("click", onGenerate);
  btnDownload.addEventListener("click", onDownload);
  btnCopy.addEventListener("click", onCopy);
}

function renderColumnEditors(){
  columnsEl.innerHTML = "";
  Object.entries(state.mapping.columns).forEach(([key, val])=>{
    const row = document.createElement("div");
    row.className = "row";
    const label = document.createElement("label"); label.textContent = key;
    const input = document.createElement("input"); input.value = val;
    input.addEventListener("input", (e)=> state.mapping.columns[key] = e.target.value);
    row.appendChild(label); row.appendChild(input); columnsEl.appendChild(row);
  });
}

function kvStringFromMap(obj){ return Object.entries(obj).map(([k,v])=> `${k} = ${v}`).join("\n"); }
function mapFromKvString(text){
  const out = {}; (text||"").split("\n").forEach(line=>{ const t=line.trim(); if(!t||t.startsWith("#")) return;
    const m=t.split("="); if(m.length>=2){ out[m[0].trim()] = m.slice(1).join("=").trim(); }});
  return out;
}

function parseCsvFile(file){
  Papa.parse(file, { header:true, skipEmptyLines:true, complete:(res)=>{
    state.rows = res.data.map(r => normaliseRow(r, state.mapping.columns));
    summariseSource();
  }, error:(err)=> alert("CSV parse error: " + err) });
}

async function fetchFromJiraProxy(){
  const base = (proxyUrlEl.value||"").trim();
  const jql = (jqlEl.value||"").trim();
  const key = (proxyKeyEl.value||"").trim();
  if(!base||!jql) return alert("Please enter Proxy URL and JQL.");
  try{
    const res = await fetch(`${base.replace(/\/$/,"")}/api/jira-search?jql=${encodeURIComponent(jql)}`, { headers: key?{ "x-api-key": key }:{} });
    if(!res.ok) throw new Error(await res.text());
    const data = await res.json();
    const rows = data.issues || [];
    state.rows = rows.map(r => ({
      key: r.key || "", id: String(r.id||""),
      type: (r.fields?.issuetype?.name)||"",
      summary: r.fields?.summary || "",
      description: typeof r.fields?.description === "string" ? r.fields.description : "",
      status: r.fields?.status?.name || "",
      priority: r.fields?.priority?.name || "",
      assignee: r.fields?.assignee?.emailAddress || "",
      reporter: r.fields?.reporter?.emailAddress || "",
      labels: r.fields?.labels || [],
      components: (r.fields?.components||[]).map(c=>c.name),
      fix_versions: (r.fields?.fixVersions||[]).map(v=>v.name),
      sprint: "",
      story_points: String(r.fields?.customfield_10016 || ""),
      epic_link: (r.fields?.parent?.key && r.fields?.issuetype?.name !== "Epic") ? r.fields.parent.key : "",
      parent: r.fields?.parent?.key || "",
      team: r.fields?.customfield_team || "",
      quarter: r.fields?.customfield_quarter || "",
      year: r.fields?.customfield_year || "",
      start: r.fields?.customfield_startdate || "",
      end: r.fields?.customfield_enddate || ""
    }));
    summariseSource();
  }catch(err){ alert("Fetch failed: " + err.message); }
}

function normaliseRow(r, cols){
  const get=(k)=> r[cols[k]] ?? "";
  const list=(v)=> !v?[]:String(v).split(/[;,]/).map(s=>s.trim()).filter(Boolean);
  return {
    key: String(get("key")).trim(),
    id: String(get("id")).trim(),
    type: String(get("type")).trim(),
    summary: String(get("summary")).trim(),
    description: String(get("description")||"").trim(),
    status: String(get("status")).trim(),
    priority: String(get("priority")).trim(),
    assignee: String(get("assignee")).trim(),
    reporter: String(get("reporter")).trim(),
    labels: list(get("labels")),
    components: list(get("components")),
    fix_versions: list(get("fix_versions")),
    sprint: String(get("sprint")).trim(),
    story_points: String(get("story_points")).trim(),
    epic_link: String(get("epic_link")).trim(),
    parent: String(get("parent")).trim(),
    team: String(get("team")).trim(),
    quarter: String(get("quarter")).trim(),
    year: String(get("year")).trim(),
    start: String(get("start")).trim(),
    end: String(get("end")).trim()
  };
}

function summariseSource(){
  const total = state.rows.length;
  const byType = {}; for(const r of state.rows){ byType[r.type]=(byType[r.type]||0)+1; }
  sourceSummaryEl.textContent = `Loaded ${total} issues. Types: ` + Object.entries(byType).map(([t,c])=>`${t}:${c}`).join(", ");
}

function onGenerate(){
  if(!state.productName){ state.productName=(productNameEl.value||"").trim(); }
  if(!state.productName) return alert("Please enter a Product title.");
  if(!state.rows.length) return alert("Please load a CSV or fetch from Jira first.");
  const xml = buildAttachedFormat(state.rows, state.mapping, parseDefaults(state.defaults), state.productName);
  state.xml = xml; xmlPreviewEl.textContent = xml; btnDownload.disabled=false; btnCopy.disabled=false;
}

function onDownload(){
  const blob = new Blob([state.xml], { type:"application/xml;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `product_tree_${(state.productName||'product').toLowerCase().replace(/\s+/g,'_')}.xml`;
  a.click(); URL.revokeObjectURL(a.href);
}

async function onCopy(){
  try{ await navigator.clipboard.writeText(state.xml); btnCopy.textContent="Copied ✓"; setTimeout(()=> btnCopy.textContent="Copy to clipboard", 1200); }catch{ alert("Copy failed"); }
}

function parseDefaults(s){
  const out={}; (s||"").split(";").forEach(pair=>{ const m=pair.split("="); if(m.length>=2){ out[m[0].trim()]=m.slice(1).join("=").trim(); }}); return out;
}

function buildAttachedFormat(rows, mapping, defaults, productTitle){
  const statusMap = mapping.status_map || {};
  const typeMap = mapping.type_map || {};
  const roleOf = (jiraType)=> (typeMap[jiraType] || "work_item");
  const normStatus = (s)=> (statusMap[s] || s);

  const epics = rows.filter(r => roleOf(r.type) === "goal");
  const others = rows.filter(r => roleOf(r.type) !== "goal");

  // group by epic or parent
  const byEpic = new Map();
  for(const r of others){
    const e = r.epic_link || r.parent || "";
    if(!e) continue;
    if(!byEpic.has(e)) byEpic.set(e, []);
    byEpic.get(e).push(r);
  }

  const esc = (s)=> String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&apos;");
  const attr = (name, val)=> (val===undefined||val===null||val==="") ? "" : ` ${name}="${esc(val)}"`;

  let out=[];
  out.push(`<?xml version="1.0" encoding="UTF-8"?>`);
  out.push(`<product_tree>`);

  const productId = `pt-prod-${slug(productTitle)}`;
  out.push(`  <product id="${esc(productId)}" title="${esc(productTitle)}" type="product"${attr("status", defaults.status)}${attr("priority", defaults.priority)}${attr("team", defaults.team)}>`);
  out.push(`    <title>${esc(productTitle)}</title>`);

  for(const e of epics){
    const gId = `pt-goal-${e.key||e.id||slug(e.summary)}`;
    out.push(`    <goal id="${esc(gId)}" title="${esc(e.summary||e.key)}" type="goal"${attr("status", normStatus(e.status))}${attr("priority", e.priority)}${attr("team", e.team)}${attr("quarter", e.quarter)}${attr("year", e.year)}>`);
    out.push(`      <title>${esc(e.summary||e.key)}</title>`);
    if(e.summary) out.push(`      <summary>${esc(e.summary)}</summary>`);
    if(e.description) out.push(`      <description>${esc(e.description)}</description>`);

    const kids = (byEpic.get(e.key) || []);
    
    // Separate jobs from work items
    const jobs = kids.filter(k => roleOf(k.type) === "job");
    const workItems = kids.filter(k => roleOf(k.type) === "work_item");
    const workItemsByJob = new Map();
    
    // Group work items by their parent job
    for(const wi of workItems){
      const parentJob = wi.parent || "";
      if(parentJob){
        if(!workItemsByJob.has(parentJob)) workItemsByJob.set(parentJob, []);
        workItemsByJob.get(parentJob).push(wi);
      }
    }
    
    // Process jobs first
    for(const k of jobs){
      const jId = `pt-job-${k.key||k.id||slug(k.summary)}`;
      out.push(`      <job id="${esc(jId)}" title="${esc(k.summary||k.key)}" type="job"${attr("status", normStatus(k.status))}${attr("priority", k.priority)}${attr("team", k.team)}${attr("effort", k.story_points)}${attr("start", k.start)}${attr("end", k.end)}>`);
      out.push(`        <title>${esc(k.summary||k.key)}</title>`);
      if(k.summary) out.push(`        <summary>${esc(k.summary)}</summary>`);
      if(k.description) out.push(`        <description>${esc(k.description)}</description>`);
      if(k.description) out.push(`        <job_content>${esc(k.description)}</job_content>`);
      
      // Add work items nested under this job
      const jobWorkItems = workItemsByJob.get(k.key) || [];
      for(const wi of jobWorkItems){
        const wiId = `pt-work-${wi.key||wi.id||slug(wi.summary)}`;
        out.push(`        <work_item id="${esc(wiId)}" title="${esc(wi.summary||wi.key)}" type="work_item"${attr("status", normStatus(wi.status))}${attr("priority", wi.priority)}${attr("team", wi.team)}>`);
        out.push(`          <title>${esc(wi.summary||wi.key)}</title>`);
        if(wi.summary) out.push(`          <summary>${esc(wi.summary)}</summary>`);
        if(wi.description) out.push(`          <description>${esc(wi.description)}</description>`);
        out.push(`        </work_item>`);
      }
      
      out.push(`      </job>`);
    }
    
    // Process remaining work items (not nested under jobs)
    const remainingWorkItems = workItems.filter(wi => !wi.parent || !jobs.some(j => j.key === wi.parent));
    for(const k of remainingWorkItems){
      const wiId = `pt-work-${k.key||k.id||slug(k.summary)}`;
      out.push(`      <work_item id="${esc(wiId)}" title="${esc(k.summary||k.key)}" type="work_item"${attr("status", normStatus(k.status))}${attr("priority", k.priority)}${attr("team", k.team)}>`);
      out.push(`        <title>${esc(k.summary||k.key)}</title>`);
      if(k.summary) out.push(`        <summary>${esc(k.summary)}</summary>`);
      if(k.description) out.push(`        <description>${esc(k.description)}</description>`);
      out.push(`      </work_item>`);
    }
    
    // Process work items (not jobs)
    const workItems2 = kids.filter(k => roleOf(k.type) === "work");
    for(const k of workItems2){
      const wId = `pt-work-${k.key||k.id||slug(k.summary)}`;
      out.push(`      <work id="${esc(wId)}" title="${esc(k.summary||k.key)}" type="work"${attr("status", normStatus(k.status))}${attr("priority", k.priority)}${attr("team", k.team)}>`);
      out.push(`        <title>${esc(k.summary||k.key)}</title>`);
      if(k.summary) out.push(`        <summary>${esc(k.summary)}</summary>`);
      if(k.description) out.push(`        <description>${esc(k.description)}</description>`);
      out.push(`      </work>`);
    }
    
    out.push(`    </goal>`);
  }

  out.push(`  </product>`);
  out.push(`</product_tree>`);

  countsEl.textContent = `Goals: ${epics.length} · Items: ${others.length}`;
  return out.join("\n");
}

function slug(s){ return String(s||"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,""); }

window.addEventListener("DOMContentLoaded", init);
