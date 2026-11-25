import { api, localize, modelToolUrl, t, type Msg, type PageData, type PageImage } from "./shared";
import { initRate } from "./rate";
import { checkImage, checkText, SPECS, type Check, type ImageFacts, type MarketKey, type Spec } from "./specs";

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
let tabId: number | null = null;
let page: PageData | null = null;
const facts = new Map<string, ImageFacts>();

function spec(): Spec {
  return SPECS.find((s) => s.key === $<HTMLSelectElement>("market").value) ?? SPECS[0];
}

function li(c: Check) {
  const el = document.createElement("li");
  el.className = c.level;
  el.textContent = t(c.key, c.subs);
  return el;
}

function fmtBytes(n?: number) {
  if (!n) return "";
  return n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`;
}

function renderImages() {
  const list = $<HTMLOListElement>("imgList");
  list.replaceChildren();
  if (!page) return;
  const imgs = page.images;
  const fromData = imgs.filter((i) => i.inProductData).length;
  $("imgSummary").textContent = imgs.length ? t("imgSummary", [String(imgs.length), String(fromData)]) : t("imgNone");
  let blocked = 0;
  imgs.forEach((img, idx) => {
    const f = facts.get(img.url);
    const merged: ImageFacts = f && f.w ? f : { w: img.w, h: img.h, pixelsRead: false, bytes: f?.bytes };
    const httpError = f?.error?.startsWith("http ");
    if (f && !f.pixelsRead && !httpError) blocked++;
    const item = document.createElement("li");
    const thumb = document.createElement("img");
    thumb.src = img.url;
    thumb.alt = "";
    thumb.title = t("showOnPage");
    thumb.addEventListener("click", () => highlight(img));
    thumb.addEventListener("error", () => thumb.classList.add("broken"));
    const body = document.createElement("div");
    const meta = document.createElement("div");
    meta.className = "meta";
    if (idx === 0) meta.append(tag(t("tagMain"), "main"));
    if (img.inProductData) meta.append(tag(t("tagProductData")));
    const dims = document.createElement("b");
    dims.textContent = merged.w ? `${merged.w}×${merged.h}` : f ? "—" : t("sizeLoading");
    meta.append(dims);
    if (merged.bytes) meta.append(tag(fmtBytes(merged.bytes)));
    if (merged.w && merged.h) meta.append(tag(ratioLabel(merged.w, merged.h)));
    const checks = document.createElement("ul");
    checks.className = "checks";
    if (httpError) checks.append(li({ level: "fail", key: "fileError", subs: [f!.error!.slice(5)] }));
    else if (f) checkImage(spec(), merged, idx === 0).forEach((c) => checks.append(li(c)));
    if (f && !f.pixelsRead && !httpError) checks.append(li({ level: "unknown", key: "cantRead" }));
    if (img.alt === null || img.alt.trim() === "") checks.append(li({ level: "warn", key: "altMissing" }));
    body.append(meta, checks);
    item.append(thumb, body);
    list.append(item);
  });
  // Offer the optional permission only when it would actually help.
  if (blocked === 0) $("grant").hidden = true;
  else void api.permissions.contains({ origins: ["<all_urls>"] }).then((has) => ($("grant").hidden = has));
}

function ratioLabel(w: number, h: number) {
  const g = (a: number, b: number): number => (b ? g(b, a % b) : a);
  const d = g(w, h);
  const rw = w / d, rh = h / d;
  return rw <= 32 && rh <= 32 ? `${rw}:${rh}` : `1:${(h / w).toFixed(2)}`;
}

function tag(text: string, cls = "") {
  const s = document.createElement("span");
  s.className = `tag ${cls}`;
  s.textContent = text;
  return s;
}

function field(label: string, value: string) {
  const wrap = document.createElement("div");
  wrap.className = "field";
  const l = document.createElement("div");
  l.className = "lbl";
  const name = document.createElement("span");
  name.textContent = label;
  const len = document.createElement("span");
  len.textContent = t("chars", [String([...value].length)]);
  l.append(name, len);
  const v = document.createElement("div");
  v.className = value ? "val" : "val empty";
  v.textContent = value || t("notFound");
  wrap.append(l, v);
  return wrap;
}

function renderText() {
  if (!page) return;
  const title = page.productName || page.h1 || page.title;
  const fields = $("textFields");
  fields.replaceChildren(
    field(t("fieldTitle"), title),
    field(t("fieldPageTitle"), page.title),
    field(t("fieldMetaDesc"), page.metaDesc),
    field(t("fieldProductDesc"), page.productDesc),
  );
  const checks = $("textChecks");
  checks.replaceChildren();
  const cs = checkText(spec(), title, page.metaDesc);
  if (!cs.length) checks.append(li({ level: "unknown", key: "noTextRules", subs: [spec().label] }));
  cs.forEach((c) => checks.append(li(c)));
  if (!page.hasProductData) checks.append(li({ level: "warn", key: "noProductData" }));
  const missing = page.images.filter((i) => i.alt === null || i.alt.trim() === "").length;
  $("altSummary").textContent = t("altSummary", [String(missing), String(page.images.length)]);
}

function renderSources() {
  const ul = $("sources");
  ul.replaceChildren();
  for (const u of spec().sources) {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = u;
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = u.replace(/^https:\/\//, "");
    li.append(a);
    ul.append(li);
  }
}

async function highlight(img: PageImage) {
  if (tabId === null) return;
  await api.scripting.executeScript({ target: { tabId }, func: (u: string) => (window as any).__fashioHighlight?.(u), args: [img.url] });
}

async function analyzeAll() {
  if (!page) return;
  const queue = [...page.images];
  const worker = async () => {
    for (let img = queue.shift(); img; img = queue.shift()) {
      const f: ImageFacts = await api.runtime.sendMessage({ type: "analyze", url: img.url } satisfies Msg);
      facts.set(img.url, f);
      renderImages();
    }
  };
  await Promise.all([worker(), worker(), worker(), worker()]);
}

async function scan() {
  const [tab] = await api.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;
  tabId = tab.id;
  try {
    await api.scripting.executeScript({ target: { tabId }, files: ["collect.js"] });
    const [res] = await api.scripting.executeScript({ target: { tabId }, func: () => (window as any).__fashioCollect() });
    page = res.result as PageData;
  } catch {
    $("notice").textContent = t("notAvailable");
    $("notice").hidden = false;
    $("imgSummary").textContent = "";
    return;
  }
  renderImages();
  renderText();
  void analyzeAll();
}

async function main() {
  localize();
  const sel = $<HTMLSelectElement>("market");
  for (const s of SPECS) sel.add(new Option(s.label, s.key));
  const stored = (await api.storage.sync.get("market")).market as MarketKey | undefined;
  if (stored && SPECS.some((s) => s.key === stored)) sel.value = stored;
  sel.addEventListener("change", () => {
    void api.storage.sync.set({ market: sel.value });
    renderImages();
    renderText();
    renderSources();
  });
  renderSources();

  document.querySelectorAll<HTMLButtonElement>(".tabs button").forEach((b) =>
    b.addEventListener("click", () => {
      document.querySelectorAll(".tabs button").forEach((x) => x.classList.toggle("on", x === b));
      document.querySelectorAll<HTMLElement>(".pane").forEach((p) => (p.hidden = p.id !== b.dataset.tab));
    }),
  );
  $("openSizeChart").addEventListener("click", () => api.tabs.create({ url: api.runtime.getURL("sizechart.html") }));
  $("openFashio").addEventListener("click", () => api.tabs.create({ url: modelToolUrl("popup") }));
  $("grantBtn").addEventListener("click", async () => {
    // Must run inside the click (user gesture).
    if (await api.permissions.request({ origins: ["<all_urls>"] })) {
      facts.clear();
      void analyzeAll();
    }
  });
  void initRate($("rate"));
  await scan();
}

void main();
