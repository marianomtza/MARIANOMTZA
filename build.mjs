import { build } from "esbuild";
import { promises as fs } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "dist");

// Component load order matters — dependencies first, app last
const COMPONENTS = [
  "components/audio.jsx",
  "components/DrumKit.jsx",
  "components/PremiumCursor.jsx",
  "components/Background3D.jsx",
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
  "components/EasterEggs.jsx",
  "app.jsx",
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

async function buildJS() {
  const parts = await Promise.all(
    COMPONENTS.map(async (f) => {
      const p = path.join(ROOT, f);
      if (!(await exists(p))) { console.warn(`[build] skipping missing: ${f}`); return ""; }
      return fs.readFile(p, "utf8");
    })
  );
  const combined = parts.join("\n");

  const result = await build({
    stdin: { contents: combined, loader: "jsx", resolveDir: ROOT },
    write: false,
    bundle: false,
    minify: true,
    jsx: "transform",
    jsxFactory: "React.createElement",
    jsxFragment: "React.Fragment",
    target: "es2018",
  });

  return result.outputFiles[0].text;
}

async function main() {
  console.log("[build] cleaning dist/");
  await fs.rm(OUT, { recursive: true, force: true });
  await fs.mkdir(OUT, { recursive: true });

  console.log("[build] compiling JSX bundle...");
  const bundle = await buildJS();
  console.log(`[build] bundle: ${(bundle.length / 1024).toFixed(1)}kb`);

  console.log("[build] building index.html from template...");
  const template = await fs.readFile(path.join(ROOT, "template.html"), "utf8");
  const html = template.replace(
    "<!--BUNDLE-->",
    `<script>${bundle}</script>`
  );
  await fs.writeFile(path.join(OUT, "index.html"), html);

  // Copy styles.css to dist root
  const stylesPath = path.join(ROOT, "styles.css");
  if (await exists(stylesPath)) {
    await fs.copyFile(stylesPath, path.join(OUT, "styles.css"));
    console.log("[build] copied styles.css");
  }

  for (const rel of ["public", "uploads"]) {
    const s = path.join(ROOT, rel);
    if (!(await exists(s))) continue;
    const stat = await fs.stat(s);
    if (stat.isDirectory()) {
      if (rel === "public") await copyDir(s, OUT);
      else await copyDir(s, path.join(OUT, rel));
      console.log("[build] copied", rel);
    }
  }

  console.log("[build] done →", OUT);
}

main().catch(e => { console.error(e); process.exit(1); });
