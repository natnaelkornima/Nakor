# Natnael Kornima — Personal Portfolio

> **Full-Stack Engineer & Systems Builder**  
> Modern, minimal, highly professional, zero-slop portfolio engineered with **Taste Skill** and **Impeccable** design craft principles.

---

## 🚀 Quick Preview (Live Now)

The local server is running at:
```bash
http://localhost:3000
```

To run the local server manually at any time:
```bash
# Python built-in zero-dependency server:
python3 -m http.server 3000
```
Then open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🎨 Design System & Architecture

This portfolio strictly adheres to **Taste Skill** and **Impeccable** craft directives:

- **Surface Mode**: `Experience` (Portfolio showcase: the software artifacts and architectural decisions lead).
- **Anti-Slop Discipline**:
  - No generic gradient text, AI purple gradient meshes, or floating blobs.
  - Strict typographic hierarchy using **Space Grotesk** (display), **Plus Jakarta Sans** (body), and **JetBrains Mono** (technical).
  - High-contrast color tokens with dual-theme support (Dark OLED Zinc `#09090b` and Crisp Light Porcelain `#fafafc`).
  - Asymmetric project layouts prioritizing problem/solution breakdown and key engineering decisions.
  - Interactive **Engineering Architecture Visualizer** (Full-Stack Web Flow & Production AI Pipeline).
  - Accessible slide-over drawer modal for project deep dives with keyboard navigation (Esc, visible focus rings).
  - Instant one-click copy email feedback with toast notification.
  - Full SEO optimization with OpenGraph, Twitter Cards, JSON-LD Schema (`Person` / `SoftwareEngineer`), `sitemap.xml`, and `robots.txt`.

---

## 📂 Project Structure

```
├── index.html                 # Semantic, accessible HTML5 entry point
├── css/
│   ├── design-system.css      # Design tokens, typography, colors, dark/light variables
│   └── components.css         # Component styling (Hero, Projects, Architecture, AI, Skills)
├── js/
│   ├── data.js                # Structured data (Profile, Projects, Skills, Architecture)
│   └── app.js                 # Theme toggler, filters, drawer modal, tabs, copy email
├── src/
│   └── data/
│       └── portfolio-data.ts  # Typed models for Next.js / TypeScript integration
├── robots.txt                 # Search engine directives
├── sitemap.xml                # Sitemap for indexing
└── .agents/skills/            # Installed Taste-Skill & Impeccable skills
```

---

## 🚢 Deployment

You can deploy this site in seconds to any platform:
- **GitHub Pages**: Push this repository and enable GitHub Pages in Settings -> Pages -> Deploy from Branch (`main` / root).
- **Vercel**: Run `vercel` or link your GitHub repo.
- **Cloudflare Pages / Netlify**: Connect repository with publish directory set to `./`.
