import { api, modelToolUrl, SITE, t, type Msg } from "./shared";
import type { ImageFacts } from "./specs";

api.runtime.onInstalled.addListener((details) => {
  api.contextMenus.removeAll(() => {
    api.contextMenus.create({ id: "on-model", title: t("menuOnModel"), contexts: ["image"] });
    api.contextMenus.create({ id: "size-chart", title: t("menuSizeChart"), contexts: ["action"] });
  });
  if (details.reason === "install") {
    api.tabs.create({ url: `${SITE}/extension?installed=1&utm_source=extension&utm_medium=install` });
  }
  api.runtime.setUninstallURL(`${SITE}/extension?uninstalled=1&utm_source=extension&utm_medium=uninstall`);
});

api.contextMenus.onClicked.addListener((info) => {
  // Opens the Fashio tool page only. The image is NOT uploaded or sent anywhere.
  if (info.menuItemId === "on-model") api.tabs.create({ url: modelToolUrl("context_menu") });
  if (info.menuItemId === "size-chart") api.tabs.create({ url: api.runtime.getURL("sizechart.html") });
});

/**
 * Reads the image's pixels. Works for the active tab's own origin (activeTab)
 * and, once the user grants optional <all_urls>, for CDN-hosted images too.
 * Anything else comes back pixelsRead:false — the popup says "can't read".
 */
async function analyze(url: string): Promise<ImageFacts> {
  let blob: Blob;
  try {
    const res = await fetch(url, { credentials: "omit" });
    if (!res.ok) return { w: 0, h: 0, pixelsRead: false, error: `http ${res.status}` };
    blob = await res.blob();
  } catch {
    return { w: 0, h: 0, pixelsRead: false, error: "blocked" };
  }
  let bmp: ImageBitmap;
  try {
    bmp = await createImageBitmap(blob);
  } catch {
    return { w: 0, h: 0, bytes: blob.size, pixelsRead: false, error: "decode" };
  }
  const w = bmp.width;
  const h = bmp.height;
  const scale = Math.min(1, 400 / Math.max(w, h));
  const cw = Math.max(1, Math.round(w * scale));
  const ch = Math.max(1, Math.round(h * scale));
  const canvas = new OffscreenCanvas(cw, ch);
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(bmp, 0, 0, cw, ch);
  bmp.close();
  const d = ctx.getImageData(0, 0, cw, ch).data;

  // Border = outer 3% frame (at least 2 px).
  const bw = Math.max(2, Math.round(cw * 0.03));
  const bh = Math.max(2, Math.round(ch * 0.03));
  let border = 0, pure = 0, near = 0;
  let minX = cw, minY = ch, maxX = -1, maxY = -1;
  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      const i = (y * cw + x) * 4;
      const r = d[i], g = d[i + 1], b = d[i + 2], a = d[i + 3];
      // Transparent pixels count as "not white": marketplaces flatten them unpredictably.
      const white = a === 255 && r >= 245 && g >= 245 && b >= 245;
      if (x < bw || y < bh || x >= cw - bw || y >= ch - bh) {
        border++;
        if (white) near++;
        // Downscaling blends edges slightly; >=254 keeps the "pure" test honest but not brittle.
        if (a === 255 && r >= 254 && g >= 254 && b >= 254) pure++;
      }
      if (!white) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  const fill = maxX < 0 ? 0 : Math.max((maxX - minX + 1) / cw, (maxY - minY + 1) / ch);
  return { w, h, bytes: blob.size, borderPure: pure / border, borderNear: near / border, fill, pixelsRead: true };
}

api.runtime.onMessage.addListener((msg: Msg, _sender, reply) => {
  if (msg.type === "analyze") {
    analyze(msg.url).then(reply);
    return true; // async reply
  }
  return false;
});
