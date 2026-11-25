import { api, t } from "./shared";

/**
 * Store rating link in the popup. Shown only after the popup has been opened on
 * at least MIN_DAYS different days; "Not now" hides it for good, and so does
 * clicking it. No incentive is offered (store policy). Firefox shows it only
 * once AMO_URL is filled in after the listing is approved.
 */
export const AMO_URL: string | null = null;
const MIN_DAYS = 5;

function reviewUrl(): string | null {
  const id = api.runtime.id;
  if (api.runtime.getURL("").startsWith("moz-extension:")) return AMO_URL ? `${AMO_URL.replace(/\/$/, "")}/reviews/` : null;
  const brands: { brand: string }[] = (navigator as any).userAgentData?.brands ?? [];
  if (brands.some((b) => b.brand === "Microsoft Edge")) return `https://microsoftedge.microsoft.com/addons/detail/${id}`;
  return `https://chromewebstore.google.com/detail/${id}/reviews`;
}

export async function initRate(box: HTMLElement) {
  const today = new Date().toISOString().slice(0, 10);
  const s = await api.storage.local.get(["usageDays", "rateDismissed"]);
  const days = new Set<string>((s.usageDays as string[] | undefined) ?? []);
  if (!days.has(today) && days.size < 30) {
    days.add(today);
    await api.storage.local.set({ usageDays: [...days] });
  }
  const url = reviewUrl();
  if (s.rateDismissed || days.size < MIN_DAYS || !url) return;

  const text = document.createElement("span");
  text.textContent = t("rateText");
  const go = document.createElement("button");
  go.className = "primary";
  go.textContent = t("rateBtn");
  const later = document.createElement("button");
  later.textContent = t("rateLater");
  const hide = () => {
    box.hidden = true;
    void api.storage.local.set({ rateDismissed: true });
  };
  go.addEventListener("click", () => {
    void api.tabs.create({ url });
    hide();
  });
  later.addEventListener("click", hide);
  box.replaceChildren(text, go, later);
  box.hidden = false;
}
