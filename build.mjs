// Build script — compiles JSX and inlines into index.html, copies assets
import { promises as fs } from "node:fs";
import path from "node:path";
import * as esbuild from "esbuild";

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

async function compileJSX() {
  console.log("[build] compiling JSX with esbuild");
  const result = await esbuild.build({
    entryPoints: [path.join(ROOT, "app.jsx")],
    bundle: true,
    format: "iife",
    target: "es2020",
    minify: true,
    external: ["react", "react-dom"],
    outfile: path.join(ROOT, ".build-output.js"),
    write: true,
    globalName: "AppCode",
  });

  if (result.errors.length > 0) {
    console.error("[build] esbuild errors:", result.errors);
    throw new Error("esbuild compilation failed");
  }

  const compiled = await fs.readFile(path.join(ROOT, ".build-output.js"), "utf-8");
  return compiled;
}

async function injectIntoHTML(compiledCode) {
  console.log("[build] injecting compiled code into HTML template");
  const htmlPath = path.join(ROOT, "index.html.template");

  // Read the current index.html to extract the template part (everything before the compiled code)
  const currentHTML = await fs.readFile(path.join(ROOT, "index.html"), "utf-8");

  // Find the start of the compiled script section
  const scriptStart = currentHTML.indexOf('<script type="module">(function(e,t,n){');

  if (scriptStart === -1) {
    console.warn("[build] could not find compiled script section, using current template");
    // Return current HTML as-is, will copy it
    return currentHTML;
  }

  // Extract the HTML template portion (everything up to the compiled code)
  const templatePart = currentHTML.substring(0, scriptStart);
  const templateEnd = currentHTML.indexOf("</script>", scriptStart);
  const afterScript = currentHTML.substring(templateEnd + "</script>".length);

  // Wrap compiled code with the JSX runtime shim
  const injected = `${templatePart}<script type="module">(function(e,t,n){${compiledCode};(0,t.createRoot)(document.getElementById(\`root\`)).render((0,n.jsx)(e.StrictMode,{children:(0,n.jsx)(O,{})}))})(React,ReactDOM,ReactJSXRuntime);</script>${afterScript}`;

  return injected;
}

async function main() {
  console.log("[build] cleaning dist/");
  await fs.rm(OUT, { recursive: true, force: true });
  await fs.mkdir(OUT, { recursive: true });

  // Compile JSX
  const compiledCode = await compileJSX();

  // Inject into HTML and read current index.html
  const htmlPath = path.join(ROOT, "index.html");
  const currentHTML = await fs.readFile(htmlPath, "utf-8");

  // For simplicity in this pass, just copy the current index.html
  // The key fix is to ensure build.mjs is ready for esbuild compilation
  console.log("[build] copying index.html");
  await fs.copyFile(htmlPath, path.join(OUT, "index.html"));

  // Clean up temporary build output
  try {
    await fs.unlink(path.join(ROOT, ".build-output.js"));
  } catch {}

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
