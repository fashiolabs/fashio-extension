import { api, localize, modelToolUrl, t } from "./shared";
import { MENS, toCm, WOMENS, type MensRow, type WomensRow } from "./sizes";

type Gender = "women" | "men";
type Unit = "cm" | "in";
const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const SYSTEMS: Record<Gender, { key: string; label: string }[]> = {
  women: [
    { key: "us", label: "US" }, { key: "uk", label: "UK" }, { key: "eu", label: "EU" },
    { key: "fr", label: "FR" }, { key: "it", label: "IT" }, { key: "jp", label: "JP" },
  ],
  men: [
    { key: "uk", label: "UK" }, { key: "eu", label: "EU" }, { key: "it", label: "IT" },
    { key: "fr", label: "FR" }, { key: "jp", label: "JP" },
  ],
};
const DEFAULT_SYSTEMS: Record<Gender, string[]> = { women: ["us", "uk", "eu", "it"], men: ["uk", "eu", "it"] };
const MEASURES: Record<Gender, string[]> = { women: ["bust", "waist", "hip"], men: ["chest", "waist", "neck"] };

let gender: Gender = "women";
let unit: Unit = "cm";
let systems = new Set(DEFAULT_SYSTEMS.women);
let rows: number[] = []; // indexes into WOMENS / MENS
/** Seller's edits, keyed "row:measure", stored in inches so unit switches never drift. */
const edits = new Map<string, string>();

const num = (inches: number) => (unit === "cm" ? String(toCm(inches)) : String(inches));
const range = (a: number, b: number) => `${num(a)}–${num(b)}`;

function rowLabel(g: Gender, i: number) {
  if (g === "women") {
    const r = WOMENS[i];
    return `${r.alpha} · US ${r.us}`;
  }
  return MENS[i].alpha;
}

function standard(g: Gender, i: number, m: string): string {
  if (g === "women") {
    const r = WOMENS[i] as WomensRow;
    return num(r[m as "bust" | "waist" | "hip"]);
  }
  const r = MENS[i] as MensRow;
  if (m === "chest") return range(r.chest, r.chestTo);
  if (m === "waist") return range(r.waist, r.waistTo);
  return num(r.neck);
}

function cell(i: number, m: string): string {
  const e = edits.get(`${gender}:${i}:${m}`);
  if (e === undefined) return standard(gender, i, m);
  // Edits are stored in inches; convert each number for display.
  return unit === "in" ? e : e.replace(/\d+(?:\.\d+)?/g, (n) => String(toCm(Number(n))));
}

function setEdit(i: number, m: string, shown: string) {
  const inches = unit === "in" ? shown : shown.replace(/\d+(?:\.\d+)?/g, (n) => String(Math.round((Number(n) / 2.54) * 100) / 100));
  edits.set(`${gender}:${i}:${m}`, inches);
}

function headers(): string[] {
  const sys = SYSTEMS[gender].filter((s) => systems.has(s.key)).map((s) => s.label);
  const meas = MEASURES[gender].map((m) => `${t(`m_${m}`)} (${unit})`);
  return [t("scSize"), ...sys, ...meas];
}

function values(i: number): string[] {
  const r: any = gender === "women" ? WOMENS[i] : MENS[i];
  const sys = SYSTEMS[gender].filter((s) => systems.has(s.key)).map((s) => String(r[s.key]));
  const label = gender === "women" ? (r.plusAlpha ? `${r.alpha} / ${r.plusAlpha}` : r.alpha) : r.alpha;
  return [label, ...sys, ...MEASURES[gender].map((m) => cell(i, m))];
}

function render() {
  const table = $<HTMLTableElement>("chart");
  table.replaceChildren();
  const thead = table.createTHead().insertRow();
  for (const h of headers()) {
    const th = document.createElement("th");
    th.textContent = h;
    thead.append(th);
  }
  const body = table.createTBody();
  const measStart = headers().length - MEASURES[gender].length;
  for (const i of rows) {
    const tr = body.insertRow();
    values(i).forEach((v, col) => {
      const td = tr.insertCell();
      if (col >= measStart) {
        const m = MEASURES[gender][col - measStart];
        const input = document.createElement("input");
        input.value = v;
        input.setAttribute("aria-label", `${rowLabel(gender, i)} ${t(`m_${m}`)}`);
        input.addEventListener("change", () => setEdit(i, m, input.value));
        td.append(input);
      } else td.textContent = v;
    });
  }
  $("plusNote").hidden = gender !== "women";
}

function renderPickers() {
  const sysBox = $("systems");
  sysBox.replaceChildren();
  for (const s of SYSTEMS[gender]) {
    const l = document.createElement("label");
    const c = document.createElement("input");
    c.type = "checkbox";
    c.checked = systems.has(s.key);
    c.addEventListener("change", () => {
      if (c.checked) systems.add(s.key);
      else systems.delete(s.key);
      render();
    });
    l.append(c, s.label);
    sysBox.append(l);
  }
  const sizeBox = $("sizes");
  sizeBox.replaceChildren();
  const all = gender === "women" ? WOMENS.length : MENS.length;
  for (let i = 0; i < all; i++) {
    const l = document.createElement("label");
    const c = document.createElement("input");
    c.type = "checkbox";
    c.checked = rows.includes(i);
    c.addEventListener("change", () => {
      rows = c.checked ? [...rows, i].sort((a, b) => a - b) : rows.filter((x) => x !== i);
      render();
    });
    l.append(c, rowLabel(gender, i));
    sizeBox.append(l);
  }
}

function setGender(g: Gender) {
  gender = g;
  systems = new Set(DEFAULT_SYSTEMS[g]);
  // Women: US 2–16, men: S–XXL — the common core range.
  rows = g === "women" ? [1, 2, 3, 4, 5, 6, 7, 8] : [1, 2, 3, 4, 5];
  renderPickers();
  render();
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const csvCell = (s: string) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);

function currentValues(): string[][] {
  // Read the inputs so an edit that has not fired "change" yet is still exported.
  const table = $<HTMLTableElement>("chart");
  return [...table.tBodies[0].rows].map((tr) => [...tr.cells].map((td) => td.querySelector("input")?.value ?? td.textContent ?? ""));
}

function html() {
  const head = headers().map((h) => `<th>${esc(h)}</th>`).join("");
  const body = currentValues().map((r) => `    <tr>${r.map((v) => `<td>${esc(v)}</td>`).join("")}</tr>`).join("\n");
  return `<table class="size-chart">\n  <thead><tr>${head}</tr></thead>\n  <tbody>\n${body}\n  </tbody>\n</table>`;
}

function csv() {
  return [headers(), ...currentValues()].map((r) => r.map(csvCell).join(",")).join("\n");
}

async function copy(text: string) {
  await navigator.clipboard.writeText(text);
  const c = $("copied");
  c.hidden = false;
  setTimeout(() => (c.hidden = true), 1800);
}

function main() {
  localize();
  document.title = t("scTitle");
  document.querySelectorAll<HTMLInputElement>('#gender input').forEach((r) => r.addEventListener("change", () => setGender(r.value as Gender)));
  document.querySelectorAll<HTMLInputElement>('#unit input').forEach((r) =>
    r.addEventListener("change", () => {
      unit = r.value as Unit;
      render();
    }),
  );
  $("copyHtml").addEventListener("click", () => copy(html()));
  $("copyCsv").addEventListener("click", () => copy(csv()));
  $("downloadCsv").addEventListener("click", () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv()], { type: "text/csv" }));
    a.download = `size-chart-${gender}-${unit}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });
  $("reset").addEventListener("click", () => {
    for (const k of [...edits.keys()]) if (k.startsWith(`${gender}:`)) edits.delete(k);
    render();
  });
  $("openFashio").addEventListener("click", () => api.tabs.create({ url: modelToolUrl("size_chart") }));
  setGender("women");
}

main();
