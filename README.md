# AI Disclosure Label

A two-axis model for transparent AI content attribution.

## Quickstart

```bash
npm install
npm run dev
```

Then open http://localhost:5173

## Build for production

```bash
npm run build        # outputs to dist/
npm run preview      # preview the production build locally
```

## Deploy

The `dist/` folder after `npm run build` is a fully static site — drop it on:
- **GitHub Pages** (set build output to `dist/`)
- **Netlify** (drag & drop `dist/`, or connect repo)
- **Vercel** (auto-detects Vite)
- Any static host

Once deployed, set your site URL in the app's Export panel. The HTML badges
will then link back to your instance with the correct classification pre-selected.

## Shareable links

`https://your-site.com/?c=0&a=2` — the app reads `c` and `a` from URL params
on load, so you can share pre-classified links directly.

## Project layout

```
src/
  App.jsx      — all components and logic (single file, easy to iterate)
  main.jsx     — React entry point
  index.css    — CSS variables (light + dark mode), minimal reset
index.html
vite.config.js
package.json
```

## Iterating on the model

All definitions live at the top of `src/App.jsx`:

- `C_DEFS` — Conception scale labels and descriptions
- `A_DEFS` — Authorship scale labels and descriptions  
- `EXAMPLES` — the six example cards
- `getLabelInfo()` — scoring thresholds that map C×A to a tier label

The badge code (`C0·A2`) is the stable reference across model updates.
The tier label (Human + AI) is a convenience label that may change.

## The autonomous HTML badge

Exported HTML badges are fully self-contained:
- No external CSS or JS dependencies
- Hover tooltip with full C and A explanations
- Optional link back to your generator (set Site URL in the Export panel)
- Light-mode hardcoded (intentional — safe to embed in any host page)
