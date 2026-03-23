# Admin & hosting — how updates work

## Using the admin pages (local or online)

1. **`admin.html`** — Edit player names in each category. Changes save automatically to the browser’s **localStorage**.
2. **`run-tournament.html`** — Enter group scores, times, 3rd-place tie-break, and view the knockout bracket. Same storage keys as above.

**Public / visitor pages**

- **`index.html`** — Read-only home page (entry lists load from the same localStorage if present).
- **`run-tournament-view.html`** — Redirects to **`run-tournament.html?view=1`**, which is **read-only** (no editing scores or times).

## Cloud = live results for everyone

The site can sync to **Supabase** (database) with a **Netlify serverless function** for secure writes. When enabled in `js/cloud-config.js`, the public home page and tournament progress page **pull** that data and **poll** every few seconds.

**Setup:** follow **[CLOUD-SETUP.md](CLOUD-SETUP.md)** (Supabase SQL, Netlify env vars, admin password).

---

## Without cloud: data is per browser only

If cloud sync is **off**, this is plain **static HTML**. Saving in admin only updates **that device’s** browser storage — other phones won’t see it.

## Other ways to share data (no cloud)

| Approach | Effort |
|----------|--------|
| **Display device** — One tablet/PC at the venue, shown on a screen | Easiest |
| **CMS / other backend** | Higher |

## Security note

`admin.html` and `run-tournament.html` are **not password-protected**. Anyone who knows the URL can edit. For a real event, either:

- Keep admin URLs private / unlinked from the public menu, or  
- Add hosting-level protection (Netlify password, basic auth) or a real login + API.

## File map

| File | Role |
|------|------|
| `index.html` | Public home |
| `admin.html` | Edit players |
| `run-tournament.html` | Organisers: full edit |
| `run-tournament-view.html` | Public shortcut → read-only tournament view |
| `run-tournament.html?view=1` | Same page, read-only mode |
| `js/cloud-config.js` | Turn cloud sync on/off + Supabase anon credentials |
| `js/cloud-sync.js` | Pull / push / polling logic |
| `netlify/functions/save-tournament.mjs` | Secure writes (Netlify) |
| `supabase/schema.sql` | Create `tournament_state` table + RLS |
| `CLOUD-SETUP.md` | Step-by-step Supabase + Netlify setup |
