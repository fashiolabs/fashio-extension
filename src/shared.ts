export const api: typeof chrome = (globalThis as any).browser ?? chrome;
export const SITE = "https://fashiolabs.com";

/** Localised path of the on-model tool page; English for locales without a slug. */
const MODEL_SLUG: Record<string, string> = {
  de: "ki-modemodell-generator",
  es: "generador-modelo-moda-ia",
  fr: "generateur-mannequin-mode-ia",
  it: "generatore-modella-moda-ia",
  pt: "gerador-modelo-moda-ia",
  tr: "yapay-zeka-moda-modeli-uretici",
};
export function modelToolUrl(medium: string) {
  const ui = api.i18n.getUILanguage().slice(0, 2);
  const path = MODEL_SLUG[ui] ? `/${ui}/${MODEL_SLUG[ui]}` : "/ai-fashion-model-generator";
  return `${SITE}${path}?utm_source=extension&utm_medium=${medium}`;
}

export function t(key: string, subs?: string[]) {
  return api.i18n.getMessage(key, subs) || key;
}

export function localize(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>("[data-i18n]").forEach((el) => (el.textContent = t(el.dataset.i18n!)));
  root.querySelectorAll<HTMLElement>("[data-i18n-title]").forEach((el) => (el.title = t(el.dataset.i18nTitle!)));
  root.querySelectorAll<HTMLInputElement>("[data-i18n-ph]").forEach((el) => (el.placeholder = t(el.dataset.i18nPh!)));
  document.documentElement.lang = api.i18n.getUILanguage();
}

export interface PageImage {
  url: string;
  w: number; // natural size as loaded on the page (0 = not loaded yet)
  h: number;
  alt: string | null;
  inProductData: boolean;
}

export interface PageData {
  url: string;
  title: string; // <title>
  h1: string;
  productName: string; // JSON-LD Product name, if present
  metaDesc: string;
  productDesc: string;
  images: PageImage[];
  hasProductData: boolean;
}

export type Msg =
  | { type: "analyze"; url: string }
  | { type: "highlight"; url: string };
