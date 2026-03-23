# Live results — Supabase + Netlify API

This adds a **shared cloud copy** of players, match scores, and tie-break data so all visitors see the same results (with a few seconds’ delay via polling).

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → New project.
2. Open **SQL Editor** → New query → paste everything from `supabase/schema.sql` → Run.
3. Open **Project Settings → API** and copy:
   - **Project URL**
   - **Publishable** key (`sb_publishable_…`) or legacy **anon** JWT — both are safe in the browser (`js/cloud-config.js`)

## 2. Deploy site on Netlify

1. Connect this folder (`lagoste_tennis_tournaments`) as the site root (or set **Base directory** / publish directory so this folder is what gets deployed).
2. **Site settings → Environment variables** (or **Build & deploy → Environment**):

   | Variable | Value |
   |----------|--------|
   | `SUPABASE_URL` | Same as Project URL |
   | `SUPABASE_SERVICE_ROLE_KEY` | **Secret** / **service_role** key (Dashboard → API) — **never** in Git or `cloud-config.js` |
   | `ADMIN_SAVE_PASSWORD` | Choose a strong password; you’ll type it on the Admin / Run tournament pages |

3. Redeploy after saving variables.

Netlify will pick up `netlify.toml` and deploy the function at:

`https://YOUR-SITE.netlify.app/.netlify/functions/save-tournament`

## 3. Enable cloud in the site

Edit **`js/cloud-config.js`** (or deploy with your values):

```javascript
window.LAGOSTE_CLOUD = {
  enabled: true,
  supabaseUrl: 'https://YOUR-PROJECT.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  saveFunctionPath: '/.netlify/functions/save-tournament',
};
```

- **`enabled: true`** turns on pull/push/polling.
- If the site is **not** on Netlify, set `saveTournamentUrl` to the full URL of your save endpoint (you’d host the same function elsewhere).

## 4. Using it day-of

1. Open **`admin.html`** or **`run-tournament.html`** on your laptop.
2. In **Cloud sync**, enter the same password as `ADMIN_SAVE_PASSWORD` → **Save password (this browser)**.
3. **Pull from cloud** once if others already entered data.
4. Edit players/scores as usual — changes save to the browser **and** (after ~2s) **push to Supabase** automatically when a password is saved.
5. **Public** `index.html` and **Tournament progress** pull from the cloud on load and **every ~10 seconds**.

### Local testing (optional)

- Run `npx netlify-cli dev` from this folder to test functions locally; configure the same env vars in Netlify CLI or a `.env` (do not commit `.env`).

## Security notes

- **anon key** in `cloud-config.js` is normal; RLS only allows **read** on `tournament_state`.
- **Writes** require `ADMIN_SAVE_PASSWORD` + server-side **service role** in the Netlify function.
- Anyone who guesses the password can overwrite data — use a long random password and don’t share it.

## Troubleshooting

| Issue | Check |
|--------|--------|
| Public page never updates | `enabled: true`, URL/anon key correct, row exists (`singleton` in `tournament_state`) |
| Push fails 401 | Password must match `ADMIN_SAVE_PASSWORD` exactly |
| Push fails 502 | Netlify env: `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` |
| CORS errors | Save must go to **same site** as the HTML or configure CORS on your host |
| Netlify **“Page not found”** (404) | The live files are in **`lagoste_tennis_tournaments/`**. If your Git repo is the **parent** folder, set **Publish directory** to `lagoste_tennis_tournaments` in Netlify, or use the repo-root **`netlify.toml`** (see parent folder). Redeploy. |
