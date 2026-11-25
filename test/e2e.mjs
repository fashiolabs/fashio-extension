// E2E for the Fashio extension. Loads dist/chrome into Playwright Chromium with a
// test-only host_permissions <all_urls>, opens the fake product page, then opens
// popup.html in a tab with tabs.query patched to point at the product tab.
import { chromium } from "playwright";
import { cpSync, readFileSync, writeFileSync, rmSync } from "node:fs";
const [src, url] = process.argv.slice(2);
const ext = "/tmp/ext-test-fashio/build";
rmSync(ext, { recursive: true, force: true });
cpSync(src, ext, { recursive: true });
const m = JSON.parse(readFileSync(ext + "/manifest.json", "utf8"));
m.host_permissions = ["<all_urls>"]; // test-only
writeFileSync(ext + "/manifest.json", JSON.stringify(m));
const ctx = await chromium.launchPersistentContext("/tmp/ext-test-fashio/profile-" + Date.now(), {
  channel: "chromium", headless: true, viewport: { width: 1280, height: 800 },
  args: [`--disable-extensions-except=${ext}`, `--load-extension=${ext}`],
});
let [sw] = ctx.serviceWorkers();
if (!sw) sw = await ctx.waitForEvent("serviceworker");
const id = sw.url().split("/")[2];
const errors = [];
const watch = (p) => { p.on("pageerror", e => errors.push("pageerror " + e.message)); p.on("console", m => m.type() === "error" && errors.push("console " + m.text())); };
await new Promise(r => setTimeout(r, 1500));
console.log("install tab:", ctx.pages().map(p => p.url()).filter(u => u.includes("fashiolabs")));
const page = await ctx.newPage(); watch(page);
await page.goto(url, { waitUntil: "load" });
const tabId = await sw.evaluate(async (u) => (await chrome.tabs.query({})).find(t => t.url?.startsWith(u))?.id, url);

async function popup(market, tab, name, h = 900) {
  const p = await ctx.newPage(); watch(p);
  await p.setViewportSize({ width: 400, height: h });
  await p.addInitScript(([tid, mk]) => {
    const q = chrome.tabs.query.bind(chrome.tabs);
    chrome.tabs.query = async (o) => (o?.active ? [{ id: tid }] : q(o));
    if (mk) chrome.storage.sync.set({ market: mk });
  }, [tabId, market]);
  await p.goto(`chrome-extension://${id}/popup.html`);
  await p.waitForTimeout(2500);
  await p.addStyleTag({ content: ".imgs{max-height:none!important}" });
  if (tab) { await p.click(`.tabs button[data-tab="${tab}"]`); await p.waitForTimeout(300); }
  await p.screenshot({ path: `/tmp/ext-test-fashio/${name}.png`, fullPage: true });
  const text = await p.evaluate(() => document.body.innerText);
  await p.close();
  return text;
}
const amazon = await popup("amazon", null, "1-amazon-images", 1400);
console.log("--- amazon images ---\n" + amazon.split("\n").filter(l => /✓|!|✕|\?|Main|×|images|pure|white|fill|read/i.test(l)).slice(0, 40).join("\n"));
const zal = await popup("zalando", null, "2-zalando-images", 1400);
console.log("--- zalando ratio lines ---\n" + zal.split("\n").filter(l => /Aspect|Minimum|Recommended/.test(l)).join("\n"));
const txt = await popup("etsy", "text", "3-etsy-text");
console.log("--- etsy text ---\n" + txt.split("\n").filter(l => /Title|characters|alt|structured/i.test(l)).join("\n"));
await popup("shopify", "text", "4-shopify-text");
await popup("shopify", "tools", "5-tools");

// highlight call
await sw.evaluate(async (tid) => chrome.scripting.executeScript({ target: { tabId: tid }, func: (u) => window.__fashioHighlight(u), args: ["http://localhost:8767/offwhite.jpg"] }), tabId);
await page.waitForTimeout(600);
await page.screenshot({ path: "/tmp/ext-test-fashio/6-highlight.png" });

// size chart page
const sc = await ctx.newPage(); watch(sc);
await sc.goto(`chrome-extension://${id}/sizechart.html`);
await sc.waitForTimeout(500);
await sc.screenshot({ path: "/tmp/ext-test-fashio/7-sizechart-women-cm.png", fullPage: true });
const first = await sc.$eval("#chart tbody tr td input", (i) => i.value);
await sc.fill("#chart tbody tr td input", "88");
await sc.dispatchEvent("#chart tbody tr td input", "change");
await sc.check('#unit input[value="in"]');
const asInch = await sc.$eval("#chart tbody tr td input", (i) => i.value);
await sc.check('#unit input[value="cm"]');
const backCm = await sc.$eval("#chart tbody tr td input", (i) => i.value);
console.log("size chart first bust cell:", first, "→ edited 88 cm → in:", asInch, "→ cm:", backCm);
await sc.check('#gender input[value="men"]');
await sc.waitForTimeout(200);
await sc.screenshot({ path: "/tmp/ext-test-fashio/8-sizechart-men.png", fullPage: true });
const csv = await sc.evaluate(() => {
  let captured = ""; navigator.clipboard.writeText = async (s) => { captured = s; };
  document.getElementById("copyCsv").click();
  return new Promise(r => setTimeout(() => r(captured), 100));
});
console.log("--- csv ---\n" + csv);
const html = await sc.evaluate(() => {
  let captured = ""; navigator.clipboard.writeText = async (s) => { captured = s; };
  document.getElementById("copyHtml").click();
  return new Promise(r => setTimeout(() => r(captured), 100));
});
console.log("--- html (head) ---\n" + html.split("\n").slice(0, 4).join("\n"));
console.log("errors:", errors.filter(e => !/Failed to load resource|net::|favicon/.test(e)).slice(0, 10));
await ctx.close();
