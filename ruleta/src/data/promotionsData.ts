import type { PromotionItem } from "../types/wheel";

export const initialPromotions: PromotionItem[] = [
  {
    description: "¡10% de DESCUENTO!\n*En tu próxima compra*",
    code: "DESC10",
    probability: 0.35, // 35% de probabilidad
    isWin: true,
  },
  {
    description: "¡Sigue participando!\n*Mucha suerte*",
    code: "LOSE_1",
    probability: 0.25, // 25% de probabilidad
    isWin: false,
  },
  {
    description: "¡Envío GRATIS!\n*A todo el país*",
    code: "FREESHIP",
    probability: 0.2, // 20% de probabilidad
    isWin: true,
  },
  {
    description: "¡Inténtalo de nuevo!\n*Otra oportunidad*",
    code: "LOSE_2",
    probability: 0.15, // 15% de probabilidad
    isWin: false,
  },
  {
    description: "¡Premio Mayor!\n*50% de DESCUENTO*",
    code: "DESC50",
    probability: 0.05, // 5% de probabilidad (muy exclusivo)
    isWin: true,
  },
];
