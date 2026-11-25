// Copied from fashiolabs.com utils/sizeCharts.ts (2026-11-25) so the extension
// and the site's size converter give the same numbers. Industry-standard
// ready-to-wear conversions anchored to body measurements; brands vary by up to
// a full size — every surface says so. Measurements are in INCHES.
export type Unit = "in" | "cm";

export type WomensRow = {
  alpha: string;
  /** Plus-size scale label where one applies. */
  plusAlpha?: string;
  us: number;
  uk: number;
  eu: number;
  fr: number;
  it: number;
  /** Japanese numeric, or the L-scale label once numeric runs out. */
  jp: string;
  /** Indian kurta-style label: bust in inches, rounded down to even. */
  in_: number;
  bust: number;
  waist: number;
  hip: number;
};

export type MensRow = {
  alpha: string;
  /** Body chest in inches — the spine of every men's system. */
  chest: number;
  chestTo: number;
  uk: number;
  eu: number;
  it: number;
  fr: number;
  jp: string;
  /** Number printed on Indian shirt tags. A label, not a chest measurement. */
  in_: number;
  waist: number;
  waistTo: number;
  neck: number;
};

/** Bust/waist/hip are the mid-point of the range a brand would cut to. */
export const WOMENS: WomensRow[] = [
  { alpha: "XXS", us: 0, uk: 4, eu: 30, fr: 32, it: 34, jp: "3", in_: 32, bust: 33, waist: 26, hip: 35 },
  { alpha: "XS", us: 2, uk: 6, eu: 32, fr: 34, it: 36, jp: "5", in_: 34, bust: 34, waist: 27, hip: 36 },
  { alpha: "S", us: 4, uk: 8, eu: 34, fr: 36, it: 38, jp: "7", in_: 34, bust: 35, waist: 28, hip: 37 },
  { alpha: "S", us: 6, uk: 10, eu: 36, fr: 38, it: 40, jp: "9", in_: 36, bust: 36, waist: 29, hip: 38 },
  { alpha: "M", us: 8, uk: 12, eu: 38, fr: 40, it: 42, jp: "11", in_: 36, bust: 37, waist: 30.5, hip: 39.5 },
  { alpha: "M", us: 10, uk: 14, eu: 40, fr: 42, it: 44, jp: "13", in_: 38, bust: 38.5, waist: 32, hip: 41 },
  { alpha: "L", us: 12, uk: 16, eu: 42, fr: 44, it: 46, jp: "15", in_: 40, bust: 40, waist: 34, hip: 42.5 },
  { alpha: "L", us: 14, uk: 18, eu: 44, fr: 46, it: 48, jp: "17", in_: 40, plusAlpha: "1X", bust: 41.5, waist: 36, hip: 44 },
  { alpha: "XL", us: 16, uk: 20, eu: 46, fr: 48, it: 50, jp: "19", in_: 42, plusAlpha: "1X", bust: 43.5, waist: 38, hip: 46 },
  { alpha: "XL", us: 18, uk: 22, eu: 48, fr: 50, it: 52, jp: "21", in_: 46, plusAlpha: "2X", bust: 47.5, waist: 43, hip: 50.5 },
  { alpha: "XXL", us: 20, uk: 24, eu: 50, fr: 52, it: 54, jp: "3L", in_: 48, plusAlpha: "2X", bust: 49.5, waist: 45, hip: 52.75 },
  { alpha: "XXL", us: 22, uk: 26, eu: 52, fr: 54, it: 56, jp: "4L", in_: 50, plusAlpha: "3X", bust: 51.5, waist: 47, hip: 55 },
  { alpha: "XXXL", us: 24, uk: 28, eu: 54, fr: 56, it: 58, jp: "5L", in_: 52, plusAlpha: "3X", bust: 53.5, waist: 49, hip: 57.25 },
  { alpha: "XXXL", us: 26, uk: 30, eu: 56, fr: 58, it: 60, jp: "6L", in_: 54, plusAlpha: "4X", bust: 55.5, waist: 51, hip: 59.5 },
  { alpha: "XXXXL", us: 28, uk: 32, eu: 58, fr: 60, it: 62, jp: "7L", in_: 56, plusAlpha: "4X", bust: 57.5, waist: 53, hip: 61.75 },
  { alpha: "XXXXL", us: 30, uk: 34, eu: 60, fr: 62, it: 64, jp: "8L", in_: 58, plusAlpha: "5X", bust: 59.5, waist: 55, hip: 64 },
];

export const MENS: MensRow[] = [
  { alpha: "XS", chest: 31, chestTo: 33, uk: 32, eu: 44, it: 44, fr: 44, jp: "S", in_: 38, waist: 26, waistTo: 28, neck: 14 },
  { alpha: "S", chest: 34, chestTo: 36, uk: 35, eu: 46, it: 46, fr: 46, jp: "M", in_: 39, waist: 30, waistTo: 32, neck: 14.5 },
  { alpha: "M", chest: 38, chestTo: 40, uk: 39, eu: 48, it: 48, fr: 48, jp: "L", in_: 40, waist: 33, waistTo: 35, neck: 15.5 },
  { alpha: "L", chest: 42, chestTo: 44, uk: 43, eu: 52, it: 52, fr: 52, jp: "LL", in_: 42, waist: 36, waistTo: 38, neck: 16.5 },
  { alpha: "XL", chest: 45, chestTo: 47, uk: 46, eu: 54, it: 54, fr: 54, jp: "3L", in_: 44, waist: 39, waistTo: 41, neck: 17 },
  { alpha: "XXL", chest: 48, chestTo: 50, uk: 49, eu: 58, it: 58, fr: 58, jp: "4L", in_: 46, waist: 42, waistTo: 44, neck: 18 },
  { alpha: "XXXL", chest: 52, chestTo: 54, uk: 53, eu: 62, it: 62, fr: 62, jp: "5L", in_: 48, waist: 45, waistTo: 47, neck: 19 },
  { alpha: "XXXXL", chest: 56, chestTo: 58, uk: 57, eu: 66, it: 66, fr: 66, jp: "6L", in_: 50, waist: 48, waistTo: 50, neck: 20 },
  { alpha: "5XL", chest: 60, chestTo: 62, uk: 61, eu: 70, it: 70, fr: 70, jp: "7L", in_: 52, waist: 51, waistTo: 53, neck: 21 },
];

/**
 * Straight-size alpha and plus-size alpha are separate scales. A brand's
 * "XXXL" and a brand's "3X" are not reliably the same garment, and a customer
 * who owns both will tell you so. This is the note the widget has to carry.
 */
export const toCm = (inches: number) => Math.round(inches * 2.54 * 10) / 10;
