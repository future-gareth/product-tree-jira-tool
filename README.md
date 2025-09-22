# Product Tree from Jira — Amended Tool
_Last updated: 2025-09-10 16:07 _

This build outputs **Product Tree XML** in the **attached format** you supplied:
- Root `<product_tree>` with lower-case tags
- `product → goal → (job | work_item | work)` hierarchy
- `title`, `summary`, `description` as child elements on each entity
- Optional `job_content` on jobs
- Attributes like `status`, `priority`, `team`, `effort`, `start`, `end` preserved when present

## How to use
1. Open `ui/index.html` in a browser (or deploy to the web).
2. Enter the Product title (display name).
3. Load Jira data via **CSV** (drag a CSV exported from Jira) or use **JQL** via the optional proxy.
4. (Optional) Adjust mappings (Epic→goal, Initiative→job, Story/Task/Bug→work_item or work).
5. Click **Generate XML** → **Download**.

## Deploying online (suggested path)
Host under: `https://garethapi.com/tools/product-tree-from-jira`  
Optional proxy route: `https://garethapi.com/tools/api/jira-search`

See **DEPLOY_NOTES.md** for Cloudflare Pages + Worker, Vercel, and Netlify options.
