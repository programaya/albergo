// utils/page-sizes.ts

export const mm2pt = (mm: number) => mm * 72 / 25.4;
export const pt2mm = (pt: number) => Math.round(pt * 25.4 / 72);

export const PAGE_SIZES = {
  A4:     [Number(mm2pt(210).toFixed(2)), Number(mm2pt(297).toFixed(2))],
  A5:     [Number(mm2pt(148).toFixed(2)), Number(mm2pt(210).toFixed(2))],
  A6:     [Number(mm2pt(105).toFixed(2)), Number(mm2pt(148).toFixed(2))],
  Letter: [Number(mm2pt(215.9).toFixed(2)), Number(mm2pt(279.4).toFixed(2))],
  Legal:  [Number(mm2pt(215.9).toFixed(2)), Number(mm2pt(355.6).toFixed(2))],
} as const;

export type PageSizeName = keyof typeof PAGE_SIZES;
export type PageOrientation = 'normal' | 'apaisada';

/**
 * Devuelve el tamaño en puntos [width, height] para un formato y orientación.
 */
export function getPageSize(
  size: PageSizeName,
  orientation: PageOrientation = 'normal'
    ): [number, number] {
    const [ancho, alto] = PAGE_SIZES[size];
    return orientation === 'normal' ? [ancho, alto] : [alto, ancho];
}

// Mapa básico de nombres de color (puedes ampliarlo según necesidad)
export const NAMED_COLORS: Record<string, [number, number, number]> = {
  black: [0, 0, 0],
  white: [255, 255, 255],
  red: [255, 0, 0],
  lime: [0, 255, 0],
  blue: [0, 0, 255],
  yellow: [255, 255, 0],
  cyan: [0, 255, 255],
  magenta: [255, 0, 255],
  silver: [192, 192, 192],
  gray: [128, 128, 128],
  maroon: [128, 0, 0],
  olive: [128, 128, 0],
  green: [0, 128, 0],
  purple: [128, 0, 128],
  teal: [0, 128, 128],
  navy: [0, 0, 128],
  // Añade más según necesites
};