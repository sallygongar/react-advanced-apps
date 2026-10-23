// Tipado explícito para la promoción
export interface PromotionItem {
  id?: number;
  description: string;
  code: string;
  probability: number; // Ej: 0.1 (10%), 0.5 (50%)
  grade?: number; // Ángulo objetivo al que debe girar
  range?: number[]; // [gradoInicio, gradoFin] dentro del círculo (0-360)
  isWin?: boolean;
  event_type?: string;
}

export interface PrizeData {
  id?: number;
  email?: string;
  description?: string;
  code?: string;
  isWin?: boolean;
  winningDegree?: number; // Para posicionar la ruleta en el premio
  event_type?: string;
}

export interface RouletteProps {
  promotions: PromotionItem[];
  colors: string[];
}

export type Canvas = HTMLCanvasElement | null;
export type CanvasContext = CanvasRenderingContext2D | null | undefined;
