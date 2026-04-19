// Build script — copies self-contained index.html and public assets to dist/
import { promises as fs } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "dist");

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

  console.log("[build] copying index.html");
  await fs.copyFile(path.join(ROOT, "index.html"), path.join(OUT, "index.html"));

  for (const rel of ["public", "uploads"]) {
    const s = path.join(ROOT, rel);
    if (!(await exists(s))) continue;
    const stat = await fs.stat(s);
    if (stat.isDirectory()) {
      if (rel === "public") {
        await copyDir(s, OUT);
      } else {
        await copyDir(s, path.join(OUT, rel));
      }
      console.log("[build] copied", rel);
    }
  }

  console.log("[build] done →", OUT);
}

main().catch(e => { console.error(e); process.exit(1); });
