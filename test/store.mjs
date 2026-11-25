// Store assets: 1280×800 screenshots (popup beside the product page) + 440×280 promo tile.
import { chromium } from "playwright";
import { cpSync, readFileSync, writeFileSync, rmSync, mkdirSync } from "node:fs";
const [src, url, outDir] = process.argv.slice(2);
mkdirSync(outDir, { recursive: true });
const ext = "/tmp/ext-test-fashio/build-store";
rmSync(ext, { recursive: true, force: true });
cpSync(src, ext, { recursive: true });
const m = JSON.parse(readFileSync(ext + "/manifest.json", "utf8"));
m.host_permissions = ["<all_urls>"];
writeFileSync(ext + "/manifest.json", JSON.stringify(m));
const ctx = await chromium.launchPersistentContext("/tmp/ext-test-fashio/profile-store-" + Date.now(), {
  channel: "chromium", headless: true, viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1,
  args: [`--disable-extensions-except=${ext}`, `--load-extension=${ext}`],
});
let [sw] = ctx.serviceWorkers();
if (!sw) sw = await ctx.waitForEvent("serviceworker");
const id = sw.url().split("/")[2];
const page = await ctx.newPage();
await page.setViewportSize({ width: 800, height: 720 });
await page.goto(url, { waitUntil: "load" });
const tabId = await sw.evaluate(async (u) => (await chrome.tabs.query({})).find(t => t.url?.startsWith(u))?.id, url);
const b64 = async (buf) => "data:image/png;base64," + buf.toString("base64");

async function popupShot(market, tab, scrollTo = 0) {
  const p = await ctx.newPage();
  await p.setViewportSize({ width: 400, height: 640 });
  await p.addInitScript(([tid, mk]) => {
    const q = chrome.tabs.query.bind(chrome.tabs);
    chrome.tabs.query = async (o) => (o?.active ? [{ id: tid }] : q(o));
    chrome.storage.sync.set({ market: mk });
  }, [tabId, market]);
  await p.goto(`chrome-extension://${id}/popup.html`);
  await p.waitForTimeout(2500);
  if (tab) { await p.click(`.tabs button[data-tab="${tab}"]`); await p.waitForTimeout(300); }
  if (scrollTo) await p.evaluate((i) => { const l = document.getElementById("imgList"); l.scrollTop = l.children[i].offsetTop - l.offsetTop; }, scrollTo);
  const buf = await p.screenshot();
  await p.close();
  return b64(buf);
}
async function pageShot(highlight) {
  await page.evaluate(() => window.scrollTo(0, 0));
  if (highlight) {
    await sw.evaluate(async ([tid, u]) => chrome.scripting.executeScript({ target: { tabId: tid }, func: (u) => window.__fashioHighlight(u), args: [u] }), [tabId, highlight]);
    await page.waitForTimeout(900);
  }
  return b64(await page.screenshot());
}

const composer = await ctx.newPage();
await composer.setViewportSize({ width: 1280, height: 800 });
async function compose(file, title, sub, left, right, rightW = 400) {
  await composer.setContent(`<html><body style="margin:0;width:1280px;height:800px;background:#f7f3ef;font-family:system-ui,-apple-system,Segoe UI,Arial,sans-serif;color:#111827;overflow:hidden">
  <div style="position:absolute;left:48px;top:34px;right:48px">
    <div style="font-family:Didot,'Bodoni 72',Georgia,serif;font-size:38px;line-height:1.15">${title}</div>
    <div style="margin-top:8px;font-size:17px;color:#374151">${sub}</div>
  </div>
  <div style="position:absolute;left:48px;top:150px;width:${1280 - 96 - rightW - 40}px;height:610px;border-radius:14px;overflow:hidden;box-shadow:0 10px 40px rgba(17,24,39,.12);background:#fff">
    <div style="height:28px;background:#e7e2dc;display:flex;gap:6px;align-items:center;padding-left:12px"><i style="width:10px;height:10px;border-radius:50%;background:#f43f5e"></i><i style="width:10px;height:10px;border-radius:50%;background:#f59e0b"></i><i style="width:10px;height:10px;border-radius:50%;background:#22c55e"></i></div>
    <img src="${left}" style="width:100%;display:block">
  </div>
  <img src="${right}" style="position:absolute;right:48px;top:150px;width:${rightW}px;height:610px;object-fit:cover;object-position:top;border-radius:14px;box-shadow:0 18px 50px rgba(17,24,39,.28)">
  </body></html>`);
  await composer.waitForTimeout(300);
  await composer.screenshot({ path: `${outDir}/${file}` });
}

await compose("screenshot-1-amazon-image-audit.png", "Check every product photo before you list",
  "Size, ratio, white background and frame fill for the main image — against the marketplace you sell on.",
  await pageShot(), await popupShot("amazon"));
await compose("screenshot-2-zalando-ratio.png", "Catch the wrong aspect ratio early",
  "Zalando's 1:1.44 portrait format, minimum and best-practice sizes, file size — image by image.",
  await pageShot("http://localhost:8767/offwhite.jpg"), await popupShot("zalando", null, 1));
await compose("screenshot-3-listing-text.png", "Title and description lengths at a glance",
  "Product title, page title, meta description and alt text, checked against published limits.",
  await pageShot(), await popupShot("shopify", "text"));

// size chart builder: full-width shot inside a frame
const sc = await ctx.newPage();
await sc.setViewportSize({ width: 1180, height: 900 });
await sc.goto(`chrome-extension://${id}/sizechart.html`);
await sc.waitForTimeout(500);
const scShot = await b64(await sc.screenshot({ clip: { x: 0, y: 0, width: 1180, height: 900 } }));
await composer.setContent(`<html><body style="margin:0;width:1280px;height:800px;background:#f7f3ef;font-family:system-ui,Arial,sans-serif;color:#111827;overflow:hidden">
  <div style="position:absolute;left:48px;top:34px;right:48px"><div style="font-family:Didot,'Bodoni 72',Georgia,serif;font-size:38px">Build a size chart in a minute</div>
  <div style="margin-top:8px;font-size:17px;color:#374151">US · UK · EU · FR · IT · JP, cm or inch, editable measurements — copy as HTML or CSV.</div></div>
  <div style="position:absolute;left:48px;right:48px;top:150px;height:610px;border-radius:14px;overflow:hidden;box-shadow:0 10px 40px rgba(17,24,39,.14)"><img src="${scShot}" style="width:100%;display:block"></div></body></html>`);
await composer.waitForTimeout(300);
await composer.screenshot({ path: `${outDir}/screenshot-4-size-chart.png` });

await compose("screenshot-5-on-model.png", "From flat lay to on-model photos",
  "One click to Fashio's on-model photo tool. The extension itself uploads nothing.",
  await pageShot(), await popupShot("shopify", "tools"));

// promo tile
await composer.setViewportSize({ width: 440, height: 280 });
await composer.setContent(`<html><body style="margin:0;width:440px;height:280px;background:#111827;color:#fff;font-family:system-ui,Arial,sans-serif;overflow:hidden;position:relative">
  <div style="position:absolute;left:32px;top:34px;width:56px;height:56px;border:1.5px solid rgba(255,255,255,.6);border-radius:12px;display:grid;place-items:center;font-family:Didot,'Bodoni 72',Georgia,serif;font-size:36px">F</div>
  <div style="position:absolute;left:32px;top:112px;font-family:Didot,'Bodoni 72',Georgia,serif;font-size:34px;letter-spacing:.12em">FASHIO</div>
  <div style="position:absolute;left:32px;top:158px;font-size:20px;font-weight:600">Listing Helper</div>
  <div style="position:absolute;left:32px;top:196px;font-size:14px;color:#d1d5db;line-height:1.5">Photo checks · listing text · size charts<br>for fashion sellers</div>
  <div style="position:absolute;right:-40px;top:-40px;width:180px;height:180px;border-radius:50%;background:#f43f5e;opacity:.9"></div>
</body></html>`);
await composer.screenshot({ path: `${outDir}/promo-small-440x280.png` });
await ctx.close();
console.log("store assets →", outDir);
