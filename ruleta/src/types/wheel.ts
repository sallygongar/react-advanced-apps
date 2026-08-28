// Tipado explícito para la promoción
export interface PromotionItem {
  description: string;
  code: string;
  probability: number; // Ej: 0.1 (10%), 0.5 (50%)
  grade?: number; // Ángulo objetivo al que debe girar
  range?: number[]; // [gradoInicio, gradoFin] dentro del círculo (0-360)
  isWin?: boolean;
}

export interface PrizeData {
  email?: string;
  description?: string;
  code?: string;
  isWin?: boolean;
}

export interface RouletteProps {
  promotions: PromotionItem[];
  colors: string[];
}

export type CanvasContext = CanvasRenderingContext2D | null | undefined;
