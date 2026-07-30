# DriveBuddy Static Site

This project keeps the full visual styling/CSS inside `index.html` so the current design is preserved. Only the JavaScript behavior was moved into `src/main.ts` and compiled to `dist/assets/main.js` for hosting.

## Build for hosting

```bash
npm run build
```

Upload the generated `dist/` folder to your static host. The build copies `index.html`, `robots.txt`, `sitemap.xml`, and `_redirects` into `dist/`, and the CSS remains embedded in the built `index.html`.
