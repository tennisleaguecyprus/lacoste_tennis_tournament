# Push only this folder to GitHub (`lacoste_tennis_tournament`)

Your tennis site lives in **`lagoste_tennis_tournaments/`** inside a bigger **Cursor** repo.  
To update **only** the GitHub site repo (e.g. for Netlify), use **one** of these.

---

## Method A — `git subtree split` (recommended)

Run from the **parent** repo root: `C:\Users\chriskar\Downloads\Cursor`

**PowerShell or Git Bash:**

```powershell
cd C:\Users\chriskar\Downloads\Cursor

git subtree split --prefix=lagoste_tennis_tournaments -b tennis-only

git push origin tennis-only:main --force-with-lease
```

What this does:

- Builds a branch **`tennis-only`** whose commits contain **only** the files from `lagoste_tennis_tournaments/`, at the **root** of that branch (good for Netlify: `index.html` at repo root).
- Pushes that branch to **`main`** on **`origin`** (`lacoste_tennis_tournament`).

If `--force-with-lease` is rejected (e.g. someone else pushed), check GitHub, then use `git push origin tennis-only:main --force` only if you intend to overwrite `main`.

---

## Method B — Fresh repo (only tennis files, new history)

Use this if subtree split fails or you want a clean history.

1. Create a **new** folder, e.g. `C:\Users\chriskar\lacoste_tennis_tournament_clean`
2. Copy **everything inside** `lagoste_tennis_tournaments\` into that folder (so `index.html` is at the folder root).
3. In that folder:

```powershell
cd C:\Users\chriskar\lacoste_tennis_tournament_clean
git init
git branch -M main
git remote add origin https://github.com/tennisleaguecyprus/lacoste_tennis_tournament.git
git add .
git commit -m "Tennis site only"
git push -u origin main --force
```

`--force` replaces whatever is on `main` — use only if you accept that.

---

## Netlify

With **Method A** or **B**, the GitHub repo root should have **`index.html`**.  
Set **Publish directory** to **`.`** and **Functions** to **`netlify/functions`**.

---

## Longer term

Point the **big Cursor** repo’s `origin` at a **different** GitHub repo (backup/monorepo), and add a second remote only for tennis, e.g.:

```powershell
git remote add tennis https://github.com/tennisleaguecyprus/lacoste_tennis_tournament.git
git push tennis tennis-only:main --force-with-lease
```

Then your main work pushes to `origin`, tennis deploy pushes to `tennis`.
