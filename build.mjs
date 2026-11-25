// Build: esbuild bundles src/*.ts, static/ is copied, then one folder + zip per browser.
// The Chrome zip also goes to Edge and Opera; Firefox gets its own manifest
// (background.scripts + gecko id).
import { build } from "esbuild";
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync, copyFileSync } from "node:fs";
import { execSync } from "node:child_process";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const base = JSON.parse(readFileSync("static/manifest.json", "utf8"));
base.version = pkg.version;
const ENTRIES = ["background", "collect", "popup", "sizechart"];

rmSync("dist", { recursive: true, force: true });
mkdirSync("dist/tmp", { recursive: true });

await build({
  entryPoints: Object.fromEntries(ENTRIES.map((e) => [e, `src/${e}.ts`])),
  bundle: true,
  minify: false, // readable bundles: AMO asks for source otherwise, CWS reviews faster
  format: "iife",
  target: ["chrome110", "firefox115"],
  outdir: "dist/tmp",
  legalComments: "eof",
});

function out(target, manifest) {
  const dir = `dist/${target}`;
  cpSync("static", dir, { recursive: true, filter: (f) => !f.endsWith(".DS_Store") });
  for (const e of ENTRIES) copyFileSync(`dist/tmp/${e}.js`, `${dir}/${e}.js`);
  writeFileSync(`${dir}/manifest.json`, JSON.stringify(manifest, null, 2));
  execSync(`cd ${dir} && zip -qr ../${pkg.name}-${target}-${pkg.version}.zip . -x '*.DS_Store'`);
}

out("chrome", base);

const ff = structuredClone(base);
ff.background = { scripts: ["background.js"] };
ff.browser_specific_settings = {
  gecko: { id: "listing-helper@fashiolabs.com", strict_min_version: "140.0", data_collection_permissions: { required: ["none"] } },
  gecko_android: { strict_min_version: "142.0" },
};
out("firefox", ff);
rmSync("dist/tmp", { recursive: true, force: true });
console.log("built", pkg.version, "→ dist/chrome, dist/firefox + zips");
