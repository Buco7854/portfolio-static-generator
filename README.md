# portfolio-static

Custom Node.js static site generator for my portfolio. Fetches data from PocketBase at build time and outputs plain HTML, CSS, and vanilla JS — zero framework fingerprints.

## Commands

| Command | Action |
| :--- | :--- |
| `npm install` | Install dependencies |
| `npm run build` | Download files + build to `dist/` |
| `npm run preview` | Build + start local preview server |

## How it works

1. **Data** — fetches all content from PocketBase (`src/lib/api.ts`)
2. **Files** — downloads PB file attachments to `public/files/` (`scripts/download-files.ts`)
3. **Templates** — generates HTML via template literal functions (`scripts/templates/`)
4. **CSS** — processes Tailwind CSS v4 via `@tailwindcss/cli`
5. **JS** — single vanilla JS file for interactivity (`public/js/main.js`)
6. **Output** — clean static site in `dist/`
