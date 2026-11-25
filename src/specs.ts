// Marketplace image + text specs. ONLY numbers read on the marketplace's own
// pages (checked 2026-11-25). A marketplace whose numbers could not be read
// from its own docs is left out rather than guessed — see README "Gaps".
export type MarketKey = "amazon" | "etsy" | "shopify" | "ebay" | "zalando";

export interface Spec {
  key: MarketKey;
  label: string;
  /** Where every number below was read. Shown in the UI. */
  sources: string[];
  minLong?: number; // px, longest side
  recLong?: number; // px, longest side (recommendation)
  minBoth?: number; // px, width AND height
  recBoth?: number; // px, width AND height (recommendation)
  minW?: number;
  minH?: number;
  recW?: number;
  recH?: number;
  maxW?: number;
  maxH?: number;
  maxMegapixels?: number;
  maxFileMB?: number;
  /** Required width:height, as height / width (Zalando 1:1.44 → 1.44). */
  ratio?: number;
  /** Main image must be on pure white (checked on the first image only). */
  whiteMain?: boolean;
  /** Product should fill at least this share of the frame (main image). */
  mainFill?: number;
  /** recLong / mainFill come from widely repeated guidance, not a page we could
   *  attribute — the UI words them as "commonly cited … confirm in Seller Central". */
  citedOnly?: boolean;
  titleMax?: number; // characters, hard limit
  titleRec?: number; // characters, recommendation
  metaDescRec?: number; // characters
}

export const SPECS: Spec[] = [
  {
    key: "amazon",
    label: "Amazon",
    // The official help page (Seller Central G1881) needs a seller login; these
    // figures are from Amazon's own Seller Forums photography standards post.
    sources: ["https://sellercentral.amazon.com/seller-forums/discussions/t/0149bdb3-2056-42ce-b0bb-9eef94e3d2b8"],
    minLong: 1000,
    recLong: 1600,
    whiteMain: true,
    mainFill: 0.85,
    citedOnly: true,
  },
  {
    key: "etsy",
    label: "Etsy",
    sources: [
      "https://help.etsy.com/hc/en-us/articles/115015663347-Requirements-and-Best-Practices-for-Images-in-Your-Etsy-Shop",
      "https://help.etsy.com/hc/en-us/articles/115015628707-How-to-Create-a-Listing",
    ],
    minBoth: 635,
    recBoth: 2000,
    titleMax: 140,
  },
  {
    key: "shopify",
    label: "Shopify",
    sources: [
      "https://help.shopify.com/en/manual/products/product-media/product-media-types",
      "https://help.shopify.com/en/manual/promoting-marketing/seo/adding-keywords",
    ],
    recW: 2048,
    recH: 2048,
    maxW: 5000,
    maxH: 5000,
    maxMegapixels: 25,
    maxFileMB: 20,
    titleMax: 70,
    titleRec: 60,
    metaDescRec: 160,
  },
  {
    key: "ebay",
    label: "eBay",
    sources: [
      "https://www.ebay.com/help/policies/listing-policies/picture-policy?id=4370",
      "https://www.ebay.com/help/selling/listings/adding-pictures-listings?id=4148",
      "https://developer.ebay.com/api-docs/user-guides/static/trading-user-guide/listing-title.html",
    ],
    minLong: 500,
    recLong: 1600,
    maxFileMB: 12,
    titleMax: 80,
  },
  {
    key: "zalando",
    label: "Zalando",
    sources: ["https://partner.zalando.com/university/article/zalando-image-guidelines"],
    minW: 762,
    minH: 1100,
    recW: 1801,
    recH: 2600,
    ratio: 1.44,
    maxFileMB: 20,
  },
];

export type Level = "ok" | "warn" | "fail" | "unknown";
export interface Check {
  level: Level;
  /** i18n key + substitutions */
  key: string;
  subs?: string[];
}

export interface ImageFacts {
  w: number;
  h: number;
  bytes?: number;
  /** Share of border pixels that are pure white (255,255,255), 0..1 */
  borderPure?: number;
  /** Share of border pixels that are near white (all channels >= 245) */
  borderNear?: number;
  /** Bounding box of non-white content, as share of the longest side */
  fill?: number;
  pixelsRead: boolean;
  /** "blocked" (no access), "decode", or "http <status>" */
  error?: string;
}

/** Checks for one image against one marketplace. `main` = first image of the listing. */
export function checkImage(spec: Spec, f: ImageFacts, main: boolean): Check[] {
  const out: Check[] = [];
  const long = Math.max(f.w, f.h);
  const short = Math.min(f.w, f.h);
  const px = (n: number) => String(n);
  if (!f.w || !f.h) return [{ level: "unknown", key: "chkNoSize" }];

  if (spec.minLong) out.push({ level: long >= spec.minLong ? "ok" : "fail", key: "chkMinLong", subs: [px(spec.minLong), px(long)] });
  if (spec.recLong && long >= (spec.minLong ?? 0)) out.push({ level: long >= spec.recLong ? "ok" : "warn", key: spec.citedOnly ? "chkRecLongCited" : "chkRecLong", subs: [px(spec.recLong), px(long)] });
  if (spec.minBoth && main) out.push({ level: short >= spec.minBoth ? "ok" : "fail", key: "chkMinBothMain", subs: [px(spec.minBoth), `${f.w}×${f.h}`] });
  if (spec.recBoth) out.push({ level: short >= spec.recBoth ? "ok" : "warn", key: "chkRecBoth", subs: [px(spec.recBoth), `${f.w}×${f.h}`] });
  if (spec.minW && spec.minH) out.push({ level: f.w >= spec.minW && f.h >= spec.minH ? "ok" : "fail", key: "chkMinWH", subs: [`${spec.minW}×${spec.minH}`, `${f.w}×${f.h}`] });
  if (spec.recW && spec.recH) out.push({ level: f.w >= spec.recW && f.h >= spec.recH ? "ok" : "warn", key: "chkRecWH", subs: [`${spec.recW}×${spec.recH}`, `${f.w}×${f.h}`] });
  if (spec.maxW && spec.maxH) out.push({ level: f.w <= spec.maxW && f.h <= spec.maxH ? "ok" : "fail", key: "chkMaxWH", subs: [`${spec.maxW}×${spec.maxH}`, `${f.w}×${f.h}`] });
  if (spec.maxMegapixels) {
    const mp = (f.w * f.h) / 1e6;
    out.push({ level: mp <= spec.maxMegapixels ? "ok" : "fail", key: "chkMaxMP", subs: [px(spec.maxMegapixels), mp.toFixed(1)] });
  }
  if (spec.ratio) {
    const r = f.h / f.w;
    out.push({ level: Math.abs(r - spec.ratio) < 0.005 ? "ok" : "fail", key: "chkRatio", subs: [`1:${spec.ratio}`, `1:${r.toFixed(2)}`] });
  }
  if (spec.maxFileMB && f.bytes) {
    const mb = f.bytes / 1048576;
    out.push({ level: mb <= spec.maxFileMB ? "ok" : "fail", key: "chkMaxFile", subs: [px(spec.maxFileMB), mb < 0.1 ? mb.toFixed(2) : mb.toFixed(1)] });
  }
  if (spec.whiteMain && main) {
    if (!f.pixelsRead || f.borderPure === undefined) out.push({ level: "unknown", key: "chkWhiteUnknown" });
    else if (f.borderPure >= 0.98) out.push({ level: "ok", key: "chkWhitePure" });
    else if ((f.borderNear ?? 0) >= 0.9) out.push({ level: "warn", key: "chkWhiteNear", subs: [String(Math.round(f.borderPure * 100))] });
    else out.push({ level: "fail", key: "chkWhiteNo" });
  }
  if (spec.mainFill && main && f.pixelsRead && f.fill !== undefined) {
    out.push({ level: f.fill >= spec.mainFill ? "ok" : "warn", key: spec.citedOnly ? "chkFillCited" : "chkFill", subs: [String(Math.round(spec.mainFill * 100)), String(Math.round(f.fill * 100))] });
  }
  return out;
}

export function checkText(spec: Spec, title: string, metaDesc: string): Check[] {
  const out: Check[] = [];
  const tl = [...title].length;
  if (spec.titleMax) out.push({ level: tl === 0 ? "unknown" : tl <= spec.titleMax ? "ok" : "fail", key: "chkTitleMax", subs: [String(spec.titleMax), String(tl)] });
  if (spec.titleRec && tl > 0) out.push({ level: tl <= spec.titleRec ? "ok" : "warn", key: "chkTitleRec", subs: [String(spec.titleRec), String(tl)] });
  if (spec.metaDescRec) {
    const dl = [...metaDesc].length;
    out.push({ level: dl === 0 ? "warn" : dl <= spec.metaDescRec ? "ok" : "warn", key: dl === 0 ? "chkMetaMissing" : "chkMetaRec", subs: [String(spec.metaDescRec), String(dl)] });
  }
  return out;
}
