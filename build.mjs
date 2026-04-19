// Build script — concatenates JSX files in order, transforms with esbuild,
// rewrites index.html for production, and copies static assets to dist/.
import { promises as fs } from "node:fs";
import path from "node:path";
import esbuild from "esbuild";

const ROOT = process.cwd();
const SRC = ROOT;
const OUT = path.join(ROOT, "dist");

const ORDER = [
  "components/Analytics.jsx",
  "components/audio.jsx",
  "components/Cursor.jsx",
  "components/Loader.jsx",
  "components/Nav.jsx",
  "components/Hero.jsx",
  "components/Band.jsx",
  "components/Stats.jsx",
  "components/Events.jsx",
  "components/Roster.jsx",
  "components/Contact.jsx",
  "components/Footer.jsx",
  "components/Tweaks.jsx",
  "app.jsx"
];

async function exists(p) { try { await fs.access(p); return true; } catch { return false; } }

async function copyDir(src, dest) {
  if (!(await exists(src))) return;
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const e of entries) {
    if (e.name.startsWith(".")) continue;
    const s = path.join(src, e.name);
    const d = path.join(dest, e.name);
    if (e.isDirectory()) await copyDir(s, d);
    else await fs.copyFile(s, d);
  }
}

async function main() {
  console.log("[build] cleaning dist/");
  await fs.rm(OUT, { recursive: true, force: true });
  await fs.mkdir(OUT, { recursive: true });

  // 1. Concatenate JSX in defined order
  console.log("[build] concatenating", ORDER.length, "JSX files");
  let combined = "";
  for (const rel of ORDER) {
    const p = path.join(SRC, rel);
    if (!(await exists(p))) {
      console.warn("[build] skipping missing", rel);
      continue;
    }
    const code = await fs.readFile(p, "utf8");
    combined += `\n// ===== ${rel} =====\n${code}\n`;
  }

  // 2. Build with esbuild (supports node_modules imports)
  console.log("[build] building with esbuild");
  
  // Write temporary combined file
  const tempFile = path.join(ROOT, ".temp-bundle.jsx");
  await fs.writeFile(tempFile, combined, "utf8");
  
  const result = await esbuild.build({
    entryPoints: [tempFile],
    bundle: true,
    minify: true,
    target: ["es2018"],
    format: "iife",
    legalComments: "none",
    external: ["react", "react-dom"],
    write: false,
    jsx: "transform",
    jsxFactory: "React.createElement",
    jsxFragment: "React.Fragment"
  });
  
  // Clean up temp file
  await fs.unlink(tempFile);
  
  const bundleCode = result.outputFiles[0].text;

  await fs.writeFile(path.join(OUT, "bundle.js"), bundleCode, "utf8");
  console.log(`[build] bundle.js: ${(bundleCode.length / 1024).toFixed(1)}kB`);

  // 3. Rewrite index.html for production
  console.log("[build] writing index.html");
  let html = await fs.readFile(path.join(SRC, "index.html"), "utf8");
  // Strip any leftover Babel/JSX script tags (just in case)
  html = html.replace(/\s*<script[^>]*type=["']text\/babel["'][^>]*><\/script>\s*/g, "\n");
  html = html.replace(/\s*<script[^>]*babel\.min\.js[^>]*><\/script>\s*/g, "\n");
  // Force production React URLs
  html = html.replace(/react@(\d+\.\d+\.\d+)\/umd\/react\.development\.js/g, "react@$1/umd/react.production.min.js");
  html = html.replace(/react-dom@(\d+\.\d+\.\d+)\/umd\/react-dom\.development\.js/g, "react-dom@$1/umd/react-dom.production.min.js");
  await fs.writeFile(path.join(OUT, "index.html"), html, "utf8");

  // 4. Copy CSS, public, uploads
  for (const rel of ["styles.css", "public", "uploads"]) {
    const s = path.join(SRC, rel);
    const d = path.join(OUT, rel === "public" ? "" : rel);
    if (!(await exists(s))) continue;
    const stat = await fs.stat(s);
    if (stat.isDirectory()) {
      // public/ contents go into dist/ root (favicon, og-image, robots, sitemap)
      if (rel === "public") {
        await copyDir(s, OUT);
      } else {
        await copyDir(s, d);
      }
    } else {
      await fs.copyFile(s, path.join(OUT, rel));
    }
    console.log("[build] copied", rel);
  }

  console.log("[build] done →", OUT);
}

main().catch(e => { console.error(e); process.exit(1); });
