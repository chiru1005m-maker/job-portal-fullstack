# Sample Website

This is a minimal static website scaffold created inside the existing Java project workspace. It's intended as a starting point you can open locally or deploy to GitHub Pages / Netlify.

Files:

- `index.html` — main page
- `styles.css` — styling
- `script.js` — contact form simulation

Open locally:

- Double-click `index.html` in the `website/` folder, or open it in a browser.

Serve locally with a quick static server (Node.js) — run in PowerShell:

```powershell
# If you have Python 3 installed
python -m http.server 5500
# or using Node.js 'http-server' if installed
npx http-server -p 5500
```

Deploy options:

- GitHub Pages: create a repo and push the `website/` contents to `gh-pages` branch or enable Pages from the `main` branch and `/(root)` path.
- Netlify: drag-and-drop the `website/` folder to Netlify or connect a repo and set publish directory to `website/`.

Customize:

- Edit `index.html`, `styles.css`, and `script.js` to add pages, components, and backend integration.