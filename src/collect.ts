// Injected into the active tab on demand (popup click → activeTab). Exposes two
// functions on the isolated world; reads the page, never changes it except for
// a temporary outline when the user asks where an image is.
import type { PageData, PageImage } from "./shared";

const W = window as any;

function productNodes(): any[] {
  const out: any[] = [];
  const walk = (n: any) => {
    if (!n || typeof n !== "object") return;
    if (Array.isArray(n)) return n.forEach(walk);
    const type = n["@type"];
    if (type === "Product" || (Array.isArray(type) && type.includes("Product")) || type === "ProductGroup") out.push(n);
    if (n["@graph"]) walk(n["@graph"]);
    if (n.hasVariant) walk(n.hasVariant);
  };
  document.querySelectorAll('script[type="application/ld+json"]').forEach((s) => {
    try {
      walk(JSON.parse(s.textContent ?? ""));
    } catch {
      /* broken JSON-LD on the page — ignore */
    }
  });
  return out;
}

function urlsOf(v: any): string[] {
  if (!v) return [];
  if (typeof v === "string") return [v];
  if (Array.isArray(v)) return v.flatMap(urlsOf);
  if (typeof v === "object") return urlsOf(v.contentUrl ?? v.url);
  return [];
}

function abs(u: string) {
  try {
    return new URL(u, location.href).href;
  } catch {
    return u;
  }
}

/** Largest candidate in srcset, else currentSrc/src/data-src. */
function bestSrc(img: HTMLImageElement): string {
  const set = img.getAttribute("srcset") || img.getAttribute("data-srcset");
  if (set) {
    let best = "";
    let bestW = 0;
    for (const part of set.split(",")) {
      const [u, d] = part.trim().split(/\s+/);
      const w = d?.endsWith("w") ? parseInt(d) : d?.endsWith("x") ? parseFloat(d) * 1000 : 1;
      if (u && w >= bestW) {
        best = u;
        bestW = w;
      }
    }
    if (best) return abs(best);
  }
  return abs(img.currentSrc || img.src || img.getAttribute("data-src") || "");
}

const key = (u: string) => u.split("#")[0];

W.__fashioCollect = (): PageData => {
  const products = productNodes();
  const productImgs = new Set(products.flatMap((p) => urlsOf(p.image)).map(abs).map(key));
  const seen = new Map<string, PageImage>();

  document.querySelectorAll("img").forEach((img) => {
    const url = bestSrc(img);
    if (!url || url.startsWith("data:") || url.endsWith(".svg")) return;
    const r = img.getBoundingClientRect();
    const natural = img.naturalWidth >= 300 && img.naturalHeight >= 300;
    const big = r.width >= 200 && r.height >= 200;
    const inData = productImgs.has(key(url)) || productImgs.has(key(abs(img.currentSrc || img.src)));
    if (!natural && !big && !inData) return;
    const k = key(url);
    if (seen.has(k)) return;
    seen.set(k, { url, w: img.naturalWidth, h: img.naturalHeight, alt: img.getAttribute("alt"), inProductData: inData });
  });
  // Product-data images that are not rendered as <img> (galleries that lazy-load).
  for (const u of productImgs) if (!seen.has(u)) seen.set(u, { url: u, w: 0, h: 0, alt: null, inProductData: true });

  const images = [...seen.values()]
    .sort((a, b) => Number(b.inProductData) - Number(a.inProductData) || b.w * b.h - a.w * a.h)
    .slice(0, 24);

  const p = products[0] ?? {};
  const meta = (sel: string) => document.querySelector<HTMLMetaElement>(sel)?.content?.trim() ?? "";
  return {
    url: location.href,
    title: document.title.trim(),
    h1: document.querySelector("h1")?.textContent?.replace(/\s+/g, " ").trim() ?? "",
    productName: typeof p.name === "string" ? p.name.trim() : "",
    metaDesc: meta('meta[name="description"]') || meta('meta[property="og:description"]'),
    productDesc: typeof p.description === "string" ? p.description.replace(/\s+/g, " ").trim() : "",
    images,
    hasProductData: products.length > 0,
  };
};

W.__fashioHighlight = (url: string) => {
  const img = [...document.querySelectorAll("img")].find((i) => key(bestSrc(i)) === key(url) || key(abs(i.currentSrc || i.src)) === key(url));
  if (!img) return false;
  img.scrollIntoView({ behavior: "smooth", block: "center" });
  const prev = img.style.outline;
  const prevOff = img.style.outlineOffset;
  img.style.outline = "4px solid #f43f5e";
  img.style.outlineOffset = "3px";
  setTimeout(() => {
    img.style.outline = prev;
    img.style.outlineOffset = prevOff;
  }, 2500);
  return true;
};
