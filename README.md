# Matrix Careers — 3D Interactive Finance & Career Content Hub

A production-ready, ultra-premium 3D interactive finance & career content hub built with React, Tailwind CSS, Lucide React, and Three.js (`@react-three/fiber` + `@react-three/drei`).

**100% static frontend** — zero server, zero database, zero backend maintenance. Deploy to any static host (Netlify, Vercel, GitHub Pages, Cloudflare Pages).

Designed to maximize user dwell time and high-CPM ad network impressions through an immersive 3D constellation interface, gamified reading experience, and embedded premium ad placements.

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Build for production (outputs to dist/)
npm run build

# Preview production build locally
npm run preview
```

---

## 📁 Project Structure

```
finance-hub/
├── public/                 # Static assets (served at root)
│   ├── favicon.svg         # Site favicon
│   ├── icons.svg           # Sprite icons
│   ├── manifest.json       # PWA web app manifest
│   ├── robots.txt          # Search engine crawling rules
│   └── sitemap.xml         # SEO sitemap
├── src/
│   ├── App.jsx             # Root app — layout, analytics, routing state
│   ├── main.jsx            # Entry point
│   ├── index.css           # Tailwind + custom styles
│   ├── data/articles.js    # 📰 Content repository (edit here to add articles)
│   ├── components/
│   │   ├── AdSlot.jsx              # Simulated display ads (horizontal/sidebar/inline)
│   │   ├── ArticleNode.jsx         # Interactive 3D node per article
│   │   ├── HubScene.jsx            # Three.js canvas scene (constellation + lights)
│   │   ├── SidebarPanel.jsx        # Glassmorphism slide-in reader
│   │   ├── CodeSandbox.jsx         # Client-side coding sandbox (localStorage)
│   │   ├── SalaryCalculator.jsx    # Freelance growth & salary calculator
│   │   └── ErrorBoundary.jsx       # React error boundary
│   └── hooks/
│       └── useAnalytics.js         # Dwell time, ad impression, article tracking
├── dist/                   # Production build output (gitignored)
├── netlify.toml            # Netlify deploy config
├── vercel.json             # Vercel deploy config
├── tailwind.config.js      # Tailwind v3 config
├── postcss.config.cjs      # PostCSS config
├── vite.config.js          # Vite config
└── README.md
```

---

## 📝 Content Management

All articles live in **`src/data/articles.js`**. To add a new article, append an object to the array:

```js
{
  id: "unique-slug-id",
  title: "Article Title",
  summary: "Short summary shown in listings",
  category: "Freelancing",   // Freelancing | Placements | Finance | Remote Work
  readTime: "7 min read",
  date: "Nov 06, 2026",
  question: "Build a Payment Gateway Integration Utility",
  starterCode: `// starter code here`,
  tests: ["Test 1", "Test 2", "Test 3"],
  content: `### Section 1\nLong-form markdown content...\n### Section 2\nMore content...`,
}
```

Each article gets:
- A 3D constellation node with category color
- A slide-in reader sidebar with typography hierarchy
- A coding sandbox question below the content
- An inline ad slot at the article midpoint

---

## 🎨 Features

| Feature | Description |
|---------|-------------|
| **3D Constellation** | Interactive nodes (icosahedron + torus knot) floating in WebGL space |
| **Category Filtering** | Click "All"/"Freelancing"/"Placements" to show/hide node groups |
| **Node Hover** | Scale +30%, wireframe→solid glowing glassmorphic mesh, emissive glow |
| **Click to Read** | Slide-in glassmorphism sidebar (480px desktop, full-screen mobile) |
| **Code Sandbox** | Per-article coding challenge with localStorage persistence |
| **Salary Calculator** | Freelance growth (10% compounding) + salary breakdown (28% allocation) |
| **Ad Placements** | Horizontal leaderboard + inline content rectangle slots |
| **Analytics** | Dwell time, ad impressions, article read time (localStorage) |
| **SEO** | Meta tags, Open Graph, Twitter Cards, JSON-LD, sitemap, robots.txt |
| **PWA** | Web app manifest for installable standalone app |
| **Accessibility** | Skip link, ARIA labels, keyboard navigation, reduced motion |

---

## 🚀 Deployment

### Netlify (Recommended)

**Option A — Drag & Drop:**
1. Run `npm run build`
2. Drag the `dist/` folder to [Netlify Drop](https://app.netlify.com/drop)

**Option B — Git Integration:**
1. Push this repo to GitHub
2. Connect the repo to Netlify
3. Build command: `npm run build`
4. Publish directory: `dist`

**Option C — CLI:**
```bash
npm run deploy:netlify
```

### Vercel

1. Push this repo to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Vercel auto-detects Vite — deploy

**CLI:**
```bash
npm run deploy:vercel
```

### GitHub Pages

1. Enable GitHub Pages in repo settings (source: GitHub Actions)
2. Add a workflow that runs `npm run build` and deploys `dist/`
3. Or use `vite build` with `base: "/repo-name/"` in `vite.config.js`

### Cloudflare Pages

1. Connect GitHub repo
2. Build command: `npm run build`
3. Build output directory: `dist`

---

## 📊 High-CPM Ad Monetization

The app includes three ad slot variants designed for premium viewability:

- **`horizontal`** (`h-24`) — Leaderboard banner at top of sidebar
- **`sidebar`** (`h-64`) — Skyscraper unit
- **`inline`** (`h-32`) — Content rectangle injected at article midpoint

All variants feature:
- Dark-mode "SPONSORED ADVERTISEMENT" labels
- Glass shimmer animation sweep
- Click tracking via `useAnalytics`
- ARIA `role="banner"` for accessibility

Ad impressions and clicks are tracked to `localStorage` under `matrix_analytics` for reporting to ad networks.

---

## 🛠️ Customization

### Colors / Branding
Edit `tailwind.config.js` — category colors are mapped in `ArticleNode.jsx`:
- Freelancing → Indigo (`0x6366f1`)
- Placements → Blue (`0x3b82f6`)
- Finance → Emerald (`0x22c55e`)
- Remote → Purple (`0xa855f7`)
- Selected state → Emerald (`0x10b981`)

### Constellation Layout
Edit `CONSTELLATION_POSITIONS` in `ArticleNode.jsx` to redistribute nodes.

### Lighting
Edit `HubScene.jsx` — ambient, indigo point, and emerald directional lights.

---

## 🧪 Tech Stack

| Package | Version | Purpose |
|---------|---------|---------|
| React | ^19.3.1 | UI framework |
| Vite | ^8.3.6 | Build tool & dev server |
| Tailwind CSS | ^3.4.17 | Styling |
| Three.js | ^0.187.0 | WebGL 3D |
| @react-three/fiber | ^9.8.2 | React renderer for Three.js |
| @react-three/drei | ^10.7.9 | Three.js helpers |
| Lucide React | ^1.70.0 | Icons |

---

## 📄 License

MIT

---

## Deploy in 2 Minutes

```bash
git clone <your-repo>
cd finance-hub
npm install
npm run build
# Upload dist/ to any static host
```

Your 3D interactive content hub is live — no servers, no databases, no maintenance.